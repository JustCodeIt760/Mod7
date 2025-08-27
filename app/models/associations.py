from .db import db, add_prefix_for_prod

# Association tables defined separately to avoid circular imports
project_users = db.Table('project_users',
    db.Column('user_id', db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), primary_key=True),
    db.Column('project_id', db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), primary_key=True)
)