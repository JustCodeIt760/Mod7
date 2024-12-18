from models import db, Task, Feature, User, environment, SCHEMA
from sqlalchemy.sql import text
from datetime import datetime, timedelta


def seed_tasks():
    features = Feature.query.all()
    homepage, about_page, user_auth, social_campaign = features

    users = User.query.all()
    demo, sarah, mike = users

    # Homepage Tasks
    wireframe = Task(
        feature_id=homepage.id,
        name="Create Wireframes",
        description="Design initial wireframes for homepage",
        status="In Progress",
        priority=1,
        assigned_to=sarah.id,
        _created_by=demo.id,
        _start_date=datetime.utcnow(),
        _due_date=datetime.utcnow() + timedelta(days=3),
    )

    # User Auth Tasks
    login_system = Task(
        feature_id=user_auth.id,
        name="Implement Login",
        description="Create login functionality",
        status="Not Started",
        priority=1,
        assigned_to=mike.id,
        _created_by=sarah.id,
        _start_date=datetime.utcnow() + timedelta(days=1),
        _due_date=datetime.utcnow() + timedelta(days=5),
    )

    registration = Task(
        feature_id=user_auth.id,
        name="User Registration",
        description="Implement user registration",
        status="Not Started",
        priority=2,
        assigned_to=demo.id,
        _created_by=sarah.id,
        _start_date=datetime.utcnow() + timedelta(days=1),
        _due_date=datetime.utcnow() + timedelta(days=4),
    )

    # Social Campaign Tasks
    content_calendar = Task(
        feature_id=social_campaign.id,
        name="Content Calendar",
        description="Create social media content calendar",
        status="In Progress",
        priority=1,
        assigned_to=sarah.id,
        _created_by=mike.id,
        _start_date=datetime.utcnow(),
        _due_date=datetime.utcnow() + timedelta(days=2),
    )

    db.session.add_all(
        [wireframe, login_system, registration, content_calendar]
    )
    db.session.commit()


def undo_tasks():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.tasks RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM tasks"))
    db.session.commit()
