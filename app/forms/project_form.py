from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, DateField
from wtforms.validators import DataRequired, Length, ValidationError
from datetime import datetime


class ProjectForm(FlaskForm):
    name = StringField(
        "name",
        validators=[
            DataRequired(),
            Length(
                min=1,
                max=100,
                message="Name must be between 1 and 100 characters",
            ),
        ],
    )
    description = TextAreaField(
        "description",
        validators=[
            DataRequired(),
            Length(
                min=10,
                max=300,
                message="Description must be less than 300 characters",
            ),
        ],
    )
    due_date = DateField("due_date", validators=[DataRequired()])

    def validate_due_date(self, field):
        if field.data < datetime.now().date():
            raise ValidationError("Due date must be in the future")
