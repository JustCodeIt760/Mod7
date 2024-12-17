#!/bin/bash
export NODE_ENV=production
export FLASK_ENV=production
docker-compose -f docker-compose.prod.yml up --build