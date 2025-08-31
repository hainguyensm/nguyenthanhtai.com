# BioTech Blog - Personal Biotechnology Blog

A full-stack blog application for biotechnology content with admin dashboard.

## Features

- Public blog display with category filtering
- Markdown support for blog content
- Admin dashboard for blog management
- Authentication system
- SQLite database for data storage
- Responsive design

## Tech Stack

- **Backend**: Python Flask, SQLAlchemy, Flask-JWT-Extended
- **Frontend**: React.js, React Router, Axios
- **Database**: SQLite
- **Styling**: Custom CSS

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

### Protected Endpoints (Require JWT)
- `POST /api/admin/posts` - Create new post
- `PUT /api/admin/posts/<id>` - Update post
- `DELETE /api/admin/posts/<id>` - Delete post

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
└── README.md
```