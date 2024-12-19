#!/bin/sh

# Exit on any error
set -e

echo "Starting initialization script..."

# Wait for database
echo "Waiting for postgres..."
while ! nc -z db 5432; do
  echo "Postgres is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL started successfully!"

# Run migrations first
#echo "Running database migrations..."
#flask --app __init__.py db upgrade
#echo "Migrations completed!"

# Try to clear seeds, but don't fail if tables don't exist
#echo "Clearing existing seed data..."
#flask --app __init__.py seed undo || echo "No existing data to clear"

# Run seeds
#echo "Running database seeds..."
#flask --app __init__.py seed all
#echo "Seeds completed!"

echo "Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:5000 "__init__:app"