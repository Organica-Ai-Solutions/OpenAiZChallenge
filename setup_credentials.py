import os
import getpass
from src.config import validate_credentials, setup_directories

def setup_credentials():
    """Interactive script to set up API credentials."""
    print("Setting up API credentials for the NIS Protocol project...")
    print("\n1. Copernicus Data Space Ecosystem")
    print("   Register at: https://dataspace.copernicus.eu/")
    print("   Steps:")
    print("   1. Click 'Sign Up' in the top right")
    print("   2. Create an account")
    print("   3. Accept terms and conditions")
    print("   4. Verify your email")
    sentinel_username = input("\nEnter your Copernicus username: ")
    sentinel_password = getpass.getpass("Enter your Copernicus password: ")
    
    print("\n2. NASA Earthdata Login (for GEDI LIDAR data)")
    print("   Register at: https://urs.earthdata.nasa.gov/")
    print("   Steps:")
    print("   1. Click 'Register'")
    print("   2. Create an account")
    print("   3. Verify your email")
    lidar_username = input("\nEnter your NASA Earthdata username: ")
    lidar_password = getpass.getpass("Enter your NASA Earthdata password: ")
    
    # Create .env file
    env_content = f"""# Copernicus Data Space Ecosystem credentials
SENTINEL_USERNAME={sentinel_username}
SENTINEL_PASSWORD={sentinel_password}

# NASA Earthdata Login credentials (for GEDI LIDAR data)
LIDAR_USERNAME={lidar_username}
LIDAR_PASSWORD={lidar_password}

# Data directories
LIDAR_DATA_DIR=./data/lidar
OUTPUT_DIR=./outputs

# API Configuration
API_HOST=localhost
API_PORT=8000
"""
    
    # Write to .env file
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("\nCredentials have been saved to .env file")
    print("Note: Make sure to add .env to your .gitignore file to keep your credentials secure!")
    
    # Set up directories
    setup_directories()
    
    # Validate credentials
    if validate_credentials():
        print("\nAll required credentials are set!")
        print("\nNext steps:")
        print("1. Install required packages:")
        print("   pip install -r requirements.txt")
        print("2. Run the tests:")
        print("   python -m unittest tests/test_data_processing.py")
    else:
        print("\nSome credentials are missing. Please update your .env file.")

if __name__ == '__main__':
    setup_credentials() 