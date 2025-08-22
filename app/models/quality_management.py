from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class QualityPlan(db.Model):
    __tablename__ = 'quality_plans'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False, unique=True)
    
    # Quality Planning
    quality_policy = db.Column(db.Text)
    quality_objectives = db.Column(db.Text)
    quality_standards = db.Column(db.Text)
    quality_metrics = db.Column(db.Text)
    
    # Quality Assurance
    qa_processes = db.Column(db.Text)
    qa_responsibilities = db.Column(db.Text)
    quality_audits = db.Column(db.Text)
    
    # Quality Control
    qc_processes = db.Column(db.Text)
    inspection_methods = db.Column(db.Text)
    testing_procedures = db.Column(db.Text)
    acceptance_criteria = db.Column(db.Text)
    
    # Quality Improvement
    improvement_processes = db.Column(db.Text)
    lessons_learned_integration = db.Column(db.Text)
    
    # Approval
    approved_by = db.Column(db.String(100))
    approval_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='Draft')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", backref="quality_plan")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'quality_policy': self.quality_policy,
            'quality_objectives': self.quality_objectives,
            'quality_standards': self.quality_standards,
            'quality_metrics': self.quality_metrics,
            'qa_processes': self.qa_processes,
            'qa_responsibilities': self.qa_responsibilities,
            'quality_audits': self.quality_audits,
            'qc_processes': self.qc_processes,
            'inspection_methods': self.inspection_methods,
            'testing_procedures': self.testing_procedures,
            'acceptance_criteria': self.acceptance_criteria,
            'improvement_processes': self.improvement_processes,
            'lessons_learned_integration': self.lessons_learned_integration,
            'approved_by': self.approved_by,
            'approval_date': self.approval_date.isoformat() if self.approval_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class QualityMetric(db.Model):
    __tablename__ = 'quality_metrics'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    work_package_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('work_packages.id')))
    
    # Metric Definition
    metric_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    metric_type = db.Column(db.String(50))  # Defect Rate, Customer Satisfaction, Performance, etc.
    
    # Measurement
    measurement_method = db.Column(db.Text)
    measurement_frequency = db.Column(db.String(50))  # Daily, Weekly, Monthly, etc.
    data_source = db.Column(db.String(100))
    
    # Targets and Thresholds
    target_value = db.Column(db.Float)
    threshold_value = db.Column(db.Float)
    tolerance_range = db.Column(db.String(20))
    
    # Current Performance
    current_value = db.Column(db.Float)
    last_measured = db.Column(db.DateTime)
    trend = db.Column(db.String(20))  # Improving, Stable, Declining
    
    # Responsible Party
    metric_owner = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    
    # Status
    status = db.Column(db.String(20), default='Active')  # Active, Suspended, Archived
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="quality_metrics")
    work_package = db.relationship("WorkPackage", backref="quality_metrics")
    owner = db.relationship("User", backref="owned_quality_metrics")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'work_package_id': self.work_package_id,
            'metric_name': self.metric_name,
            'description': self.description,
            'metric_type': self.metric_type,
            'measurement_method': self.measurement_method,
            'measurement_frequency': self.measurement_frequency,
            'data_source': self.data_source,
            'target_value': self.target_value,
            'threshold_value': self.threshold_value,
            'tolerance_range': self.tolerance_range,
            'current_value': self.current_value,
            'last_measured': self.last_measured.isoformat() if self.last_measured else None,
            'trend': self.trend,
            'metric_owner': self.metric_owner,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class QualityIssue(db.Model):
    __tablename__ = 'quality_issues'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    work_package_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('work_packages.id')))
    
    # Issue Identification
    issue_title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    issue_type = db.Column(db.String(50))  # Defect, Non-conformance, Process Issue, etc.
    severity = db.Column(db.String(20))  # Critical, High, Medium, Low
    
    # Discovery Information
    discovered_by = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    discovered_date = db.Column(db.DateTime, default=datetime.utcnow)
    discovery_method = db.Column(db.String(50))  # Inspection, Testing, Audit, Review, etc.
    
    # Root Cause Analysis
    root_cause = db.Column(db.Text)
    contributing_factors = db.Column(db.Text)
    
    # Impact Assessment
    impact_description = db.Column(db.Text)
    cost_impact = db.Column(db.Float)
    schedule_impact_days = db.Column(db.Integer)
    
    # Resolution
    corrective_action = db.Column(db.Text)
    preventive_action = db.Column(db.Text)
    assigned_to = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    target_resolution_date = db.Column(db.DateTime)
    actual_resolution_date = db.Column(db.DateTime)
    
    # Verification
    verification_method = db.Column(db.Text)
    verified_by = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    verification_date = db.Column(db.DateTime)
    
    # Status
    status = db.Column(db.String(20), default='Open')  # Open, In Progress, Resolved, Verified, Closed
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="quality_issues")
    work_package = db.relationship("WorkPackage", backref="quality_issues")
    discoverer = db.relationship("User", foreign_keys=[discovered_by], backref="discovered_quality_issues")
    assignee = db.relationship("User", foreign_keys=[assigned_to], backref="assigned_quality_issues")
    verifier = db.relationship("User", foreign_keys=[verified_by], backref="verified_quality_issues")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'work_package_id': self.work_package_id,
            'issue_title': self.issue_title,
            'description': self.description,
            'issue_type': self.issue_type,
            'severity': self.severity,
            'discovered_by': self.discovered_by,
            'discovered_date': self.discovered_date.isoformat() if self.discovered_date else None,
            'discovery_method': self.discovery_method,
            'root_cause': self.root_cause,
            'contributing_factors': self.contributing_factors,
            'impact_description': self.impact_description,
            'cost_impact': self.cost_impact,
            'schedule_impact_days': self.schedule_impact_days,
            'corrective_action': self.corrective_action,
            'preventive_action': self.preventive_action,
            'assigned_to': self.assigned_to,
            'target_resolution_date': self.target_resolution_date.isoformat() if self.target_resolution_date else None,
            'actual_resolution_date': self.actual_resolution_date.isoformat() if self.actual_resolution_date else None,
            'verification_method': self.verification_method,
            'verified_by': self.verified_by,
            'verification_date': self.verification_date.isoformat() if self.verification_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }