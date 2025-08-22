from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class Stakeholder(db.Model):
    __tablename__ = 'stakeholders'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)  # e.g., "Potential Client", "Current Client", "Advisor"
    organization = db.Column(db.String(100))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    
    # PMI Power/Interest Grid
    power_level = db.Column(db.String(20))  # Low, Medium, High
    interest_level = db.Column(db.String(20))  # Low, Medium, High
    influence_strategy = db.Column(db.String(50))  # Monitor, Keep Informed, Keep Satisfied, Manage Closely
    
    # Business Context
    potential_value = db.Column(db.Float)  # Revenue potential
    current_status = db.Column(db.String(50))  # Lead, Prospect, Client, etc.
    last_contact = db.Column(db.DateTime)
    next_action = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="stakeholders")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'role': self.role,
            'organization': self.organization,
            'email': self.email,
            'phone': self.phone,
            'power_level': self.power_level,
            'interest_level': self.interest_level,
            'influence_strategy': self.influence_strategy,
            'potential_value': self.potential_value,
            'current_status': self.current_status,
            'last_contact': self.last_contact.isoformat() if self.last_contact else None,
            'next_action': self.next_action,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }