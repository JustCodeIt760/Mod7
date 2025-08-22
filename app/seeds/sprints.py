from models import db, Sprint, Project
from sqlalchemy.sql import text
from datetime import datetime, timedelta

# Base date for all sprints
BASE_DATE = datetime(2025, 1, 2)

def seed_sprints():
    projects = Project.query.all()
    website, mobile_app, marketing = projects

    # Website Redesign Sprints (1 week each)
    web_sprint1 = Sprint(
        project_id=website.id,
        name="Design Phase",
        start_date=BASE_DATE,
        end_date=BASE_DATE + timedelta(days=6),
    )

    web_sprint2 = Sprint(
        project_id=website.id,
        name="Frontend Development",
        start_date=BASE_DATE + timedelta(days=7),
        end_date=BASE_DATE + timedelta(days=13),
    )

    web_sprint3 = Sprint(
        project_id=website.id,
        name="Backend Integration",
        start_date=BASE_DATE + timedelta(days=14),
        end_date=BASE_DATE + timedelta(days=20),
    )

    web_sprint4 = Sprint(
        project_id=website.id,
        name="Testing & QA",
        start_date=BASE_DATE + timedelta(days=21),
        end_date=BASE_DATE + timedelta(days=27),
    )

    # Mobile App Sprints (1 week each)
    app_sprint1 = Sprint(
        project_id=mobile_app.id,
        name="MVP Features",
        start_date=BASE_DATE,
        end_date=BASE_DATE + timedelta(days=6),
    )

    app_sprint2 = Sprint(
        project_id=mobile_app.id,
        name="User Authentication",
        start_date=BASE_DATE + timedelta(days=7),
        end_date=BASE_DATE + timedelta(days=13),
    )

    app_sprint3 = Sprint(
        project_id=mobile_app.id,
        name="Core Functionality",
        start_date=BASE_DATE + timedelta(days=14),
        end_date=BASE_DATE + timedelta(days=20),
    )

    # Marketing Sprints (1 week each)
    marketing_sprint1 = Sprint(
        project_id=marketing.id,
        name="Content Creation",
        start_date=BASE_DATE,
        end_date=BASE_DATE + timedelta(days=6),
    )

    marketing_sprint2 = Sprint(
        project_id=marketing.id,
        name="Social Media Strategy",
        start_date=BASE_DATE + timedelta(days=7),
        end_date=BASE_DATE + timedelta(days=13),
    )

    db.session.add_all([
        web_sprint1, web_sprint2, web_sprint3, web_sprint4,
        app_sprint1, app_sprint2, app_sprint3,
        marketing_sprint1, marketing_sprint2
    ])
    db.session.commit()
    return [
        web_sprint1, web_sprint2, web_sprint3, web_sprint4,
        app_sprint1, app_sprint2, app_sprint3,
        marketing_sprint1, marketing_sprint2
    ]


def undo_sprints():
    db.session.execute(text("TRUNCATE TABLE sprints RESTART IDENTITY CASCADE;"))
    db.session.commit()