import json

with open("scratch/openapi.json") as f:
    data = json.load(f)

endpoints = [
    "/api/admin/likes",
    "/api/admin/likes/{likeId}",
]

for p in endpoints:
    if p in data["paths"]:
        print(f"--- PATH: {p} ---")
        print(json.dumps(data["paths"][p], indent=2))
