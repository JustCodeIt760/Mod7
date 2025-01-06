from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Project
from forms import ProjectForm
from functools import wraps


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


project_routes = Blueprint("projects", __name__)


@project_routes.route("", methods=["GET"])
@project_routes.route("/", methods=["GET"])
@login_required
def get_all_projects():
    """
    Get all projects for the current user
    """
    projects = Project.get_all_projects(
        current_user.id
    )  # Using the class method for getting projects
    return jsonify({"projects": [project.to_dict() for project in projects]})


# In project_routes.py
@project_routes.route(
    "/<int:project_id>/members/<int:user_id>", methods=["POST"]
)
@project_routes.route(
    "/<int:project_id>/members/<int:user_id>/", methods=["POST"]
)
@login_required
def add_project_member(project_id, user_id):
    """
    Add a member to a project
    """
    project = Project.get_project_by_id(project_id, current_user.id)
    if not project:
        return {"errors": ["Project not found"]}, 404

    if Project.add_user_to_project(user_id, project_id):
        project = Project.get_project_by_id(
            project_id, current_user.id
        )  # Get fresh project data
        return jsonify(project.to_dict())
    else:
        return {"errors": ["Failed to add member"]}, 400


@project_routes.route(
    "/<int:project_id>/members/<int:user_id>", methods=["DELETE"]
)
@project_routes.route(
    "/<int:project_id>/members/<int:user_id>/", methods=["DELETE"]
)
@login_required
@require_project_access
def remove_project_member(project_id, user_id):
    """
    Remove a member from a project
    """
    project = Project.get_project_by_id(project_id, current_user.id)

    if not project:
        return {"errors": ["Project not found"]}, 404

    # Only owner can remove members
    if project.owner_id != current_user.id:
        return {"errors": ["Unauthorized"]}, 403

    if Project.remove_user_from_project(user_id, project_id):
        project = Project.get_project_by_id(
            project_id, current_user.id
        )  # Get fresh project data
        return jsonify(project.to_dict())
    else:
        return {"errors": ["Failed to remove member"]}, 400


@project_routes.route("/<int:id>", methods=["GET"])
@project_routes.route("/<int:id>/", methods=["GET"])
@login_required
def get_project(id):
    """
    Get a specific project by id
    """
    project = Project.get_project_by_id(id, current_user.id)
    if not project:
        return {"errors": ["Project not found"]}, 404
    return jsonify(project.to_dict())


@project_routes.route("", methods=["POST"])  # /projects
@project_routes.route("/", methods=["POST"])  # /projects/
@login_required
def create_project():
    """
    Create a new project
    """
    form = ProjectForm()
    form["csrf_token"].data = request.cookies["csrf_token"]

    if form.validate_on_submit():
        project = Project.create_project(
            name=form.data["name"],
            description=form.data["description"],
            due_date=form.data["due_date"],
            owner_id=current_user.id,
        )
        return project.to_dict(), 201  # Returning with 201 (Created) status
    return {"errors": form.errors}, 400


@project_routes.route("/<int:id>", methods=["PUT"])
@project_routes.route("/<int:id>/", methods=["PUT"])
@login_required
def update_project(id):
    """
    Update an existing project
    """
    project = Project.get_project_by_id(id, current_user.id)
    if not project:
        return {"errors": ["Project not found"]}, 404

    # Handle JSON data
    if request.is_json:
        data = request.get_json()
        try:
            project.update_project(
                name=data.get("name", project.name),
                description=data.get("description", project.description),
                due_date=data.get("due_date", project.due_date),
            )
            return jsonify(project.to_dict())
        except Exception as e:
            return {"errors": [str(e)]}, 400

    # Handle form data
    form = ProjectForm()
    form["csrf_token"].data = request.cookies["csrf_token"]

    if form.validate_on_submit():
        project.update_project(
            name=form.data["name"],
            description=form.data["description"],
            due_date=form.data["due_date"],
        )
        return jsonify(project.to_dict())

    return {"errors": form.errors}, 400


@project_routes.route("/<int:id>", methods=["DELETE"])
@project_routes.route("/<int:id>/", methods=["DELETE"])
@login_required
def delete_project_route(id):  # Renamed to avoid naming conflict
    """
    Delete a project
    """
    try:
        success = Project.delete_project(id, current_user.id)
        if not success:
            return {"errors": ["Project not found"]}, 404

        return {"message": "Successfully deleted"}, 200
    except Exception as e:
        # Log the error here if you have logging set up
        return {
            "errors": ["An error occurred while deleting the project"]
        }, 500
