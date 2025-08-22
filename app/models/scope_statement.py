from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class ScopeStatement(db.Model):
    __tablename__ = 'scope_statements'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False, unique=True)
    
    # Product Scope Description
    product_scope = db.Column(db.Text, nullable=False)
    product_acceptance_criteria = db.Column(db.Text)
    
    # Project Scope Description
    project_scope = db.Column(db.Text, nullable=False)
    major_deliverables = db.Column(db.Text)
    
    # Project Exclusions
    project_exclusions = db.Column(db.Text)
    out_of_scope = db.Column(db.Text)
    
    # Constraints
    schedule_constraints = db.Column(db.Text)
    budget_constraints = db.Column(db.Text)
    resource_constraints = db.Column(db.Text)
    quality_constraints = db.Column(db.Text)
    technical_constraints = db.Column(db.Text)
    regulatory_constraints = db.Column(db.Text)
    
    # Assumptions
    schedule_assumptions = db.Column(db.Text)
    resource_assumptions = db.Column(db.Text)
    budget_assumptions = db.Column(db.Text)
    stakeholder_assumptions = db.Column(db.Text)
    
    # Change Control
    change_control_procedures = db.Column(db.Text)
    scope_baseline_version = db.Column(db.String(20), default='1.0')
    
    # Approval
    approved_by = db.Column(db.String(100))
    approval_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='Draft')  # Draft, Under Review, Approved
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", backref="scope_statement")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'product_scope': self.product_scope,
            'product_acceptance_criteria': self.product_acceptance_criteria,
            'project_scope': self.project_scope,
            'major_deliverables': self.major_deliverables,
            'project_exclusions': self.project_exclusions,
            'out_of_scope': self.out_of_scope,
            'schedule_constraints': self.schedule_constraints,
            'budget_constraints': self.budget_constraints,
            'resource_constraints': self.resource_constraints,
            'quality_constraints': self.quality_constraints,
            'technical_constraints': self.technical_constraints,
            'regulatory_constraints': self.regulatory_constraints,
            'schedule_assumptions': self.schedule_assumptions,
            'resource_assumptions': self.resource_assumptions,
            'budget_assumptions': self.budget_assumptions,
            'stakeholder_assumptions': self.stakeholder_assumptions,
            'change_control_procedures': self.change_control_procedures,
            'scope_baseline_version': self.scope_baseline_version,
            'approved_by': self.approved_by,
            'approval_date': self.approval_date.isoformat() if self.approval_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }