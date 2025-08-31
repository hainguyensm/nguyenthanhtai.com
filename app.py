from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import bcrypt
import os
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='backend/static', template_folder='backend/templates')

# Configuration
if os.environ.get('DATABASE_URL'):
    # Production database (PostgreSQL on Render)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL').replace('postgres://', 'postgresql://')
else:
    # Development database (SQLite)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'backend', 'uploads')

# Set Flask environment
if os.environ.get('FLASK_ENV') == 'production':
    app.config['DEBUG'] = False
else:
    app.config['DEBUG'] = True

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'images'), exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    mime_type = db.Column(db.String(100), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'url': self.url,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'uploaded_by': self.uploaded_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class BlogPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    summary = db.Column(db.Text)
    author = db.Column(db.String(100))
    category = db.Column(db.String(50))
    tags = db.Column(db.String(200))
    image_url = db.Column(db.String(300))
    published = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'content': self.content,
            'summary': self.summary,
            'author': self.author,
            'category': self.category,
            'tags': self.tags.split(',') if self.tags else [],
            'image_url': self.image_url,
            'published': self.published,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

@app.route('/api/posts', methods=['GET'])
def get_posts():
    published_only = request.args.get('published', 'true').lower() == 'true'
    category = request.args.get('category')
    
    query = BlogPost.query
    if published_only:
        query = query.filter_by(published=True)
    if category:
        query = query.filter_by(category=category)
    
    posts = query.order_by(BlogPost.created_at.desc()).all()
    return jsonify([post.to_dict() for post in posts])

@app.route('/api/posts/<string:slug>', methods=['GET'])
def get_post(slug):
    post = BlogPost.query.filter_by(slug=slug).first_or_404()
    return jsonify(post.to_dict())

@app.route('/api/admin/posts', methods=['POST'])
@jwt_required()
def create_post():
    data = request.json
    
    slug = data.get('slug', '').lower().replace(' ', '-')
    if BlogPost.query.filter_by(slug=slug).first():
        return jsonify({'error': 'Slug already exists'}), 400
    
    post = BlogPost(
        title=data['title'],
        slug=slug,
        content=data['content'],
        summary=data.get('summary'),
        author=data.get('author'),
        category=data.get('category'),
        tags=','.join(data.get('tags', [])) if isinstance(data.get('tags'), list) else data.get('tags'),
        image_url=data.get('image_url'),
        published=data.get('published', False)
    )
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify(post.to_dict()), 201

@app.route('/api/admin/posts/<int:id>', methods=['PUT'])
@jwt_required()
def update_post(id):
    post = BlogPost.query.get_or_404(id)
    data = request.json
    
    post.title = data.get('title', post.title)
    post.content = data.get('content', post.content)
    post.summary = data.get('summary', post.summary)
    post.author = data.get('author', post.author)
    post.category = data.get('category', post.category)
    post.tags = ','.join(data.get('tags', [])) if isinstance(data.get('tags'), list) else data.get('tags', post.tags)
    post.image_url = data.get('image_url', post.image_url)
    post.published = data.get('published', post.published)
    post.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify(post.to_dict())

@app.route('/api/admin/posts/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_post(id):
    post = BlogPost.query.get_or_404(id)
    db.session.delete(post)
    db.session.commit()
    return '', 204

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user.password_hash):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            'username': user.username,
            'is_admin': user.is_admin
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    user = User(
        username=username,
        password_hash=password_hash,
        is_admin=User.query.count() == 0
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = db.session.query(BlogPost.category).distinct().filter(BlogPost.category.isnot(None)).all()
    return jsonify([cat[0] for cat in categories if cat[0]])

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload/image', methods=['POST'])
@jwt_required()
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        # Generate unique filename
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        
        # Save file
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'images', filename)
        file.save(filepath)
        
        # Get current user
        current_user_id = get_jwt_identity()
        
        # Save image record to database
        image_url = f"/uploads/images/{filename}"
        image_record = Image(
            filename=filename,
            original_filename=file.filename,
            file_path=filepath,
            url=image_url,
            file_size=os.path.getsize(filepath),
            mime_type=file.content_type or f'image/{ext}',
            uploaded_by=current_user_id
        )
        
        db.session.add(image_record)
        db.session.commit()
        
        # Return image data
        return jsonify({
            'success': True,
            'id': image_record.id,
            'url': image_url,
            'filename': filename,
            'original_filename': file.filename,
            'file_size': image_record.file_size
        })
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/uploads/<path:path>')
def serve_upload(path):
    return send_from_directory(app.config['UPLOAD_FOLDER'], path)

@app.route('/api/images', methods=['GET'])
@jwt_required()
def get_images():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    images = Image.query.order_by(Image.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'images': [img.to_dict() for img in images.items],
        'total': images.total,
        'pages': images.pages,
        'current_page': page
    })

@app.route('/api/images/<int:image_id>', methods=['DELETE'])
@jwt_required()
def delete_image(image_id):
    image = Image.query.get_or_404(image_id)
    
    # Delete physical file
    try:
        if os.path.exists(image.file_path):
            os.remove(image.file_path)
    except OSError as e:
        print(f"Error deleting file {image.file_path}: {e}")
    
    # Delete database record
    db.session.delete(image)
    db.session.commit()
    
    return '', 204

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return render_template('index.html')

# Initialize database and create admin user
def init_db():
    with app.app_context():
        db.create_all()
        
        if User.query.count() == 0:
            admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
            admin_user = User(username='admin', password_hash=admin_password, is_admin=True)
            db.session.add(admin_user)
            db.session.commit()
            print("Admin user created: username='admin', password='admin123'")

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])
else:
    # For production deployment (gunicorn)
    init_db()