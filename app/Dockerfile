FROM python:3.9.18-alpine3.18

# Add production dependencies
RUN apk add --no-cache build-base postgresql-dev gcc python3-dev musl-dev netcat-openbsd

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make init script executable
COPY init.sh .
RUN chmod +x init.sh

ENV PYTHONPATH=/app
ENV FLASK_ENV=production
ENV FLASK_DEBUG=0

# Use init script
CMD ["./init.sh"]