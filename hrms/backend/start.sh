#!/bin/bash
# Run Gunicorn from the backend directory so Python finds hrms_lite.
# Use from repo root: ./backend/start.sh  or  bash backend/start.sh
# Render: set start command to  ./backend/start.sh  (or  cd backend && gunicorn ...)
cd "$(dirname "$0")"
exec gunicorn hrms_lite.wsgi:application --bind 0.0.0.0:${PORT:-8000}
