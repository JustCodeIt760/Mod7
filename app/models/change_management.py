from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class ChangeRequest(db.Model):
    __tablename__ = 'change_requests'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    
    # Change Request Identification
    change_request_number = db.Column(db.String(50), unique=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    change_category = db.Column(db.String(50))  # Scope, Schedule, Cost, Quality, Risk, etc.
    change_type = db.Column(db.String(50))  # Corrective Action, Preventive Action, Defect Repair, Updates
    
    # Change Origination
    requested_by = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    stakeholder_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('stakeholders.id')))
    request_date = db.Column(db.DateTime, default=datetime.utcnow)
    reason_for_change = db.Column(db.Text)
    
    # Current State vs Proposed State
    current_situation = db.Column(db.Text)
    proposed_solution = db.Column(db.Text)
    alternatives_considered = db.Column(db.Text)
    
    # Impact Analysis
    scope_impact = db.Column(db.Text)
    schedule_impact_days = db.Column(db.Integer)
    cost_impact = db.Column(db.Float)
    quality_impact = db.Column(db.Text)
    risk_impact = db.Column(db.Text)
    resource_impact = db.Column(db.Text)
    
    # Business Justification
    business_justification = db.Column(db.Text)
    benefits = db.Column(db.Text)
    risks_if_not_implemented = db.Column(db.Text)
    
    # Priority and Urgency
    priority = db.Column(db.String(20))  # Critical, High, Medium, Low
    urgency = db.Column(db.String(20))  # Urgent, High, Medium, Low
    required_by_date = db.Column(db.DateTime)
    
    # Review and Approval Process
    assigned_to = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    reviewer_comments = db.Column(db.Text)
    ccb_review_date = db.Column(db.DateTime)  # Change Control Board review date
    approved_by = db.Column(db.String(100))
    approval_date = db.Column(db.DateTime)
    rejection_reason = db.Column(db.Text)
    
    # Implementation
    implementation_plan = db.Column(db.Text)
    implementation_start_date = db.Column(db.DateTime)
    implementation_end_date = db.Column(db.DateTime)
    actual_implementation_date = db.Column(db.DateTime)
    implementation_notes = db.Column(db.Text)
    
    # Status Tracking
    status = db.Column(db.String(20), default='Submitted')  # Submitted, Under Review, Approved, Rejected, Implemented, Closed
    
    # Verification and Closure
    verification_criteria = db.Column(db.Text)
    verification_date = db.Column(db.DateTime)
    verified_by = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    closure_date = db.Column(db.DateTime)
    lessons_learned = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="change_requests")
    requester = db.relationship("User", foreign_keys=[requested_by], backref="submitted_change_requests")
    stakeholder = db.relationship("Stakeholder", backref="change_requests")
    assignee = db.relationship("User", foreign_keys=[assigned_to], backref="assigned_change_requests")
    verifier = db.relationship("User", foreign_keys=[verified_by], backref="verified_change_requests")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'change_request_number': self.change_request_number,
            'title': self.title,
            'description': self.description,
            'change_category': self.change_category,
            'change_type': self.change_type,
            'requested_by': self.requested_by,
            'stakeholder_id': self.stakeholder_id,
            'request_date': self.request_date.isoformat() if self.request_date else None,
            'reason_for_change': self.reason_for_change,
            'current_situation': self.current_situation,
            'proposed_solution': self.proposed_solution,
            'alternatives_considered': self.alternatives_considered,
            'scope_impact': self.scope_impact,
            'schedule_impact_days': self.schedule_impact_days,
            'cost_impact': self.cost_impact,
            'quality_impact': self.quality_impact,
            'risk_impact': self.risk_impact,
            'resource_impact': self.resource_impact,
            'business_justification': self.business_justification,
            'benefits': self.benefits,
            'risks_if_not_implemented': self.risks_if_not_implemented,
            'priority': self.priority,
            'urgency': self.urgency,
            'required_by_date': self.required_by_date.isoformat() if self.required_by_date else None,
            'assigned_to': self.assigned_to,
            'reviewer_comments': self.reviewer_comments,
            'ccb_review_date': self.ccb_review_date.isoformat() if self.ccb_review_date else None,
            'approved_by': self.approved_by,
            'approval_date': self.approval_date.isoformat() if self.approval_date else None,
            'rejection_reason': self.rejection_reason,
            'implementation_plan': self.implementation_plan,
            'implementation_start_date': self.implementation_start_date.isoformat() if self.implementation_start_date else None,
            'implementation_end_date': self.implementation_end_date.isoformat() if self.implementation_end_date else None,
            'actual_implementation_date': self.actual_implementation_date.isoformat() if self.actual_implementation_date else None,
            'implementation_notes': self.implementation_notes,
            'status': self.status,
            'verification_criteria': self.verification_criteria,
            'verification_date': self.verification_date.isoformat() if self.verification_date else None,
            'verified_by': self.verified_by,
            'closure_date': self.closure_date.isoformat() if self.closure_date else None,
            'lessons_learned': self.lessons_learned,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class LessonsLearned(db.Model):
    __tablename__ = 'lessons_learned'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    
    # Lesson Identification
    lesson_title = db.Column(db.String(200), nullable=False)
    lesson_category = db.Column(db.String(50))  # Process, Technical, Management, Communication, etc.
    knowledge_area = db.Column(db.String(50))  # Integration, Scope, Schedule, Cost, Quality, etc.
    
    # Lesson Details
    situation_description = db.Column(db.Text, nullable=False)
    what_happened = db.Column(db.Text)
    what_went_well = db.Column(db.Text)
    what_went_wrong = db.Column(db.Text)
    root_cause = db.Column(db.Text)
    
    # Recommendations
    recommendations = db.Column(db.Text)
    best_practices = db.Column(db.Text)
    things_to_avoid = db.Column(db.Text)
    
    # Impact and Value
    impact_description = db.Column(db.Text)
    potential_cost_savings = db.Column(db.Float)
    potential_time_savings = db.Column(db.Integer)  # Days
    
    # Lesson Source
    contributed_by = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    date_identified = db.Column(db.DateTime, default=datetime.utcnow)
    phase_identified = db.Column(db.String(50))  # Initiation, Planning, Execution, Monitoring, Closing
    
    # Application and Follow-up
    applicable_to = db.Column(db.Text)  # Future projects, departments, etc.
    action_items = db.Column(db.Text)
    follow_up_required = db.Column(db.Boolean, default=False)
    
    # Approval and Status
    reviewed_by = db.Column(db.String(100))
    review_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='Draft')  # Draft, Reviewed, Approved, Archived
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="lessons_learned")
    contributor = db.relationship("User", backref="contributed_lessons")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'lesson_title': self.lesson_title,
            'lesson_category': self.lesson_category,
            'knowledge_area': self.knowledge_area,
            'situation_description': self.situation_description,
            'what_happened': self.what_happened,
            'what_went_well': self.what_went_well,
            'what_went_wrong': self.what_went_wrong,
            'root_cause': self.root_cause,
            'recommendations': self.recommendations,
            'best_practices': self.best_practices,
            'things_to_avoid': self.things_to_avoid,
            'impact_description': self.impact_description,
            'potential_cost_savings': self.potential_cost_savings,
            'potential_time_savings': self.potential_time_savings,
            'contributed_by': self.contributed_by,
            'date_identified': self.date_identified.isoformat() if self.date_identified else None,
            'phase_identified': self.phase_identified,
            'applicable_to': self.applicable_to,
            'action_items': self.action_items,
            'follow_up_required': self.follow_up_required,
            'reviewed_by': self.reviewed_by,
            'review_date': self.review_date.isoformat() if self.review_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }