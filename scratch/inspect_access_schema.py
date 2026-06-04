import json

with open("scratch/openapi.json") as f:
    data = json.load(f)

schemas = data["components"]["schemas"]
for name in ["AdminAccessRulePayload", "AdminAccessRule", "AccessRule"]:
    if name in schemas:
        print(f"--- SCHEMA: {name} ---")
        print(json.dumps(schemas[name], indent=2))
