#!/usr/bin/env python3
"""
Copernicus Data Space Ecosystem Credentials Setup
=================================================

This script helps you set up proper authentication for accessing real Sentinel-2 satellite data
from the new Copernicus Data Space Ecosystem.

The old SciHub system has been deprecated and replaced with a new authentication system.
"""

import os
import sys
import requests
import json
from datetime import datetime

def print_banner():
    print("=" * 80)
    print("🛰️  COPERNICUS DATA SPACE ECOSYSTEM SETUP")
    print("=" * 80)
    print()
    print("The old Copernicus SciHub has been replaced with the new")
    print("Copernicus Data Space Ecosystem (CDSE) which requires different authentication.")
    print()

def check_current_credentials():
    """Check if credentials are already set"""
    username = os.getenv('SENTINEL_USERNAME')
    password = os.getenv('SENTINEL_PASSWORD')
    
    if username and password:
        print(f"✅ Current credentials found:")
        print(f"   Username: {username}")
        print(f"   Password: {'*' * len(password)}")
        return username, password
    else:
        print("❌ No credentials found in environment variables")
        return None, None

def test_authentication(username, password):
    """Test authentication with Copernicus Data Space Ecosystem"""
    print("\n🔐 Testing authentication with Copernicus Data Space Ecosystem...")
    
    auth_url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
    auth_data = {
        "client_id": "cdse-public",
        "grant_type": "password",
        "username": username,
        "password": password,
    }
    
    try:
        response = requests.post(auth_url, data=auth_data, verify=True, timeout=10)
        if response.status_code == 200:
            token_data = response.json()
            print("✅ Authentication successful!")
            print(f"   Access token received (expires in {token_data.get('expires_in', 'unknown')} seconds)")
            return True
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            if response.status_code == 401:
                print("   Invalid username or password")
            elif response.status_code == 400:
                print("   Bad request - check your credentials format")
            else:
                print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        print("   Check your internet connection and try again")
        return False

def get_user_credentials():
    """Get credentials from user input"""
    print("\n📝 Enter your Copernicus Data Space Ecosystem credentials:")
    print("   (Register at: https://dataspace.copernicus.eu/)")
    print()
    
    username = input("Username: ").strip()
    password = input("Password: ").strip()
    
    if not username or not password:
        print("❌ Username and password are required")
        return None, None
    
    return username, password

def save_credentials_to_env(username, password):
    """Save credentials to environment variables"""
    print("\n💾 Saving credentials...")
    
    # Set environment variables for current session
    os.environ['SENTINEL_USERNAME'] = username
    os.environ['SENTINEL_PASSWORD'] = password
    
    # Create/update .env file
    env_content = f"""# Copernicus Data Space Ecosystem Credentials
SENTINEL_USERNAME={username}
SENTINEL_PASSWORD={password}

# Note: These credentials are for the NEW Copernicus Data Space Ecosystem
# Register at: https://dataspace.copernicus.eu/
"""
    
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ Credentials saved to .env file")
        print("   Make sure to add .env to your .gitignore file!")
    except Exception as e:
        print(f"❌ Failed to save .env file: {e}")

def show_usage_instructions():
    """Show instructions for using the credentials"""
    print("\n📋 USAGE INSTRUCTIONS:")
    print("=" * 50)
    print()
    print("1. Your credentials are now configured for the backend")
    print("2. The backend will automatically use the new Copernicus Data Space Ecosystem")
    print("3. Real Sentinel-2 data will be fetched when available")
    print()
    print("🔧 Backend Integration:")
    print("   - Updated authentication method (OAuth2 tokens)")
    print("   - New OData API for product search")
    print("   - Fallback to mock data if real data unavailable")
    print()
    print("🌐 API Endpoints Used:")
    print("   - Auth: https://identity.dataspace.copernicus.eu/")
    print("   - Catalog: https://catalogue.dataspace.copernicus.eu/")
    print()
    print("📊 What You'll Get:")
    print("   - Real Sentinel-2 Level-2A products")
    print("   - 10m resolution imagery")
    print("   - Cloud cover filtering (<50%)")
    print("   - Last 30 days of data")
    print()

def main():
    print_banner()
    
    # Check existing credentials
    username, password = check_current_credentials()
    
    if username and password:
        # Test existing credentials
        if test_authentication(username, password):
            print("\n✅ Your existing credentials work with the new system!")
            show_usage_instructions()
            return
        else:
            print("\n⚠️  Your existing credentials don't work with the new system.")
            print("   You may need to register for the new Copernicus Data Space Ecosystem.")
    
    # Get new credentials
    print("\n🔗 Registration Required:")
    print("   1. Go to: https://dataspace.copernicus.eu/")
    print("   2. Click 'Login' -> 'Register'")
    print("   3. Complete the registration process")
    print("   4. Return here with your credentials")
    print()
    
    while True:
        username, password = get_user_credentials()
        if not username or not password:
            continue
            
        if test_authentication(username, password):
            save_credentials_to_env(username, password)
            show_usage_instructions()
            break
        else:
            print("\n❌ Authentication failed. Please try again or register at:")
            print("   https://dataspace.copernicus.eu/")
            
            retry = input("\nTry again? (y/n): ").strip().lower()
            if retry != 'y':
                break
    
    print("\n🎯 Next Steps:")
    print("   1. Restart your backend if it's running")
    print("   2. Test the satellite page in your frontend")
    print("   3. Check the backend logs for real data fetching")
    print()
    print("🔍 Troubleshooting:")
    print("   - Check backend logs for authentication attempts")
    print("   - Verify your internet connection")
    print("   - Ensure credentials are correct")
    print()

if __name__ == "__main__":
    main() 