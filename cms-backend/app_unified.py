from flask import Flask, jsonify, request, send_from_directory, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import uuid
import json
from functools import wraps
import re
from slugify import slugify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='')

# Configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
# Use absolute path for database to ensure it works regardless of working directory
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'cms.db')
if DATABASE_URL:
    # Production database (SQLite - same as local)
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
else:
    # Development database (SQLite)
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-cms-secret-key-change-this-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')

# Create upload folders
for folder in ['uploads', 'uploads/images', 'uploads/documents', 'uploads/themes', 'uploads/plugins']:
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], folder.split('/')[-1]), exist_ok=True)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'mp3', 'zip', 'doc', 'docx'}

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app)

# Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    role = db.Column(db.String(20), default='subscriber')  # admin, editor, author, contributor, subscriber
    avatar_url = db.Column(db.String(255))
    bio = db.Column(db.Text)
    website = db.Column(db.String(255))
    social_links = db.Column(db.Text)  # JSON string
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    posts = db.relationship('Post', backref='author', lazy=True)
    comments = db.relationship('Comment', backref='author', lazy=True)
    media_files = db.relationship('Media', backref='uploader', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'website': self.website,
            'social_links': json.loads(self.social_links) if self.social_links else {},
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    parent_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    image_url = db.Column(db.String(255))
    meta_title = db.Column(db.String(255))
    meta_description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Self-referential relationship for parent/child categories
    children = db.relationship('Category', backref=db.backref('parent', remote_side=[id]))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'parent_id': self.parent_id,
            'image_url': self.image_url,
            'meta_title': self.meta_title,
            'meta_description': self.meta_description,
            'created_at': self.created_at.isoformat(),
            'children': [child.to_dict() for child in self.children] if self.children else []
        }

class Tag(db.Model):
    __tablename__ = 'tags'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    slug = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }

# Post-Tag many-to-many relationship table
post_tags = db.Table('post_tags',
    db.Column('post_id', db.Integer, db.ForeignKey('posts.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    content = db.Column(db.Text)
    excerpt = db.Column(db.Text)
    featured_image = db.Column(db.String(255))
    status = db.Column(db.String(20), default='draft')  # draft, published, private, trash
    post_type = db.Column(db.String(20), default='post')  # post, page, custom
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    comment_status = db.Column(db.String(20), default='open')  # open, closed
    view_count = db.Column(db.Integer, default=0)
    meta_title = db.Column(db.String(255))
    meta_description = db.Column(db.Text)
    meta_keywords = db.Column(db.String(255))
    custom_fields = db.Column(db.Text)  # JSON string for custom fields
    published_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = db.relationship('Category', backref='posts')
    tags = db.relationship('Tag', secondary=post_tags, backref=db.backref('posts', lazy='dynamic'))
    comments = db.relationship('Comment', backref='post', lazy=True, cascade='all, delete-orphan')
    revisions = db.relationship('PostRevision', backref='post', lazy=True)
    
    def generate_slug(self):
        if not self.slug:
            self.slug = slugify(self.title)
            # Ensure unique slug
            counter = 1
            original_slug = self.slug
            while Post.query.filter_by(slug=self.slug).first():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
    
    def to_dict(self, include_content=True):
        result = {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'excerpt': self.excerpt,
            'featured_image': self.featured_image,
            'status': self.status,
            'post_type': self.post_type,
            'author_id': self.author_id,
            'author': self.author.to_dict() if self.author else None,
            'category_id': self.category_id,
            'category': self.category.to_dict() if self.category else None,
            'tags': [tag.to_dict() for tag in self.tags],
            'comment_status': self.comment_status,
            'view_count': self.view_count,
            'meta_title': self.meta_title,
            'meta_description': self.meta_description,
            'meta_keywords': self.meta_keywords,
            'custom_fields': json.loads(self.custom_fields) if self.custom_fields else {},
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'comments_count': len(self.comments)
        }
        
        if include_content:
            result['content'] = self.content
            
        return result

class PostRevision(db.Model):
    __tablename__ = 'post_revisions'
    
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    title = db.Column(db.String(255))
    content = db.Column(db.Text)
    excerpt = db.Column(db.Text)
    revision_type = db.Column(db.String(20), default='revision')  # revision, autosave
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    creator = db.relationship('User', backref='revisions')

class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    author_name = db.Column(db.String(100))
    author_email = db.Column(db.String(120))
    author_website = db.Column(db.String(255))
    author_ip = db.Column(db.String(45))
    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # approved, pending, spam, trash
    parent_id = db.Column(db.Integer, db.ForeignKey('comments.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Self-referential relationship for reply comments
    replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]))
    
    def to_dict(self):
        return {
            'id': self.id,
            'post_id': self.post_id,
            'author_id': self.author_id,
            'author': self.author.to_dict() if self.author else None,
            'author_name': self.author_name,
            'author_email': self.author_email,
            'author_website': self.author_website,
            'content': self.content,
            'status': self.status,
            'parent_id': self.parent_id,
            'created_at': self.created_at.isoformat(),
            'replies': [reply.to_dict() for reply in self.replies]
        }

class Media(db.Model):
    __tablename__ = 'media'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255))
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50))
    mime_type = db.Column(db.String(100))
    file_size = db.Column(db.Integer)
    alt_text = db.Column(db.String(255))
    caption = db.Column(db.Text)
    description = db.Column(db.Text)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'url': self.url,
            'file_type': self.file_type,
            'mime_type': self.mime_type,
            'file_size': self.file_size,
            'alt_text': self.alt_text,
            'caption': self.caption,
            'description': self.description,
            'uploaded_by': self.uploaded_by,
            'uploader': self.uploader.to_dict() if self.uploader else None,
            'created_at': self.created_at.isoformat()
        }

