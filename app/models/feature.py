from .db import db
from flask import Blueprint, jsonify, request
from .auth import is_authenticated, user_has_access_to_project
from datetime import datetime
from .user import User
from functools import wraps
import jwt
from app import app

feature_routes = Blueprint("features", __name__)


class Feature(db.Model):
    __tablename__ = "features"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    project_id = db.Column(
        db.Integer, db.ForeignKey("projects.id"), nullable=False
    )
    name = db.Column(db.String, nullable=False)
    created_by = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False
    )
    sprint_id = db.Column(
        db.Integer, db.ForeignKey("sprints.id"), nullable=True
    )
    created_at = db.Column(
        db.DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    project = db.relationship("Project", back_populates="features")
    user = db.relationship("User", back_populates="features")
    sprint = db.relationship("Sprint", back_populates="features")

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "name": self.name,
            "created_by": self.created_by,
            "sprint_id": self.sprint_id,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    #! helper Functions and Decorators

    # ** is_authenticated function **
    def is_authenticated(request):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return False

        try:
            token = auth_header.split(" ")[1]

            decoded_token = jwt.decode(
                token, app.config["SECRET_KEY"], algorithms=["HS256"]
            )

            # Add user info to request object for use in routes
            request.user = decoded_token

            return True

        except jwt.ExpiredSignatureError:
            return False
        except jwt.InvalidTokenError:
            return False
        except Exception as e:
            app.logger.error(f"Unexpected error: {e}")
            return False

    #  ** is_authorized **
    def is_authorized(request, feature_id):
        # Check if the user is authenticated
        if not is_authenticated(request):
            return False
        # Check if the user has access to the project
        if not user_has_access_to_project(request.user, feature_id):
            return False
        return True

    # ** Authorization and Authentication Decorators **
    @classmethod
    def full_auth(cls, f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if the user is authenticated
            if not is_authenticated(request):
                return jsonify({"message": "Authentication required"}), 401

            project_id = kwargs.get("project_id")

            if not user_has_access_to_project(request.user, project_id):
                return jsonify({"message": "Access denied"}), 403

            return f(*args, **kwargs)

        return decorated_function


# Get all features for a project
@feature_routes.route("/projects/<int:project_id>/features", methods=["GET"])
@Feature.full_auth
def get_features(project_id):
    features = Feature.query.filter_by(project_id=project_id).all()
    return jsonify([feature.to_dict() for feature in features])


# Get a single feature
@feature_routes.route("/features/<int:feature_id>", methods=["GET"])
@Feature.full_auth
def get_feature(feature_id):
    feature = Feature.query.get(feature_id)
    return (
        jsonify(feature.to_dict())
        if feature
        else jsonify({"error": "Feature not found"})
    )


# Create a new feature
@feature_routes.route("/projects/<int:project_id>/features", methods=["POST"])
@Feature.full_auth
def create_feature(project_id):
    data = request.get_json()
    new_feature = Feature(
        project_id=project_id,
        name=data["name"],
        created_by=request.user.id,  # Get user from request
        sprint_id=data["sprint_id"],
    )
    db.session.add(new_feature)
    db.session.commit()
    return jsonify(new_feature.to_dict()), 201


# get all features
@feature_routes.route("/features", methods=["GET"])
@Feature.full_auth
def show_all_features():
    if not request.json:
        return jsonify({"error": "Invalid request"}), 400
    features = Feature.query.all()
    return jsonify([feature.to_dict() for feature in features])


# get a single feature
@feature_routes.route("/features/<int:feature_id>/details", methods=["GET"])
@Feature.full_auth
def get_feature_by_id(feature_id):
    if not feature_id:
        return jsonify({"error": "Invalid feature fID"}), 400
    feature = Feature.query.get(feature_id)
    if feature:
        return render_template("feature.html", feature=feature)
    return jsonify({"error": "Feature not found"}), 404


# Update feature
@feature_routes.route("/features/<int:feature_id>", methods=["PATCH"])
@Feature.full_auth
def update_feature(feature_id):
    feature = Feature.query.get(feature_id)
    data = request.get_json()

    feature.name = data.get("name", feature.name)
    feature.sprint_id = data.get("sprint_id", feature.sprint_id)

    db.session.commit()
    return jsonify(feature.to_dict()), 200
