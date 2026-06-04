import json

with open("scratch/openapi.json") as f:
    data = json.load(f)

for p in data["paths"]:
    if "like" in p.lower() or "share" in p.lower():
        print(p)
