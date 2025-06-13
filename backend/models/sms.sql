CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    body TEXT NOT NULL,
    date TEXT NOT NULL,
    amount INTEGER NOT NULL,
    sender TEXT,
    recipient_name TEXT,
    recipient_phone TEXT,
    fee INTEGER DEFAULT 0,
    new_balance INTEGER NOT NULL,
    transaction_type TEXT,
    UNIQUE(body, date)
);