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

# Build frontend (already built and copied to backend/templates)
echo "Frontend already built and deployed to backend/templates"

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p backend/uploads/images

echo "Build completed successfully!"