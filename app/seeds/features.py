from models import db, Feature, Project, Sprint
from sqlalchemy.sql import text
import random

def seed_features():
    projects = Project.query.all()
    sprints = Sprint.query.all()
    
    # Create sprint lookup by project
    project_sprints = {}
    for sprint in sprints:
        if sprint.project_id not in project_sprints:
            project_sprints[sprint.project_id] = []
        project_sprints[sprint.project_id].append(sprint)
    
    features = []
    
    # E-Commerce Platform Features
    ecommerce = projects[0]  # E-Commerce Platform Redesign
    ecommerce_sprints = project_sprints[ecommerce.id]
    
    # Sprint 1: Discovery & Planning
    features.extend([
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[0].id,
            name="User Research & Personas",
            description="Conduct user interviews, create user personas, analyze current user behavior and pain points",
            status="Completed",
            priority=3,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[0].id,
            name="Technical Architecture Planning",
            description="Design system architecture, technology stack selection, database schema planning",
            status="Completed",
            priority=3,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[0].id,
            name="Competitive Analysis",
            description="Analyze competitor websites, feature comparison, identify opportunities",
            status="Completed",
            priority=2,
        )
    ])
    
    # Sprint 2: User Authentication & Security
    features.extend([
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[1].id,
            name="Multi-Factor Authentication",
            description="Implement 2FA with SMS and authenticator app support",
            status="In Progress",
            priority=3,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[1].id,
            name="OAuth Social Login",
            description="Google, Facebook, Apple sign-in integration",
            status="In Progress",
            priority=2,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[1].id,
            name="Password Security Enhancement",
            description="Password strength validation, breach detection, secure reset flow",
            status="Not Started",
            priority=2,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[1].id,
            name="Security Audit & Compliance",
            description="GDPR compliance, security vulnerability assessment",
            status="Not Started",
            priority=3,
        )
    ])
    
    # Sprint 3: Product Catalog & Search
    features.extend([
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[2].id,
            name="Advanced Search & Filtering",
            description="Elasticsearch integration, faceted search, auto-complete",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[2].id,
            name="Product Recommendations",
            description="AI-powered product recommendations based on user behavior",
            status="Not Started",
            priority=2,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[2].id,
            name="Inventory Management Integration",
            description="Real-time inventory tracking, low stock alerts",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[2].id,
            name="Product Image Optimization",
            description="Image compression, lazy loading, multiple format support",
            status="Not Started",
            priority=1,
        )
    ])
    
    # Sprint 4: Shopping Cart & Checkout
    features.extend([
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[3].id,
            name="One-Click Checkout",
            description="Streamlined checkout process with saved payment methods",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[3].id,
            name="Multiple Payment Gateways",
            description="Stripe, PayPal, Apple Pay, Google Pay integration",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[3].id,
            name="Abandoned Cart Recovery",
            description="Email automation for cart abandonment recovery",
            status="Not Started",
            priority=2,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[3].id,
            name="Guest Checkout Option",
            description="Allow purchasing without account creation",
            status="Not Started",
            priority=2,
        )
    ])
    
    # Sprint 5: Admin Dashboard
    features.extend([
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[4].id,
            name="Sales Analytics Dashboard",
            description="Revenue tracking, conversion metrics, customer insights",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[4].id,
            name="Order Management System",
            description="Order processing, shipping integration, return handling",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[4].id,
            name="Customer Service Tools",
            description="Live chat integration, ticket system, customer history",
            status="Not Started",
            priority=2,
        )
    ])
    
    # Sprint 6: Testing & Launch
    features.extend([
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[5].id,
            name="Performance Optimization",
            description="Page speed optimization, CDN setup, caching implementation",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[5].id,
            name="Automated Testing Suite",
            description="End-to-end testing, load testing, security testing",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=ecommerce_sprints[5].id,
            name="Production Deployment",
            description="Blue-green deployment, monitoring setup, rollback procedures",
            status="Not Started",
            priority=3,
        )
    ])

    # TaskFlow Mobile App Features
    mobile_app = projects[1]  # TaskFlow Mobile App
    mobile_sprints = project_sprints[mobile_app.id]
    
    # Sprint 1: Foundation & Setup
    features.extend([
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[0].id,
            name="React Native Setup",
            description="Project initialization, navigation setup, build configuration",
            status="Completed",
            priority=3,
        ),
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[0].id,
            name="Authentication Flow",
            description="Login, registration, password reset, biometric authentication",
            status="In Progress",
            priority=3,
        ),
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[0].id,
            name="Onboarding Experience",
            description="Welcome screens, tutorial, permission requests",
            status="In Progress",
            priority=2,
        )
    ])
    
    # Sprint 2: Core Features
    features.extend([
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[1].id,
            name="Project Management",
            description="Create, edit, delete projects, project dashboard",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[1].id,
            name="Task Management",
            description="Task CRUD operations, task assignment, status updates",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[1].id,
            name="Team Collaboration",
            description="Team member management, role-based permissions",
            status="Not Started",
            priority=2,
        ),
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[1].id,
            name="Sprint Management",
            description="Sprint planning, sprint board, burndown charts",
            status="Not Started",
            priority=2,
        )
    ])
    
    # Sprint 3: Real-time & Offline
    features.extend([
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[2].id,
            name="Push Notifications",
            description="Task assignments, due date reminders, team updates",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[2].id,
            name="Offline Sync",
            description="Local data storage, conflict resolution, background sync",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[2].id,
            name="Real-time Updates",
            description="WebSocket integration, live collaboration features",
            status="Not Started",
            priority=2,
        )
    ])
    
    # Sprint 4: Polish & UX
    features.extend([
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[3].id,
            name="UI/UX Improvements",
            description="Animations, micro-interactions, accessibility improvements",
            status="Not Started",
            priority=2,
        ),
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[3].id,
            name="Dark Mode Support",
            description="Dark theme implementation, theme switching",
            status="Not Started",
            priority=1,
        ),
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[3].id,
            name="Performance Optimization",
            description="Bundle optimization, image caching, memory management",
            status="Not Started",
            priority=2,
        )
    ])
    
    # Sprint 5: Beta Testing & Launch
    features.extend([
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[4].id,
            name="Beta Testing Program",
            description="TestFlight/Play Console setup, feedback collection",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[4].id,
            name="App Store Optimization",
            description="Screenshots, descriptions, keywords, reviews management",
            status="Not Started",
            priority=2,
        ),
        Feature(
            project_id=mobile_app.id,
            sprint_id=mobile_sprints[4].id,
            name="Analytics Integration",
            description="User behavior tracking, crash reporting, performance monitoring",
            status="Not Started",
            priority=2,
        )
    ])

    # Marketing Campaign Features
    marketing = projects[2]  # Q1 Digital Marketing Blitz
    marketing_sprints = project_sprints[marketing.id]
    
    # Week 1: Strategy & Planning
    features.extend([
        Feature(
            project_id=marketing.id,
            sprint_id=marketing_sprints[0].id,
            name="Market Research Report",
            description="Target audience analysis, competitor research, market trends",
            status="Completed",
            priority=3,
        ),
        Feature(
            project_id=marketing.id,
            sprint_id=marketing_sprints[0].id,
            name="Campaign Strategy Document",
            description="Goals, KPIs, budget allocation, timeline planning",
            status="Completed",
            priority=3,
        )
    ])
    
    # Week 2: Content Creation
    features.extend([
        Feature(
            project_id=marketing.id,
            sprint_id=marketing_sprints[1].id,
            name="Blog Content Calendar",
            description="20 blog posts, SEO optimization, content themes",
            status="In Progress",
            priority=3,
        ),
        Feature(
            project_id=marketing.id,
            sprint_id=marketing_sprints[1].id,
            name="Email Campaign Templates",
            description="Welcome series, newsletter templates, automation sequences",
            status="In Progress",
            priority=2,
        ),
        Feature(
            project_id=marketing.id,
            sprint_id=marketing_sprints[1].id,
            name="Social Media Content Bank",
            description="100+ posts across platforms, hashtag research",
            status="Not Started",
            priority=2,
        )
    ])
    
    # Week 3: Brand Assets
    features.extend([
        Feature(
            project_id=marketing.id,
            sprint_id=marketing_sprints[2].id,
            name="Visual Brand Guidelines",
            description="Logo variations, color palettes, typography standards",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=marketing.id,
            sprint_id=marketing_sprints[2].id,
            name="Video Content Production",
            description="Product demos, testimonials, explainer videos",
            status="Not Started",
            priority=2,
        ),
        Feature(
            project_id=marketing.id,
            sprint_id=marketing_sprints[2].id,
            name="Photography & Graphics",
            description="Product photography, infographics, social media graphics",
            status="Not Started",
            priority=2,
        )
    ])

    # Add features for remaining projects (DevOps, Design System, API Platform)
    # I'll add a few key features for each to demonstrate variety
    
    # DevOps Migration Features (sample from first 2 sprints)
    devops = projects[3]
    devops_sprints = project_sprints[devops.id]
    
    features.extend([
        Feature(
            project_id=devops.id,
            sprint_id=devops_sprints[0].id,
            name="Infrastructure Audit",
            description="Current system analysis, performance benchmarking, cost analysis",
            status="Completed",
            priority=3,
        ),
        Feature(
            project_id=devops.id,
            sprint_id=devops_sprints[0].id,
            name="Migration Strategy Plan",
            description="Phased migration approach, risk assessment, rollback procedures",
            status="In Progress",
            priority=3,
        ),
        Feature(
            project_id=devops.id,
            sprint_id=devops_sprints[1].id,
            name="Docker Containerization",
            description="Application containerization, multi-stage builds, registry setup",
            status="Not Started",
            priority=3,
        )
    ])
    
    # Design System Features (sample from first 2 sprints)
    design_system = projects[4]
    design_sprints = project_sprints[design_system.id]
    
    features.extend([
        Feature(
            project_id=design_system.id,
            sprint_id=design_sprints[0].id,
            name="Design Token System",
            description="Color, typography, spacing tokens, JSON/CSS variable export",
            status="Completed",
            priority=3,
        ),
        Feature(
            project_id=design_system.id,
            sprint_id=design_sprints[0].id,
            name="Component Audit",
            description="Existing component inventory, inconsistency identification",
            status="In Progress",
            priority=2,
        ),
        Feature(
            project_id=design_system.id,
            sprint_id=design_sprints[1].id,
            name="Typography System",
            description="Font scale, weight system, line-height standards",
            status="Not Started",
            priority=3,
        )
    ])
    
    # API Platform Features (sample from first 2 sprints)
    api_platform = projects[5]
    api_sprints = project_sprints[api_platform.id]
    
    features.extend([
        Feature(
            project_id=api_platform.id,
            sprint_id=api_sprints[0].id,
            name="OpenAPI Specification",
            description="Complete API documentation, endpoint specifications",
            status="In Progress",
            priority=3,
        ),
        Feature(
            project_id=api_platform.id,
            sprint_id=api_sprints[0].id,
            name="Database Schema Design",
            description="Normalized schema, indexing strategy, migration scripts",
            status="Not Started",
            priority=3,
        ),
        Feature(
            project_id=api_platform.id,
            sprint_id=api_sprints[1].id,
            name="Authentication & Authorization",
            description="JWT implementation, role-based access control, API keys",
            status="Not Started",
            priority=3,
        )
    ])
    
    # Add some parking lot features (unassigned to sprints) for each project
    parking_lot_features = [
        Feature(
            project_id=ecommerce.id,
            sprint_id=None,
            name="Mobile App Integration",
            description="Deep linking between web and mobile app",
            status="Not Started",
            priority=1,
        ),
        Feature(
            project_id=ecommerce.id,
            sprint_id=None,
            name="Voice Search Feature",
            description="Voice-activated product search using speech recognition",
            status="Not Started",
            priority=1,
        ),
        Feature(
            project_id=mobile_app.id,
            sprint_id=None,
            name="Apple Watch Companion",
            description="Quick task updates and notifications on Apple Watch",
            status="Not Started",
            priority=1,
        ),
        Feature(
            project_id=marketing.id,
            sprint_id=None,
            name="Podcast Sponsorship Campaign",
            description="Partner with industry podcasts for brand awareness",
            status="Not Started",
            priority=1,
        ),
        Feature(
            project_id=devops.id,
            sprint_id=None,
            name="Multi-Cloud Strategy",
            description="Hybrid cloud setup with AWS and Azure",
            status="Not Started",
            priority=1,
        )
    ]
    
    features.extend(parking_lot_features)

    db.session.add_all(features)
    db.session.commit()
    return features


def undo_features():
    db.session.execute(text("TRUNCATE TABLE features RESTART IDENTITY CASCADE;"))
    db.session.commit()