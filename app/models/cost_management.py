from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class Budget(db.Model):
    __tablename__ = 'budgets'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    
    # Budget Identification
    budget_name = db.Column(db.String(200), nullable=False)
    budget_category = db.Column(db.String(50))  # Labor, Materials, Equipment, Travel, etc.
    cost_center = db.Column(db.String(50))
    
    # Budget Amounts
    planned_value = db.Column(db.Float, nullable=False)  # PV - Budgeted Cost of Work Scheduled
    approved_budget = db.Column(db.Float)
    contingency_reserve = db.Column(db.Float, default=0)
    management_reserve = db.Column(db.Float, default=0)
    
    # Budget Baseline
    baseline_budget = db.Column(db.Float)
    baseline_date = db.Column(db.DateTime)
    baseline_version = db.Column(db.String(20), default='1.0')
    
    # Budget Period
    budget_start_date = db.Column(db.DateTime)
    budget_end_date = db.Column(db.DateTime)
    
    # Approval and Control
    approved_by = db.Column(db.String(100))
    approval_date = db.Column(db.DateTime)
    budget_owner = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    
    # Status
    status = db.Column(db.String(20), default='Draft')  # Draft, Approved, Active, Closed
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="budgets")
    owner = db.relationship("User", backref="owned_budgets")
    cost_estimates = db.relationship("CostEstimate", back_populates="budget")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'budget_name': self.budget_name,
            'budget_category': self.budget_category,
            'cost_center': self.cost_center,
            'planned_value': self.planned_value,
            'approved_budget': self.approved_budget,
            'contingency_reserve': self.contingency_reserve,
            'management_reserve': self.management_reserve,
            'baseline_budget': self.baseline_budget,
            'baseline_date': self.baseline_date.isoformat() if self.baseline_date else None,
            'baseline_version': self.baseline_version,
            'budget_start_date': self.budget_start_date.isoformat() if self.budget_start_date else None,
            'budget_end_date': self.budget_end_date.isoformat() if self.budget_end_date else None,
            'approved_by': self.approved_by,
            'approval_date': self.approval_date.isoformat() if self.approval_date else None,
            'budget_owner': self.budget_owner,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CostEstimate(db.Model):
    __tablename__ = 'cost_estimates'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    budget_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('budgets.id')))
    work_package_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('work_packages.id')))
    
    # Estimate Details
    estimate_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    cost_category = db.Column(db.String(50))  # Direct, Indirect, Fixed, Variable
    
    # Three-Point Estimating
    optimistic_cost = db.Column(db.Float)  # Best case
    most_likely_cost = db.Column(db.Float)  # Most realistic
    pessimistic_cost = db.Column(db.Float)  # Worst case
    expected_cost = db.Column(db.Float)  # PERT calculation
    
    # Cost Components
    labor_cost = db.Column(db.Float, default=0)
    material_cost = db.Column(db.Float, default=0)
    equipment_cost = db.Column(db.Float, default=0)
    overhead_cost = db.Column(db.Float, default=0)
    
    # Estimation Method
    estimation_method = db.Column(db.String(50))  # Analogous, Parametric, Bottom-up, Three-point
    basis_of_estimate = db.Column(db.Text)
    confidence_level = db.Column(db.String(20))  # Low, Medium, High
    
    # Actual Costs (for tracking)
    actual_cost = db.Column(db.Float, default=0)  # AC - Actual Cost of Work Performed
    
    # Quality and Accuracy
    estimate_accuracy = db.Column(db.String(20))  # Rough Order of Magnitude, Budget, Definitive
    accuracy_range = db.Column(db.String(20))  # e.g., "+/- 25%", "+/- 10%", "+/- 5%"
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="cost_estimates")
    budget = db.relationship("Budget", back_populates="cost_estimates")
    work_package = db.relationship("WorkPackage", backref="cost_estimates")

    def calculate_expected_cost(self):
        """Calculate expected cost using PERT formula: (O + 4M + P) / 6"""
        if all([self.optimistic_cost, self.most_likely_cost, self.pessimistic_cost]):
            self.expected_cost = (self.optimistic_cost + 4 * self.most_likely_cost + self.pessimistic_cost) / 6
        return self.expected_cost

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'budget_id': self.budget_id,
            'work_package_id': self.work_package_id,
            'estimate_name': self.estimate_name,
            'description': self.description,
            'cost_category': self.cost_category,
            'optimistic_cost': self.optimistic_cost,
            'most_likely_cost': self.most_likely_cost,
            'pessimistic_cost': self.pessimistic_cost,
            'expected_cost': self.expected_cost,
            'labor_cost': self.labor_cost,
            'material_cost': self.material_cost,
            'equipment_cost': self.equipment_cost,
            'overhead_cost': self.overhead_cost,
            'estimation_method': self.estimation_method,
            'basis_of_estimate': self.basis_of_estimate,
            'confidence_level': self.confidence_level,
            'actual_cost': self.actual_cost,
            'estimate_accuracy': self.estimate_accuracy,
            'accuracy_range': self.accuracy_range,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class EarnedValueManagement(db.Model):
    __tablename__ = 'earned_value_management'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    work_package_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('work_packages.id')))
    
    # Reporting Period
    reporting_date = db.Column(db.DateTime, nullable=False)
    reporting_period = db.Column(db.String(50))  # Weekly, Monthly, Quarterly
    
    # Core EVM Values
    planned_value = db.Column(db.Float, nullable=False)  # PV - Budgeted Cost of Work Scheduled
    earned_value = db.Column(db.Float, nullable=False)   # EV - Budgeted Cost of Work Performed
    actual_cost = db.Column(db.Float, nullable=False)    # AC - Actual Cost of Work Performed
    
    # Budget Values
    budget_at_completion = db.Column(db.Float)  # BAC - Total Budget
    
    # Calculated Variances
    schedule_variance = db.Column(db.Float)     # SV = EV - PV
    cost_variance = db.Column(db.Float)         # CV = EV - AC
    variance_at_completion = db.Column(db.Float)  # VAC = BAC - EAC
    
    # Performance Indices
    schedule_performance_index = db.Column(db.Float)  # SPI = EV / PV
    cost_performance_index = db.Column(db.Float)      # CPI = EV / AC
    
    # Forecasting
    estimate_at_completion = db.Column(db.Float)       # EAC = BAC / CPI (typical formula)
    estimate_to_complete = db.Column(db.Float)         # ETC = EAC - AC
    to_complete_performance_index = db.Column(db.Float)  # TCPI = (BAC - EV) / (BAC - AC)
    
    # Progress Metrics
    percent_complete = db.Column(db.Float)
    percent_spent = db.Column(db.Float)
    
    # Status Indicators
    schedule_status = db.Column(db.String(20))  # Ahead, On Track, Behind
    cost_status = db.Column(db.String(20))      # Under Budget, On Budget, Over Budget
    
    # Comments and Analysis
    performance_analysis = db.Column(db.Text)
    corrective_actions = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="evm_reports")
    work_package = db.relationship("WorkPackage", backref="evm_reports")

    def calculate_evm_metrics(self):
        """Calculate all EVM metrics based on PV, EV, AC"""
        if self.planned_value and self.earned_value and self.actual_cost:
            # Variances
            self.schedule_variance = self.earned_value - self.planned_value
            self.cost_variance = self.earned_value - self.actual_cost
            
            # Performance Indices
            if self.planned_value > 0:
                self.schedule_performance_index = self.earned_value / self.planned_value
            if self.actual_cost > 0:
                self.cost_performance_index = self.earned_value / self.actual_cost
            
            # Forecasting
            if self.budget_at_completion and self.cost_performance_index and self.cost_performance_index > 0:
                self.estimate_at_completion = self.budget_at_completion / self.cost_performance_index
                self.estimate_to_complete = self.estimate_at_completion - self.actual_cost
                self.variance_at_completion = self.budget_at_completion - self.estimate_at_completion
                
                # TCPI
                remaining_work = self.budget_at_completion - self.earned_value
                remaining_budget = self.budget_at_completion - self.actual_cost
                if remaining_budget > 0:
                    self.to_complete_performance_index = remaining_work / remaining_budget
            
            # Progress percentages
            if self.budget_at_completion > 0:
                self.percent_complete = (self.earned_value / self.budget_at_completion) * 100
                self.percent_spent = (self.actual_cost / self.budget_at_completion) * 100
            
            # Status indicators
            self.schedule_status = "On Track" if abs(self.schedule_variance) < 0.05 * self.planned_value else ("Ahead" if self.schedule_variance > 0 else "Behind")
            self.cost_status = "On Budget" if abs(self.cost_variance) < 0.05 * self.earned_value else ("Under Budget" if self.cost_variance > 0 else "Over Budget")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'work_package_id': self.work_package_id,
            'reporting_date': self.reporting_date.isoformat() if self.reporting_date else None,
            'reporting_period': self.reporting_period,
            'planned_value': self.planned_value,
            'earned_value': self.earned_value,
            'actual_cost': self.actual_cost,
            'budget_at_completion': self.budget_at_completion,
            'schedule_variance': self.schedule_variance,
            'cost_variance': self.cost_variance,
            'variance_at_completion': self.variance_at_completion,
            'schedule_performance_index': self.schedule_performance_index,
            'cost_performance_index': self.cost_performance_index,
            'estimate_at_completion': self.estimate_at_completion,
            'estimate_to_complete': self.estimate_to_complete,
            'to_complete_performance_index': self.to_complete_performance_index,
            'percent_complete': self.percent_complete,
            'percent_spent': self.percent_spent,
            'schedule_status': self.schedule_status,
            'cost_status': self.cost_status,
            'performance_analysis': self.performance_analysis,
            'corrective_actions': self.corrective_actions,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }