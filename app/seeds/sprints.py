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
        start_date=datetime(2023, 12, 31),
        end_date=datetime(2024, 1, 4),
    )

    web_sprint2 = Sprint(
        project_id=website.id,
        name="Frontend Development",
        start_date=datetime(2024, 1, 4),
        end_date=datetime(2024, 1, 6),
    )

    web_sprint3 = Sprint(
        project_id=website.id,
        name="Backend Integration",
        start_date=datetime(2024, 1, 6),
        end_date=datetime(2024, 1, 8),
    )

    web_sprint4 = Sprint(
        project_id=website.id,
        name="Testing & QA",
        start_date=datetime(2024, 1, 8),
        end_date=datetime(2024, 1, 10),
    )

    web_sprint5 = Sprint(
        project_id=website.id,
        name="Performance Optimization",
        start_date=datetime(2024, 1, 10),
        end_date=datetime(2024, 1, 12),
    )

    web_sprint6 = Sprint(
        project_id=website.id,
        name="Launch Preparation",
        start_date=datetime(2024, 1, 12),
        end_date=datetime(2024, 1, 14),
    )

    # Mobile App Sprints
    app_sprint1 = Sprint(
        project_id=mobile_app.id,
        name="MVP Features",
        start_date=datetime(2023, 12, 31),
        end_date=datetime(2024, 1, 4),
    )

    app_sprint2 = Sprint(
        project_id=mobile_app.id,
        name="User Authentication",
        start_date=datetime(2024, 1, 4),
        end_date=datetime(2024, 1, 6),
    )

    app_sprint3 = Sprint(
        project_id=mobile_app.id,
        name="Core Functionality",
        start_date=datetime(2024, 1, 6),
        end_date=datetime(2024, 1, 8),
    )

    app_sprint4 = Sprint(
        project_id=mobile_app.id,
        name="UI Polish",
        start_date=datetime(2024, 1, 8),
        end_date=datetime(2024, 1, 10),
    )

    # Marketing Sprints
    marketing_sprint1 = Sprint(
        project_id=marketing.id,
        name="Content Creation",
        start_date=datetime(2023, 12, 31),
        end_date=datetime(2024, 1, 4),
    )

    marketing_sprint2 = Sprint(
        project_id=marketing.id,
        name="Social Media Strategy",
        start_date=datetime(2024, 1, 4),
        end_date=datetime(2024, 1, 6),
    )

    marketing_sprint3 = Sprint(
        project_id=marketing.id,
        name="Analytics & Reporting",
        start_date=datetime(2024, 1, 6),
        end_date=datetime(2024, 1, 8),
    )

    db.session.add_all([
        web_sprint1, web_sprint2, web_sprint3, web_sprint4, web_sprint5, web_sprint6,
        app_sprint1, app_sprint2, app_sprint3, app_sprint4,
        marketing_sprint1, marketing_sprint2, marketing_sprint3
    ])
    db.session.commit()
    return [
        web_sprint1, web_sprint2, web_sprint3, web_sprint4, web_sprint5, web_sprint6,
        app_sprint1, app_sprint2, app_sprint3, app_sprint4,
        marketing_sprint1, marketing_sprint2, marketing_sprint3
    ]


def undo_sprints():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.sprints RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM sprints"))
    db.session.commit()
