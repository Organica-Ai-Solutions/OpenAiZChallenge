#!/usr/bin/env python3
"""
Setup script for Sentinel-2 satellite data credentials.

This script helps you configure access to real Sentinel-2 satellite data
from the Copernicus Open Access Hub.
"""

import os
from pathlib import Path

def setup_sentinel_credentials():
    """Setup Sentinel-2 credentials for real satellite data access."""
    
    print("🛰️ Sentinel-2 Real Satellite Data Setup")
    print("=" * 50)
    print()
    print("To access REAL Sentinel-2 satellite data, you need to:")
    print("1. Create a free account at: https://scihub.copernicus.eu/dhus/#/self-registration")
    print("2. Verify your email address")
    print("3. Enter your credentials below")
    print()
    
    # Check if .env file exists
    env_file = Path('.env')
    env_content = ""
    
    if env_file.exists():
        with open(env_file, 'r') as f:
            env_content = f.read()
    
    # Get credentials from user
    print("Enter your Copernicus Open Access Hub credentials:")
    username = input("Username: ").strip()
    password = input("Password: ").strip()
    
    if not username or not password:
        print("❌ Username and password are required!")
        return False
    
    # Update or add credentials to .env file
    lines = env_content.split('\n') if env_content else []
    
    # Remove existing Sentinel credentials
    lines = [line for line in lines if not line.startswith('SENTINEL_USERNAME=') and not line.startswith('SENTINEL_PASSWORD=')]
    
    # Add new credentials
    lines.append(f"SENTINEL_USERNAME={username}")
    lines.append(f"SENTINEL_PASSWORD={password}")
    
    # Write back to .env file
    with open(env_file, 'w') as f:
        f.write('\n'.join(lines))
    
    print()
    print("✅ Sentinel-2 credentials saved to .env file")
    print()
    print("🔄 Please restart the backend server to use real satellite data:")
    print("   python backend_main.py")
    print()
    print("📡 The system will now fetch REAL Sentinel-2 satellite imagery!")
    print("   - 10m resolution")
    print("   - Recent images (last 30 days)")
    print("   - Multiple spectral bands")
    print("   - Real cloud cover data")
    print()
    
    return True

def test_credentials():
    """Test the Sentinel-2 credentials."""
    try:
        from sentinelsat import SentinelAPI
        
        username = os.getenv('SENTINEL_USERNAME')
        password = os.getenv('SENTINEL_PASSWORD')
        
        if not username or not password:
            print("❌ No credentials found. Run setup first.")
            return False
        
        print("🧪 Testing Sentinel-2 connection...")
        api = SentinelAPI(username, password, 'https://scihub.copernicus.eu/dhus')
        
        # Test with a simple query
        from datetime import datetime, timedelta
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        # Small area around Amazon for testing
        footprint = "POLYGON((-62.3 -3.5, -62.2 -3.5, -62.2 -3.4, -62.3 -3.4, -62.3 -3.5))"
        
        products = api.query(
            footprint,
            date=(start_date, end_date),
            platformname='Sentinel-2',
            cloudcoverpercentage=(0, 100)
        )
        
        print(f"✅ Connection successful! Found {len(products)} Sentinel-2 products")
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("Please check your credentials and internet connection.")
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Setup Sentinel-2 credentials")
    parser.add_argument('--test', action='store_true', help='Test existing credentials')
    
    args = parser.parse_args()
    
    if args.test:
        test_credentials()
    else:
        setup_sentinel_credentials() 