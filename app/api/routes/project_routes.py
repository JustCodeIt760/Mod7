from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Project
from forms import ProjectForm

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


@project_routes.route("", methods=["POST"])
@project_routes.route("/", methods=["POST"])
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

    form = ProjectForm()
    form["csrf_token"].data = request.cookies["csrf_token"]

    if form.validate_on_submit():
        project.update_project(
            name=form.data["name"],
            description=form.data["description"],
            due_date=form.data["due_date"],
        )
        return project.to_dict()

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
