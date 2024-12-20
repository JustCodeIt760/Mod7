from flask import Blueprint, jsonify, request
from models import Sprint, Project
from flask_login import login_required, current_user
from functools import wraps

sprint_routes = Blueprint("sprints", __name__)


def require_project_access(f):
    @wraps(f)
    def decorated_function(project_id, *args, **kwargs):
        project = Project.query.get(project_id)
        if not project:
            return {"message": "Project couldn't be found"}, 404
        if not current_user.has_project_access(project_id):
            return {"message": "Unauthorized"}, 403
        return f(project_id, *args, **kwargs)

    return decorated_function


@sprint_routes.route("/projects/<int:project_id>/sprints")
@login_required
@require_project_access
def get_all_sprints_project(project_id):

    sprints = Sprint.get_all_sprints_for_project(project_id).all()

    return [sprint.to_dict() for sprint in sprints]


@sprint_routes.route("/projects/<int:project_id>/sprints", methods=["POST"])
@login_required
@require_project_access
def create_sprint(project_id):

    data = request.json

    errors = {}

    if not data.get("name"):
        errors["name"] = "Name is required"

    if errors:
        return {"message": "Validation error", "errors": errors}

    try:
        new_sprint = Sprint.create_sprint(
            project_id=project_id,
            name=data.get("name"),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
        )

        return new_sprint.to_dict(), 201
    except ValueError as e:
        return {
            "message": "Validation error",
            "errors": {"model_error": str(e)},
        }, 400


@sprint_routes.route(
    "/projects/<int:project_id>/sprints/<int:sprint_id>", methods=["PUT"]
)
@login_required
@require_project_access
def update_sprint(project_id, sprint_id):

    sprint = Sprint.query.get(sprint_id)
    if not sprint:
        return {"message": "Sprint couldn't be found"}, 404

    data = request.json

    try:
        updated_sprint = sprint.update_sprint(
            name=data.get("name"),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
        )

        return updated_sprint.to_dict(), 200

    except ValueError as e:
        return {
            "message": "Validation error",
            "errors": {"model_error": str(e)},
        }, 400


@sprint_routes.route(
    "/projects/<int:project_id>/sprints/<int:sprint_id>", methods=["DELETE"]
)
@login_required
@require_project_access
def delete_sprint(project_id, sprint_id):

    sprint = Sprint.query.get(sprint_id)

    if not sprint:
        return {"message": "Sprint couldn't be found"}, 404

    if Sprint.delete_sprint(sprint_id):
        return {"message": "Sprint successfully deleted"}, 200
    else:
        return {"message": "Delete failed"}, 400
