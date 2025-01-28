from models import db, Project, User
from sqlalchemy.sql import text
from datetime import datetime, timedelta

# Base date for all projects
BASE_DATE = datetime(2025, 1, 2)

def seed_projects():
    users = User.query.all()
    demo, sarah, mike = users

    website_redesign = Project(
        name="Website Redesign",
        description="Complete overhaul of company website",
        owner_id=demo.id,
        due_date=BASE_DATE + timedelta(days=14),
    )

    mobile_app = Project(
        name="Mobile App Development",
        description="New mobile application for customers",
        owner_id=sarah.id,
        due_date=BASE_DATE + timedelta(days=14),
    )

    marketing = Project(
        name="Q1 Marketing Campaign",
        description="Social media marketing campaign",
        owner_id=mike.id,
        due_date=BASE_DATE + timedelta(days=14),
    )

    # Add members to projects
    website_redesign.users.extend([demo, sarah])
    mobile_app.users.extend([sarah, mike])
    marketing.users.extend([mike, demo])

    db.session.add_all([website_redesign, mobile_app, marketing])
    db.session.commit()
    return [website_redesign, mobile_app, marketing]


def undo_projects():
    db.session.execute(text("TRUNCATE TABLE projects RESTART IDENTITY CASCADE;"))
    db.session.commit()
