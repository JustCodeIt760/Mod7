from flask import Blueprint, jsonify
from flask_login import login_required
from models import User, Project

user_routes = Blueprint("users", __name__)


@user_routes.route("users/<int:id>")
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

    if not current_user.has_project_access(project_id):
        return {"errors": {"message": "Unauthorized"}}, 403
