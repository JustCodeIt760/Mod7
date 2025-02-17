from flask.cli import AppGroup
from .users import seed_users, undo_users
from .projects import seed_projects, undo_projects
from .sprints import seed_sprints, undo_sprints
from .features import seed_features, undo_features
from .tasks import seed_tasks, undo_tasks

from models import db

seed_commands = AppGroup("seed")

@seed_commands.command("all")
def seed():
    # Always undo before seeding
    undo_tasks()
    undo_features()
    undo_sprints()
    undo_projects()
    undo_users()
    
    seed_users()
    seed_projects()
    seed_sprints()
    seed_features()
    seed_tasks()

@seed_commands.command("undo")
def undo():
    undo_tasks()  # Must undo in reverse order
    undo_features()  # due to foreign key relationships
    undo_sprints()
    undo_projects()
    undo_users()