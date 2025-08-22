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

# Clean start - remove all migration data
echo "Cleaning old migrations..."
rm -rf migrations
flask db init

# Create and run fresh migrations
echo "Creating and running migrations..."
export FLASK_APP=__init__.py
flask db migrate -m "initial migration"
flask db upgrade

# Run seeds
echo "Running seeds..."
flask seed all
echo "Database refresh completed!"

echo "Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:5000 "__init__:app"