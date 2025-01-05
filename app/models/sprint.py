from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime


class Sprint(db.Model):
    __tablename__ = "sprints"

    if environment == "production":
        __table_args__ = {"schema": SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(
        db.Integer, db.ForeignKey("projects.id"), nullable=False
    )
    name = db.Column(db.String, nullable=False)
    _start_date = db.Column(db.DateTime)
    _end_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    project = db.relationship("Project", back_populates="sprints")
    features = db.relationship(
        "Feature", back_populates="sprint", cascade="all, delete-orphan"
    )

    @property
    def start_date(self):
        return self._start_date

    @property
    def end_date(self):
        return self._end_date

    @start_date.setter
    def start_date(self, value):
        if self._end_date and value and value > self._end_date:
            raise ValueError("Start date can't be after end date")
        self._start_date = value

    @end_date.setter
    def end_date(self, value):
        if self._start_date and value and value < self._start_date:
            raise ValueError("End date can't be before start date")
        self._end_date = value

    @property
    def duration(self):
        if self._start_date and self._end_date:
            difference = self._end_date - self._start_date
            total_hours = difference.days * 24 + difference.seconds / 3600

            if total_hours >= 12:
                return int((total_hours + 12) // 24)
            else:
                return int(total_hours)
        return None

    @classmethod
    def create_sprint(cls, project_id, name, start_date=None, end_date=None):
        sprint = cls(
            project_id=project_id,
            name=name,
            start_date=start_date,
            end_date=end_date,
        )

        db.session.add(sprint)
        db.session.commit()
        return sprint

    def update_sprint(self, name, start_date, end_date):
        try:
            self.name = name
            self.start_date = start_date
            self.end_date = end_date
            db.session.commit()
            return self
        except ValueError as e:
            db.session.rollback()
            raise e

    @classmethod
    def get_all_sprints_for_project(cls, project_id):
        return cls.query.filter_by(project_id=project_id)

    @classmethod
    def delete_sprint(cls, id):
        sprint = cls.query.get(id)
        if sprint:
            db.session.delete(sprint)
            db.session.commit()
            return True
        return False

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
            "project_id": self.project_id,
            "name": self.name,
            "start_date": (
                self._start_date.isoformat() if self._start_date else None
            ),
            "end_date": self._end_date.isoformat() if self._end_date else None,
            "duration": duration_string,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
