# Nguyen Thanh Tai Blog - Biotechnology Research Blog

A professional full-stack blog application for biotechnology research content with comprehensive admin dashboard and public pages.

## Features

### Public Pages
- **Homepage**: Blog post listing with category filtering
- **About**: Personal introduction and expertise areas
- **Research**: Current research projects and methodologies
- **Publications**: Scientific papers, books, and conference presentations
- **Courses**: Available courses with registration information
- **Contact**: Contact form and collaboration opportunities

### Blog Features
- Rich text editor with HTML support and image upload
- Category and tag management
- SEO-friendly URLs with slugs
- **Social Comment System**: Users can comment on blog posts with social login support
- **Threaded Comments**: Reply functionality with nested comment threads
- **Multiple Login Options**: Facebook, Google, Twitter, and guest commenting
- Responsive design for all devices
- Professional biotechnology theme

### Admin Dashboard
- Create, edit, and delete blog posts
- Image gallery and management
- **Comment Management**: Approve, moderate, and delete comments
- User authentication with JWT
- Database image tracking
- Advanced content editor

## Tech Stack

- **Backend**: Python Flask, SQLAlchemy, Flask-JWT-Extended, bcrypt
- **Frontend**: React.js, React Router, Axios
- **Database**: SQLite (development) / PostgreSQL (production)
- **Styling**: Custom CSS with professional biotechnology theme
- **Deployment**: Render.com with gunicorn

## Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask server:
```bash
python app.py
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Default Admin Credentials

- Username: `admin`
- Password: `admin123`

## Usage

1. Start both backend and frontend servers
2. Visit http://localhost:3000 to view the blog
3. Click "Đăng nhập" to access admin dashboard
4. In admin dashboard, you can:
   - Create new blog posts
   - Edit existing posts
   - Delete posts
   - Manage post categories and tags
   - Toggle publish status

## API Endpoints

### Public Endpoints
- `GET /api/posts` - Get all published posts
- `GET /api/posts/<slug>` - Get single post by slug
- `GET /api/categories` - Get all categories
- `GET /api/posts/<slug>/comments` - Get comments for a post
- `POST /api/posts/<slug>/comments` - Create new comment

### Protected Endpoints (Require JWT)
- `POST /api/admin/posts` - Create new post
- `PUT /api/admin/posts/<id>` - Update post
- `DELETE /api/admin/posts/<id>` - Delete post
- `GET /api/admin/comments` - Get all comments for moderation
- `PUT /api/admin/comments/<id>/approve` - Approve comment
- `DELETE /api/admin/comments/<id>` - Delete comment

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user

## Project Structure

```
nguyenthanhtai.com/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── blog.db            # SQLite database (auto-created)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/           # API integration
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   └── package.json       # Node dependencies
├── app.py                 # Production Flask app (root level)
├── requirements.txt       # Python dependencies
├── Procfile              # Process file for deployment
├── render.yaml           # Render deployment configuration
├── build.sh              # Build script
└── README.md

## Deployment on Render.com

This application is configured for easy deployment on Render.com with PostgreSQL database.

### Prerequisites
- GitHub repository with your code
- Render.com account

### Deployment Steps

1. **Connect GitHub Repository**
   - Go to Render.com and create a new account
   - Connect your GitHub account
   - Import your repository

2. **Deploy Using render.yaml**
   - Render will automatically detect the `render.yaml` file
   - It will create both a web service and PostgreSQL database
   - Environment variables will be set automatically

3. **Manual Deployment (Alternative)**
   - Create a new Web Service
   - Select your repository
   - Set build command: `./build.sh`
   - Set start command: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - Add environment variables:
     - `FLASK_ENV=production`
     - `JWT_SECRET_KEY=your-secure-secret-key`
     - `DATABASE_URL=your-postgresql-connection-string`

4. **Database Setup**
   - Create a PostgreSQL database service
   - Copy the database connection string
   - Add it as `DATABASE_URL` environment variable

### Environment Variables

Required environment variables for production:

- `FLASK_ENV`: Set to `production`
- `JWT_SECRET_KEY`: Secure random string for JWT tokens
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Automatically set by Render

### Post-Deployment

After deployment:
1. The database tables will be created automatically
2. Default admin user will be created:
   - Username: `admin`
   - Password: `admin123`
3. Visit your Render URL to access the application

### Live Demo

Once deployed, your site will be available at your Render domain (e.g., `https://your-app-name.onrender.com`)

Available pages:
- `/` - Homepage with blog posts
- `/about` - About page
- `/research` - Research projects
- `/publications` - Publications and papers
- `/courses` - Available courses
- `/contact` - Contact information
- `/admin` - Admin dashboard (requires login)

## Troubleshooting Deployment

### Common Issues

#### 1. Pillow Build Errors
If you encounter Pillow/PIL dependency issues during deployment:
- Use `requirements-minimal.txt` instead (doesn't include Pillow)
- The application doesn't actually use Pillow for core functionality

#### 2. Build Command Issues
If the build script fails:
- Try using the simple build command: `pip install -r requirements.txt`
- Or use the minimal requirements: `pip install -r requirements-minimal.txt`

#### 3. Database Connection Issues
- Ensure PostgreSQL service is created and connected
- Check that DATABASE_URL environment variable is properly set
- Database tables are created automatically on first run

#### 4. Alternative Build Commands

For manual deployment, you can use these build commands:

**Option 1 (Recommended):**
```bash
pip install -r requirements.txt
```

**Option 2 (If Pillow issues persist):**
```bash
pip install -r requirements-minimal.txt
```

**Option 3 (Manual package installation):**
```bash
pip install Flask Flask-CORS Flask-SQLAlchemy Flask-JWT-Extended Werkzeug bcrypt python-dotenv gunicorn psycopg2-binary
```

#### 5. Environment Variables Checklist
- `FLASK_ENV=production`
- `JWT_SECRET_KEY` (auto-generated by Render)
- `DATABASE_URL` (auto-set when database is connected)
- `PORT` (auto-set by Render)

### Build Scripts Available

- `build.sh` - Full build script with system dependencies
- `build-simple.sh` - Simplified build script
- Use direct pip install in render.yaml (current configuration)

### Support

If deployment issues persist:
1. Check Render build logs for specific error messages
2. Try the minimal requirements file
3. Verify all files are properly committed to GitHub
4. Ensure database service is running and connected