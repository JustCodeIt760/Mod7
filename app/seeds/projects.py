from models import db, Project, User
from sqlalchemy.sql import text
from datetime import datetime, timedelta

# Base date for all projects
BASE_DATE = datetime(2025, 1, 2)

def seed_projects():
    users = User.query.all()
    demo, alex_rivera, sarah, mike, emily_davis, james_wilson, maya_patel, david_kim, lisa_thompson, carlos_mendoza = users

    # E-commerce Platform Project (Large, Complex)
    ecommerce_platform = Project(
        name="E-Commerce Platform Redesign",
        description="Complete modernization of our e-commerce platform including new checkout flow, inventory management, and mobile-first responsive design. This project will increase conversion rates and improve user experience across all devices.",
        owner_id=alex_rivera.id,
        due_date=BASE_DATE + timedelta(days=90),  # 3 months
    )

    # Mobile App Development Project (Medium)
    mobile_app = Project(
        name="TaskFlow Mobile App",
        description="Native iOS and Android mobile application for TaskFlow project management. Features include offline sync, push notifications, team collaboration, and real-time updates.",
        owner_id=sarah.id,
        due_date=BASE_DATE + timedelta(days=75),  # 2.5 months
    )

    # Marketing Campaign Project (Small, Fast)
    marketing = Project(
        name="Q1 Digital Marketing Blitz",
        description="Comprehensive digital marketing campaign for Q1 including social media strategy, content marketing, email campaigns, influencer partnerships, and paid advertising across Google, Facebook, and LinkedIn.",
        owner_id=lisa_thompson.id,
        due_date=BASE_DATE + timedelta(days=60),  # 2 months
    )

    # DevOps Infrastructure Project (Medium-Large)
    devops_migration = Project(
        name="Cloud Infrastructure Migration",
        description="Migration from on-premise infrastructure to AWS cloud services. Includes containerization with Docker, Kubernetes orchestration, CI/CD pipeline setup, monitoring, and security hardening.",
        owner_id=carlos_mendoza.id,
        due_date=BASE_DATE + timedelta(days=105),  # 3.5 months
    )

    # Design System Project (Medium)
    design_system = Project(
        name="Unified Design System",
        description="Creation of a comprehensive design system including component library, style guide, accessibility standards, and design tokens. Will be used across all company products and platforms.",
        owner_id=maya_patel.id,
        due_date=BASE_DATE + timedelta(days=50),  # ~7 weeks
    )

    # API Development Project (Large)
    api_platform = Project(
        name="Public API Platform v2.0",
        description="Development of next-generation RESTful API platform with GraphQL support, comprehensive documentation, rate limiting, analytics, and third-party integrations for partners.",
        owner_id=emily_davis.id,
        due_date=BASE_DATE + timedelta(days=80),  # ~11 weeks
    )

    # Add diverse team members to projects
    ecommerce_platform.users.extend([alex_rivera, sarah, mike, emily_davis, james_wilson, maya_patel, david_kim])
    mobile_app.users.extend([sarah, mike, emily_davis, maya_patel, david_kim, carlos_mendoza])
    marketing.users.extend([lisa_thompson, maya_patel, james_wilson, demo])
    devops_migration.users.extend([carlos_mendoza, mike, emily_davis, alex_rivera])
    design_system.users.extend([maya_patel, james_wilson, sarah, emily_davis])
    api_platform.users.extend([emily_davis, mike, sarah, david_kim, carlos_mendoza])

    projects = [ecommerce_platform, mobile_app, marketing, devops_migration, design_system, api_platform]
    db.session.add_all(projects)
    db.session.commit()
    return projects


def undo_projects():
    db.session.execute(text("TRUNCATE TABLE projects RESTART IDENTITY CASCADE;"))
    db.session.commit()
