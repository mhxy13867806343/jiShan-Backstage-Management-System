import json

with open("scratch/openapi.json") as f:
    data = json.load(f)

endpoints = [
    "/api/admin/likes",
    "/api/admin/likes/{likeId}",
    "/api/admin/shares",
    "/api/admin/shares/{shareId}",
]

for p in endpoints:
    if p in data["paths"]:
        print(f"--- PATH: {p} ---")
        print(json.dumps(data["paths"][p], indent=2))
    else:
        print(f"--- PATH: {p} NOT FOUND ---")
