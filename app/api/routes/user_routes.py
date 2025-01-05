from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from models import User, Project

user_routes = Blueprint("users", __name__)


@user_routes.route("/users")
@user_routes.route("/users/")
@login_required
def get_all_users():
    users = User.query.all()
    return {"users": [user.to_dict() for user in users]}


@user_routes.route("/users/<int:id>")
@login_required
def user(id):
    """
    Query for a user by id and returns that user in a dictionary
    """
    user = User.query.get(id)
    return user.to_dict()


@user_routes.route("/projects/<int:project_id>/users")
@login_required
def project_users(project_id):
    project = Project.query.get(project_id)

    # Check if project exists
    if not project:
        return {"errors": {"message": "Project couldn't be found"}}, 404

    # Check authorization
    if not current_user.has_project_access(project_id):
        return {"errors": {"message": "Unauthorized"}}, 403

    # If authorized, return project users
    users = [
        user.to_dict() for user in project.users
    ]  # Changed from members to users

    # Don't forget to include owner if they're not in users
    if project.owner not in project.users:
        users.append(project.owner.to_dict())

    return {"users": users}
