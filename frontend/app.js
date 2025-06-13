const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "../models/transactions.db"));

db.all("SELECT date, amount, sender, recipient_name, transaction_type FROM transactions ORDER BY date DESC;", (err, rows) => {
    if (err) return console.error("Database Error:", err);
    
    // Save results to a JSON file
    const fs = require("fs");
    fs.writeFileSync("transactions.json", JSON.stringify(rows, null, 2));

    console.log("Transactions saved to transactions.json");
});