class Setting(db.Model):
    __tablename__ = 'settings'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text)
    autoload = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Theme(db.Model):
    __tablename__ = 'themes'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    version = db.Column(db.String(20))
    description = db.Column(db.Text)
    author = db.Column(db.String(100))
    screenshot = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=False)
    settings = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Plugin(db.Model):
    __tablename__ = 'plugins'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    version = db.Column(db.String(20))
    description = db.Column(db.Text)
    author = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=False)
    settings = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Helper functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def role_required(roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user or user.role not in roles:
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Initialize database and create admin user
def create_tables():
    db.create_all()
    
    # Create default admin user if not exists
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@cms.com',
            first_name='System',
            last_name='Administrator',
            role='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Create default category
        uncategorized = Category(
            name='Uncategorized',
            slug='uncategorized',
            description='Default category for posts'
        )
        db.session.add(uncategorized)
        
        # Create default settings
        site_url = os.environ.get('RENDER_EXTERNAL_URL', 'http://localhost:5000')
        default_settings = [
            ('site_title', 'My Blog'),
            ('site_description', 'Sharing insights, experiences, and knowledge about technology, life, and everything in between'),
            ('site_url', site_url),
            ('admin_email', 'admin@myblog.com'),
            ('posts_per_page', '10'),
            ('comment_moderation', 'true'),
            ('timezone', 'UTC')
        ]
        
        for key, value in default_settings:
            setting = Setting(key=key, value=value)
            db.session.add(setting)
        
        db.session.commit()

# Import routes to register them
from routes import *

# Serve static files (JS, CSS, etc.)
@app.route('/static/<path:filename>')
def serve_static_files(filename):
    """Serve React static files (JS, CSS, images, etc.)"""
    return send_from_directory(os.path.join(app.root_path, 'static', 'static'), filename)

# Serve manifest.json and other root static files
@app.route('/manifest.json')
@app.route('/asset-manifest.json')
def serve_manifest():
    """Serve manifest files"""
    filename = request.path[1:]  # Remove leading slash
    return send_from_directory(os.path.join(app.root_path, 'static'), filename)

# Serve React App - this catches all routes not handled by the API
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    # Don't serve React app for API routes, uploads, or static files
    if (path.startswith('api/') or 
        path.startswith('uploads/') or 
        path.startswith('static/') or
        path in ['manifest.json', 'asset-manifest.json']):
        return jsonify({'error': 'Not found'}), 404
    
    # Serve index.html for all other routes (React Router will handle them)
    index_path = os.path.join(app.root_path, 'static', 'index.html')
    return send_file(index_path)

# Create tables and default data
with app.app_context():
    create_tables()

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    if debug:
        print("\n" + "="*60)
        print("NGUYEN THANH TAI BLOG - UNIFIED BACKEND + FRONTEND")
        print("="*60)
        print(f"\nServer running at: http://localhost:{port}")
        print(f"Admin Panel: http://localhost:{port}/admin")
        print("\nDefault Login:")
        print("  Username: admin")
        print("  Password: admin123")
        print("\n" + "="*60 + "\n")
    
    app.run(debug=debug, host='0.0.0.0', port=port)