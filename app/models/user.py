from .db import db, environment, SCHEMA, add_prefix_for_prod
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


class User(db.Model, UserMixin):
    __tablename__ = "users"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    first_name = db.Column(db.String(40), nullable=False)
    last_name = db.Column(db.String(40), nullable=False)
    hashed_password = db.Column(db.String(255), nullable=False)

    owned_projects = db.relationship(
        "Project", foreign_keys="Project.owner_id", back_populates="owner"
    )
    projects = db.relationship(
        "Project", secondary="project_users", back_populates="users"
    )
    created_tasks = db.relationship(
        "Task", foreign_keys="Task._created_by", backref="creator"
    )
    assigned_tasks = db.relationship(
        "Task", foreign_keys="Task.assigned_to", backref="assignee"
    )

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
        return check_password_hash(self.password, password)

    def has_project_access(self, project_id):
        # Check if user is owner
        is_owner = any(
            project.id == project_id and project.owner_id == self.id
            for project in self.projects
        )

        # Check if user is member
        is_member = any(project.id == project_id for project in self.projects)

        return is_owner or is_member

    def is_project_owner(self, project_id):
        return any(project.id == project_id for project in self.owned_projects)

    def get_project_role(self, project_id):
        if any(project.id == project_id for project in self.owned_projects):
            return "owner"
        if any(project.id == project_id for project in self.projects):
            return "member"
        return None

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name,
        }
