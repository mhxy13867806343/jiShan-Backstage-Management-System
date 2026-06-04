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

# 1. Export first
export_url = "http://localhost:8000/api/admin/users/export?format=xlsx"
res_export = requests.get(export_url, headers=headers)
if res_export.status_code == 200:
    with open("scratch/users_export.xlsx", "wb") as f:
        f.write(res_export.content)
    print("Export successful, file saved.")
else:
    print("Export failed:", res_export.text)
    exit(1)

# 2. Import the exported file
import_url = "http://localhost:8000/api/admin/users/import"
files = {
    "file": ("users_export.xlsx", open("scratch/users_export.xlsx", "rb"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
}
res_import = requests.post(import_url, headers=headers, files=files)
print("Import status:", res_import.status_code)
print("Import response:", res_import.json())
