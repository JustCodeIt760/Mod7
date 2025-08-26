from models import db, Task, Feature, User
from sqlalchemy.sql import text
from datetime import datetime, timedelta
import random

# Base date for all tasks
BASE_DATE = datetime(2025, 1, 2)

def seed_tasks():
    features = Feature.query.all()
    users = User.query.all()
    demo, alex_rivera, sarah, mike, emily_davis, james_wilson, maya_patel, david_kim, lisa_thompson, carlos_mendoza = users

    tasks = []
    
    # Helper function to create task with specific dates and realistic assignments
    def create_task(feature, name, description, status, priority, assigned_to, created_by, start_offset_hours, duration_hours):
        start_date = BASE_DATE + timedelta(hours=start_offset_hours)
        due_date = start_date + timedelta(hours=duration_hours)
        return Task(
            feature_id=feature.id,
            name=name,
            description=description,
            status=status,
            priority=priority,
            assigned_to=assigned_to,
            _created_by=created_by,
            _start_date=start_date,
            _due_date=due_date,
        )

    # Define task templates based on feature type and team roles
    task_generators = {
        # Research and Strategy Tasks
        "User Research & Personas": [
            ("Conduct User Interviews", "Interview 10 current users about their pain points and workflows", "Completed", 3, maya_patel.id, alex_rivera.id, 0, 24),
            ("Create User Personas", "Develop 3-4 detailed user personas based on interview data", "Completed", 3, maya_patel.id, alex_rivera.id, 24, 16),
            ("User Journey Mapping", "Map current and future user journeys for key workflows", "Completed", 2, james_wilson.id, maya_patel.id, 40, 12),
            ("Compile Research Report", "Document findings and recommendations", "Completed", 2, maya_patel.id, alex_rivera.id, 52, 8)
        ],
        
        "Technical Architecture Planning": [
            ("System Architecture Design", "Design high-level system architecture and technology stack", "Completed", 3, emily_davis.id, alex_rivera.id, 0, 20),
            ("Database Schema Design", "Design normalized database schema with proper relationships", "Completed", 3, mike.id, emily_davis.id, 20, 16),
            ("API Specification", "Define REST API endpoints and data structures", "Completed", 3, emily_davis.id, alex_rivera.id, 36, 12),
            ("Infrastructure Planning", "Plan cloud infrastructure and deployment strategy", "Completed", 2, carlos_mendoza.id, alex_rivera.id, 48, 8)
        ],
        
        "Multi-Factor Authentication": [
            ("Research 2FA Solutions", "Evaluate SMS, TOTP, and push notification providers", "In Progress", 3, mike.id, alex_rivera.id, 0, 12),
            ("Implement SMS 2FA", "Integrate with Twilio for SMS-based authentication", "In Progress", 3, sarah.id, mike.id, 12, 20),
            ("TOTP App Integration", "Support for Google Authenticator and Authy", "Not Started", 2, emily_davis.id, mike.id, 32, 16),
            ("Security Testing", "Penetration testing and security audit", "Not Started", 3, david_kim.id, alex_rivera.id, 48, 12),
            ("User Documentation", "Create user guides for 2FA setup", "Not Started", 1, maya_patel.id, mike.id, 60, 8)
        ],
        
        "React Native Setup": [
            ("Project Initialization", "Set up React Native project with TypeScript", "Completed", 3, sarah.id, sarah.id, 0, 8),
            ("Navigation Setup", "Configure React Navigation with tab and stack navigators", "Completed", 3, sarah.id, sarah.id, 8, 12),
            ("State Management", "Set up Redux Toolkit for state management", "Completed", 2, emily_davis.id, sarah.id, 20, 10),
            ("Build Configuration", "Configure iOS and Android build scripts", "Completed", 2, carlos_mendoza.id, sarah.id, 30, 14)
        ],
        
        "Authentication Flow": [
            ("Login Screen UI", "Design and implement login screen with form validation", "In Progress", 3, maya_patel.id, sarah.id, 0, 12),
            ("Registration Flow", "Multi-step registration with email verification", "In Progress", 3, sarah.id, sarah.id, 12, 16),
            ("Biometric Authentication", "Face ID and fingerprint authentication", "Not Started", 2, emily_davis.id, sarah.id, 28, 18),
            ("Social Login Integration", "Google and Apple sign-in integration", "Not Started", 2, mike.id, sarah.id, 46, 14)
        ],
        
        "Market Research Report": [
            ("Competitor Analysis", "Analyze top 5 competitors' marketing strategies", "Completed", 3, lisa_thompson.id, lisa_thompson.id, 0, 16),
            ("Target Audience Segmentation", "Define primary and secondary audience segments", "Completed", 3, lisa_thompson.id, lisa_thompson.id, 16, 12),
            ("Market Trend Analysis", "Research current digital marketing trends", "Completed", 2, demo.id, lisa_thompson.id, 28, 10),
            ("Opportunity Assessment", "Identify market gaps and opportunities", "Completed", 2, lisa_thompson.id, lisa_thompson.id, 38, 8)
        ],
        
        "Blog Content Calendar": [
            ("SEO Keyword Research", "Research high-value keywords for blog content", "In Progress", 3, lisa_thompson.id, lisa_thompson.id, 0, 14),
            ("Content Theme Planning", "Plan 20 blog post themes and outlines", "In Progress", 3, james_wilson.id, lisa_thompson.id, 14, 18),
            ("Editorial Calendar Setup", "Set up publishing schedule and workflow", "Not Started", 2, lisa_thompson.id, lisa_thompson.id, 32, 8),
            ("Writer Onboarding", "Brief freelance writers on brand voice and guidelines", "Not Started", 1, maya_patel.id, lisa_thompson.id, 40, 6)
        ],
        
        "Infrastructure Audit": [
            ("Current System Documentation", "Document existing infrastructure and dependencies", "Completed", 3, carlos_mendoza.id, carlos_mendoza.id, 0, 20),
            ("Performance Benchmarking", "Benchmark current system performance metrics", "Completed", 3, mike.id, carlos_mendoza.id, 20, 16),
            ("Cost Analysis Report", "Analyze current infrastructure costs vs cloud alternatives", "Completed", 2, alex_rivera.id, carlos_mendoza.id, 36, 12),
            ("Risk Assessment", "Identify migration risks and mitigation strategies", "Completed", 3, carlos_mendoza.id, carlos_mendoza.id, 48, 10)
        ],
        
        "Design Token System": [
            ("Color Palette Definition", "Define primary, secondary, and semantic color tokens", "Completed", 3, maya_patel.id, maya_patel.id, 0, 12),
            ("Typography Tokens", "Define font sizes, weights, and line heights", "Completed", 3, james_wilson.id, maya_patel.id, 12, 10),
            ("Spacing System", "Create consistent spacing scale and tokens", "Completed", 2, maya_patel.id, maya_patel.id, 22, 8),
            ("Token Export Scripts", "Automated export to CSS variables and JSON", "Completed", 2, sarah.id, maya_patel.id, 30, 14)
        ],
        
        "OpenAPI Specification": [
            ("Endpoint Documentation", "Document all REST API endpoints with examples", "In Progress", 3, emily_davis.id, emily_davis.id, 0, 24),
            ("Schema Definitions", "Define request/response schemas and validation rules", "In Progress", 3, mike.id, emily_davis.id, 24, 18),
            ("Interactive Documentation", "Set up Swagger UI for interactive API docs", "Not Started", 2, sarah.id, emily_davis.id, 42, 12),
            ("API Testing Suite", "Create automated API test cases", "Not Started", 2, david_kim.id, emily_davis.id, 54, 16)
        ]
    }
    
    # Generate tasks for features that have specific templates
    for feature in features:
        if feature.name in task_generators:
            feature_tasks = task_generators[feature.name]
            for task_name, description, status, priority, assigned_to, created_by, start_offset, duration in feature_tasks:
                tasks.append(create_task(
                    feature, task_name, description, status, priority, 
                    assigned_to, created_by, start_offset, duration
                ))
        else:
            # Generate default tasks for features without specific templates
            # Determine task types based on feature characteristics
            task_types = []
            
            # Determine appropriate team member based on feature type
            if any(keyword in feature.name.lower() for keyword in ['design', 'ui', 'ux', 'visual', 'brand']):
                lead_assignee = maya_patel.id
                task_types = [
                    ("Design Research", f"Research design patterns and best practices for {feature.name}", "planning"),
                    ("Mockup Creation", f"Create high-fidelity mockups for {feature.name}", "design"),
                    ("Prototype Development", f"Build interactive prototype for {feature.name}", "development"),
                    ("User Testing", f"Test {feature.name} with target users", "testing")
                ]
            elif any(keyword in feature.name.lower() for keyword in ['api', 'backend', 'database', 'security', 'auth']):
                lead_assignee = emily_davis.id
                task_types = [
                    ("Technical Specification", f"Write technical spec for {feature.name}", "planning"),
                    ("Backend Implementation", f"Implement server-side logic for {feature.name}", "development"),
                    ("Database Integration", f"Set up database layer for {feature.name}", "development"),
                    ("Security Review", f"Security audit and testing for {feature.name}", "testing")
                ]
            elif any(keyword in feature.name.lower() for keyword in ['marketing', 'content', 'social', 'campaign', 'email']):
                lead_assignee = lisa_thompson.id
                task_types = [
                    ("Strategy Planning", f"Develop strategy for {feature.name}", "planning"),
                    ("Content Creation", f"Create content assets for {feature.name}", "development"),
                    ("Campaign Setup", f"Set up and configure {feature.name}", "development"),
                    ("Performance Analysis", f"Analyze and optimize {feature.name} performance", "testing")
                ]
            elif any(keyword in feature.name.lower() for keyword in ['devops', 'infrastructure', 'deployment', 'docker', 'kubernetes']):
                lead_assignee = carlos_mendoza.id
                task_types = [
                    ("Infrastructure Planning", f"Plan infrastructure requirements for {feature.name}", "planning"),
                    ("Environment Setup", f"Set up development environment for {feature.name}", "development"),
                    ("Deployment Configuration", f"Configure deployment pipeline for {feature.name}", "development"),
                    ("Monitoring Setup", f"Set up monitoring and alerting for {feature.name}", "testing")
                ]
            else:
                # Default software development tasks
                lead_assignee = sarah.id
                task_types = [
                    ("Requirements Analysis", f"Analyze requirements and create technical plan for {feature.name}", "planning"),
                    ("Frontend Implementation", f"Implement user interface for {feature.name}", "development"),
                    ("Backend Integration", f"Integrate {feature.name} with backend services", "development"),
                    ("Quality Assurance", f"Test and validate {feature.name} functionality", "testing")
                ]
            
            # Assign varied team members and realistic timelines
            team_rotation = [sarah.id, mike.id, emily_davis.id, james_wilson.id, maya_patel.id, david_kim.id]
            
            # Determine status based on feature status and task order
            base_status_map = {
                "Completed": ["Completed", "Completed", "Completed", "In Progress"],
                "In Progress": ["Completed", "In Progress", "Not Started", "Not Started"],
                "Not Started": ["Not Started", "Not Started", "Not Started", "Not Started"]
            }
            
            status_sequence = base_status_map.get(feature.status, ["Not Started", "Not Started", "Not Started", "Not Started"])
            
            # Create tasks with realistic scheduling
            current_offset = 0
            for i, (task_name, description, task_category) in enumerate(task_types[:4]):  # Limit to 4 tasks per feature
                # Vary duration based on task complexity and type
                duration_map = {
                    "planning": random.randint(4, 12),
                    "design": random.randint(8, 20),
                    "development": random.randint(12, 32),
                    "testing": random.randint(6, 16)
                }
                
                duration = duration_map.get(task_category, 12)
                status = status_sequence[i]
                
                # Assign appropriate team member
                if task_category == "design":
                    assignee = maya_patel.id
                elif task_category == "testing":
                    assignee = david_kim.id
                elif "marketing" in feature.name.lower():
                    assignee = lisa_thompson.id
                elif "devops" in feature.name.lower() or "infrastructure" in feature.name.lower():
                    assignee = carlos_mendoza.id
                else:
                    assignee = team_rotation[i % len(team_rotation)]
                
                # Set priority based on feature priority and task importance
                priority = min(3, feature.priority + (1 if task_category in ["planning", "development"] else 0))
                
                tasks.append(create_task(
                    feature, task_name, description, status, priority,
                    assignee, lead_assignee, current_offset, duration
                ))
                
                current_offset += duration + random.randint(2, 8)  # Add buffer between tasks

    # Add some additional standalone tasks for realism
    additional_tasks = [
        # General project management tasks
        Task(
            feature_id=features[0].id,  # First feature
            name="Weekly Team Standup",
            description="Weekly team synchronization and progress review",
            status="In Progress",
            priority=2,
            assigned_to=alex_rivera.id,
            _created_by=alex_rivera.id,
            _start_date=BASE_DATE,
            _due_date=BASE_DATE + timedelta(hours=1),
        ),
        Task(
            feature_id=features[1].id,  # Second feature
            name="Code Review Session",
            description="Review recent code changes and ensure quality standards",
            status="Not Started",
            priority=2,
            assigned_to=emily_davis.id,
            _created_by=sarah.id,
            _start_date=BASE_DATE + timedelta(days=1),
            _due_date=BASE_DATE + timedelta(days=1, hours=2),
        ),
        Task(
            feature_id=features[2].id,  # Third feature
            name="Stakeholder Demo Preparation",
            description="Prepare demo materials and presentation for stakeholders",
            status="Not Started",
            priority=3,
            assigned_to=maya_patel.id,
            _created_by=alex_rivera.id,
            _start_date=BASE_DATE + timedelta(days=2),
            _due_date=BASE_DATE + timedelta(days=2, hours=4),
        )
    ]
    
    tasks.extend(additional_tasks)

    # Add some overdue tasks for realism
    overdue_tasks = []
    completed_features = [f for f in features if f.status == "Completed"][:3]  # Get first 3 completed features
    
    for feature in completed_features:
        # Add one overdue task that was later completed
        overdue_task = Task(
            feature_id=feature.id,
            name="Final Review & Sign-off",
            description=f"Final stakeholder review and approval for {feature.name}",
            status="Completed",  # Completed but was overdue
            priority=3,
            assigned_to=alex_rivera.id,
            _created_by=alex_rivera.id,
            _start_date=BASE_DATE - timedelta(days=5),
            _due_date=BASE_DATE - timedelta(days=3),  # Was due 3 days ago
        )
        overdue_tasks.append(overdue_task)
    
    tasks.extend(overdue_tasks)

    db.session.add_all(tasks)
    db.session.commit()
    return tasks


def undo_tasks():
    db.session.execute(text("TRUNCATE TABLE tasks RESTART IDENTITY CASCADE;"))
    db.session.commit()