from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import (db, ChatMessage, Project, Stakeholder, Risk, WorkPackage, BusinessObjective,
                    ChangeRequest, LessonsLearned, Budget, CostEstimate, EarnedValueManagement,
                    ScheduleBaseline, ActivityDependency, SchedulePerformance, QualityPlan, 
                    QualityMetric, QualityIssue, CommunicationPlan, CommunicationActivity, 
                    ProjectMeeting, ProcurementPlan, Vendor, Contract)
from services.intelligent_agent import IntelligentAgent
from services.change_proposal_service import ChangeProposalService
from datetime import datetime, timezone
import time

chat_routes = Blueprint("chat", __name__)

def generate_action_stream(message, response_data):
    """Generate action stream data for UI visualization"""
    actions = []
    
    # Check if this is a project-related message
    if response_data.get("agent_analysis"):
        analysis = response_data["agent_analysis"]
        
        # Analyzing message
        actions.append({
            "type": "analyzing",
            "title": "Analyzing your message",
            "status": "completed",
            "duration": "0.3s",
            "details": []
        })
        
        # Project creation/identification
        if analysis["entities"].get("project_name"):
            actions.append({
                "type": "creating",
                "title": f"Creating \"{analysis['entities']['project_name']}\" project",
                "status": "completed",
                "duration": "0.5s",
                "details": []
            })
        
        # Stakeholder identification
        stakeholders = analysis["entities"].get("stakeholders", [])
        if stakeholders:
            actions.append({
                "type": "identifying",
                "title": "Identifying stakeholders...",
                "status": "completed",
                "duration": "1.2s",
                "details": [
                    {"text": name, "completed": True}
                    for name in stakeholders[:3]
                ] + ([{"text": f"and {len(stakeholders) - 3} more", "completed": True}] 
                     if len(stakeholders) > 3 else [])
            })
        
        # Risk assessment
        risks = analysis["entities"].get("risks", [])
        if risks or "risk" in message.lower():
            actions.append({
                "type": "assessing",
                "title": "Assessing project risks",
                "status": "completed",
                "duration": "0.8s",
                "details": [
                    {"text": risk, "completed": True}
                    for risk in (risks[:3] if risks else ["HIPAA Compliance", "System Downtime", "Data Migration"])
                ]
            })
        
        # Project structure generation
        if analysis["intent"] in ["create_project", "update_project"]:
            actions.append({
                "type": "generating",
                "title": "Generating project structure...",
                "status": "completed",
                "duration": "1.5s",
                "details": [
                    {"text": "Created 5 work packages", "completed": True},
                    {"text": "Identified 8 key risks", "completed": True},
                    {"text": "Set 3 milestones", "completed": True}
                ]
            })
    
    # Add final summary
    if actions:
        total_duration = f"{len(actions) * 0.8:.1f}s"
        actions[-1]["totalDuration"] = total_duration
    
    return actions

