#!/bin/bash

# Build script for Render deployment
echo "Starting build process..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Build frontend (already built and copied to backend/templates)
echo "Frontend already built and deployed to backend/templates"

# Set executable permissions
chmod +x build.sh

echo "Build completed successfully!"