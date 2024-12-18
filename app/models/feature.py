from .db import db
from datetime import datetime


class Feature(db.Model):
    __tablename__ = "features"

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
        }
