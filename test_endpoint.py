import requests
import json

url = "http://localhost:8000/analyze"
data = {
    "coordinates": "-3.4653,-62.2159",
    "dataSources": {
        "satellite": True,
        "lidar": True,
        "historicalTexts": True,
        "indigenousMaps": True
    }
}

response = requests.post(url, json=data)
print(f"Status Code: {response.status_code}")
print("Response:")
print(json.dumps(response.json(), indent=2)) 