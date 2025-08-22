from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class BusinessObjective(db.Model):
    __tablename__ = 'business_objectives'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    
    # Objective Details
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))  # Revenue, Marketing, Technical, Operational
    
    # SMART Criteria
    specific_target = db.Column(db.Text)  # What exactly will be accomplished
    measurable_metric = db.Column(db.String(100))  # How it will be measured
    target_value = db.Column(db.Float)  # Target number (e.g., $100,000)
    current_value = db.Column(db.Float, default=0)  # Current progress
    unit = db.Column(db.String(20))  # dollars, clients, percentage, etc.
    
    # Timeline
    start_date = db.Column(db.DateTime)
    target_date = db.Column(db.DateTime)
    achieved_date = db.Column(db.DateTime)
    
    # Status
    status = db.Column(db.String(20), default='Active')  # Active, Achieved, At Risk, Cancelled
    priority = db.Column(db.String(20))  # Critical, High, Medium, Low
    
    # Progress Tracking
    progress_percentage = db.Column(db.Float, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="business_objectives")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'specific_target': self.specific_target,
            'measurable_metric': self.measurable_metric,
            'target_value': self.target_value,
            'current_value': self.current_value,
            'unit': self.unit,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'achieved_date': self.achieved_date.isoformat() if self.achieved_date else None,
            'status': self.status,
            'priority': self.priority,
            'progress_percentage': self.progress_percentage,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @property
    def completion_percentage(self):
        if self.target_value and self.target_value > 0:
            return min((self.current_value / self.target_value) * 100, 100)
        return 0