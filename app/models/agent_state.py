from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime
import json

class AgentState(db.Model):
    """Redux-like state management for AI agents"""
    __tablename__ = "agent_states"
    
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    
    # Core State (like Redux store)
    working_memory = db.Column(db.JSON, default=dict)  # Current session context
    long_term_memory = db.Column(db.JSON, default=dict)  # Persistent knowledge
    active_context = db.Column(db.JSON, default=dict)  # Current focus/project
    
    # State Metadata
    state_version = db.Column(db.Integer, default=1)
    last_action = db.Column(db.String(100))
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='agent_state')
    
    def __init__(self, user_id):
        self.user_id = user_id
        self.working_memory = self._get_initial_working_memory()
        self.long_term_memory = self._get_initial_long_term_memory()
        self.active_context = {}
    
    def _get_initial_working_memory(self):
        """Initialize working memory (current session)"""
        return {
            "current_project_id": None,
            "conversation_history": [],
            "recent_actions": [],
            "pending_decisions": [],
            "session_insights": []
        }
    
    def _get_initial_long_term_memory(self):
        """Initialize long-term memory (persistent knowledge)"""
        return {
            "user_preferences": {
                "communication_style": "unknown",
                "decision_making_pattern": "unknown",
                "project_types": [],
                "success_factors": []
            },
            "learned_patterns": {
                "successful_strategies": [],
                "common_risks": [],
                "stakeholder_types": [],
                "project_phases": []
            },
            "domain_knowledge": {
                "software_development": {},
                "system_integration": {},
                "infrastructure": {},
                "process_improvement": {},
                "project_management": {}
            }
        }
    
    def dispatch_action(self, action_type, payload=None):
        """Redux-style action dispatcher"""
        
        # Create action object
        action = {
            "type": action_type,
            "payload": payload or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Apply reducer
        new_state = self._agent_reducer(action)
        
        # Update state
        self.working_memory = new_state["working_memory"]
        self.long_term_memory = new_state["long_term_memory"] 
        self.active_context = new_state["active_context"]
        self.last_action = action_type
        self.last_updated = datetime.utcnow()
        self.state_version += 1
        
        # Persist to database
        db.session.commit()
        
        return new_state
    
    def _agent_reducer(self, action):
        """Redux-style reducer for agent state"""
        
        current_state = {
            "working_memory": self.working_memory.copy(),
            "long_term_memory": self.long_term_memory.copy(),
            "active_context": self.active_context.copy()
        }
        
        action_type = action["type"]
        payload = action["payload"]
        
        if action_type == "SET_ACTIVE_PROJECT":
            current_state["working_memory"]["current_project_id"] = payload["project_id"]
            current_state["active_context"]["project"] = payload["project_data"]
            
        elif action_type == "ADD_CONVERSATION":
            history = current_state["working_memory"]["conversation_history"]
            history.append({
                "message": payload["message"],
                "response": payload.get("response"),
                "timestamp": action["timestamp"]
            })
            # Keep last 50 conversations in working memory
            current_state["working_memory"]["conversation_history"] = history[-50:]
            
        elif action_type == "LEARN_USER_PREFERENCE":
            prefs = current_state["long_term_memory"]["user_preferences"]
            preference_type = payload["type"]
            value = payload["value"]
            
            if preference_type in prefs:
                prefs[preference_type] = value
            
        elif action_type == "RECORD_SUCCESS_PATTERN":
            patterns = current_state["long_term_memory"]["learned_patterns"]["successful_strategies"]
            patterns.append({
                "strategy": payload["strategy"],
                "context": payload["context"],
                "outcome": payload["outcome"],
                "timestamp": action["timestamp"]
            })
            
        elif action_type == "UPDATE_PROJECT_CONTEXT":
            current_state["active_context"].update(payload)
            
        elif action_type == "ADD_PENDING_DECISION":
            decisions = current_state["working_memory"]["pending_decisions"]
            decisions.append({
                "decision": payload["decision"],
                "context": payload["context"],
                "urgency": payload.get("urgency", "medium"),
                "timestamp": action["timestamp"]
            })
            
        elif action_type == "RESOLVE_DECISION":
            decisions = current_state["working_memory"]["pending_decisions"]
            decision_id = payload["decision_id"]
            current_state["working_memory"]["pending_decisions"] = [
                d for d in decisions if d.get("id") != decision_id
            ]
            
        elif action_type == "RESET_SESSION":
            current_state["working_memory"] = self._get_initial_working_memory()
            
        return current_state
    
    def get_state_snapshot(self):
        """Get current complete state (like Redux getState())"""
        return {
            "working_memory": self.working_memory,
            "long_term_memory": self.long_term_memory,
            "active_context": self.active_context,
            "metadata": {
                "version": self.state_version,
                "last_action": self.last_action,
                "last_updated": self.last_updated.isoformat() if self.last_updated else None
            }
        }
    
    def to_dict(self):
        return self.get_state_snapshot()
    
    @classmethod
    def get_or_create_for_user(cls, user_id):
        """Get existing agent state or create new one"""
        agent_state = cls.query.filter_by(user_id=user_id).first()
        
        if not agent_state:
            agent_state = cls(user_id=user_id)
            db.session.add(agent_state)
            db.session.commit()
            
        return agent_state