from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class CommunicationPlan(db.Model):
    __tablename__ = 'communication_plans'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False, unique=True)
    
    # Plan Overview
    communication_objectives = db.Column(db.Text)
    communication_requirements = db.Column(db.Text)
    communication_constraints = db.Column(db.Text)
    communication_assumptions = db.Column(db.Text)
    
    # Escalation Procedures
    escalation_process = db.Column(db.Text)
    escalation_triggers = db.Column(db.Text)
    escalation_timeframes = db.Column(db.Text)
    
    # Communication Technology
    communication_technology = db.Column(db.Text)
    information_systems = db.Column(db.Text)
    
    # Glossary and Definitions
    glossary = db.Column(db.Text)
    
    # Plan Management
    plan_version = db.Column(db.String(20), default='1.0')
    approved_by = db.Column(db.String(100))
    approval_date = db.Column(db.DateTime)
    next_review_date = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", backref="communication_plan")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'communication_objectives': self.communication_objectives,
            'communication_requirements': self.communication_requirements,
            'communication_constraints': self.communication_constraints,
            'communication_assumptions': self.communication_assumptions,
            'escalation_process': self.escalation_process,
            'escalation_triggers': self.escalation_triggers,
            'escalation_timeframes': self.escalation_timeframes,
            'communication_technology': self.communication_technology,
            'information_systems': self.information_systems,
            'glossary': self.glossary,
            'plan_version': self.plan_version,
            'approved_by': self.approved_by,
            'approval_date': self.approval_date.isoformat() if self.approval_date else None,
            'next_review_date': self.next_review_date.isoformat() if self.next_review_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class CommunicationActivity(db.Model):
    __tablename__ = 'communication_activities'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    stakeholder_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('stakeholders.id')))
    
    # Communication Details
    communication_type = db.Column(db.String(50))  # Status Report, Meeting, Email, Presentation, etc.
    subject = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    format = db.Column(db.String(50))  # Formal, Informal, Written, Verbal
    method = db.Column(db.String(50))  # Email, Phone, Video Conference, In-Person, etc.
    
    # Participants
    sender = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    recipients = db.Column(db.Text)  # JSON array of stakeholder/user IDs
    cc_recipients = db.Column(db.Text)  # JSON array
    
    # Timing
    scheduled_date = db.Column(db.DateTime)
    actual_date = db.Column(db.DateTime)
    frequency = db.Column(db.String(50))  # One-time, Daily, Weekly, Monthly, etc.
    duration_minutes = db.Column(db.Integer)
    
    # Status and Follow-up
    status = db.Column(db.String(20), default='Planned')  # Planned, Sent, Delivered, Read, Responded
    response_required = db.Column(db.Boolean, default=False)
    response_deadline = db.Column(db.DateTime)
    follow_up_required = db.Column(db.Boolean, default=False)
    follow_up_date = db.Column(db.DateTime)
    
    # Effectiveness
    feedback_received = db.Column(db.Text)
    effectiveness_rating = db.Column(db.Integer)  # 1-5 scale
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="communication_activities")
    stakeholder = db.relationship("Stakeholder", backref="communications")
    sender_user = db.relationship("User", backref="sent_communications")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'stakeholder_id': self.stakeholder_id,
            'communication_type': self.communication_type,
            'subject': self.subject,
            'content': self.content,
            'format': self.format,
            'method': self.method,
            'sender': self.sender,
            'recipients': self.recipients,
            'cc_recipients': self.cc_recipients,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'actual_date': self.actual_date.isoformat() if self.actual_date else None,
            'frequency': self.frequency,
            'duration_minutes': self.duration_minutes,
            'status': self.status,
            'response_required': self.response_required,
            'response_deadline': self.response_deadline.isoformat() if self.response_deadline else None,
            'follow_up_required': self.follow_up_required,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'feedback_received': self.feedback_received,
            'effectiveness_rating': self.effectiveness_rating,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ProjectMeeting(db.Model):
    __tablename__ = 'project_meetings'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('projects.id')), nullable=False)
    
    # Meeting Details
    meeting_title = db.Column(db.String(200), nullable=False)
    meeting_type = db.Column(db.String(50))  # Kickoff, Status, Review, Retrospective, etc.
    meeting_purpose = db.Column(db.Text)
    agenda = db.Column(db.Text)
    
    # Scheduling
    scheduled_date = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer)
    location = db.Column(db.String(200))
    meeting_link = db.Column(db.String(500))  # Video conference link
    
    # Participants
    organizer = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')))
    required_attendees = db.Column(db.Text)  # JSON array of user/stakeholder IDs
    optional_attendees = db.Column(db.Text)  # JSON array
    actual_attendees = db.Column(db.Text)  # JSON array of who actually attended
    
    # Meeting Output
    meeting_notes = db.Column(db.Text)
    decisions_made = db.Column(db.Text)
    action_items = db.Column(db.Text)  # JSON array of action items
    issues_raised = db.Column(db.Text)
    next_steps = db.Column(db.Text)
    
    # Status
    status = db.Column(db.String(20), default='Scheduled')  # Scheduled, In Progress, Completed, Cancelled
    
    # Follow-up
    minutes_distributed = db.Column(db.Boolean, default=False)
    minutes_distribution_date = db.Column(db.DateTime)
    next_meeting_scheduled = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = db.relationship("Project", back_populates="meetings")
    meeting_organizer = db.relationship("User", backref="organized_meetings")

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'meeting_title': self.meeting_title,
            'meeting_type': self.meeting_type,
            'meeting_purpose': self.meeting_purpose,
            'agenda': self.agenda,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'duration_minutes': self.duration_minutes,
            'location': self.location,
            'meeting_link': self.meeting_link,
            'organizer': self.organizer,
            'required_attendees': self.required_attendees,
            'optional_attendees': self.optional_attendees,
            'actual_attendees': self.actual_attendees,
            'meeting_notes': self.meeting_notes,
            'decisions_made': self.decisions_made,
            'action_items': self.action_items,
            'issues_raised': self.issues_raised,
            'next_steps': self.next_steps,
            'status': self.status,
            'minutes_distributed': self.minutes_distributed,
            'minutes_distribution_date': self.minutes_distribution_date.isoformat() if self.minutes_distribution_date else None,
            'next_meeting_scheduled': self.next_meeting_scheduled.isoformat() if self.next_meeting_scheduled else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }