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

# Check if we should do a clean start
if [ "$REFRESH_DB" = "true" ]; then
    echo "REFRESH_DB=true - Performing clean database start..."
    echo "Cleaning old migrations and database..."
    rm -rf migrations

    # Drop all tables to start fresh
    python -c "
from __init__ import app, db
from sqlalchemy import text
with app.app_context():
    # Drop alembic version table specifically
    db.session.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE'))
    db.drop_all()
    db.session.commit()
    print('All tables dropped including alembic_version')
"

    flask db init
else
    echo "REFRESH_DB=false - Using existing database and migrations..."
    # Check if database is already initialized
    if ! flask db current > /dev/null 2>&1; then
        echo "Database not initialized. Starting fresh setup..."
        
        if [ -d "migrations" ]; then
            echo "Using existing migrations directory"
        else
            echo "Initializing Flask-Migrate..."
            flask db init
        fi
    else
        echo "Database already initialized, checking for pending migrations..."
    fi
fi

# Create and run migrations
echo "Creating and running migrations..."
export FLASK_APP=__init__.py

if [ "$REFRESH_DB" = "true" ]; then
    flask db migrate -m "initial migration"
    flask db upgrade
    
    # Run seeds
    echo "Running seeds..."
    flask seed all
    echo "Database refresh completed!"
else
    # Run any pending migrations
    flask db upgrade
    echo "Database migrations up to date!"
fi

echo "Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:5000 "__init__:app"