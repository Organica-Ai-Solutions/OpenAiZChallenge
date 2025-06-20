# Main Backend Dockerfile - Python 3.12 for Pydantic compatibility
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies (minimal set)
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install wheel
RUN pip install --no-cache-dir --upgrade pip wheel setuptools

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories including storage
RUN mkdir -p logs data outputs storage

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/system/health || exit 1

# Run the application
CMD ["python", "backend_main.py"] 