from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

# Association Tables for Many-to-Many
project_users = db.Table(
    "project_users",
    db.Column(
        "project_id",
        db.Integer,
        db.ForeignKey("projects.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    db.Column(
        "user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True
    ),
)


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    owner = db.relationship("User", back_populates="projects")
    sprints = db.relationship(
        "Sprint", cascade="all, delete-orphan", back_populates="project"
    )
    features = db.relationship(
        "Feature", cascade="all, delete-orphan", back_populates="project"
    )
    users = db.relationship(
        "User",
        secondary="project_users",
        back_populates="projects",
    )

    # Convert Model to Dictionary
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "owner_id": self.owner_id,
            "due_date": self.due_date.isoformat(),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    # Create method (used by route logic)
    @classmethod
    def create_project(cls, name, description, owner_id, due_date):
        new_project = cls(
            name=name,
            description=description,
            owner_id=owner_id,
            due_date=due_date,
        )
        db.session.add(new_project)
        db.session.commit()
        return new_project

    # Read method (fetch all projects for a specific user)
    @classmethod
    def get_all_projects(cls, owner_id):
        return cls.query.filter_by(owner_id=owner_id).all()

    # Get a single project by ID
    @classmethod
    def get_project_by_id(cls, id, owner_id):
        return cls.query.filter_by(id=id, owner_id=owner_id).first()

    # Update method (modify project)
    def update_project(self, name, description, due_date):
        self.name = name
        self.description = description
        self.due_date = due_date
        self.updated_at = datetime.utcnow()  # Update the timestamp
        db.session.commit()
        return self

    # Delete method (remove project)

    @classmethod
    def delete_project(cls, id, owner_id):
        """
        Delete a project and return whether it was successful
        """
        try:
            project = cls.query.filter_by(id=id, owner_id=owner_id).first()
            if not project:
                return False

            db.session.delete(project)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e  # Let the route handler deal with the error
