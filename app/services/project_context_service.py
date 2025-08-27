from models import db, Project, Stakeholder, Risk, WorkPackage, BusinessObjective
from sqlalchemy import or_
import re
import json

class ProjectContextService:
    """Intelligent project context extraction and management"""
    
    @staticmethod
    def extract_project_info(message_content):
        """Extract project-related entities from message"""
        
        # Extract project name patterns
        project_patterns = [
            r"(?:implementing|working on|project)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)",
            r"(?:the\s+)?([A-Z][a-z]+\s+(?:system|integration|upgrade|implementation))",
        ]
        
        # Extract organization
        org_patterns = [
            r"(?:at|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Company|Corporation|Organization|Institute|Group))",
        ]
        
        # Extract timeline
        timeline_patterns = [
            r"(\d+)\s+weeks?",
            r"(\d+)\s+months?",
        ]
        
        # Extract stakeholder mentions
        stakeholder_patterns = [
            r"(?:Dr\.|Ms\.|Mr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)",
            r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[-–]\s*([A-Z]{2,}|[A-Z][a-z]+\s+(?:of|for)\s+[A-Z][a-z]+)",
        ]
        
        extracted = {
            "project_names": [],
            "organizations": [],
            "timeline": None,
            "stakeholders": []
        }
        
        # Extract project names
        for pattern in project_patterns:
            matches = re.findall(pattern, message_content, re.IGNORECASE)
            extracted["project_names"].extend(matches)
        
        # Extract organizations
        for pattern in org_patterns:
            matches = re.findall(pattern, message_content)
            extracted["organizations"].extend(matches)
        
        # Extract timeline
        for pattern in timeline_patterns:
            match = re.search(pattern, message_content, re.IGNORECASE)
            if match:
                extracted["timeline"] = match.group(1)
                break
        
        # Extract stakeholders
        for pattern in stakeholder_patterns:
            matches = re.findall(pattern, message_content)
            for match in matches:
                if isinstance(match, tuple):
                    name = match[0]
                    role = match[1] if len(match) > 1 else None
                    extracted["stakeholders"].append({"name": name, "role": role})
                else:
                    extracted["stakeholders"].append({"name": match, "role": None})
        
        return extracted
    
    @staticmethod
    def find_or_create_project(user_id, extracted_info):
        """Find existing project or create new one based on extracted info"""
        
        # Try to find existing project
        if extracted_info["project_names"]:
            project_name = extracted_info["project_names"][0]
            
            # Search for existing project
            existing_project = Project.query.filter_by(
                owner_id=user_id
            ).filter(
                or_(
                    Project.name.ilike(f"%{project_name}%"),
                    Project.description.ilike(f"%{project_name}%")
                )
            ).first()
            
            if existing_project:
                return existing_project
            
            # Create new project
            from datetime import datetime, timedelta
            new_project = Project(
                owner_id=user_id,
                name=project_name,
                description=f"Project to implement {project_name}",
                due_date=datetime.utcnow() + timedelta(weeks=int(extracted_info["timeline"]) if extracted_info["timeline"] else 12),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.session.add(new_project)
            db.session.flush()  # Get ID without committing
            
            print(f"🔨 AI CREATED PROJECT: {new_project.name} (ID: {new_project.id})")
            
            # Add stakeholders
            for stakeholder_info in extracted_info["stakeholders"]:
                stakeholder = Stakeholder(
                    project_id=new_project.id,
                    name=stakeholder_info["name"],
                    role=stakeholder_info["role"] or "Stakeholder"  # Default role if None
                )
                db.session.add(stakeholder)
                print(f"🔨 AI CREATED STAKEHOLDER: {stakeholder.name} (Role: {stakeholder.role})")
            
            db.session.commit()
            print(f"✅ AI DATABASE CHANGES SAVED")
            return new_project
        
        return None
    
    @staticmethod
    def get_active_project_context(user_id, message_content=None):
        """Get the active project context for AI prompt enhancement"""
        
        # Extract project info from message if provided
        if message_content:
            extracted = ProjectContextService.extract_project_info(message_content)
            project = ProjectContextService.find_or_create_project(user_id, extracted)
        else:
            # Get most recent project
            project = Project.query.filter_by(owner_id=user_id)\
                .order_by(Project.updated_at.desc()).first()
        
        if not project:
            return None
        
        # Build comprehensive context
        context = {
            "project": project.to_dict(),
            "stakeholders": [s.to_dict() for s in project.stakeholders.limit(10)],
            "active_risks": [r.to_dict() for r in project.risks.filter_by(status='open').limit(5)],
            "current_work_packages": [wp.to_dict() for wp in project.work_packages.filter_by(status='in_progress').limit(5)],
            "business_objectives": [bo.to_dict() for bo in project.business_objectives.filter_by(status='in_progress').limit(5)]
        }
        
        return context
    
    @staticmethod
    def extract_and_save_entities(project_id, message_content):
        """Extract and save risks, stakeholders, and decisions from conversation"""
        
        # Risk detection patterns
        risk_keywords = ["risk", "concern", "worried", "problem", "issue", "challenge"]
        if any(keyword in message_content.lower() for keyword in risk_keywords):
            # Extract risk description (simplified - in production would use NLP)
            risk_match = re.search(r"(?:risk|concern|worried about|problem with)\s+(.+?)(?:\.|,|$)", 
                                   message_content, re.IGNORECASE)
            if risk_match:
                # Check if similar risk exists
                risk_description = risk_match.group(1)
                existing_risk = Risk.query.filter_by(project_id=project_id)\
                    .filter(Risk.description.ilike(f"%{risk_description[:50]}%")).first()
                
                if not existing_risk:
                    new_risk = Risk(
                        project_id=project_id,
                        title=f"Risk: {risk_description[:100]}",
                        description=risk_description,
                        category="unclassified",
                        status="open"
                    )
                    db.session.add(new_risk)
        
        db.session.commit()
    
    @staticmethod
    def build_enhanced_prompt(user_message, user_id):
        """Build enhanced AI prompt with full project context"""
        
        # Get project context
        context = ProjectContextService.get_active_project_context(user_id, user_message)
        
        base_prompt = """You are an expert PM mentor specializing in complex system integrations 
        and technology implementations. Provide strategic guidance for effective 
        stakeholder management and project execution."""
        
        if context:
            # Add project-specific context
            project_prompt = f"""
            
ACTIVE PROJECT CONTEXT:
Project: {context['project']['name']}
Description: {context['project']['description']}
Due Date: {context['project']['due_date']}

KEY STAKEHOLDERS:
"""
            for stakeholder in context['stakeholders']:
                project_prompt += f"- {stakeholder['name']} ({stakeholder['role']}): {stakeholder['power_level']} power, {stakeholder['interest_level']} interest\n"
            
            if context['active_risks']:
                project_prompt += "\nACTIVE RISKS:\n"
                for risk in context['active_risks']:
                    project_prompt += f"- {risk['title']}: {risk['risk_level']} level, {risk['status']}\n"
            
            if context['current_work_packages']:
                project_prompt += "\nCURRENT WORK PACKAGES:\n"
                for wp in context['current_work_packages']:
                    project_prompt += f"- {wp['name']}: {wp['progress_percentage']}% complete\n"
            
            base_prompt += project_prompt
        
        return base_prompt