from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class ProcurementPlan(db.Model):
    __tablename__ = 'procurement_plans'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False, unique=True)
    
    # Make-or-Buy Decisions
    make_or_buy_decisions = db.Column(db.Text)
    procurement_requirements = db.Column(db.Text)
    
    # Contract Types and Approach
    contract_types = db.Column(db.Text)
    procurement_approach = db.Column(db.Text)
    vendor_selection_criteria = db.Column(db.Text)
    
    # Risk Management
    procurement_risks = db.Column(db.Text)
    risk_mitigation_strategies = db.Column(db.Text)
    
    # Performance Management
    performance_metrics = db.Column(db.Text)
    acceptance_criteria = db.Column(db.Text)
    
    # Approval and Management
    approved_by = db.Column(db.String(100))
    approval_date = db.Column(db.DateTime)
    plan_version = db.Column(db.String(20), default='1.0')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", backref="procurement_plan")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'make_or_buy_decisions': self.make_or_buy_decisions,
            'procurement_requirements': self.procurement_requirements,
            'contract_types': self.contract_types,
            'procurement_approach': self.procurement_approach,
            'vendor_selection_criteria': self.vendor_selection_criteria,
            'procurement_risks': self.procurement_risks,
            'risk_mitigation_strategies': self.risk_mitigation_strategies,
            'performance_metrics': self.performance_metrics,
            'acceptance_criteria': self.acceptance_criteria,
            'approved_by': self.approved_by,
            'approval_date': self.approval_date.isoformat() if self.approval_date else None,
            'plan_version': self.plan_version,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Vendor(db.Model):
    __tablename__ = 'vendors'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    
    # Vendor Information
    vendor_name = db.Column(db.String(200), nullable=False)
    vendor_type = db.Column(db.String(50))  # Supplier, Contractor, Consultant, etc.
    business_registration = db.Column(db.String(100))
    tax_id = db.Column(db.String(50))
    
    # Contact Information
    primary_contact = db.Column(db.String(100))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    website = db.Column(db.String(200))
    
    # Capabilities and Qualifications
    services_offered = db.Column(db.Text)
    certifications = db.Column(db.Text)
    experience = db.Column(db.Text)
    references = db.Column(db.Text)
    
    # Financial Information
    annual_revenue = db.Column(db.Float)
    credit_rating = db.Column(db.String(20))
    insurance_coverage = db.Column(db.Text)
    
    # Performance History
    past_performance_rating = db.Column(db.Float)  # 1-5 scale
    on_time_delivery_rate = db.Column(db.Float)  # Percentage
    quality_rating = db.Column(db.Float)  # 1-5 scale
    
    # Status
    vendor_status = db.Column(db.String(20), default='Active')  # Active, Inactive, Blacklisted
    prequalified = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    contracts = db.relationship("Contract", back_populates="vendor")

    def to_dict(self):
        return {
            'id': self.id,
            'vendor_name': self.vendor_name,
            'vendor_type': self.vendor_type,
            'business_registration': self.business_registration,
            'tax_id': self.tax_id,
            'primary_contact': self.primary_contact,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'website': self.website,
            'services_offered': self.services_offered,
            'certifications': self.certifications,
            'experience': self.experience,
            'references': self.references,
            'annual_revenue': self.annual_revenue,
            'credit_rating': self.credit_rating,
            'insurance_coverage': self.insurance_coverage,
            'past_performance_rating': self.past_performance_rating,
            'on_time_delivery_rate': self.on_time_delivery_rate,
            'quality_rating': self.quality_rating,
            'vendor_status': self.vendor_status,
            'prequalified': self.prequalified,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Contract(db.Model):
    __tablename__ = 'contracts'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    vendor_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('vendors.id')), nullable=False)
    
    # Contract Identification
    contract_number = db.Column(db.String(50), unique=True)
    contract_title = db.Column(db.String(200), nullable=False)
    contract_type = db.Column(db.String(50))  # Fixed Price, Cost Plus, Time & Materials, etc.
    contract_category = db.Column(db.String(50))  # Services, Goods, Construction, etc.
    
    # Scope and Deliverables
    scope_of_work = db.Column(db.Text, nullable=False)
    deliverables = db.Column(db.Text)
    acceptance_criteria = db.Column(db.Text)
    
    # Financial Terms
    contract_value = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default='USD')
    payment_terms = db.Column(db.Text)
    payment_schedule = db.Column(db.Text)
    
    # Timeline
    contract_start_date = db.Column(db.DateTime, nullable=False)
    contract_end_date = db.Column(db.DateTime, nullable=False)
    key_milestones = db.Column(db.Text)
    
    # Performance Management
    performance_standards = db.Column(db.Text)
    service_level_agreements = db.Column(db.Text)
    penalties_incentives = db.Column(db.Text)
    
    # Risk and Legal
    risk_allocation = db.Column(db.Text)
    insurance_requirements = db.Column(db.Text)
    termination_clauses = db.Column(db.Text)
    dispute_resolution = db.Column(db.Text)
    
    # Contract Administration
    contract_manager = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    vendor_project_manager = db.Column(db.String(100))
    
    # Status and Performance
    contract_status = db.Column(db.String(20), default='Draft')  # Draft, Executed, Active, Completed, Terminated
    performance_rating = db.Column(db.Float)  # 1-5 scale
    
    # Change Management
    change_requests = db.Column(db.Text)  # JSON array of change request IDs
    amendments = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="contracts")
    vendor = db.relationship("Vendor", back_populates="contracts")
    manager = db.relationship("User", backref="managed_contracts")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'vendor_id': self.vendor_id,
            'contract_number': self.contract_number,
            'contract_title': self.contract_title,
            'contract_type': self.contract_type,
            'contract_category': self.contract_category,
            'scope_of_work': self.scope_of_work,
            'deliverables': self.deliverables,
            'acceptance_criteria': self.acceptance_criteria,
            'contract_value': self.contract_value,
            'currency': self.currency,
            'payment_terms': self.payment_terms,
            'payment_schedule': self.payment_schedule,
            'contract_start_date': self.contract_start_date.isoformat() if self.contract_start_date else None,
            'contract_end_date': self.contract_end_date.isoformat() if self.contract_end_date else None,
            'key_milestones': self.key_milestones,
            'performance_standards': self.performance_standards,
            'service_level_agreements': self.service_level_agreements,
            'penalties_incentives': self.penalties_incentives,
            'risk_allocation': self.risk_allocation,
            'insurance_requirements': self.insurance_requirements,
            'termination_clauses': self.termination_clauses,
            'dispute_resolution': self.dispute_resolution,
            'contract_manager': self.contract_manager,
            'vendor_project_manager': self.vendor_project_manager,
            'contract_status': self.contract_status,
            'performance_rating': self.performance_rating,
            'change_requests': self.change_requests,
            'amendments': self.amendments,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }