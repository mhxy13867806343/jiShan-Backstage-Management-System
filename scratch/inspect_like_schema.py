import json

with open("scratch/openapi.json") as f:
    data = json.load(f)

for name in data["components"]["schemas"]:
    if "like" in name.lower() or "share" in name.lower():
        print("--- SCHEMA:", name, "---")
        print(json.dumps(data["components"]["schemas"][name], indent=2))
