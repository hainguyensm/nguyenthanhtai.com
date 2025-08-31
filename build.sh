#!/bin/bash

# Build script for Render deployment
set -o errexit

echo "Starting build process..."

# Upgrade pip to latest version
echo "Upgrading pip..."
pip install --upgrade pip

# Install system dependencies for Pillow
echo "Installing system dependencies..."
apt-get update && apt-get install -y \
    libjpeg-dev \
    libpng-dev \
    zlib1g-dev \
    libfreetype6-dev \
    liblcms2-dev \
    libwebp-dev \
    libharfbuzz-dev \
    libfribidi-dev \
    libxcb1-dev || echo "System packages installation failed, continuing..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

# Ensure frontend is built and static files are in place
echo "Ensuring frontend build files are properly placed..."

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p backend/uploads/images
mkdir -p backend/static
mkdir -p backend/templates

# Verify static files exist (they should already be there from development)
if [ -d "backend/static" ]; then
    echo "Static files found in backend/static"
    ls -la backend/static/
else
    echo "Warning: Static files not found in backend/static"
fi

if [ -f "backend/templates/index.html" ]; then
    echo "Index.html found in backend/templates"
else
    echo "Warning: index.html not found in backend/templates"
fi

echo "Build completed successfully!"