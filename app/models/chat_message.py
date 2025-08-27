from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    message_type = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.String(100))  # Optional grouping

    # Relationship
    user = db.relationship('User', back_populates='chat_messages')

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "type": self.message_type,
            "content": self.content,
            "timestamp": self.timestamp.isoformat()
        }