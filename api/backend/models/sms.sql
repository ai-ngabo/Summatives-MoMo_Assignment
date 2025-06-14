CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount INTEGER NOT NULL,
    sender TEXT,
    recipient_name TEXT,
    recipient_phone TEXT,
    fee INTEGER DEFAULT 0,
    new_balance INTEGER,
    transaction_type TEXT,
    UNIQUE(date, amount, sender)
);