from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, ChatMessage, Project, Stakeholder, Risk, WorkPackage, BusinessObjective
from services.intelligent_agent import IntelligentAgent
from datetime import datetime, timezone

chat_routes = Blueprint("chat", __name__)

@chat_routes.route("", methods=["POST"])
@login_required
def handle_chat():
    data = request.get_json()
    message = data.get('message', '')
    
    # Save user message to database (traditional chat log)
    user_message = ChatMessage(
        user_id=current_user.id,
        message_type='user',
        content=message
    )
    db.session.add(user_message)
    db.session.commit()
    
    # Use Intelligent Agent with persistent state management
    agent = IntelligentAgent(current_user.id)
    
    # Process message with full context awareness
    response_data = agent.process_message(message)
    
    # Save assistant response to traditional chat log
    assistant_message = ChatMessage(
        user_id=current_user.id,
        message_type='assistant',
        content=response_data["content"]
    )
    db.session.add(assistant_message)
    db.session.commit()
    
    # Return enhanced response with agent intelligence
    return jsonify({
        "response": response_data["content"],
        "context_aware": response_data.get("context_aware", False),
        "state_version": response_data.get("state_version", 0),
        "agent_status": "intelligent" if response_data.get("context_aware") else "basic",
        "user_id": current_user.id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

@chat_routes.route("/history", methods=["GET"])
@login_required
def get_chat_history():
    messages = ChatMessage.query.filter_by(user_id=current_user.id)\
        .order_by(ChatMessage.timestamp.asc()).all()
    
    return jsonify({
        "messages": [msg.to_dict() for msg in messages]
    })

@chat_routes.route("/context", methods=["GET"])
@login_required
def get_project_context():
    """Get current project context for the user"""
    agent = IntelligentAgent(current_user.id)
    insights = agent.get_agent_insights()
    
    return jsonify({
        "agent_status": insights["agent_status"],
        "state_version": insights["state_version"],
        "active_project_id": insights["active_project_id"],
        "conversation_count": insights["conversation_count"],
        "learned_patterns": insights["learned_patterns"],
        "user_preferences": insights["user_preferences"]
    })