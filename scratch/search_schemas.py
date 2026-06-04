import json

with open("scratch/openapi.json") as f:
    data = json.load(f)

for name in data["components"]["schemas"]:
    if "rule" in name.lower() or "access" in name.lower():
        print(name)
        print(json.dumps(data["components"]["schemas"][name], indent=2))
