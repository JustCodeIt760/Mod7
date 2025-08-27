from flask import Blueprint, jsonify
from .routes.auth_routes import auth_routes
from .routes.chat_routes import chat_routes

api = Blueprint("api", __name__)

@api.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "Backend is running"})

api.register_blueprint(auth_routes, url_prefix="/auth")
api.register_blueprint(chat_routes, url_prefix="/chat")
