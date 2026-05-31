import requests

# We don't even need login since the swagger says: "公共省市区三级地区接口" (Public provincial and municipal three-level region interface)
# Let's verify if we need authentication or not
url = "http://localhost:8000/api/address/tree"
res = requests.get(url)
print("Address Tree Status:", res.status_code)
if res.status_code == 200:
    data = res.json()
    print("Success! Data keys:", data.keys() if isinstance(data, dict) else "List response")
    if isinstance(data, dict):
        print("Data preview:", str(data)[:500])
    elif isinstance(data, list):
        print("Data list length:", len(data))
        print("First item preview:", str(data[0])[:500] if len(data) > 0 else "Empty list")
else:
    print("Failed response:", res.text)
