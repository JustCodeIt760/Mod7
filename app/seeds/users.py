from models import db, User
from sqlalchemy.sql import text


def seed_users():
    # Project Managers
    demo = User(
        username="Demo",
        email="demo@aa.io",
        password="password",
        first_name="Demo",
        last_name="User",
    )
    
    alex_rivera = User(
        username="alex.rivera",
        email="alex.rivera@taskflow.io",
        password="password",
        first_name="Alex",
        last_name="Rivera",
    )

    # Developers
    sarah = User(
        username="sarah.chen",
        email="sarah.chen@taskflow.io",
        password="password",
        first_name="Sarah",
        last_name="Chen",
    )
    
    mike = User(
        username="mike.johnson",
        email="mike.johnson@taskflow.io",
        password="password",
        first_name="Mike",
        last_name="Johnson",
    )
    
    emily_davis = User(
        username="emily.davis",
        email="emily.davis@taskflow.io",
        password="password",
        first_name="Emily",
        last_name="Davis",
    )
    
    # Designers
    james_wilson = User(
        username="james.wilson",
        email="james.wilson@taskflow.io",
        password="password",
        first_name="James",
        last_name="Wilson",
    )
    
    maya_patel = User(
        username="maya.patel",
        email="maya.patel@taskflow.io",
        password="password",
        first_name="Maya",
        last_name="Patel",
    )
    
    # QA Engineers
    david_kim = User(
        username="david.kim",
        email="david.kim@taskflow.io",
        password="password",
        first_name="David",
        last_name="Kim",
    )
    
    # Marketing
    lisa_thompson = User(
        username="lisa.thompson",
        email="lisa.thompson@taskflow.io",
        password="password",
        first_name="Lisa",
        last_name="Thompson",
    )
    
    # DevOps
    carlos_mendoza = User(
        username="carlos.mendoza",
        email="carlos.mendoza@taskflow.io",
        password="password",
        first_name="Carlos",
        last_name="Mendoza",
    )

    all_users = [demo, alex_rivera, sarah, mike, emily_davis, james_wilson, 
                 maya_patel, david_kim, lisa_thompson, carlos_mendoza]
    
    db.session.add_all(all_users)
    db.session.commit()
    return all_users


def undo_users():
    db.session.execute(text("TRUNCATE TABLE users RESTART IDENTITY CASCADE;"))
    db.session.commit()