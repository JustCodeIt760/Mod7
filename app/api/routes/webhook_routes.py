from flask import Blueprint, jsonify, request
import requests
import os
from functools import wraps
from models import Feature, Task, db
from flask_login import current_user
from datetime import datetime

webhook_routes = Blueprint("webhooks", __name__)

# n8n webhook URL - loaded from environment
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678/webhook/parking-lot-webhook")

def notify_n8n(event_type, data):
    """Send webhook notification to n8n"""
    try:
        payload = {
            "event": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": current_user.id if current_user else None,
            "data": data
        }
        response = requests.post(N8N_WEBHOOK_URL, json=payload, timeout=5)
        return response.status_code == 200
    except Exception as e:
        print(f"Failed to notify n8n: {str(e)}")
        return False

def trigger_parking_lot_webhook(feature):
    """Trigger webhook when feature is added to parking lot"""
    if feature.sprint_id is None:  # Feature is in parking lot
        data = {
            "feature_id": feature.id,
            "feature_name": feature.name,
            "feature_description": feature.description,
            "project_id": feature.project_id,
            "priority": feature.priority,
            "status": feature.status
        }
        notify_n8n("parking_lot_added", data)

@webhook_routes.route("/webhooks/process-ai-tasks", methods=["POST"])
def process_ai_generated_tasks():
    """
    Receive AI-generated tasks from n8n and create them in the database
    Expected payload:
    {
        "feature_id": 123,
        "tasks": [
            {
                "name": "Task name",
                "description": "Task description",
                "priority": 5,
                "estimated_hours": 4,
                "skills": ["React", "API"]
            }
        ]
    }
    """
    try:
        data = request.json
        feature_id = data.get("feature_id")
        tasks_data = data.get("tasks", [])
        
        if not feature_id:
            return {"error": "feature_id is required"}, 400
        
        feature = Feature.query.get(feature_id)
        if not feature:
            return {"error": "Feature not found"}, 404
        
        created_tasks = []
        for task_data in tasks_data:
            # Create task with AI-generated data
            task = Task.create_task(
                feature_id=feature_id,
                name=task_data.get("name", "New Task"),
                description=task_data.get("description", ""),
                created_by=current_user.id if current_user.is_authenticated else 1,  # Default to user 1 for webhook
                status="Not Started",
                priority=task_data.get("priority", 5),
                # Add estimated hours as a custom field or in description
                # since your Task model doesn't have estimated_hours field
            )
            created_tasks.append(task.to_dict())
        
        return {
            "message": f"Created {len(created_tasks)} tasks",
            "tasks": created_tasks
        }, 201
        
    except Exception as e:
        return {"error": str(e)}, 500

@webhook_routes.route("/webhooks/health", methods=["GET"])
def webhook_health():
    """Health check endpoint for webhooks"""
    return {"status": "healthy", "n8n_url": N8N_WEBHOOK_URL}, 200