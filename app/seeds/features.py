from models import db, Feature, Project, Sprint, environment, SCHEMA
from sqlalchemy.sql import text


def seed_features():
    projects = Project.query.all()
    website, mobile_app, marketing = projects

    sprints = Sprint.query.all()
    (web_sprint1, web_sprint2, web_sprint3, web_sprint4, web_sprint5, web_sprint6,
     app_sprint1, app_sprint2, app_sprint3, app_sprint4,
     marketing_sprint1, marketing_sprint2, marketing_sprint3) = sprints

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

    # Website Features - Performance Optimization
    code_optimization = Feature(
        project_id=website.id,
        sprint_id=web_sprint5.id,
        name="Code Optimization",
        description="Optimize code for better performance",
        status="Not Started",
        priority=1,
    )

    caching = Feature(
        project_id=website.id,
        sprint_id=web_sprint5.id,
        name="Caching Implementation",
        description="Implement caching strategy",
        status="Not Started",
        priority=2,
    )

    # Website Features - Launch Preparation
    deployment = Feature(
        project_id=website.id,
        sprint_id=web_sprint6.id,
        name="Deployment Setup",
        description="Set up deployment pipeline",
        status="Not Started",
        priority=1,
    )

    monitoring = Feature(
        project_id=website.id,
        sprint_id=web_sprint6.id,
        name="Monitoring Setup",
        description="Set up monitoring and alerts",
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

    # Mobile App Features - UI Polish
    dark_mode = Feature(
        project_id=mobile_app.id,
        sprint_id=app_sprint4.id,
        name="Dark Mode",
        description="Implement dark mode theme",
        status="Not Started",
        priority=2,
    )

    accessibility = Feature(
        project_id=mobile_app.id,
        sprint_id=app_sprint4.id,
        name="Accessibility",
        description="Improve app accessibility",
        status="Not Started",
        priority=1,
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

    # Marketing Features - Email Campaign
    email_templates = Feature(
        project_id=marketing.id,
        sprint_id=marketing_sprint3.id,
        name="Email Templates",
        description="Design email templates",
        status="Not Started",
        priority=1,
    )

    automation = Feature(
        project_id=marketing.id,
        sprint_id=marketing_sprint3.id,
        name="Email Automation",
        description="Set up email automation flows",
        status="Not Started",
        priority=2,
    )

    # Unassigned Features - Website
    seo = Feature(
        project_id=website.id,
        sprint_id=None,
        name="SEO Optimization",
        description="Implement SEO best practices",
        status="Not Started",
        priority=2,
    )

    analytics = Feature(
        project_id=website.id,
        sprint_id=None,
        name="Analytics Integration",
        description="Set up website analytics",
        status="Not Started",
        priority=3,
    )

    # Unassigned Features - Mobile App
    offline_mode = Feature(
        project_id=mobile_app.id,
        sprint_id=None,
        name="Offline Mode",
        description="Add offline functionality",
        status="Not Started",
        priority=3,
    )

    file_sharing = Feature(
        project_id=mobile_app.id,
        sprint_id=None,
        name="File Sharing",
        description="Implement file sharing between users",
        status="Not Started",
        priority=2,
    )

    # Unassigned Features - Marketing
    video_content = Feature(
        project_id=marketing.id,
        sprint_id=None,
        name="Video Content",
        description="Create promotional videos",
        status="Not Started",
        priority=2,
    )

    podcast_series = Feature(
        project_id=marketing.id,
        sprint_id=None,
        name="Podcast Series",
        description="Launch a podcast series",
        status="Not Started",
        priority=3,
    )

    features = [
        # Website Features
        homepage, about_page, wireframes,
        responsive_design, animations,
        api_integration, database_setup,
        unit_tests, e2e_tests,
        code_optimization, caching,
        deployment, monitoring,
        seo, analytics,

        # Mobile App Features
        user_auth, user_profile,
        oauth, two_factor,
        messaging, notifications,
        dark_mode, accessibility,
        offline_mode, file_sharing,

        # Marketing Features
        social_campaign, blog_posts,
        influencer_outreach, social_analytics,
        email_templates, automation,
        video_content, podcast_series
    ]

    db.session.add_all(features)
    db.session.commit()
    return features


def undo_features():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.features RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM features"))
    db.session.commit()
