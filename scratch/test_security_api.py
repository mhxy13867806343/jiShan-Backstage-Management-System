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

# 1. GET overview
overview_url = "http://localhost:8000/api/admin/security/overview"
res_overview = requests.get(overview_url, headers=headers)
print("Overview status:", res_overview.status_code)
print("Overview response:", res_overview.json())

# 2. GET login-logs
logs_url = "http://localhost:8000/api/admin/security/login-logs?page=1&limit=3"
res_logs = requests.get(logs_url, headers=headers)
print("Logs status:", res_logs.status_code)
print("Logs response:", res_logs.json())
