from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

environment = os.environ.get("FLASK_ENV", "development")
SCHEMA = os.environ.get("SCHEMA", "taskflow")

def add_prefix_for_prod(table_name):
    if environment == "production":
        return f"{SCHEMA}.{table_name}"
    return table_name