#!/usr/bin/env python3
"""
Test script to verify Sentinel-2 connection with real credentials.
"""

import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_sentinel_connection():
    """Test connection to Sentinel-2 API."""
    
    print("🛰️ Testing Sentinel-2 Connection")
    print("=" * 40)
    
    # Get credentials
    username = os.getenv('SENTINEL_USERNAME')
    password = os.getenv('SENTINEL_PASSWORD')
    
    print(f"Username: {username}")
    print(f"Password: {'*' * len(password) if password else 'Not set'}")
    print()
    
    if not username or not password:
        print("❌ Credentials not found in .env file")
        return False
    
    try:
        print("📡 Importing sentinelsat...")
        from sentinelsat import SentinelAPI
        
        print("🔗 Connecting to Copernicus Data Space Ecosystem...")
        
        # Try different endpoints
        endpoints = [
            'https://catalogue.dataspace.copernicus.eu/',
            'https://scihub.copernicus.eu/dhus',
            'https://apihub.copernicus.eu/apihub'
        ]
        
        for endpoint in endpoints:
            try:
                print(f"   Trying: {endpoint}")
                api = SentinelAPI(username, password, endpoint)
                
                # Test with a simple query
                print("🔍 Testing search query...")
                end_date = datetime.now()
                start_date = end_date - timedelta(days=7)
                
                # Small area around Amazon
                footprint = "POLYGON((-62.3 -3.5, -62.2 -3.5, -62.2 -3.4, -62.3 -3.4, -62.3 -3.5))"
                
                products = api.query(
                    footprint,
                    date=(start_date, end_date),
                    platformname='Sentinel-2',
                    cloudcoverpercentage=(0, 100)
                )
                
                print(f"✅ SUCCESS with {endpoint}")
                print(f"   Found {len(products)} Sentinel-2 products")
                
                if products:
                    # Show first product details
                    first_product = list(products.values())[0]
                    print(f"   Sample product: {first_product.get('identifier', 'Unknown')}")
                    print(f"   Cloud cover: {first_product.get('cloudcoverpercentage', 'Unknown')}%")
                    print(f"   Date: {first_product.get('beginposition', 'Unknown')}")
                
                return True
                
            except Exception as e:
                print(f"   ❌ Failed: {str(e)}")
                continue
        
        print("❌ All endpoints failed")
        return False
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Run: pip install sentinelsat")
        return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

if __name__ == "__main__":
    success = test_sentinel_connection()
    
    if success:
        print("\n🎉 Sentinel-2 connection is working!")
        print("   Your backend should now use real satellite data.")
    else:
        print("\n⚠️  Sentinel-2 connection failed.")
        print("   Backend will continue using mock data.")
        print("\n💡 Possible solutions:")
        print("   1. Check your credentials at https://dataspace.copernicus.eu/")
        print("   2. Verify your account is activated")
        print("   3. Try creating a new account if needed") 