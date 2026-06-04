import json

with open("scratch/openapi.json") as f:
    data = json.load(f)

paths = ["/api/admin/access-rules", "/api/admin/access-rules/{ruleId}"]
for p in paths:
    if p in data["paths"]:
        print(f"--- PATH: {p} ---")
        print(json.dumps(data["paths"][p], indent=2))
    else:
        print(f"--- PATH: {p} NOT FOUND ---")
