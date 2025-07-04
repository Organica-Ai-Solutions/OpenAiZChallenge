import requests
print("νΊ Testing satellite endpoint...")
try:
    response = requests.get("http://localhost:8000/satellite/imagery/local?lat=-3.4653&lng=-62.2159&radius=50")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"β Success! Message: {data.get('message', 'No message')}")
    else:
        print(f"β Error: {response.text}")
except Exception as e:
    print(f"β Error: {e}")
