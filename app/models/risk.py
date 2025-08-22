from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class Risk(db.Model):
    __tablename__ = 'risks'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    
    # Risk Identification
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50))  # Technical, Market, Financial, Operational, External
    
    # Risk Assessment (PMI Standard)
    probability = db.Column(db.String(20))  # Very Low, Low, Medium, High, Very High
    probability_score = db.Column(db.Integer)  # 1-5 scale
    impact = db.Column(db.String(20))  # Very Low, Low, Medium, High, Very High
    impact_score = db.Column(db.Integer)  # 1-5 scale
    
    # Calculated Risk Score
    risk_score = db.Column(db.Integer)  # probability_score * impact_score
    risk_level = db.Column(db.String(20))  # Low (1-5), Medium (6-15), High (16-25)
    
    # Risk Response Strategy
    response_strategy = db.Column(db.String(50))  # Accept, Avoid, Mitigate, Transfer
    response_description = db.Column(db.Text)
    contingency_plan = db.Column(db.Text)
    
    # Assignment and Timeline
    risk_owner = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    identified_date = db.Column(db.DateTime, default=datetime.utcnow)
    target_resolution_date = db.Column(db.DateTime)
    actual_resolution_date = db.Column(db.DateTime)
    
    # Status Tracking
    status = db.Column(db.String(20), default='Active')  # Active, Mitigated, Occurred, Closed
    last_review_date = db.Column(db.DateTime)
    next_review_date = db.Column(db.DateTime)
    
    # Impact Details
    potential_cost = db.Column(db.Float)  # Potential financial impact
    potential_delay_days = db.Column(db.Integer)  # Potential schedule impact
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="risks")
    owner = db.relationship("User", backref="owned_risks")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'probability': self.probability,
            'probability_score': self.probability_score,
            'impact': self.impact,
            'impact_score': self.impact_score,
            'risk_score': self.risk_score,
            'risk_level': self.risk_level,
            'response_strategy': self.response_strategy,
            'response_description': self.response_description,
            'contingency_plan': self.contingency_plan,
            'risk_owner': self.risk_owner,
            'identified_date': self.identified_date.isoformat() if self.identified_date else None,
            'target_resolution_date': self.target_resolution_date.isoformat() if self.target_resolution_date else None,
            'actual_resolution_date': self.actual_resolution_date.isoformat() if self.actual_resolution_date else None,
            'status': self.status,
            'last_review_date': self.last_review_date.isoformat() if self.last_review_date else None,
            'next_review_date': self.next_review_date.isoformat() if self.next_review_date else None,
            'potential_cost': self.potential_cost,
            'potential_delay_days': self.potential_delay_days,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def calculate_risk_score(self):
        """Calculate risk score and level based on probability and impact"""
        if self.probability_score and self.impact_score:
            self.risk_score = self.probability_score * self.impact_score
            if self.risk_score <= 5:
                self.risk_level = "Low"
            elif self.risk_score <= 15:
                self.risk_level = "Medium"
            else:
                self.risk_level = "High"