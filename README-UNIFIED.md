# CMS System - Unified Application

## 🚀 Quick Start (Unified Version)

The CMS has been combined into a single application where the Flask backend serves both the API and the React frontend.

### Prerequisites
- Python 3.8+
- Node.js 16+ (for building frontend only)

### Installation

1. **Setup Backend Environment**:
   ```bash
   cd cms-backend
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # source venv/bin/activate  # On macOS/Linux
   pip install -r requirements.txt
   ```

2. **Build Frontend** (if making changes):
   ```bash
   cd cms-frontend
   npm install
   npm run build
   ```
   
3. **Copy Built Frontend to Backend**:
   ```bash
   cp -r cms-frontend/build/* cms-backend/static/
   ```

### Running the Unified Application

#### Option 1: Use the Startup Script
```bash
start-unified-cms.bat  # On Windows
```

#### Option 2: Manual Start
```bash
cd cms-backend
python app_unified.py
```

### Access the Application

**Single URL for Everything**: `http://localhost:5000`

- **Public Website**: `http://localhost:5000`
- **Admin Panel**: `http://localhost:5000/admin`
- **Login Page**: `http://localhost:5000/login`
- **API Endpoints**: `http://localhost:5000/api/*`

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

## 📦 Architecture

### Unified Structure
```
cms-backend/
├── app_unified.py      # Main application (serves both API and frontend)
├── routes.py           # API routes
├── requirements.txt    # Python dependencies
├── cms.db             # SQLite database
├── static/            # Built React frontend
│   ├── index.html     # React app entry point
│   └── static/        # React assets (JS, CSS)
└── uploads/           # User uploaded files
```

### How It Works
1. **Flask serves the API** at `/api/*` endpoints
2. **Flask serves static files** from the built React app
3. **React Router handles** all frontend routing
4. **Single server** on port 5000 handles everything

## 🔧 Development Workflow

### Backend Changes
1. Edit Python files in `cms-backend/`
2. Flask auto-reloads in debug mode

### Frontend Changes
1. Edit React files in `cms-frontend/src/`
2. Run `npm run build` in `cms-frontend/`
3. Copy build to `cms-backend/static/`
4. Refresh browser

### Quick Frontend Development
For rapid frontend development, you can still run the React dev server:
```bash
cd cms-frontend
npm start  # Runs on port 3000
```
Configure proxy in `package.json` to point to Flask backend on port 5000.

## 🚢 Production Deployment

### 1. Build for Production
```bash
# Build frontend
cd cms-frontend
npm run build

# Copy to backend
cp -r build/* ../cms-backend/static/

# Set production config
cd ../cms-backend
export FLASK_ENV=production
```

### 2. Use Production Server
```python
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app_unified:app
```

### 3. Environment Variables
Create `.env` file in `cms-backend/`:
```env
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET_KEY=your-secure-secret-key
```

## 🎯 Benefits of Unified Application

1. **Single Deployment**: One application to deploy and manage
2. **Simplified CORS**: No cross-origin issues between frontend and backend
3. **Single Port**: Only need to open one port (5000)
4. **Easier Configuration**: One configuration file for everything
5. **Better Performance**: No proxy overhead between frontend and backend
6. **Simpler Docker**: One container for the entire application

## 🐳 Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy and install Python dependencies
COPY cms-backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY cms-backend/ .

# Expose port
EXPOSE 5000

# Run application
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app_unified:app"]
```

Build and run:
```bash
docker build -t cms-unified .
docker run -p 5000:5000 cms-unified
```

## 📝 API Endpoints

All API endpoints are prefixed with `/api/`:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `GET /api/media` - List media
- `POST /api/media/upload` - Upload file
- And more...

## 🔐 Security Notes

For production:
1. Change default admin password
2. Set secure JWT secret key
3. Use PostgreSQL instead of SQLite
4. Enable HTTPS
5. Set proper CORS headers
6. Use environment variables for sensitive data

## 📚 Technology Stack

- **Backend**: Flask 3.1.2, SQLAlchemy, JWT
- **Frontend**: React 18, Material-UI, React Router
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Server**: Gunicorn (production)

---

**Unified CMS** - One application, complete functionality! 🎉