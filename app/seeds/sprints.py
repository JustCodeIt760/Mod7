from models import db, Sprint, Project, environment, SCHEMA
from sqlalchemy.sql import text
from datetime import datetime, timedelta


def seed_sprints():
    projects = Project.query.all()
    website, mobile_app, marketing = projects

    # Website Redesign Sprints
    web_sprint1 = Sprint(
        project_id=website.id,
        name="Design Phase",
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=14),
    )

    web_sprint2 = Sprint(
        project_id=website.id,
        name="Frontend Development",
        start_date=datetime.utcnow() + timedelta(days=15),
        end_date=datetime.utcnow() + timedelta(days=29),
    )

    # Mobile App Sprints
    app_sprint1 = Sprint(
        project_id=mobile_app.id,
        name="MVP Features",
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=21),
    )

    # Marketing Sprints
    marketing_sprint1 = Sprint(
        project_id=marketing.id,
        name="Content Creation",
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=10),
    )

    db.session.add_all(
        [web_sprint1, web_sprint2, app_sprint1, marketing_sprint1]
    )
    db.session.commit()
    return [web_sprint1, web_sprint2, app_sprint1, marketing_sprint1]


def undo_sprints():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.sprints RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM sprints"))
    db.session.commit()
