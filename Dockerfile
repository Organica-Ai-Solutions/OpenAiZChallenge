# Multi-stage build for Indigenous Knowledge Research Platform

# Stage 1: Base Python image with dependencies
FROM python:3.10-slim-bullseye AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PIP_NO_CACHE_DIR 1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Stage 2: Install Python dependencies
FROM base AS dependencies

# Copy only requirements to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Stage 3: Copy application code
FROM dependencies AS application

# Copy the entire project
COPY . .

# Create necessary directories
RUN mkdir -p /app/data /app/outputs /app/logs

# Stage 4: Development configuration
FROM application AS development

# Install development dependencies
RUN pip install -r requirements-dev.txt

# Expose ports for services
EXPOSE 8000
EXPOSE 8787
EXPOSE 9092

# Set default environment variables
ENV FLASK_ENV=development
ENV PROCESSING_MODE=local

# Development entrypoint
CMD ["python", "-m", "src.main"]

# Stage 5: Production configuration
FROM application AS production

# Set production environment variables
ENV FLASK_ENV=production
ENV PROCESSING_MODE=kubernetes

# Use non-root user for security
RUN addgroup --system appuser && adduser --system --group appuser
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Production entrypoint with Gunicorn
CMD ["gunicorn", "-c", "gunicorn_config.py", "-k", "uvicorn.workers.UvicornWorker", "src.main:app"]

# Stage 6: Final production image
FROM production AS final

# Labels for metadata
LABEL maintainer="Indigenous Knowledge Research Team"
LABEL version="1.0.0"
LABEL description="Distributed Platform for Indigenous Knowledge Research" 