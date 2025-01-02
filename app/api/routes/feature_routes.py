from flask import Blueprint, jsonify, request
from functools import wraps
from models import User, Sprint, Project, Feature, db
from flask_login import login_required, current_user

feature_routes = Blueprint("features", __name__)


# ** Authorization Decorator **
def require_project_access(f):
    @wraps(f)
    def decorated_function(project_id, *args, **kwargs):
        project = Project.query.get(project_id)
        if not project:
            return {"message": "Project couldn't be found"}, 404
        if not current_user.has_project_access(project_id):
            return {"message": "Unauthorized"}
        return f(project_id, *args, **kwargs)

    return decorated_function


@feature_routes.route("/projects/<int:project_id>/features")
@login_required
@require_project_access
def get_all_features(project_id):
    print(f"Getting features for project {project_id}")  # Debug print
    features = Feature.get_features_by_project(project_id)
    feature_list = [feature.to_dict() for feature in features]
    print(f"Found {len(feature_list)} features")  # Debug print
    print(f"Feature data: {feature_list}")  # Debug print
    return jsonify(feature_list)


@feature_routes.route("/projects/<int:project_id>/features", methods=["POST"])
@login_required
@require_project_access
def create_feature(project_id):
    data = request.json

    errors = {}
    if not data.get("name"):
        errors["name"] = "Name is required"
    if data.get("status") and data["status"] not in Feature.VALID_STATUSES:
        errors["status"] = (
            f"Status must be one of: {', '.join(Feature.VALID_STATUSES)}"
        )
    if errors:
        return {"message": "Validation error", "errors": errors}, 400

    try:
        new_feature = Feature.create_feature(
            project_id=project_id,
            name=data["name"],
            description=data.get("description"),
            sprint_id=data.get("sprint_id"),
            status=data.get("status", "Not Started"),
            priority=data.get("priority", 0),
        )
        return jsonify(new_feature.to_dict()), 201
    except ValueError as e:
        return {
            "message": "Validation error",
            "errors": {"model_error": str(e)},
        }, 400


@feature_routes.route(
    "/projects/<int:project_id>/features/<int:feature_id>", methods=["PUT"]
)
@login_required
@require_project_access
def update_feature(project_id, feature_id):
    feature = Feature.query.get(feature_id)
    if not feature:
        return {"message": "Feature not found"}, 404
    data = request.json
    if data.get("status") and data["status"] not in Feature.VALID_STATUSES:
        return {
            "message": "Validation error",
            "errors": {
                "status": f"Status must be one of: {', '.join(Feature.VALID_STATUSES)}"
            },
        }, 400
    try:
        updated_feature = feature.update_feature(
            **{
                "name": data.get("name", feature.name),
                "description": data.get("description", feature.description),
                "status": data.get("status", feature.status),
                "priority": data.get("priority", feature.priority),
                "sprint_id": data.get("sprint_id", feature.sprint_id),
            }
        )
        return jsonify(updated_feature.to_dict())
    except ValueError as e:
        return {
            "message": "Validation error",
            "errors": {"model_error": str(e)},
        }, 400


@feature_routes.route(
    "/projects/<int:project_id>/features/<int:feature_id>", methods=["DELETE"]
)
@login_required
@require_project_access
def delete_feature(project_id, feature_id):
    if Feature.delete_feature(feature_id):
        return {}, 204
    return {"message": "Feature couldn't be found"}, 404


@feature_routes.route("/projects/<int:project_id>/features/<int:feature_id>")
@login_required
@require_project_access
def get_feature(project_id, feature_id):
    feature = Feature.query.get(feature_id)
    if not feature:
        return {"message": "Feature couldn't be found"}, 404
    return jsonify(feature.to_dict())
