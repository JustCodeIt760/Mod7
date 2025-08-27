from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

# Association table for many-to-many relationship between Users and Projects
project_users = db.Table('project_users',
    db.Column('user_id', db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), primary_key=True),
    db.Column('project_id', db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), primary_key=True)
)

class User(db.Model, UserMixin):
    __tablename__ = "users"

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    first_name = db.Column(db.String(40), nullable=False)
    last_name = db.Column(db.String(40), nullable=False)
    hashed_password = db.Column(db.String(255), nullable=False)

    # Temporarily disabled to fix backend startup
    # owned_projects = db.relationship(
    #     "Project", 
    #     foreign_keys="Project.owner_id", 
    #     back_populates="owner",
    #     lazy='dynamic'
    # )
    
    # projects = db.relationship(
    #     "Project", 
    #     secondary=project_users, 
    #     back_populates="users",
    #     lazy='dynamic'
    # )
    
    # Agent state relationship
    agent_state = db.relationship("AgentState", back_populates="user", uselist=False)
    
    # Chat messages relationship
    chat_messages = db.relationship("ChatMessage", back_populates="user", lazy='dynamic')

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)

    def has_project_access(self, project_id):
        # Simplified for now until relationships are fixed
        return True

    def is_project_owner(self, project_id):
        # Simplified for now until relationships are fixed  
        return True

    def get_project_role(self, project_id):
        # Simplified for now until relationships are fixed
        return "owner"

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
        }
