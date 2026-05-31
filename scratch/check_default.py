import requests

login_url = "http://localhost:8000/api/admin/auth/login"
login_payload = {
    "username": "admin",
    "password": "123456"
}

res = requests.post(login_url, json=login_payload)
token = res.json().get("data", {}).get("token")

headers = {
    "Authorization": f"Bearer {token}"
}

# Fetch with limit=100 (default tree is True in backend)
url = "http://localhost:8000/api/admin/dictionaries"
params = {
    "limit": 100
}
res2 = requests.get(url, headers=headers, params=params)
print("Response with limit=100:")
print(res2.json())
