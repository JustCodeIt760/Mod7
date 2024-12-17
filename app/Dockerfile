FROM python:3.9.18-alpine3.18

RUN apk add build-base postgresql-dev gcc python3-dev musl-dev netcat-openbsd

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make init script executable
COPY init.sh .
RUN chmod +x init.sh

ENV PYTHONPATH=/app

# Use init script instead of direct gunicorn command
CMD ["./init.sh"]