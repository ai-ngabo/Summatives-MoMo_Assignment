const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { cleanSMS } = require("./filter");
const { parseSMSFromFile } = require("./sms_parser");

const db = new sqlite3.Database("transactions.db");

// Load & clean the data
const smsData = parseSMSFromFile(path.join(__dirname, "../../sms_data/sms.xml"));
const cleaned = cleanSMS(smsData);

// Insert function
function insertTransaction(tx) {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO transactions (
            body, date, amount, sender,
            recipient_name, recipient_phone,
            fee, new_balance, transaction_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run([
        tx.date,
        parseInt(tx.amount, 10),
        tx.sender,
        tx.recipient_name,
        tx.recipient_phone,
        parseInt(tx.fee, 10),
        tx.new_balance ? parseInt(tx.new_balance, 10) : null,
        tx.transaction_type
    ]);

    stmt.finalize();
}

// Insert all cleaned transactions
cleaned.forEach(insertTransaction);

db.close(() => console.log("Transactions successfully inserted into the database."));