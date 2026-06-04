import json

with open("scratch/openapi.json") as f:
    data = json.load(f)

for p in data["paths"]:
    print(p)
