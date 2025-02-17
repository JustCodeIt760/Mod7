from .db import db
from datetime import datetime
from sqlalchemy.orm import validates


class Task(db.Model):
    __tablename__ = "tasks"


    id = db.Column(db.Integer, primary_key=True)
    feature_id = db.Column(
        db.Integer, db.ForeignKey("features.id"), nullable=False
    )
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    status = db.Column(db.String, default="Not Started")
    priority = db.Column(db.Integer, default=0)
    assigned_to = db.Column(db.Integer, db.ForeignKey("users.id"))
    _created_by = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False
    )
    _start_date = db.Column(db.DateTime)
    _due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    feature = db.relationship("Feature", back_populates="tasks")

    @property
    def start_date(self):
        return self._start_date

    @property
    def due_date(self):
        return self._due_date

    @start_date.setter
    def start_date(self, value):
        if isinstance(value, str):
            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
        self._start_date = value

    @due_date.setter
    def due_date(self, value):
        if isinstance(value, str):
            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
        self._due_date = value

    @property
    def duration(self):
        if self._start_date and self._due_date:
            difference = self._due_date - self._start_date
            total_hours = difference.days * 24 + difference.seconds / 3600

            if total_hours >= 12:
                return int((total_hours + 12) // 24)
            else:
                return int(total_hours)
        return None

    @classmethod
    def get_accessible_tasks(cls, user):
        from . import Project, Feature  # Import when needed

        accessible_projects = Project.query.filter(
            db.or_(Project.owner_id == user.id, Project.users.contains(user))
        ).all()

        return (
            cls.query.join(Feature)
            .filter(
                Feature.project_id.in_([p.id for p in accessible_projects])
            )
            .distinct()
            .all()
        )

    @classmethod
    def create_task(
        cls,
        feature_id,
        name,
        description,
        created_by,
        assigned_to=None,
        status="In Progress",
        priority=0,
        start_date=None,
        due_date=None,
    ):
        task = cls(
            feature_id=feature_id,
            name=name,
            description=description,
            _created_by=created_by,
            assigned_to=assigned_to,
            status=status,
            priority=priority,
            start_date=start_date,
            due_date=due_date,
        )

        db.session.add(task)
        db.session.commit()
        return task

    def update_task(self, **kwargs):
        try:
            # If both dates are being updated, handle them together
            if "start_date" in kwargs and "due_date" in kwargs:
                # Store current dates in case we need to rollback
                old_start = self._start_date
                old_due = self._due_date

                # Temporarily set due date to None to avoid validation errors
                self._due_date = None
                # Use the property setter for start_date
                self.start_date = kwargs.pop("start_date")
                # Use the property setter for due_date
                self.due_date = kwargs.pop("due_date")

            # Handle remaining updates
            for key, value in kwargs.items():
                setattr(self, key, value)

            db.session.commit()
            return self
        except Exception as e:
            db.session.rollback()
            raise e

    @classmethod
    def get_all_tasks_for_feature(cls, feature_id):
        return cls.query.filter_by(feature_id=feature_id)

    @classmethod
    def delete_task(cls, id):
        task = cls.query.get(id)
        if task:
            db.session.delete(task)
            db.session.commit()
            return True
        return False

    VALID_STATUSES = ["Not Started", "In Progress", "Overdue", "Completed"]

    @validates("status")
    def validates_status(self, key, status):
        if status not in self.VALID_STATUSES:
            raise ValueError(
                f"Status must be one of: {', '.join(self.VALID_STATUSES)}"
            )
        return status

    def to_dict(self):
        duration = self.duration
        duration_string = None
        if duration is not None:
            unit = (
                "day"
                if duration == 1
                else "days" if duration >= 12 else "hours"
            )
            duration_string = f"{duration} {unit}"
        return {
            "id": self.id,
            "feature_id": self.feature_id,
            "name": self.name,
            "description": self.description,
            "created_by": self._created_by,
            "assigned_to": self.assigned_to,
            "status": self.status,
            "priority": self.priority,
            "start_date": (
                self._start_date.isoformat() if self._start_date else None
            ),
            "due_date": self._due_date.isoformat() if self._due_date else None,
            "duration": duration_string,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
