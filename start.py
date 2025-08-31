#!/usr/bin/env python3

import os
import sys

# Add the cms-backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'cms-backend'))

# Import the Flask app from app_unified
from app_unified import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(debug=debug, host='0.0.0.0', port=port)