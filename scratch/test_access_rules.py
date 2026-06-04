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

# GET access-rules
rules_url = "http://localhost:8000/api/admin/access-rules"
res_rules = requests.get(rules_url, headers=headers)
print("Rules status:", res_rules.status_code)
print("Rules response:")
import json
print(json.dumps(res_rules.json(), indent=2))
