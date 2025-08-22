from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class ProjectCharter(db.Model):
    __tablename__ = 'project_charters'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False, unique=True)
    
    # Project Identification
    project_title = db.Column(db.String(200), nullable=False)
    project_purpose = db.Column(db.Text, nullable=False)
    project_justification = db.Column(db.Text)
    
    # Business Case
    business_need = db.Column(db.Text)
    market_demand = db.Column(db.Text)
    organizational_need = db.Column(db.Text)
    customer_request = db.Column(db.Text)
    
    # High-Level Requirements
    product_requirements = db.Column(db.Text)
    project_requirements = db.Column(db.Text)
    transition_requirements = db.Column(db.Text)
    
    # Success Criteria
    success_criteria = db.Column(db.Text)
    acceptance_criteria = db.Column(db.Text)
    
    # High-Level Risks
    high_level_risks = db.Column(db.Text)
    assumptions = db.Column(db.Text)
    constraints = db.Column(db.Text)
    
    # Summary Budget
    preliminary_budget = db.Column(db.Float)
    funding_source = db.Column(db.String(100))
    
    # Timeline
    target_start_date = db.Column(db.DateTime)
    target_end_date = db.Column(db.DateTime)
    
    # Authorization
    project_manager_assigned = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    sponsor = db.Column(db.String(100))
    sponsor_signature_date = db.Column(db.DateTime)
    
    # Status
    charter_status = db.Column(db.String(20), default='Draft')  # Draft, Under Review, Approved, Rejected
    approved_date = db.Column(db.DateTime)
    approved_by = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", backref="charter")
    project_manager = db.relationship("User", backref="managed_projects")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'project_title': self.project_title,
            'project_purpose': self.project_purpose,
            'project_justification': self.project_justification,
            'business_need': self.business_need,
            'market_demand': self.market_demand,
            'organizational_need': self.organizational_need,
            'customer_request': self.customer_request,
            'product_requirements': self.product_requirements,
            'project_requirements': self.project_requirements,
            'transition_requirements': self.transition_requirements,
            'success_criteria': self.success_criteria,
            'acceptance_criteria': self.acceptance_criteria,
            'high_level_risks': self.high_level_risks,
            'assumptions': self.assumptions,
            'constraints': self.constraints,
            'preliminary_budget': self.preliminary_budget,
            'funding_source': self.funding_source,
            'target_start_date': self.target_start_date.isoformat() if self.target_start_date else None,
            'target_end_date': self.target_end_date.isoformat() if self.target_end_date else None,
            'project_manager_assigned': self.project_manager_assigned,
            'sponsor': self.sponsor,
            'sponsor_signature_date': self.sponsor_signature_date.isoformat() if self.sponsor_signature_date else None,
            'charter_status': self.charter_status,
            'approved_date': self.approved_date.isoformat() if self.approved_date else None,
            'approved_by': self.approved_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }