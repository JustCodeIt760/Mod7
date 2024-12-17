from flask import Blueprint
from .routes.auth_routes import auth_routes
from .routes.project_routes import project_routes
from .routes.feature_routes import feature_routes
from .routes.sprint_routes import sprint_routes
from .routes.task_routes import task_routes


api = Blueprint("api", __name__)


api.register_blueprint(auth_routes)
api.register_blueprint(project_routes)
api.register_blueprint(feature_routes)
api.register_blueprint(sprint_routes)
api.register_blueprint(task_routes)
