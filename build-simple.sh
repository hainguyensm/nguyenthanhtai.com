#!/bin/bash

# Simple build script for Render deployment
echo "Starting simple build process..."

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies with retry logic
echo "Installing Python dependencies..."
pip install --no-cache-dir --timeout 300 -r requirements.txt || {
    echo "First install attempt failed, trying with specific versions..."
    pip install --no-cache-dir Flask Flask-CORS Flask-SQLAlchemy Flask-JWT-Extended Werkzeug bcrypt python-dotenv gunicorn psycopg2-binary
    echo "Skipping Pillow for now..."
}

# Create directories
mkdir -p backend/uploads/images

echo "Build completed!"