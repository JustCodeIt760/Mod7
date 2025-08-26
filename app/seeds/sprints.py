from models import db, Sprint, Project
from sqlalchemy.sql import text
from datetime import datetime, timedelta

# Base date for all sprints
BASE_DATE = datetime(2025, 1, 2)

def seed_sprints():
    projects = Project.query.all()
    ecommerce, mobile_app, marketing, devops, design_system, api_platform = projects

    sprints = []

    # E-Commerce Platform Sprints (2-week sprints, 6 sprints total - 3 months)
    sprint_duration = 14  # 2 weeks
    
    ecommerce_sprints = [
        ("Discovery & Planning", "Requirements gathering, user research, technical architecture planning"),
        ("User Authentication & Security", "Login system, password management, OAuth integration, security audit"),
        ("Product Catalog & Search", "Product listing, filtering, search functionality, inventory integration"),
        ("Shopping Cart & Checkout", "Cart functionality, payment processing, order management"),
        ("Admin Dashboard", "Inventory management, order processing, analytics dashboard"),
        ("Testing & Launch", "QA testing, performance optimization, production deployment")
    ]
    
    for i, (name, description) in enumerate(ecommerce_sprints):
        start = BASE_DATE + timedelta(days=i * sprint_duration)
        end = start + timedelta(days=sprint_duration - 1)
        sprints.append(Sprint(
            project_id=ecommerce.id,
            name=f"Sprint {i+1}: {name}",
            start_date=start,
            end_date=end
        ))

    # Mobile App Sprints (2-week sprints, 5 sprints total - 2.5 months)
    mobile_sprints = [
        ("Foundation & Setup", "Project setup, authentication, basic navigation"),
        ("Core Features", "Task management, project views, team collaboration"),
        ("Real-time & Offline", "Push notifications, offline sync, real-time updates"),
        ("Polish & UX", "UI improvements, animations, user onboarding"),
        ("Beta Testing & Launch", "Testing, App Store submission, production release")
    ]
    
    for i, (name, description) in enumerate(mobile_sprints):
        start = BASE_DATE + timedelta(days=i * sprint_duration)
        end = start + timedelta(days=sprint_duration - 1)
        sprints.append(Sprint(
            project_id=mobile_app.id,
            name=f"Sprint {i+1}: {name}",
            start_date=start,
            end_date=end
        ))

    # Marketing Campaign Sprints (1-week sprints, 8 sprints total - 2 months)
    marketing_duration = 7
    marketing_sprints = [
        ("Strategy & Planning", "Market research, competitor analysis, campaign strategy"),
        ("Content Creation", "Blog posts, social media content, email templates"),
        ("Brand Assets", "Graphics, videos, photography, brand guidelines"),
        ("Website Optimization", "SEO, landing pages, conversion optimization"),
        ("Social Media Launch", "Platform setup, content scheduling, influencer outreach"),
        ("Paid Advertising", "Google Ads, Facebook Ads, LinkedIn campaigns"),
        ("Email Marketing", "Newsletter campaigns, automation setup, segmentation"),
        ("Analytics & Optimization", "Performance tracking, A/B testing, campaign optimization")
    ]
    
    for i, (name, description) in enumerate(marketing_sprints):
        start = BASE_DATE + timedelta(days=i * marketing_duration)
        end = start + timedelta(days=marketing_duration - 1)
        sprints.append(Sprint(
            project_id=marketing.id,
            name=f"Week {i+1}: {name}",
            start_date=start,
            end_date=end
        ))

    # DevOps Migration Sprints (2-week sprints, 7 sprints total - 3.5 months)
    devops_sprints = [
        ("Infrastructure Assessment", "Current system audit, migration planning, cost analysis"),
        ("Containerization", "Docker setup, container registry, image optimization"),
        ("Kubernetes Setup", "Cluster setup, networking, storage configuration"),
        ("CI/CD Pipeline", "Jenkins/GitHub Actions, automated testing, deployment automation"),
        ("Monitoring & Logging", "Prometheus, Grafana, ELK stack, alerting systems"),
        ("Security & Compliance", "Security scanning, compliance checks, access management"),
        ("Migration & Validation", "Production migration, testing, rollback procedures")
    ]
    
    for i, (name, description) in enumerate(devops_sprints):
        start = BASE_DATE + timedelta(days=i * sprint_duration)
        end = start + timedelta(days=sprint_duration - 1)
        sprints.append(Sprint(
            project_id=devops.id,
            name=f"Phase {i+1}: {name}",
            start_date=start,
            end_date=end
        ))

    # Design System Sprints (1-week sprints, 7 sprints total - 7 weeks)
    design_sprints = [
        ("Research & Foundation", "Design audit, token system, color palette"),
        ("Typography & Grid", "Type system, spacing, layout grid"),
        ("Basic Components", "Buttons, forms, inputs, cards"),
        ("Complex Components", "Navigation, modals, data tables"),
        ("Documentation", "Style guide, component library docs"),
        ("Implementation", "React/Vue components, CSS framework"),
        ("Testing & Rollout", "Accessibility testing, team training")
    ]
    
    for i, (name, description) in enumerate(design_sprints):
        start = BASE_DATE + timedelta(days=i * marketing_duration)
        end = start + timedelta(days=marketing_duration - 1)
        sprints.append(Sprint(
            project_id=design_system.id,
            name=f"Sprint {i+1}: {name}",
            start_date=start,
            end_date=end
        ))

    # API Platform Sprints (2-week sprints, 6 sprints total - ~3 months)
    api_sprints = [
        ("API Design & Planning", "OpenAPI specs, database design, architecture planning"),
        ("Core REST Endpoints", "CRUD operations, authentication, basic functionality"),
        ("GraphQL Integration", "Schema design, resolvers, query optimization"),
        ("Advanced Features", "Rate limiting, caching, pagination, webhooks"),
        ("Documentation & SDK", "Interactive docs, client SDKs, code examples"),
        ("Testing & Production", "Load testing, security audit, production deployment")
    ]
    
    for i, (name, description) in enumerate(api_sprints):
        start = BASE_DATE + timedelta(days=i * sprint_duration)
        end = start + timedelta(days=sprint_duration - 1)
        sprints.append(Sprint(
            project_id=api_platform.id,
            name=f"Sprint {i+1}: {name}",
            start_date=start,
            end_date=end
        ))

    db.session.add_all(sprints)
    db.session.commit()
    return sprints


def undo_sprints():
    db.session.execute(text("TRUNCATE TABLE sprints RESTART IDENTITY CASCADE;"))
    db.session.commit()