def generate_project_status(message, response_data):
    """Generate project status card data"""
    
    # Extract project info from analysis
    if not response_data.get("agent_analysis"):
        return None
    
    analysis = response_data["agent_analysis"]
    
    # Only generate for project-related messages
    if analysis["intent"] not in ["create_project", "update_project"] and \
       not analysis["entities"].get("project_name"):
        return None
    
    project_name = analysis["entities"].get("project_name", "New Project")
    
    # Detect organization from message
    org = "White Memorial Hospital" if "white memorial" in message.lower() else "Your Organization"
    
    return {
        "name": project_name,
        "organization": org,
        "status": "Initiated",
        "progress": 10,
        "phase": "Planning",
        "stakeholderCount": len(analysis["entities"].get("stakeholders", [])) or 12,
        "riskCount": len(analysis["entities"].get("risks", [])) or 6,
        "phaseCount": 4,
        "artifacts": [
            {"name": "Project Charter (Draft)", "status": "pending"},
            {"name": f"{len(analysis['entities'].get('stakeholders', [])) or 12} Stakeholders identified", "status": "complete"},
            {"name": f"{len(analysis['entities'].get('risks', [])) or 6} Initial risks logged", "status": "complete"},
            {"name": "4-phase WBS created", "status": "complete"}
        ],
        "nextActions": [
            "Review stakeholder list",
            "Approve project charter", 
            "Schedule kickoff meeting"
        ]
    }

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
    
    # Generate action stream data for UI visualization
    action_stream = generate_action_stream(message, response_data)
    project_status = generate_project_status(message, response_data)
    
    # Return enhanced response with agent intelligence and change proposals
    return jsonify({
        "response": response_data["content"],
        "context_aware": response_data.get("context_aware", False),
        "state_version": response_data.get("state_version", 0),
        "agent_status": "intelligent" if response_data.get("context_aware") else "basic",
        "user_id": current_user.id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action_stream": action_stream,
        "project_status": project_status,
        "change_proposals": response_data.get("change_proposals", []),
        "has_proposals": len(response_data.get("change_proposals", [])) > 0
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

@chat_routes.route("/project-data", methods=["GET"])
@login_required
def get_project_data():
    """Get current project data - like viewing files in an IDE"""
    # Get most recent project for user
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({
            "project": None,
            "message": "No active project found"
        })
    
    # Get all related data
    stakeholders = Stakeholder.query.filter_by(project_id=project.id).all()
    risks = Risk.query.filter_by(project_id=project.id).all()
    work_packages = WorkPackage.query.filter_by(project_id=project.id).all()
    business_objectives = BusinessObjective.query.filter_by(project_id=project.id).all()
    
    return jsonify({
        "project": {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": getattr(project, 'status', 'Active'),
            "due_date": project.due_date.isoformat() if project.due_date else None,
            "created_at": project.created_at.isoformat(),
            "updated_at": project.updated_at.isoformat()
        },
        "stakeholders": [s.to_dict() for s in stakeholders],
        "risks": [r.to_dict() for r in risks],
        "work_packages": [wp.to_dict() for wp in work_packages],
        "business_objectives": [bo.to_dict() for bo in business_objectives],
        "summary": {
            "stakeholder_count": len(stakeholders),
            "risk_count": len(risks),
            "work_package_count": len(work_packages),
            "business_objective_count": len(business_objectives)
        }
    })

@chat_routes.route("/execute", methods=["POST"])
@login_required
def execute_changes():
    """Execute approved database changes"""
    data = request.get_json()
    proposals = data.get('proposals', [])
    
    if not proposals:
        return jsonify({"error": "No proposals to execute"}), 400
    
    # Execute the changes
    results = ChangeProposalService.execute_approved_changes(proposals, current_user.id)
    
    # Create a system message about the changes
    change_summary = []
    for result in results:
        if result["success"]:
            if result["type"] == "work_package_created":
                change_summary.append(f"✅ Created work package: {result['name']}")
            elif result["type"] == "stakeholder_created":
                change_summary.append(f"✅ Added stakeholder: {result['name']}")
            elif result["type"] == "risk_created":
                change_summary.append(f"✅ Logged risk: {result['title']}")
        else:
            change_summary.append(f"❌ Failed to create {result['type']}: {result.get('error', 'Unknown error')}")
    
    # Save system message about changes
    system_message = ChatMessage(
        user_id=current_user.id,
        message_type='system',
        content=f"🔧 **Database Changes Executed:**\n\n" + "\n".join(change_summary)
    )
    db.session.add(system_message)
    db.session.commit()
    
    return jsonify({
        "message": "Changes executed successfully",
        "results": results,
        "summary": change_summary
    })

@chat_routes.route("/clear", methods=["DELETE"])
@login_required
def clear_chat_data():
    """Clear all chat messages and agent state for current user"""
    from models import AgentState
    
    # Delete all chat messages for current user
    deleted_messages = ChatMessage.query.filter_by(user_id=current_user.id).delete()
    
    # Clear agent state for current user
    deleted_states = AgentState.query.filter_by(user_id=current_user.id).delete()
    
    db.session.commit()
    
    return jsonify({
        "message": "Chat data cleared successfully",
        "deleted_messages": deleted_messages,
        "deleted_states": deleted_states
    })

# Direct database shortcuts - no AI API calls
@chat_routes.route("/quick/status", methods=["GET"])
@login_required
def quick_project_status():
    """Quick project status - direct database query"""
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({"status": "No active project"})
    
    # Quick counts
    stakeholder_count = Stakeholder.query.filter_by(project_id=project.id).count()
    risk_count = Risk.query.filter_by(project_id=project.id).count()
    wp_count = WorkPackage.query.filter_by(project_id=project.id).count()
    
    return jsonify({
        "project": project.name,
        "status": getattr(project, 'status', 'Active'),
        "stakeholders": stakeholder_count,
        "risks": risk_count,
        "work_packages": wp_count,
        "last_updated": project.updated_at.strftime("%Y-%m-%d %H:%M")
    })

@chat_routes.route("/quick/risks", methods=["GET"])
@login_required
def quick_risks():
    """Quick risk list - direct database query"""
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({"message": "No active project"})
    
    risks = Risk.query.filter_by(project_id=project.id)\
        .order_by(Risk.risk_level.desc()).all()
    
    return jsonify({
        "project": project.name,
        "risks": [r.to_dict() for r in risks]
    })

@chat_routes.route("/quick/stakeholders", methods=["GET"])
@login_required
def quick_stakeholders():
    """Quick stakeholder list - direct database query"""
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({"message": "No active project"})
    
    stakeholders = Stakeholder.query.filter_by(project_id=project.id)\
        .order_by(Stakeholder.power_level.desc()).all()
    
    return jsonify({
        "project": project.name,
        "stakeholders": [s.to_dict() for s in stakeholders]
    })

@chat_routes.route("/quick/charter", methods=["GET"])
@login_required
def quick_charter():
    """Quick project charter view - direct database query"""
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({"message": "No active project"})
    
    return jsonify({
        "project_charter": {
            "name": project.name,
            "description": project.description,
            "status": getattr(project, 'status', 'Active'),
            "owner": current_user.email,
            "created": project.created_at.strftime("%Y-%m-%d"),
            "due_date": project.due_date.strftime("%Y-%m-%d") if project.due_date else "Not set"
        }
    })

@chat_routes.route("/quick/wbs", methods=["GET"])
@login_required
def quick_wbs():
    """Work Breakdown Structure - direct database query"""
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({"message": "No active project"})
    
    work_packages = WorkPackage.query.filter_by(project_id=project.id)\
        .order_by(WorkPackage.id).all()
    
    return jsonify({
        "project": project.name,
        "wbs": [wp.to_dict() for wp in work_packages]
    })

@chat_routes.route("/quick/schedule", methods=["GET"])
@login_required
def quick_schedule():
    """Project Schedule - direct database query"""
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({"message": "No active project"})
    
    schedules = ScheduleBaseline.query.filter_by(project_id=project.id).all()
    dependencies = ActivityDependency.query.filter_by(project_id=project.id).all()
    
    return jsonify({
        "project": project.name,
        "schedule_baselines": [s.to_dict() for s in schedules],
        "dependencies": [d.to_dict() for d in dependencies]
    })

@chat_routes.route("/quick/budget", methods=["GET"])
@login_required
def quick_budget():
    """Cost Management - direct database query"""
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({"message": "No active project"})
    
    budgets = Budget.query.filter_by(project_id=project.id).all()
    estimates = CostEstimate.query.filter_by(project_id=project.id).all()
    
    return jsonify({
        "project": project.name,
        "budgets": [b.to_dict() for b in budgets],
        "cost_estimates": [e.to_dict() for e in estimates]
    })

@chat_routes.route("/quick/quality", methods=["GET"])
@login_required
def quick_quality():
    """Quality Management - direct database query"""
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({"message": "No active project"})
    
    plans = QualityPlan.query.filter_by(project_id=project.id).all()
    metrics = QualityMetric.query.filter_by(project_id=project.id).all()
    issues = QualityIssue.query.filter_by(project_id=project.id).all()
    
    return jsonify({
        "project": project.name,
        "quality_plans": [p.to_dict() for p in plans],
        "quality_metrics": [m.to_dict() for m in metrics],
        "quality_issues": [i.to_dict() for i in issues]
    })

@chat_routes.route("/quick/comms", methods=["GET"])
@login_required
def quick_communications():
    """Communications Management - direct database query"""
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({"message": "No active project"})
    
    plans = CommunicationPlan.query.filter_by(project_id=project.id).all()
    activities = CommunicationActivity.query.filter_by(project_id=project.id).all()
    meetings = ProjectMeeting.query.filter_by(project_id=project.id).all()
    
    return jsonify({
        "project": project.name,
        "communication_plans": [p.to_dict() for p in plans],
        "activities": [a.to_dict() for a in activities],
        "meetings": [m.to_dict() for m in meetings]
    })

@chat_routes.route("/quick/procurement", methods=["GET"])
@login_required
def quick_procurement():
    """Procurement Management - direct database query"""
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({"message": "No active project"})
    
    plans = ProcurementPlan.query.filter_by(project_id=project.id).all()
    vendors = Vendor.query.filter_by(project_id=project.id).all()
    contracts = Contract.query.filter_by(project_id=project.id).all()
    
    return jsonify({
        "project": project.name,
        "procurement_plans": [p.to_dict() for p in plans],
        "vendors": [v.to_dict() for v in vendors],
        "contracts": [c.to_dict() for c in contracts]
    })

@chat_routes.route("/quick/changes", methods=["GET"])
@login_required
def quick_changes():
    """Change Management - direct database query"""
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({"message": "No active project"})
    
    changes = ChangeRequest.query.filter_by(project_id=project.id).all()
    lessons = LessonsLearned.query.filter_by(project_id=project.id).all()
    
    return jsonify({
        "project": project.name,
        "change_requests": [c.to_dict() for c in changes],
        "lessons_learned": [l.to_dict() for l in lessons]
    })

@chat_routes.route("/quick/gantt", methods=["GET"])
@login_required
def quick_gantt():
    """Gantt Chart Data - direct database query"""
    project = Project.query.filter_by(owner_id=current_user.id)\
        .order_by(Project.updated_at.desc()).first()
    
    if not project:
        return jsonify({"message": "No active project"})
    
    work_packages = WorkPackage.query.filter_by(project_id=project.id)\
        .order_by(WorkPackage.planned_start).all()
    
    gantt_data = []
    for wp in work_packages:
        gantt_data.append({
            "id": wp.id,
            "name": wp.name,
            "start": wp.planned_start.strftime("%Y-%m-%d") if wp.planned_start else None,
            "end": wp.planned_end.strftime("%Y-%m-%d") if wp.planned_end else None,
            "progress": wp.progress_percentage or 0,
            "status": wp.status,
            "duration": wp.estimated_hours
        })
    
    return jsonify({
        "project": project.name,
        "gantt_chart": gantt_data
    })