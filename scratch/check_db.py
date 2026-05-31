import sqlite3

db_path = "/Users/hooksvue/Desktop/instant flash backend/local.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tables in database:", tables)

conn.close()
