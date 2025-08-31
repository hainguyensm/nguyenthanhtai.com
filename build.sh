#!/bin/bash

echo "Starting build process for Nguyen Thanh Tai Blog..."

# Install Python dependencies
echo "Installing Python dependencies..."
cd cms-backend
pip install -r requirements.txt

# Install Node.js dependencies and build React app  
echo "Building React frontend..."
cd ../cms-frontend
npm install
npm run build

# Copy built frontend to backend static folder
echo "Copying frontend build to backend..."
cd ../cms-backend
rm -rf static/*
cp -r ../cms-frontend/build/* static/

echo "Build completed successfully!"