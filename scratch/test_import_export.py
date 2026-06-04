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

# 1. Test Export GET
export_url = "http://localhost:8000/api/admin/users/export"
res_export = requests.get(export_url, headers=headers)
print("Export status:", res_export.status_code)
print("Export Content-Type:", res_export.headers.get("Content-Type"))
print("Export Content-Disposition:", res_export.headers.get("Content-Disposition"))
if res_export.status_code == 200:
    content = res_export.content
    print("Export length:", len(content))
    if len(content) < 500:
        print("Export body:", res_export.text)
    else:
        print("Export body start:", content[:100])
else:
    print("Export failed:", res_export.text)
