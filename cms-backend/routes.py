from app_unified import app, db, jwt, allowed_file, role_required, User, Post, Category, Tag, Comment, Media, Setting, Theme, Plugin, PostRevision
from flask import jsonify, request, send_from_directory, send_file
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid
import json
from slugify import slugify

# Authentication Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter(
        (User.username == username) | (User.email == username)
    ).first()
    
    if user and user.check_password(password) and user.is_active:
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        role=data.get('role', 'subscriber')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully', 'user': user.to_dict()}), 201

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify(user.to_dict() if user else None)

# User Management Routes
@app.route('/api/users', methods=['GET'])
@jwt_required()
@role_required(['admin', 'editor'])
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    role = request.args.get('role')
    
    query = User.query
    if role:
        query = query.filter_by(role=role)
    
    users = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'users': [user.to_dict() for user in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': page
    })

@app.route('/api/users', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def create_user():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if username already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Validate role
        valid_roles = ['admin', 'editor', 'author', 'subscriber']
        if data['role'] not in valid_roles:
            return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=data['role'],
            bio=data.get('bio', ''),
            website=data.get('website', ''),
            avatar_url=data.get('avatar_url', ''),
            is_active=data.get('is_active', True),
            social_links=json.dumps(data.get('social_links', {}))
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify(user.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    user = User.query.get_or_404(user_id)
    
    # Check permissions
    if current_user.role != 'admin' and current_user_id != str(user_id):
        return jsonify({'error': 'Insufficient permissions'}), 403
    
    data = request.get_json()
    
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.email = data.get('email', user.email)
    user.bio = data.get('bio', user.bio)
    user.website = data.get('website', user.website)
    user.avatar_url = data.get('avatar_url', user.avatar_url)
    
    if data.get('social_links'):
        user.social_links = json.dumps(data['social_links'])
    
    # Only admins can change roles and activation status
    if current_user.role == 'admin':
        user.role = data.get('role', user.role)
        user.is_active = data.get('is_active', user.is_active)
    
    if data.get('password'):
        user.set_password(data['password'])
    
    user.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(user.to_dict())

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@role_required(['admin'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204

# Post Management Routes
@app.route('/api/posts', methods=['GET'])
def get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status', 'published')
    post_type = request.args.get('post_type', 'post')
    category_id = request.args.get('category_id', type=int)
    tag = request.args.get('tag')
    author_id = request.args.get('author_id', type=int)
    search = request.args.get('search')
    
    query = Post.query
    
    # Apply filters
    if status != 'all':
        query = query.filter_by(status=status)
    if post_type:
        query = query.filter_by(post_type=post_type)
    if category_id:
        query = query.filter_by(category_id=category_id)
    if author_id:
        query = query.filter_by(author_id=author_id)
    if tag:
        query = query.join(Post.tags).filter(Tag.slug == tag)
    if search:
        query = query.filter(
            (Post.title.contains(search)) | 
            (Post.content.contains(search))
        )
    
    posts = query.order_by(Post.published_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'posts': [post.to_dict(include_content=False) for post in posts.items],
        'total': posts.total,
        'pages': posts.pages,
        'current_page': page
    })

@app.route('/api/posts/<slug>', methods=['GET'])
def get_post(slug):
    if slug.isdigit():
        post = Post.query.get_or_404(int(slug))
    else:
        post = Post.query.filter_by(slug=slug).first_or_404()
    
    # Increment view count
    post.view_count += 1
    db.session.commit()
    
    return jsonify(post.to_dict())

@app.route('/api/posts', methods=['POST'])
@jwt_required()
@role_required(['admin', 'editor', 'author'])
def create_post():
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    post = Post(
        title=data['title'],
        content=data.get('content', ''),
        excerpt=data.get('excerpt', ''),
        featured_image=data.get('featured_image'),
        status=data.get('status', 'draft'),
        post_type=data.get('post_type', 'post'),
        author_id=current_user_id,
        category_id=data.get('category_id'),
        comment_status=data.get('comment_status', 'open'),
        meta_title=data.get('meta_title'),
        meta_description=data.get('meta_description'),
        meta_keywords=data.get('meta_keywords'),
        custom_fields=json.dumps(data.get('custom_fields', {}))
    )
    
    # Generate slug
    post.generate_slug()
    
    # Set published date if publishing
    if post.status == 'published' and not post.published_at:
        post.published_at = datetime.utcnow()
    
    db.session.add(post)
    db.session.flush()  # Get the post ID
    
    # Handle tags
    if data.get('tags'):
        for tag_name in data['tags']:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name, slug=slugify(tag_name))
                db.session.add(tag)
            post.tags.append(tag)
    
    # Create revision
    revision = PostRevision(
        post_id=post.id,
        title=post.title,
        content=post.content,
        excerpt=post.excerpt,
        created_by=current_user_id
    )
    db.session.add(revision)
    
    db.session.commit()
    
    return jsonify(post.to_dict()), 201

@app.route('/api/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
@role_required(['admin', 'editor', 'author'])
def update_post(post_id):
    post = Post.query.get_or_404(post_id)
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Check permissions
    if current_user.role not in ['admin', 'editor'] and post.author_id != int(current_user_id):
        return jsonify({'error': 'Insufficient permissions'}), 403
    
    data = request.get_json()
    
    # Create revision before updating
    revision = PostRevision(
        post_id=post.id,
        title=post.title,
        content=post.content,
        excerpt=post.excerpt,
        created_by=current_user_id
    )
    db.session.add(revision)
    
    # Update post
    post.title = data.get('title', post.title)
    post.content = data.get('content', post.content)
    post.excerpt = data.get('excerpt', post.excerpt)
    post.featured_image = data.get('featured_image', post.featured_image)
    post.status = data.get('status', post.status)
    post.category_id = data.get('category_id', post.category_id)
    post.comment_status = data.get('comment_status', post.comment_status)
    post.meta_title = data.get('meta_title', post.meta_title)
    post.meta_description = data.get('meta_description', post.meta_description)
    post.meta_keywords = data.get('meta_keywords', post.meta_keywords)
    
    if data.get('custom_fields'):
        post.custom_fields = json.dumps(data['custom_fields'])
    
    # Update slug if title changed
    if data.get('title') and data['title'] != post.title:
        post.generate_slug()
    
    # Set published date if publishing for first time
    if post.status == 'published' and not post.published_at:
        post.published_at = datetime.utcnow()
    
    # Update tags
    if 'tags' in data:
        post.tags.clear()
        for tag_name in data['tags']:
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name, slug=slugify(tag_name))
                db.session.add(tag)
            post.tags.append(tag)
    
    post.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(post.to_dict())

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
@role_required(['admin', 'editor'])
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    
    # Delete associated revisions first (if any)
    PostRevision.query.filter_by(post_id=post_id).delete()
    
    # Delete the post (comments will be deleted automatically due to cascade)
    db.session.delete(post)
    db.session.commit()
    return '', 204

# Category Management Routes
@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.filter_by(parent_id=None).all()
    return jsonify([cat.to_dict() for cat in categories])

@app.route('/api/categories', methods=['POST'])
@jwt_required()
@role_required(['admin', 'editor'])
def create_category():
    data = request.get_json()
    
    category = Category(
        name=data['name'],
        slug=slugify(data['name']),
        description=data.get('description', ''),
        parent_id=data.get('parent_id'),
        image_url=data.get('image_url'),
        meta_title=data.get('meta_title'),
        meta_description=data.get('meta_description')
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify(category.to_dict()), 201

# Similar routes for tags, comments, media, settings, themes, and plugins...
# (Continuing with key routes)

# Media Management Routes
@app.route('/api/media', methods=['GET'])
@jwt_required()
def get_media():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    file_type = request.args.get('file_type')
    
    query = Media.query
    if file_type:
        query = query.filter_by(file_type=file_type)
    
    media = query.order_by(Media.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'media': [item.to_dict() for item in media.items],
        'total': media.total,
        'pages': media.pages,
        'current_page': page
    })

@app.route('/api/media/upload', methods=['POST'])
@jwt_required()
def upload_media():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        
        # Determine file type and folder
        if ext in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
            file_type = 'image'
            folder = 'images'
        elif ext in ['mp4', 'avi', 'mov']:
            file_type = 'video'
            folder = 'images'  # Using same folder for now
        elif ext in ['mp3', 'wav', 'ogg']:
            file_type = 'audio'
            folder = 'images'
        else:
            file_type = 'document'
            folder = 'documents'
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], folder, unique_filename)
        file.save(file_path)
        
        media = Media(
            title=request.form.get('title', filename),
            filename=unique_filename,
            original_filename=filename,
            file_path=file_path,
            url=f"/uploads/{folder}/{unique_filename}",
            file_type=file_type,
            mime_type=file.content_type,
            file_size=os.path.getsize(file_path),
            alt_text=request.form.get('alt_text', ''),
            caption=request.form.get('caption', ''),
            description=request.form.get('description', ''),
            uploaded_by=get_jwt_identity()
        )
        
        db.session.add(media)
        db.session.commit()
        
        return jsonify(media.to_dict()), 201
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/media/<int:media_id>', methods=['PUT'])
@jwt_required()
@role_required(['admin', 'editor', 'author'])
def update_media(media_id):
    media = Media.query.get_or_404(media_id)
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Check permissions
    if current_user.role not in ['admin', 'editor'] and media.uploaded_by != int(current_user_id):
        return jsonify({'error': 'Insufficient permissions'}), 403
    
    data = request.get_json()
    
    media.title = data.get('title', media.title)
    media.alt_text = data.get('alt_text', media.alt_text)
    media.caption = data.get('caption', media.caption)
    media.description = data.get('description', media.description)
    
    db.session.commit()
    return jsonify(media.to_dict())

