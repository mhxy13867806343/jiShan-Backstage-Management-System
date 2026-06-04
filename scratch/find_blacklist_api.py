import json

with open("scratch/openapi.json") as f:
    data = json.load(f)

print("--- Searching for blacklist in openapi paths ---")
found = False
for p in data["paths"]:
    if "blacklist" in p.lower():
        print(f"Path: {p}")
        print(json.dumps(data["paths"][p], indent=2))
        found = True

if not found:
    print("No blacklist paths found in Swagger/OpenAPI.")
