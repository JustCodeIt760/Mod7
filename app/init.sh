#!/bin/sh

# Exit on any error
set -e

echo "==================================================="
echo "Starting initialization script at $(date)"
echo "==================================================="

# Wait for database
echo "[Database] Checking PostgreSQL connection..."
while ! nc -z db 5432; do
  echo "[Database] Postgres is unavailable - sleeping"
  sleep 1
done
echo "[Database] PostgreSQL connection successful!"
echo "[Database] Host: db:5432"

# Check if database is already initialized
echo "[Database] Checking if database is already initialized..."
if ! flask db current > /dev/null 2>&1; then
    echo "[Database] Database is not initialized. Starting fresh setup..."

    # Initialize database
    echo "[Database] Starting database initialization..."
    if [ -d "migrations" ]; then
        echo "[Migrations] Using existing migrations directory"
    else
        echo "[Migrations] Initializing Flask-Migrate..."
        flask db init
    fi

    echo "[Migrations] Creating initial migration..."
    flask db migrate -m "initial migration"
    echo "[Migrations] Applying migrations to database..."
    flask db upgrade
    echo "[Database] Database schema created successfully!"
else
    echo "[Database] Database is already initialized, skipping setup"
    echo "[Migrations] Checking for any pending migrations..."
    flask db upgrade
fi

echo "[Server] Configuration:"
echo "- FLASK_APP: $FLASK_APP"
echo "- FLASK_DEBUG: $FLASK_DEBUG"
echo "- DATABASE_URL: $DATABASE_URL"
echo "- SCHEMA: $SCHEMA"

# Start the Flask development server
echo "[Server] Starting Flask development server..."
echo "[Server] Listening on 0.0.0.0:5000"
flask run --host=0.0.0.0