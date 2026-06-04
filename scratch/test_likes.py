import requests
import json

login_url = "http://localhost:8000/api/admin/auth/login"
login_payload = {
    "username": "admin",
    "password": "123456"
}

res = requests.post(login_url, json=login_payload)
token = res.json().get("data", {}).get("token")
headers = {
    "Authorization": f"Bearer {token}"
}

# Hitting POST /api/posts/{postId}/like as a user (wait, is it admin or user endpoint?)
# Wait, /api/posts/{postId}/like might require a user token instead of admin token.
# Let's check if we can login as a user or if the admin token works.
# Let's try it.
like_url = "http://localhost:8000/api/posts/post_0ee2ddbd425f4186940bb6d6632d1479/like"
res_like = requests.post(like_url, headers=headers)
print("Like post status:", res_like.status_code)
print("Like post response:", res_like.json())

# Fetch likes list
res_likes = requests.get("http://localhost:8000/api/admin/likes", headers=headers)
print("Likes Status:", res_likes.status_code)
print("Likes response:")
print(json.dumps(res_likes.json(), indent=2))
