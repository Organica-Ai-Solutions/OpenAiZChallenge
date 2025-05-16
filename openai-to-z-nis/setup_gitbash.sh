#!/bin/bash

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 from https://www.python.org/downloads/"
    echo "Make sure to check 'Add Python to PATH' during installation."
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/Scripts/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Run setup script
echo "Running setup script..."
python setup_credentials.py

echo "Setup complete! You can now run the application." 