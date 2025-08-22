from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class WorkPackage(db.Model):
    __tablename__ = 'work_packages'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('work_packages.id'))  # For WBS hierarchy
    
    # WBS Details
    wbs_code = db.Column(db.String(20))  # e.g., "1.2.3" for hierarchical numbering
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    work_type = db.Column(db.String(50))  # Marketing, Development, Sales, Operations
    
    # Effort and Timeline
    estimated_hours = db.Column(db.Float)
    actual_hours = db.Column(db.Float, default=0)
    planned_start = db.Column(db.DateTime)
    planned_end = db.Column(db.DateTime)
    actual_start = db.Column(db.DateTime)
    actual_end = db.Column(db.DateTime)
    
    # Financial
    estimated_cost = db.Column(db.Float)
    actual_cost = db.Column(db.Float, default=0)
    budget_category = db.Column(db.String(50))  # Marketing, Development, Operations
    
    # Assignment and Accountability
    work_package_manager = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    team_members = db.Column(db.Text)  # JSON array of user IDs
    
    # Status and Progress
    status = db.Column(db.String(20), default='Not Started')  # Not Started, In Progress, Completed, On Hold
    progress_percentage = db.Column(db.Float, default=0)
    
    # Deliverables and Acceptance
    deliverables = db.Column(db.Text)  # What will be produced
    acceptance_criteria = db.Column(db.Text)  # How success is measured
    quality_requirements = db.Column(db.Text)
    
    # Dependencies
    predecessors = db.Column(db.Text)  # JSON array of work package IDs that must complete first
    successors = db.Column(db.Text)  # JSON array of work package IDs that depend on this
    
    # Performance Metrics
    schedule_variance = db.Column(db.Float)  # Planned vs actual timeline
    cost_variance = db.Column(db.Float)  # Planned vs actual cost
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="work_packages")
    manager = db.relationship("User", backref="managed_work_packages")
    parent = db.relationship("WorkPackage", remote_side=[id], backref="children")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'parent_id': self.parent_id,
            'wbs_code': self.wbs_code,
            'name': self.name,
            'description': self.description,
            'work_type': self.work_type,
            'estimated_hours': self.estimated_hours,
            'actual_hours': self.actual_hours,
            'planned_start': self.planned_start.isoformat() if self.planned_start else None,
            'planned_end': self.planned_end.isoformat() if self.planned_end else None,
            'actual_start': self.actual_start.isoformat() if self.actual_start else None,
            'actual_end': self.actual_end.isoformat() if self.actual_end else None,
            'estimated_cost': self.estimated_cost,
            'actual_cost': self.actual_cost,
            'budget_category': self.budget_category,
            'work_package_manager': self.work_package_manager,
            'team_members': self.team_members,
            'status': self.status,
            'progress_percentage': self.progress_percentage,
            'deliverables': self.deliverables,
            'acceptance_criteria': self.acceptance_criteria,
            'quality_requirements': self.quality_requirements,
            'predecessors': self.predecessors,
            'successors': self.successors,
            'schedule_variance': self.schedule_variance,
            'cost_variance': self.cost_variance,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @property
    def schedule_performance_index(self):
        """Calculate Schedule Performance Index (Earned Value Management)"""
        if self.planned_hours and self.planned_hours > 0:
            earned_value = (self.progress_percentage / 100) * self.estimated_hours
            planned_value = self.planned_hours
            return earned_value / planned_value if planned_value > 0 else 0
        return 0

    @property
    def cost_performance_index(self):
        """Calculate Cost Performance Index (Earned Value Management)"""
        if self.actual_cost and self.actual_cost > 0:
            earned_value = (self.progress_percentage / 100) * self.estimated_cost
            return earned_value / self.actual_cost
        return 0