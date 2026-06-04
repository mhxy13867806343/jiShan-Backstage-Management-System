import json

with open("scratch/openapi.json") as f:
    data = json.load(f)

schema = data["components"]["schemas"].get("Body_import_admin_users_api_admin_users_import_post")
print(json.dumps(schema, indent=2))
