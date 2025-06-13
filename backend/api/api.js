const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const express = require("express");

const db = new sqlite3.Database(path.join(__dirname, "../models/transactions.db"));
const app = express();

app.get("/transactions", (req, res) => {
    db.all("SELECT * FROM transactions ORDER BY date DESC LIMIT 10;", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(3000, () => console.log("API running at http://localhost:3000"));