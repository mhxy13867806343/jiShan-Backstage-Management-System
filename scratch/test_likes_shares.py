import requests
import json

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

# GET likes
res_likes = requests.get("http://localhost:8000/api/admin/likes", headers=headers)
print("Likes Status:", res_likes.status_code)
print("Likes response:")
print(json.dumps(res_likes.json(), indent=2))

# GET shares
res_shares = requests.get("http://localhost:8000/api/admin/shares", headers=headers)
print("Shares Status:", res_shares.status_code)
print("Shares response:")
print(json.dumps(res_shares.json(), indent=2))
