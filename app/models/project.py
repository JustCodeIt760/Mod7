from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

# Import the association table
from .user import project_users

class Project(db.Model):
    __tablename__ = 'projects'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    # Exact match to database structure
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)

    # Temporarily disabled to fix backend startup
    # owner = db.relationship("User", back_populates="owned_projects")
    # users = db.relationship("User", secondary=project_users, back_populates="projects")
    
    # PMI Knowledge Area relationships
    stakeholders = db.relationship("Stakeholder", back_populates="project", lazy='dynamic')
    risks = db.relationship("Risk", back_populates="project", lazy='dynamic')
    work_packages = db.relationship("WorkPackage", back_populates="project", lazy='dynamic')
    business_objectives = db.relationship("BusinessObjective", back_populates="project", lazy='dynamic')
    
    # Additional PMI relationships (will add as we integrate them)
    budgets = db.relationship("Budget", back_populates="project", lazy='dynamic')
    quality_metrics = db.relationship("QualityMetric", back_populates="project", lazy='dynamic')
    communication_activities = db.relationship("CommunicationActivity", back_populates="project", lazy='dynamic')
    change_requests = db.relationship("ChangeRequest", back_populates="project", lazy='dynamic')
    lessons_learned = db.relationship("LessonsLearned", back_populates="project", lazy='dynamic')
    meetings = db.relationship("ProjectMeeting", back_populates="project", lazy='dynamic')
    contracts = db.relationship("Contract", back_populates="project", lazy='dynamic')
    cost_estimates = db.relationship("CostEstimate", back_populates="project", lazy='dynamic')
    earned_value_performance = db.relationship("EarnedValueManagement", back_populates="project", lazy='dynamic')
    quality_issues = db.relationship("QualityIssue", back_populates="project", lazy='dynamic')
    activity_dependencies = db.relationship("ActivityDependency", back_populates="project", lazy='dynamic')
    schedule_performance = db.relationship("SchedulePerformance", back_populates="project", lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'owner_id': self.owner_id,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def get_pmi_context(self):
        """Get comprehensive PMI project context for AI agents"""
        return {
            "project": self.to_dict(),
            "stakeholders": [s.to_dict() for s in self.stakeholders.all()],
            "active_risks": [r.to_dict() for r in self.risks.filter_by(status='Active').all()],
            "work_packages": [wp.to_dict() for wp in self.work_packages.all()],
            "objectives": [obj.to_dict() for obj in self.business_objectives.all()]
        }