import sqlite3
import json

# Connect to database
conn = sqlite3.connect("transactions.db")
cursor = conn.cursor()

# Fetch transactions
cursor.execute("SELECT * FROM transactions")
columns = [col[0] for col in cursor.description]
transactions = [dict(zip(columns, row)) for row in cursor.fetchall()]

# Save as JSON file
with open("transactions.json", "w") as json_file:
    json.dump(transactions, json_file, indent=4)

print("Exported transactions to transactions.json")
conn.close()