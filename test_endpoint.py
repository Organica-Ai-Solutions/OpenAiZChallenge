import requests
print("íº€ Testing satellite endpoint...")
try:
    response = requests.get("http://localhost:8000/satellite/imagery/local?lat=-3.4653&lng=-62.2159&radius=50")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"âœ… Success! Message: {data.get('message', 'No message')}")
    else:
        print(f"âŒ Error: {response.text}")
except Exception as e:
    print(f"âŒ Error: {e}")
