FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for building wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend source code
COPY backend/ /app/backend/

# Copy debug start script (used only for troubleshooting on Render)
COPY ../start_debug.sh /app/start_debug.sh
RUN chmod +x /app/start_debug.sh

# Note: Frontend files are served by Cloudflare Pages, not included in this container

# Create necessary directories
RUN mkdir -p /app/data /app/logs

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV FLASK_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8080

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Create startup script
RUN echo '#!/bin/bash\n\
# Initialize database tables\n\
echo "Initializing database..."\n\
python -c "from backend.models import create_tables; create_tables(); print(\"Tables created successfully\")"\n\
\n\
# Start gunicorn\n\
echo "Starting application..."\n\
exec gunicorn -w 4 -b 0.0.0.0:$PORT --access-logfile /app/logs/access.log --error-logfile /app/logs/error.log main:app' > /app/start.sh && chmod +x /app/start.sh

# Start with database initialization and gunicorn
CMD ["/app/start.sh"]


