# CMS System - WordPress-like Content Management System

A full-featured Content Management System built with Flask (Python) backend and React frontend, similar to WordPress functionality.

## Features

### Backend Features (Flask)
- **User Management**: Role-based access control (Admin, Editor, Author, Contributor, Subscriber)
- **Content Management**: Create, edit, delete posts and pages
- **Rich Content**: Support for rich text content with HTML
- **Media Management**: File upload and management system
- **Categories & Tags**: Organize content with hierarchical categories and tags
- **Comments System**: Threaded comments with moderation
- **SEO Features**: Meta titles, descriptions, and SEO-friendly URLs
- **Revisions**: Post revision history and version control
- **Settings**: Configurable site settings
- **REST API**: Complete RESTful API for all operations

### Frontend Features (React)
- **Admin Dashboard**: Comprehensive admin panel with statistics
- **Rich Text Editor**: ReactQuill-based WYSIWYG editor
- **Media Library**: Drag-and-drop file uploads with preview
- **Responsive Design**: Mobile-friendly Material-UI components
- **User Authentication**: JWT-based authentication system
- **Post Management**: Create, edit, publish, and manage posts
- **Category Management**: Organize content with categories
- **Public Frontend**: Beautiful public-facing website
- **SEO Optimized**: Meta tags and structured data
- **Search & Filter**: Advanced filtering and search capabilities

## Technology Stack

### Backend
- **Framework**: Flask 2.3.3
- **Database**: SQLAlchemy with SQLite (easily configurable for PostgreSQL/MySQL)
- **Authentication**: Flask-JWT-Extended
- **File Handling**: Werkzeug for secure file uploads
- **Migrations**: Flask-Migrate for database versioning

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Rich Text**: ReactQuill
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## Project Structure

```
cms-system/
├── cms-backend/                 # Flask backend
│   ├── app.py                  # Main Flask application with models
│   ├── routes.py               # API routes and endpoints
│   ├── requirements.txt        # Python dependencies
│   └── uploads/                # Media files storage
├── cms-frontend/               # React frontend
│   ├── public/                 # Static files
│   ├── src/                    # Source code
│   │   ├── components/         # Reusable components
│   │   │   └── layout/         # Layout components
│   │   ├── contexts/           # React contexts (Auth)
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin panel pages
│   │   │   ├── auth/           # Authentication pages
│   │   │   └── public/         # Public website pages
│   │   └── services/           # API service layer
│   └── package.json            # Node.js dependencies
└── README.md                   # This file
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd cms-backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database**:
   ```bash
   python app.py
   ```
   The database will be created automatically with default admin user:
   - **Username**: admin
   - **Password**: admin123
   - **Email**: admin@cms.com

5. **Run backend server**:
   ```bash
   python app.py
   ```
   Server runs on `http://localhost:5001`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd cms-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```
   Frontend runs on `http://localhost:3000`

## Usage

### Accessing the System

1. **Public Website**: Visit `http://localhost:3000`
2. **Admin Panel**: Visit `http://localhost:3000/admin` or `http://localhost:3000/login`
3. **Login with default admin credentials**:
   - Username: `admin`
   - Password: `admin123`

### User Roles & Permissions

- **Admin**: Full access to all features
- **Editor**: Can manage posts, categories, comments, and users
- **Author**: Can create and manage own posts
- **Contributor**: Can create posts but needs approval
- **Subscriber**: Can only comment (if enabled)

### Creating Content

1. **Login to admin panel**
2. **Go to Posts → New Post**
3. **Create your content with the rich text editor**
4. **Add categories and tags**
5. **Set SEO metadata**
6. **Publish or save as draft**

### Managing Media

1. **Go to Media in admin panel**
2. **Upload images, documents, videos**
3. **Organize and manage uploaded files**
4. **Insert media into posts**

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - List posts (with filtering)
- `GET /api/posts/{id}` - Get single post
- `POST /api/posts` - Create post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

### Media
- `GET /api/media` - List media files
- `POST /api/media/upload` - Upload media file

### Users
- `GET /api/users` - List users (admin only)
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Configuration

### Backend Configuration
Edit `app.py` to modify:
- Database connection
- JWT secret key
- File upload settings
- CORS settings

### Frontend Configuration
Create `.env` file in `cms-frontend/` for:
```env
REACT_APP_API_URL=http://localhost:5001
```

## Deployment

### Production Considerations
1. **Change default passwords**
2. **Use PostgreSQL/MySQL for production**
3. **Set secure JWT secret key**
4. **Configure HTTPS**
5. **Set up proper file storage (AWS S3, etc.)**
6. **Enable production builds**

### Environment Variables
```bash
# Backend
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/dbname
JWT_SECRET_KEY=your-secure-secret-key

# Frontend
REACT_APP_API_URL=https://your-api-domain.com
```

## Development

### Adding New Features
1. **Backend**: Add models to `app.py`, routes to `routes.py`
2. **Frontend**: Create components in appropriate directories
3. **API**: Update `services/api.js` for new endpoints

### Database Migrations
```bash
flask db init
flask db migrate -m "Description"
flask db upgrade
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

This project is open source and available under the MIT License.

## Support

For support and questions:
- Email: admin@cms.com
- Create an issue in the repository
- Check documentation in code comments

## Screenshots

### Admin Dashboard
![Admin Dashboard](docs/admin-dashboard.png)

### Post Editor
![Post Editor](docs/post-editor.png)

### Public Homepage
![Public Homepage](docs/homepage.png)

---

**Built with ❤️ using Flask and React**