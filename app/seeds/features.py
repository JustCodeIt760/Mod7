from models import db, Feature, Project, Sprint, environment, SCHEMA
from sqlalchemy.sql import text


def seed_features():
    projects = Project.query.all()
    website, mobile_app, marketing = projects

    sprints = Sprint.query.all()
    (web_sprint1, web_sprint2, web_sprint3, web_sprint4,
     app_sprint1, app_sprint2, app_sprint3,
     marketing_sprint1, marketing_sprint2) = sprints

    # Website Features - Design Phase
    homepage = Feature(
        project_id=website.id,
        sprint_id=web_sprint1.id,
        name="Homepage Redesign",
        description="Complete redesign of main homepage",
        status="Not Started",
        priority=1,
    )

    about_page = Feature(
        project_id=website.id,
        sprint_id=web_sprint1.id,
        name="About Page",
        description="New about page with team bios",
        status="Not Started",
        priority=2,
    )

    wireframes = Feature(
        project_id=website.id,
        sprint_id=web_sprint1.id,
        name="Wireframe Creation",
        description="Create detailed wireframes for all pages",
        status="In Progress",
        priority=1,
    )

    # Website Features - Frontend Development
    responsive_design = Feature(
        project_id=website.id,
        sprint_id=web_sprint2.id,
        name="Responsive Design",
        description="Implement responsive design for all screen sizes",
        status="Not Started",
        priority=1,
    )

    animations = Feature(
        project_id=website.id,
        sprint_id=web_sprint2.id,
        name="UI Animations",
        description="Add smooth transitions and animations",
        status="Not Started",
        priority=3,
    )

    # Website Features - Backend Integration
    api_integration = Feature(
        project_id=website.id,
        sprint_id=web_sprint3.id,
        name="API Integration",
        description="Connect frontend with backend APIs",
        status="Not Started",
        priority=1,
    )

    database_setup = Feature(
        project_id=website.id,
        sprint_id=web_sprint3.id,
        name="Database Setup",
        description="Set up and configure database",
        status="Not Started",
        priority=2,
    )

    # Website Features - Testing & QA
    unit_tests = Feature(
        project_id=website.id,
        sprint_id=web_sprint4.id,
        name="Unit Tests",
        description="Write comprehensive unit tests",
        status="Not Started",
        priority=1,
    )

    e2e_tests = Feature(
        project_id=website.id,
        sprint_id=web_sprint4.id,
        name="E2E Tests",
        description="Implement end-to-end testing",
        status="Not Started",
        priority=2,
    )

    # Mobile App Features - MVP
    user_auth = Feature(
        project_id=mobile_app.id,
        sprint_id=app_sprint1.id,
        name="User Authentication",
        description="Login and registration system",
        status="In Progress",
        priority=1,
    )

    user_profile = Feature(
        project_id=mobile_app.id,
        sprint_id=app_sprint1.id,
        name="User Profile",
        description="User profile management",
        status="Not Started",
        priority=2,
    )

    # Mobile App Features - Authentication
    oauth = Feature(
        project_id=mobile_app.id,
        sprint_id=app_sprint2.id,
        name="OAuth Integration",
        description="Implement social login",
        status="Not Started",
        priority=1,
    )

    two_factor = Feature(
        project_id=mobile_app.id,
        sprint_id=app_sprint2.id,
        name="Two-Factor Auth",
        description="Add two-factor authentication",
        status="Not Started",
        priority=2,
    )

    # Mobile App Features - Core Functionality
    messaging = Feature(
        project_id=mobile_app.id,
        sprint_id=app_sprint3.id,
        name="Messaging System",
        description="Implement real-time messaging",
        status="Not Started",
        priority=1,
    )

    notifications = Feature(
        project_id=mobile_app.id,
        sprint_id=app_sprint3.id,
        name="Push Notifications",
        description="Set up push notifications",
        status="Not Started",
        priority=2,
    )

    # Marketing Features - Content Creation
    social_campaign = Feature(
        project_id=marketing.id,
        sprint_id=marketing_sprint1.id,
        name="Social Media Campaign",
        description="Twitter and Instagram campaign",
        status="In Progress",
        priority=1,
    )

    blog_posts = Feature(
        project_id=marketing.id,
        sprint_id=marketing_sprint1.id,
        name="Blog Content",
        description="Write and publish blog posts",
        status="Not Started",
        priority=2,
    )

    # Marketing Features - Social Media
    influencer_outreach = Feature(
        project_id=marketing.id,
        sprint_id=marketing_sprint2.id,
        name="Influencer Program",
        description="Set up influencer partnership program",
        status="Not Started",
        priority=1,
    )

    social_analytics = Feature(
        project_id=marketing.id,
        sprint_id=marketing_sprint2.id,
        name="Analytics Setup",
        description="Set up social media analytics",
        status="Not Started",
        priority=2,
    )

    db.session.add_all([
        homepage, about_page, wireframes,
        responsive_design, animations,
        api_integration, database_setup,
        unit_tests, e2e_tests,
        user_auth, user_profile,
        oauth, two_factor,
        messaging, notifications,
        social_campaign, blog_posts,
        influencer_outreach, social_analytics
    ])
    db.session.commit()
    return [
        homepage, about_page, wireframes,
        responsive_design, animations,
        api_integration, database_setup,
        unit_tests, e2e_tests,
        user_auth, user_profile,
        oauth, two_factor,
        messaging, notifications,
        social_campaign, blog_posts,
        influencer_outreach, social_analytics
    ]


def undo_features():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.features RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM features"))
    db.session.commit()