@app.route('/api/media/<int:media_id>', methods=['DELETE'])
@jwt_required()
@role_required(['admin', 'editor', 'author'])
def delete_media(media_id):
    media = Media.query.get_or_404(media_id)
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Check permissions
    if current_user.role not in ['admin', 'editor'] and media.uploaded_by != int(current_user_id):
        return jsonify({'error': 'Insufficient permissions'}), 403
    
    # Delete physical file
    try:
        if os.path.exists(media.file_path):
            os.remove(media.file_path)
    except Exception as e:
        print(f"Error deleting file: {e}")
    
    db.session.delete(media)
    db.session.commit()
    return jsonify({'message': 'Media deleted successfully'})

# Settings Routes
@app.route('/api/settings', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def get_settings():
    settings = Setting.query.all()
    return jsonify({setting.key: setting.value for setting in settings})

@app.route('/api/settings', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def update_settings():
    data = request.get_json()
    
    for key, value in data.items():
        setting = Setting.query.filter_by(key=key).first()
        if setting:
            setting.value = str(value)
            setting.updated_at = datetime.utcnow()
        else:
            setting = Setting(key=key, value=str(value))
            db.session.add(setting)
    
    db.session.commit()
    return jsonify({'message': 'Settings updated successfully'})

# Dashboard Stats Route
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
@role_required(['admin', 'editor'])
def get_dashboard_stats():
    stats = {
        'total_posts': Post.query.filter_by(status='published').count(),
        'total_pages': Post.query.filter_by(post_type='page', status='published').count(),
        'total_comments': Comment.query.filter_by(status='approved').count(),
        'total_users': User.query.filter_by(is_active=True).count(),
        'total_media': Media.query.count(),
        'recent_posts': [post.to_dict(include_content=False) for post in 
                        Post.query.order_by(Post.created_at.desc()).limit(5).all()],
        'recent_comments': [comment.to_dict() for comment in 
                           Comment.query.order_by(Comment.created_at.desc()).limit(5).all()]
    }
    return jsonify(stats)

# Admin Routes
@app.route('/api/admin/categories', methods=['GET'])
@jwt_required()
@role_required(['admin', 'editor'])
def get_admin_categories():
    """Get categories with posts count for admin interface"""
    categories = Category.query.all()
    return jsonify([cat.to_dict(include_posts_count=True) for cat in categories])

@app.route('/api/admin/download-database', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def download_database():
    try:
        # Get the database file path
        db_path = os.path.join(os.path.dirname(__file__), 'instance', 'cms.db')
        
        if not os.path.exists(db_path):
            return jsonify({'error': 'Database file not found'}), 404
        
        # Generate filename with current date
        filename = f"cms-backup-{datetime.utcnow().strftime('%Y-%m-%d')}.db"
        
        return send_file(
            db_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/x-sqlite3'
        )
    except Exception as e:
        return jsonify({'error': f'Failed to download database: {str(e)}'}), 500

# Comments Routes
@app.route('/api/posts/<slug>/comments', methods=['GET'])
def get_post_comments(slug):
    post = Post.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    comments = Comment.query.filter_by(post_id=post.id, status='approved').order_by(Comment.created_at.desc()).all()
    return jsonify([comment.to_dict() for comment in comments])

@app.route('/api/posts/<slug>/comments', methods=['POST'])
def add_post_comment(slug):
    post = Post.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    data = request.get_json()
    if not data or not data.get('content'):
        return jsonify({'error': 'Comment content is required'}), 400
    
    comment = Comment(
        post_id=post.id,
        author_name=data.get('name', 'Anonymous'),
        author_email=data.get('email', ''),
        content=data['content'],
        status='approved'  # Auto-approve for now, can be changed to 'pending' for moderation
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify(comment.to_dict()), 201

# Admin Comments Management
@app.route('/api/comments', methods=['GET'])
@jwt_required()
@role_required(['admin', 'editor'])
def get_all_comments():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', 'all')
        search = request.args.get('search', '')
        post_id = request.args.get('post_id', type=int)
        
        # Base query
        query = Comment.query
        
        # Filter by status
        if status != 'all':
            query = query.filter(Comment.status == status)
        
        # Filter by post
        if post_id:
            query = query.filter(Comment.post_id == post_id)
        
        # Search filter
        if search:
            query = query.filter(
                db.or_(
                    Comment.author_name.ilike(f'%{search}%'),
                    Comment.author_email.ilike(f'%{search}%'),
                    Comment.content.ilike(f'%{search}%')
                )
            )
        
        # Order by created_at desc
        query = query.order_by(Comment.created_at.desc())
        
        # Paginate
        comments = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # Get stats
        stats = {
            'total': Comment.query.count(),
            'pending': Comment.query.filter(Comment.status == 'pending').count(),
            'approved': Comment.query.filter(Comment.status == 'approved').count(),
            'spam': Comment.query.filter(Comment.status == 'spam').count(),
            'trash': Comment.query.filter(Comment.status == 'trash').count(),
        }
        
        return jsonify({
            'comments': [comment.to_dict() for comment in comments.items],
            'current_page': comments.page,
            'pages': comments.pages,
            'total': comments.total,
            'per_page': per_page,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
@role_required(['admin', 'editor'])
def update_comment_admin(comment_id):
    try:
        comment = Comment.query.get_or_404(comment_id)
        data = request.get_json()
        
        # Update allowed fields
        if 'status' in data:
            comment.status = data['status']
        if 'content' in data:
            comment.content = data['content']
        if 'author_name' in data:
            comment.author_name = data['author_name']
        if 'author_email' in data:
            comment.author_email = data['author_email']
        if 'author_website' in data:
            comment.author_website = data['author_website']
        
        db.session.commit()
        return jsonify(comment.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
@role_required(['admin', 'editor'])
def delete_comment_admin(comment_id):
    try:
        comment = Comment.query.get_or_404(comment_id)
        
        # Delete all replies first
        Comment.query.filter(Comment.parent_id == comment_id).delete()
        
        # Delete the comment
        db.session.delete(comment)
        db.session.commit()
        
        return jsonify({'message': 'Comment deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments/bulk', methods=['POST'])
@jwt_required()
@role_required(['admin', 'editor'])
def bulk_comment_action():
    try:
        data = request.get_json()
        comment_ids = data.get('comment_ids', [])
        action = data.get('action')
        
        if not comment_ids or not action:
            return jsonify({'error': 'Comment IDs and action are required'}), 400
        
        comments = Comment.query.filter(Comment.id.in_(comment_ids)).all()
        
        if action == 'approve':
            for comment in comments:
                comment.status = 'approved'
        elif action == 'spam':
            for comment in comments:
                comment.status = 'spam'
        elif action == 'trash':
            for comment in comments:
                comment.status = 'trash'
        elif action == 'delete':
            # Delete replies first
            Comment.query.filter(Comment.parent_id.in_(comment_ids)).delete()
            # Delete comments
            Comment.query.filter(Comment.id.in_(comment_ids)).delete()
        else:
            return jsonify({'error': 'Invalid action'}), 400
        
        db.session.commit()
        return jsonify({'message': f'Bulk action {action} completed successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comments/<int:comment_id>/reply', methods=['POST'])
@jwt_required()
@role_required(['admin', 'editor', 'author'])
def reply_to_comment(comment_id):
    try:
        parent_comment = Comment.query.get_or_404(comment_id)
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        data = request.get_json()
        content = data.get('content', '').strip()
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        reply = Comment(
            post_id=parent_comment.post_id,
            author_id=int(current_user_id),
            author_name=f"{current_user.first_name} {current_user.last_name}",
            author_email=current_user.email,
            content=content,
            status='approved',  # Admin replies are auto-approved
            parent_id=comment_id
        )
        
        db.session.add(reply)
        db.session.commit()
        
        return jsonify(reply.to_dict()), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/posts/list', methods=['GET'])
@jwt_required()
@role_required(['admin', 'editor'])
def get_posts_list():
    """Get a simple list of posts for dropdowns/filters"""
    try:
        # Only get posts that have comments
        posts_with_comments = db.session.query(Post).join(Comment).distinct().all()
        
        posts_list = [
            {
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'comment_count': Comment.query.filter_by(post_id=post.id).count()
            }
            for post in posts_with_comments
        ]
        
        # Sort by comment count descending
        posts_list.sort(key=lambda x: x['comment_count'], reverse=True)
        
        return jsonify(posts_list)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Theme Routes
@app.route('/api/themes/active', methods=['GET'])
def get_active_theme():
    """Get the currently active theme"""
    try:
        active_theme = Theme.query.filter_by(is_active=True).first()
        
        if not active_theme:
            # Return default theme if none is active
            return jsonify({
                'slug': 'default',
                'name': 'Default Theme',
                'settings': {}
            })
        
        settings = {}
        if active_theme.settings:
            try:
                settings = json.loads(active_theme.settings)
            except:
                settings = {}
        
        return jsonify({
            'slug': active_theme.slug,
            'name': active_theme.name,
            'settings': settings
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/themes/activate', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def activate_theme():
    """Activate a theme"""
    try:
        data = request.get_json()
        theme_id = data.get('theme_id')
        
        if not theme_id:
            return jsonify({'error': 'Theme ID is required'}), 400
        
        # Deactivate all themes first
        Theme.query.update({'is_active': False})
        
        # Check if theme exists in database, if not create it
        theme = Theme.query.filter_by(slug=theme_id).first()
        if not theme:
            # Create theme entry for default themes
            theme_names = {
                'default': 'Default Theme',
                'dark': 'Dark Theme', 
                'minimal': 'Minimal Theme',
                'blog': 'Blog Theme'
            }
            
            theme = Theme(
                name=theme_names.get(theme_id, theme_id.title()),
                slug=theme_id,
                version='1.0.0',
                author='CMS Team',
                is_active=True
            )
            db.session.add(theme)
        else:
            theme.is_active = True
        
        db.session.commit()
        
        return jsonify({'message': 'Theme activated successfully', 'theme': theme_id})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/themes/<theme_id>/settings', methods=['PUT'])
@jwt_required()
@role_required(['admin'])
def update_theme_settings(theme_id):
    """Update theme settings"""
    try:
        data = request.get_json()
        
        theme = Theme.query.filter_by(slug=theme_id).first()
        if not theme:
            return jsonify({'error': 'Theme not found'}), 404
        
        # Store settings as JSON string
        theme.settings = json.dumps(data)
        db.session.commit()
        
        return jsonify({'message': 'Theme settings updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# File serving
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

