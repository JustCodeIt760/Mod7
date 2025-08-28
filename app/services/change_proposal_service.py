from models import db, Project, Stakeholder, Risk, WorkPackage, BusinessObjective
from datetime import datetime, timedelta
import json

class ChangeProposalService:
    """Executes database changes based on AI recommendations"""
    
    @staticmethod
    def analyze_and_propose_changes(message, project_context, analysis):
        """Analyze message and propose specific database changes"""
        
        proposals = []
        
        # Scenario: Team member leaving
        if any(word in message.lower() for word in ["quit", "left", "leaving", "resigned"]):
            proposals.extend(ChangeProposalService._handle_team_member_departure(message, project_context, analysis))
        
        # Scenario: New stakeholder identified
        if analysis["entities"].get("stakeholders"):
            proposals.extend(ChangeProposalService._handle_new_stakeholders(analysis, project_context))
        
        # Scenario: Risk identified
        if analysis["entities"].get("risks") or any(word in message.lower() for word in ["risk", "concern", "problem"]):
            proposals.extend(ChangeProposalService._handle_new_risks(message, analysis, project_context))
        
        # Scenario: Timeline changes
        if any(word in message.lower() for word in ["delay", "extend", "rush", "deadline"]):
            proposals.extend(ChangeProposalService._handle_timeline_changes(message, project_context))
        
        # Scenario: New work packages needed
        if any(word in message.lower() for word in ["task", "work", "implement", "develop", "create"]):
            proposals.extend(ChangeProposalService._handle_work_package_creation(message, analysis, project_context))
        
        return proposals
    
    @staticmethod
    def _handle_team_member_departure(message, project_context, analysis):
        """Handle team member leaving scenarios"""
        proposals = []
        
        # Extract name if possible
        import re
        name_match = re.search(r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:quit|left|leaving|resigned)", message, re.IGNORECASE)
        departing_member = name_match.group(1) if name_match else "Team Member"
        
        if project_context and project_context.get("project"):
            project_id = project_context["project"]["id"]
            
            # 1. Create knowledge transfer work package
            proposals.append({
                "type": "create_work_package",
                "rationale": f"Need knowledge transfer before {departing_member} leaves",
                "data": {
                    "project_id": project_id,
                    "name": f"Knowledge Transfer - {departing_member}",
                    "description": f"Ensure {departing_member}'s knowledge is documented and transferred to remaining team members",
                    "work_type": "Knowledge Management",
                    "estimated_hours": 16,
                    "planned_start": datetime.utcnow(),
                    "planned_end": datetime.utcnow() + timedelta(days=5),
                    "status": "In Progress",
                    "priority": "High"
                }
            })
            
            # 2. Create task reallocation risk
            proposals.append({
                "type": "create_risk",
                "rationale": f"{departing_member}'s departure may impact project timeline",
                "data": {
                    "project_id": project_id,
                    "title": f"Task Reallocation Risk - {departing_member} Departure",
                    "description": f"Need to reassign {departing_member}'s responsibilities and potentially adjust timeline",
                    "category": "Resource",
                    "risk_level": "High",
                    "status": "open",
                    "probability": 0.9,
                    "impact": 0.8
                }
            })
        
        return proposals
    
    @staticmethod
    def _handle_new_stakeholders(analysis, project_context):
        """Handle new stakeholder identification"""
        proposals = []
        
        if project_context and project_context.get("project"):
            project_id = project_context["project"]["id"]
            
            for stakeholder in analysis["entities"]["stakeholders"]:
                # Check if stakeholder already exists
                existing = Stakeholder.query.filter_by(
                    project_id=project_id, 
                    name=stakeholder
                ).first()
                
                if not existing:
                    proposals.append({
                        "type": "create_stakeholder",
                        "rationale": f"New stakeholder identified: {stakeholder}",
                        "data": {
                            "project_id": project_id,
                            "name": stakeholder,
                            "role": "Stakeholder",
                            "power_level": "medium",
                            "interest_level": "medium",
                            "influence_strategy": "Keep Informed"
                        }
                    })
        
        return proposals
    
    @staticmethod
    def _handle_new_risks(message, analysis, project_context):
        """Handle risk identification"""
        proposals = []
        
        if project_context and project_context.get("project"):
            project_id = project_context["project"]["id"]
            
            # Extract risks from analysis or common risk patterns
            risks = analysis["entities"].get("risks", [])
            if not risks:
                # Default risks for common scenarios
                if "integration" in message.lower():
                    risks = ["System compatibility issues", "Data migration challenges"]
                elif "hospital" in message.lower() or "healthcare" in message.lower():
                    risks = ["HIPAA compliance violations", "System downtime affecting patient care"]
                else:
                    risks = ["Scope creep", "Resource constraints"]
            
            for risk in risks:
                proposals.append({
                    "type": "create_risk",
                    "rationale": f"Identified potential risk: {risk}",
                    "data": {
                        "project_id": project_id,
                        "title": risk,
                        "description": f"Risk identified from conversation: {risk}",
                        "category": "Technical" if "system" in risk.lower() else "General",
                        "risk_level": "Medium",
                        "status": "open",
                        "probability": 0.6,
                        "impact": 0.7
                    }
                })
        
        return proposals
    
    @staticmethod
    def _handle_timeline_changes(message, project_context):
        """Handle timeline adjustment scenarios"""
        proposals = []
        
        if project_context and project_context.get("project"):
            project_id = project_context["project"]["id"]
            
            # Create timeline adjustment work package
            if "delay" in message.lower() or "extend" in message.lower():
                proposals.append({
                    "type": "create_work_package",
                    "rationale": "Timeline adjustment needed based on conversation",
                    "data": {
                        "project_id": project_id,
                        "name": "Timeline Risk Assessment",
                        "description": "Assess impact of delays and create mitigation plan",
                        "work_type": "Project Management",
                        "estimated_hours": 8,
                        "planned_start": datetime.utcnow(),
                        "planned_end": datetime.utcnow() + timedelta(days=2),
                        "status": "Not Started"
                    }
                })
        
        return proposals
    
    @staticmethod
    def _handle_work_package_creation(message, analysis, project_context):
        """Handle new work package creation based on conversation"""
        proposals = []
        
        if project_context and project_context.get("project"):
            project_id = project_context["project"]["id"]
            
            # Extract work from entities or common patterns
            if "integration" in message.lower():
                proposals.append({
                    "type": "create_work_package",
                    "rationale": "Integration work identified from conversation",
                    "data": {
                        "project_id": project_id,
                        "name": "System Integration Phase",
                        "description": "Integrate new system with existing infrastructure",
                        "work_type": "Development",
                        "estimated_hours": 120,
                        "planned_start": datetime.utcnow() + timedelta(days=7),
                        "planned_end": datetime.utcnow() + timedelta(days=21),
                        "status": "Not Started",
                        "deliverables": "Integrated system ready for testing"
                    }
                })
        
        return proposals
    
    @staticmethod
    def execute_approved_changes(proposals, user_id):
        """Execute approved database changes"""
        results = []
        
        for proposal in proposals:
            try:
                if proposal["type"] == "create_work_package":
                    wp = WorkPackage(**proposal["data"])
                    db.session.add(wp)
                    db.session.flush()
                    results.append({
                        "type": "work_package_created",
                        "id": wp.id,
                        "name": wp.name,
                        "success": True
                    })
                
                elif proposal["type"] == "create_stakeholder":
                    stakeholder = Stakeholder(**proposal["data"])
                    db.session.add(stakeholder)
                    db.session.flush()
                    results.append({
                        "type": "stakeholder_created", 
                        "id": stakeholder.id,
                        "name": stakeholder.name,
                        "success": True
                    })
                
                elif proposal["type"] == "create_risk":
                    risk = Risk(**proposal["data"])
                    db.session.add(risk)
                    db.session.flush()
                    results.append({
                        "type": "risk_created",
                        "id": risk.id,
                        "title": risk.title,
                        "success": True
                    })
                
                # Add more entity types as needed
                
            except Exception as e:
                results.append({
                    "type": proposal["type"],
                    "success": False,
                    "error": str(e)
                })
        
        # Commit all changes if successful
        try:
            db.session.commit()
            print(f"✅ EXECUTED {len([r for r in results if r['success']])} DATABASE CHANGES")
        except Exception as e:
            db.session.rollback()
            print(f"❌ FAILED TO COMMIT CHANGES: {e}")
            for result in results:
                result["success"] = False
        
        return results