import requests

login_url = "http://localhost:8000/api/admin/auth/login"
login_payload = {
    "username": "admin",
    "password": "123456"
}

res = requests.post(login_url, json=login_payload)
print("Login status:", res.status_code)
token = res.json().get("data", {}).get("token")
print("Token:", token)

headers = {
    "Authorization": f"Bearer {token}"
}

# Fetch with limit=1000&tree=true
url = "http://localhost:8000/api/admin/dictionaries"
params = {
    "limit": 1000,
    "tree": "true"
}
res2 = requests.get(url, headers=headers, params=params)
print("Request limit=1000&tree=true status:", res2.status_code)
print("Response:", res2.text)
