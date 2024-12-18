from models import db, Feature, Project, Sprint, environment, SCHEMA
from sqlalchemy.sql import text


def seed_features():
    projects = Project.query.all()
    website, mobile_app, marketing = projects

    sprints = Sprint.query.all()
    web_sprint1, web_sprint2, app_sprint1, marketing_sprint1 = sprints

    # Website Features
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

    # Mobile App Features
    user_auth = Feature(
        project_id=mobile_app.id,
        sprint_id=app_sprint1.id,
        name="User Authentication",
        description="Login and registration system",
        status="In Progress",
        priority=1,
    )

    # Marketing Features
    social_campaign = Feature(
        project_id=marketing.id,
        sprint_id=marketing_sprint1.id,
        name="Social Media Campaign",
        description="Twitter and Instagram campaign",
        status="In Progress",
        priority=1,
    )

    db.session.add_all([homepage, about_page, user_auth, social_campaign])
    db.session.commit()
    return [homepage, about_page, user_auth, social_campaign]


def undo_features():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.features RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM features"))
    db.session.commit()
