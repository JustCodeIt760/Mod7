from flask import Blueprint, request, jsonify
from models import User, db
from forms import LoginForm
from forms import SignUpForm
from flask_login import current_user, login_user, logout_user, login_required

auth_routes = Blueprint("auth", __name__)


# including both "" and "/" to catch both "/auth" and "/auth/" routes
@auth_routes.route("")
@auth_routes.route("/")
def authenticate():
    """
    Authenticates a user.
    """
    if current_user.is_authenticated:
        return current_user.to_dict()
    return {"errors": {"message": "Unauthorized"}}, 401


@auth_routes.route("/login", methods=["POST"])
def login():
    """
    Logs a user in
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return {"errors": {"email": "Email required", "password": "Password required"}}, 401
    
    user = User.query.filter(User.email == email).first()
    
    if user and user.check_password(password):
        login_user(user)
        return user.to_dict()
    
    return {"errors": {"email": "Invalid credentials"}}, 401


@auth_routes.route("/logout")
def logout():
    """
    Logs a user out
    """
    logout_user()
    return jsonify({"message": "User logged out"})


@auth_routes.route("/signup", methods=["POST"])
def sign_up():
    """
    Creates a new user and logs them in
    """
    data = request.get_json()
    
    # Basic validation
    required_fields = ['first_name', 'last_name', 'username', 'email', 'password']
    errors = {}
    for field in required_fields:
        if not data.get(field):
            errors[field] = f"{field.replace('_', ' ').title()} is required"
    
    if errors:
        return {"errors": errors}, 400
        
    # Check if user already exists
    existing_user = User.query.filter(
        (User.email == data['email']) | (User.username == data['username'])
    ).first()
    
    if existing_user:
        if existing_user.email == data['email']:
            errors['email'] = 'Email already registered'
        if existing_user.username == data['username']:
            errors['username'] = 'Username already taken'
        return {"errors": errors}, 400
    
    try:
        user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            username=data['username'],
            email=data['email'],
            password=data['password']
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return user.to_dict()
    except Exception as e:
        db.session.rollback()
        return {"errors": {"general": "Registration failed"}}, 500


@auth_routes.route("/unauthorized")
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails
    """
    return {"errors": {"message": "Unauthorized"}}, 401
