#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
cd frontend
npm install

# Build React app
npm run build

# Collect static files
cd ..
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate
