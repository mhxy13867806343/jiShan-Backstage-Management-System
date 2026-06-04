import json

with open("scratch/openapi.json") as f:
    data = json.load(f)

print(json.dumps(data["paths"]["/api/admin/access-rules"]["get"], indent=2))
