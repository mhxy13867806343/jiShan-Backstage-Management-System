import requests
import json

urls = [
    "http://127.0.0.1:8000/openapi.json",
    "http://127.0.0.1:8000/swagger.json",
    "http://127.0.0.1:8000/api/docs",
    "http://127.0.0.1:8000/api/admin/docs",
    "http://127.0.0.1:8000/docs",
]

for url in urls:
    try:
        res = requests.get(url, timeout=2)
        print(f"URL: {url} -> Status: {res.status_code}")
        if res.status_code == 200:
            content_type = res.headers.get("Content-Type", "")
            if "json" in content_type:
                data = res.json()
                print("Found OpenAPI/Swagger JSON at", url)
                with open("scratch/openapi.json", "w") as f:
                    json.dump(data, f, indent=2)
                break
    except Exception as e:
        print(f"Error {url}: {e}")
