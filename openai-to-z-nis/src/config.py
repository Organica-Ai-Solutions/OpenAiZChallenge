import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Sentinel-2 Copernicus Open Access Hub credentials
SENTINEL_USERNAME = os.getenv('SENTINEL_USERNAME')
SENTINEL_PASSWORD = os.getenv('SENTINEL_PASSWORD')

# LIDAR Data credentials
LIDAR_USERNAME = os.getenv('LIDAR_USERNAME')
LIDAR_PASSWORD = os.getenv('LIDAR_PASSWORD')

# Data directories
LIDAR_DATA_DIR = os.getenv('LIDAR_DATA_DIR', './data/lidar')
OUTPUT_DIR = os.getenv('OUTPUT_DIR', './outputs')

# API Configuration
API_HOST = os.getenv('API_HOST', 'localhost')
API_PORT = int(os.getenv('API_PORT', '8000'))

# Validate required credentials
def validate_credentials():
    """Validate that all required credentials are set."""
    missing_credentials = []
    
    if not SENTINEL_USERNAME or not SENTINEL_PASSWORD:
        missing_credentials.append("Sentinel-2 Copernicus Open Access Hub")
    
    if not LIDAR_USERNAME or not LIDAR_PASSWORD:
        missing_credentials.append("LIDAR data source")
    
    if missing_credentials:
        print("Warning: Missing credentials for:")
        for source in missing_credentials:
            print(f"- {source}")
        print("\nPlease set the required credentials in your .env file.")
        return False
    
    return True

# Create required directories
def setup_directories():
    """Create required directories if they don't exist."""
    os.makedirs(LIDAR_DATA_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, 'satellite'), exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, 'lidar'), exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, 'combined'), exist_ok=True) 