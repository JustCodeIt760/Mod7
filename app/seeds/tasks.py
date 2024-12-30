from models import db, Task, Feature, User, environment, SCHEMA
from sqlalchemy.sql import text
from datetime import datetime, timedelta


def seed_tasks():
    features = Feature.query.all()
    users = User.query.all()
    demo, sarah, mike = users

    tasks = []

    # Helper function to create tasks
    def create_task(feature, name, description, status, priority, assigned_to, created_by, days_offset=0):
        return Task(
            feature_id=feature.id,
            name=name,
            description=description,
            status=status,
            priority=priority,
            assigned_to=assigned_to,
            _created_by=created_by,
            _start_date=datetime.utcnow() + timedelta(days=days_offset),
            _due_date=datetime.utcnow() + timedelta(days=days_offset + 3),
        )

    # Create tasks for each feature
    for feature in features:
        # Create 2-4 tasks per feature
        if feature.name == "Homepage Redesign":
            tasks.extend([
                create_task(feature, "Design Mockup", "Create initial design mockup", "In Progress", 1, sarah.id, demo.id),
                create_task(feature, "Gather Assets", "Collect all required images and icons", "Not Started", 2, mike.id, demo.id, 1),
                create_task(feature, "Implement Design", "Code the new homepage design", "Not Started", 1, demo.id, sarah.id, 2),
            ])
        elif feature.name == "About Page":
            tasks.extend([
                create_task(feature, "Write Content", "Write team bios and company info", "Not Started", 1, mike.id, demo.id),
                create_task(feature, "Design Layout", "Design page layout", "Not Started", 2, sarah.id, demo.id, 1),
            ])
        elif feature.name == "User Authentication":
            tasks.extend([
                create_task(feature, "Backend Setup", "Set up authentication backend", "In Progress", 1, mike.id, sarah.id),
                create_task(feature, "Frontend Integration", "Integrate auth with frontend", "Not Started", 2, demo.id, sarah.id, 1),
                create_task(feature, "Testing", "Test authentication flow", "Not Started", 3, sarah.id, mike.id, 2),
            ])
        elif feature.name == "Social Media Campaign":
            tasks.extend([
                create_task(feature, "Content Planning", "Plan social media content", "In Progress", 1, sarah.id, mike.id),
                create_task(feature, "Create Graphics", "Design social media graphics", "Not Started", 2, mike.id, sarah.id, 1),
                create_task(feature, "Schedule Posts", "Schedule content for posting", "Not Started", 3, demo.id, mike.id, 2),
            ])
        else:
            # Create default tasks for other features
            tasks.extend([
                create_task(feature, "Planning", f"Plan {feature.name} implementation", "Not Started", 1, demo.id, sarah.id),
                create_task(feature, "Implementation", f"Implement {feature.name}", "Not Started", 2, sarah.id, mike.id, 1),
                create_task(feature, "Testing", f"Test {feature.name}", "Not Started", 3, mike.id, demo.id, 2),
            ])

    db.session.add_all(tasks)
    db.session.commit()
    return tasks


def undo_tasks():
    if environment == "production":
        db.session.execute(
            f"TRUNCATE table {SCHEMA}.tasks RESTART IDENTITY CASCADE;"
        )
    else:
        db.session.execute(text("DELETE FROM tasks"))
    db.session.commit()
