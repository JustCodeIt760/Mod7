from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class ScheduleBaseline(db.Model):
    __tablename__ = 'schedule_baselines'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    
    # Baseline Information
    baseline_name = db.Column(db.String(200), nullable=False)
    baseline_version = db.Column(db.String(20), default='1.0')
    baseline_date = db.Column(db.DateTime, nullable=False)
    
    # Schedule Dates
    baseline_start_date = db.Column(db.DateTime, nullable=False)
    baseline_finish_date = db.Column(db.DateTime, nullable=False)
    baseline_duration_days = db.Column(db.Integer)
    
    # Critical Path
    critical_path = db.Column(db.Text)  # JSON array of work package IDs on critical path
    critical_path_duration = db.Column(db.Integer)
    
    # Approval
    approved_by = db.Column(db.String(100))
    approval_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='Active')  # Active, Superseded, Archived
    
    # Change Control
    change_requests = db.Column(db.Text)  # JSON array of change request IDs
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", backref="schedule_baselines")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'baseline_name': self.baseline_name,
            'baseline_version': self.baseline_version,
            'baseline_date': self.baseline_date.isoformat() if self.baseline_date else None,
            'baseline_start_date': self.baseline_start_date.isoformat() if self.baseline_start_date else None,
            'baseline_finish_date': self.baseline_finish_date.isoformat() if self.baseline_finish_date else None,
            'baseline_duration_days': self.baseline_duration_days,
            'critical_path': self.critical_path,
            'critical_path_duration': self.critical_path_duration,
            'approved_by': self.approved_by,
            'approval_date': self.approval_date.isoformat() if self.approval_date else None,
            'status': self.status,
            'change_requests': self.change_requests,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ActivityDependency(db.Model):
    __tablename__ = 'activity_dependencies'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    
    # Dependency Relationship
    predecessor_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('work_packages.id')), nullable=False)
    successor_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('work_packages.id')), nullable=False)
    
    # Dependency Type
    dependency_type = db.Column(db.String(20), default='FS')  # FS (Finish-to-Start), SS (Start-to-Start), FF (Finish-to-Finish), SF (Start-to-Finish)
    
    # Lag and Lead
    lag_days = db.Column(db.Float, default=0)  # Positive for lag, negative for lead
    
    # Dependency Details
    dependency_reason = db.Column(db.Text)
    is_hard_dependency = db.Column(db.Boolean, default=True)  # Hard (mandatory) vs Soft (preferential)
    dependency_category = db.Column(db.String(50))  # Mandatory, Discretionary, External, Internal
    
    # Status
    status = db.Column(db.String(20), default='Active')  # Active, Inactive
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="activity_dependencies")
    predecessor = db.relationship("WorkPackage", foreign_keys=[predecessor_id], backref="successor_dependencies")
    successor = db.relationship("WorkPackage", foreign_keys=[successor_id], backref="predecessor_dependencies")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'predecessor_id': self.predecessor_id,
            'successor_id': self.successor_id,
            'dependency_type': self.dependency_type,
            'lag_days': self.lag_days,
            'dependency_reason': self.dependency_reason,
            'is_hard_dependency': self.is_hard_dependency,
            'dependency_category': self.dependency_category,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class SchedulePerformance(db.Model):
    __tablename__ = 'schedule_performance'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    work_package_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('work_packages.id')))
    
    # Reporting Period
    reporting_date = db.Column(db.DateTime, nullable=False)
    reporting_period = db.Column(db.String(50))  # Weekly, Monthly
    
    # Baseline vs Actual
    baseline_start = db.Column(db.DateTime)
    baseline_finish = db.Column(db.DateTime)
    baseline_duration = db.Column(db.Integer)
    
    actual_start = db.Column(db.DateTime)
    actual_finish = db.Column(db.DateTime)
    actual_duration = db.Column(db.Integer)
    
    # Current Status
    current_status = db.Column(db.String(20))  # Not Started, In Progress, Completed
    percent_complete = db.Column(db.Float, default=0)
    
    # Schedule Variance Analysis
    start_variance_days = db.Column(db.Integer)  # Actual - Baseline
    finish_variance_days = db.Column(db.Integer)  # Actual - Baseline
    duration_variance_days = db.Column(db.Integer)  # Actual - Baseline
    
    # Schedule Performance Index (from EVM)
    schedule_performance_index = db.Column(db.Float)  # SPI = EV / PV
    
    # Critical Path Analysis
    is_on_critical_path = db.Column(db.Boolean, default=False)
    total_float_days = db.Column(db.Float)
    free_float_days = db.Column(db.Float)
    
    # Forecasting
    forecast_start = db.Column(db.DateTime)
    forecast_finish = db.Column(db.DateTime)
    forecast_duration = db.Column(db.Integer)
    
    # Issues and Corrective Actions
    schedule_issues = db.Column(db.Text)
    corrective_actions = db.Column(db.Text)
    recovery_plan = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="schedule_performance")
    work_package = db.relationship("WorkPackage", backref="schedule_performance")

    def calculate_variances(self):
        """Calculate schedule variances"""
        if self.baseline_start and self.actual_start:
            self.start_variance_days = (self.actual_start - self.baseline_start).days
        
        if self.baseline_finish and self.actual_finish:
            self.finish_variance_days = (self.actual_finish - self.baseline_finish).days
        
        if self.baseline_duration and self.actual_duration:
            self.duration_variance_days = self.actual_duration - self.baseline_duration

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'work_package_id': self.work_package_id,
            'reporting_date': self.reporting_date.isoformat() if self.reporting_date else None,
            'reporting_period': self.reporting_period,
            'baseline_start': self.baseline_start.isoformat() if self.baseline_start else None,
            'baseline_finish': self.baseline_finish.isoformat() if self.baseline_finish else None,
            'baseline_duration': self.baseline_duration,
            'actual_start': self.actual_start.isoformat() if self.actual_start else None,
            'actual_finish': self.actual_finish.isoformat() if self.actual_finish else None,
            'actual_duration': self.actual_duration,
            'current_status': self.current_status,
            'percent_complete': self.percent_complete,
            'start_variance_days': self.start_variance_days,
            'finish_variance_days': self.finish_variance_days,
            'duration_variance_days': self.duration_variance_days,
            'schedule_performance_index': self.schedule_performance_index,
            'is_on_critical_path': self.is_on_critical_path,
            'total_float_days': self.total_float_days,
            'free_float_days': self.free_float_days,
            'forecast_start': self.forecast_start.isoformat() if self.forecast_start else None,
            'forecast_finish': self.forecast_finish.isoformat() if self.forecast_finish else None,
            'forecast_duration': self.forecast_duration,
            'schedule_issues': self.schedule_issues,
            'corrective_actions': self.corrective_actions,
            'recovery_plan': self.recovery_plan,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }