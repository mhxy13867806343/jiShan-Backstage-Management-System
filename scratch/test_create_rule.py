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
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# 1. POST to create an access rule
payload = {
    "type": "blacklist",
    "ip": "192.168.10.45",
    "method": "ALL",
    "path": "/api/*",
    "status": "enabled",
    "remark": "频发灌水发贴，恶意调用全站接口"
}

create_url = "http://localhost:8000/api/admin/access-rules"
res_create = requests.post(create_url, headers=headers, json=payload)
print("Create status:", res_create.status_code)
print("Create response:", res_create.json())

# 2. GET list to inspect response
res_rules = requests.get(create_url, headers=headers)
print("List status:", res_rules.status_code)
print("List response:")
print(json.dumps(res_rules.json(), indent=2))
