from flask import Flask, jsonify
import sqlite3

app = Flask(__name__)

def get_transactions():
    conn = sqlite3.connect("../backend/models/transactions.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM transactions")  # Select ALL columns
    column_names = [desc[0] for desc in cursor.description]  # Get column names
    
    data = cursor.fetchall()
    conn.close()
    
    # Convert rows into JSON using dynamic column names
    transactions = [dict(zip(column_names, row)) for row in data]
    return transactions

@app.route("/transactions", methods=["GET"])
def transactions():
    """Return all transactions as JSON"""
    return jsonify(get_transactions())


@app.route("/transactions/<string:type>", methods=["GET"])
def transactions_by_type(type):
    """Filter transactions by type"""
    data = get_transactions()
    filtered = [tx for tx in data if tx["transaction_type"] == type]
    return jsonify(filtered)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
