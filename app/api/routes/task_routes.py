from flask import Blueprint, jsonify, request
from models import Task, Feature, Project
from flask_login import login_required, current_user
from functools import wraps

task_routes = Blueprint("tasks", __name__)


def require_project_access(f):
    @wraps(f)
    def decorated_function(project_id, feature_id, *args, **kwargs):
        feature = Feature.query.get(feature_id)
        if not feature:
            return {"message": "Feature couldn't be found"}, 404
        project = Project.query.get(project_id)
        if not project:
            return {"message": "Project couldn't be found"}, 404
        if feature.project_id != project_id:
            return {"message": "Feature couldn't be found"}, 404
        if not current_user.has_project_access(project_id):
            return {"message": "Unauthorized"}, 403
        return f(feature_id, *args, **kwargs)

    return decorated_function


def require_task_access(f):
    @wraps(f)
    def decorated_function(task_id, *args, **kwargs):
        # Get task and verify it exists
        task = Task.query.get(task_id)
        if not task:
            return {"message": "Task couldn't be found"}, 404

        # Get feature and verify it exists
        feature = Feature.query.get(task.feature_id)
        if not feature:
            return {"message": "Feature couldn't be found"}, 404

        # Get project and verify it exists
        project = Project.query.get(feature.project_id)
        if not project:
            return {"message": "Project couldn't be found"}, 404

        # Check if user has access using your existing method
        if not current_user.has_project_access(feature.project_id):
            return {"message": "Unauthorized"}, 403

        return f(task_id, *args, **kwargs)

    return decorated_function


@task_routes.route(
    "/projects/<int:project_id>/features/<int:feature_id>/tasks"
)
@login_required
@require_project_access
def get_all_tasks_feature(feature_id):
    """
    Get all tasks for a feature
    """
    tasks = Task.get_all_tasks_for_feature(feature_id).all()
    return jsonify([task.to_dict() for task in tasks])


@task_routes.route("/tasks")
@task_routes.route("/tasks/")
@login_required
def get_user_tasks():
    """
    Get all tasks assigned to the current user
    """
    tasks = Task.query.filter(Task.assigned_to == current_user.id).all()
    return jsonify([task.to_dict() for task in tasks])


@task_routes.route("/tasks/<int:task_id>/toggle", methods=["PATCH"])
@task_routes.route("/tasks/<int:task_id>/toggle/", methods=["PATCH"])
@login_required
@require_task_access
def toggle_task_completion(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return {"message": "Task couldn't be found"}, 404

        # Toggle between Completed and Not Started
        new_status = (
            "Completed" if task.status != "Completed" else "Not Started"
        )

        # Use the model's update_task method which handles db session
        updated_task = task.update_task(status=new_status)

        # The model method returns the updated task
        return updated_task.to_dict()

    except ValueError as e:  # This would catch invalid status values
        return {"message": str(e)}, 400
    except Exception as e:
        print("Error in toggle_task_completion:", str(e))
        return {"message": "Server error"}, 500


@task_routes.route(
    "/projects/<int:project_id>/features/<int:feature_id>/tasks",
    methods=["POST"],
)
@login_required
@require_project_access
def create_task(feature_id):
    """
    Create a new task for a feature
    """
    data = request.json

    errors = {}
    if not data.get("name"):
        errors["name"] = "Name is required"
    if not data.get("description"):
        errors["description"] = "Description is required"

    if errors:
        return {"message": "Validation error", "errors": errors}, 400

    try:
        new_task = Task.create_task(
            feature_id=feature_id,
            name=data.get("name"),
            description=data.get("description"),
            created_by=current_user.id,
            assigned_to=data.get("assigned_to"),
            status=data.get("status", "Not Started"),
            priority=data.get("priority", 0),
            start_date=data.get("start_date"),
            due_date=data.get("due_date"),
        )

        return new_task.to_dict(), 201

    except ValueError as e:
        return {
            "message": "Validation error",
            "errors": {"model_error": str(e)},
        }, 400


@task_routes.route(
    "/projects/<int:project_id>/features/<int:feature_id>/tasks/<int:task_id>"
)
@login_required
@require_project_access
def get_task(feature_id, task_id):
    """
    Get a specific task by ID
    """
    task = Task.query.get(task_id)
    if not task or task.feature_id != feature_id:
        return {"message": "Task couldn't be found"}, 404

    return jsonify(task.to_dict())


@task_routes.route(
    "/projects/<int:project_id>/features/<int:feature_id>/tasks/<int:task_id>",
    methods=["PUT"],
)
@login_required
@require_project_access
def update_task(feature_id, task_id):
    """
    Update an existing task
    """
    task = Task.query.get(task_id)
    if not task or task.feature_id != feature_id:
        return {"message": "Task couldn't be found"}, 404

    data = request.json

    try:
        updated_task = task.update_task(
            name=data.get("name", task.name),
            description=data.get("description", task.description),
            assigned_to=data.get("assigned_to", task.assigned_to),
            status=data.get("status", task.status),
            priority=data.get("priority", task.priority),
            start_date=data.get("start_date", task.start_date),
            due_date=data.get("due_date", task.due_date),
        )

        return updated_task.to_dict()

    except ValueError as e:
        return {
            "message": "Validation error",
            "errors": {"model_error": str(e)},
        }, 400


@task_routes.route(
    "/projects/<int:project_id>/features/<int:feature_id>/tasks/<int:task_id>",
    methods=["DELETE"],
)
@login_required
@require_project_access
def delete_task(feature_id, task_id):
    """
    Delete an existing task
    """
    task = Task.query.get(task_id)
    if not task or task.feature_id != feature_id:
        return {"message": "Task couldn't be found"}, 404

    if Task.delete_task(task_id):
        return {"message": "Successfully deleted"}, 200
    else:
        return {"message": "Delete failed"}, 400
