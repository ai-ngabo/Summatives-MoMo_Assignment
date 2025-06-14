const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const express = require("express");

const db = new sqlite3.Database(path.join(__dirname, "../backend/models/transactions.db"));
const app = express();

app.get("/transactions", (req, res) => {
    db.all("SELECT date, amount, sender, recipient_name, recipient_phone, fee, new_balance, transaction_type FROM transactions ORDER BY date DESC;", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(5000, () => console.log("API running at link http://localhost:5000"));
