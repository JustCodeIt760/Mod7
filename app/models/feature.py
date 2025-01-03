from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime
from sqlalchemy.orm import validates


class Feature(db.Model):
    __tablename__ = "features"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(
        db.Integer, db.ForeignKey("projects.id"), nullable=False
    )
    sprint_id = db.Column(db.Integer, db.ForeignKey("sprints.id"))
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String, default="Not Started")
    priority = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    project = db.relationship("Project", back_populates="features")
    sprint = db.relationship("Sprint", back_populates="features")
    tasks = db.relationship("Task", back_populates="feature")

    @classmethod
    def create_feature(
        cls,
        project_id,
        name,
        description=None,
        sprint_id=None,
        status="Not Started",
        priority=0,
    ):
        feature = cls(
            project_id=project_id,
            name=name,
            description=description,
            sprint_id=sprint_id,
            status=status,
            priority=priority,
        )
        db.session.add(feature)
        db.session.commit()
        return feature

    def update_feature(self, **kwargs):
        try:
            for key, value in kwargs.items():
                setattr(self, key, value)
            db.session.commit()
            return self
        except Exception as e:
            db.session.rollback()
            raise e

    @classmethod
    def get_features_by_project(cls, project_id):
        return cls.query.filter_by(project_id=project_id).all()

    @classmethod
    def delete_feature(cls, id):
        feature = cls.query.get(id)
        if feature:
            db.session.delete(feature)
            db.session.commit()
            return True
        return False

    def assign_to_sprint(self, sprint_id):
        if sprint_id:
            from .sprint import Sprint

            sprint = Sprint.query.get(sprint_id)
            if sprint and sprint.project_id != self.project_id:
                raise ValueError("Sprint must belong to same project")
        self.sprint_id = sprint_id
        db.session.commit()
        return self

    VALID_STATUSES = ["Not Started", "In Progress", "Completed"]

    @validates("status")
    def validates_status(self, key, status):
        if status not in self.VALID_STATUSES:
            raise ValueError(
                f"Status must be one of: {', '.join(self.VALID_STATUSES)}"
            )
        return status

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "sprint_id": self.sprint_id,
            "name": self.name,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "tasks": [task.to_dict() for task in self.tasks]
        }
