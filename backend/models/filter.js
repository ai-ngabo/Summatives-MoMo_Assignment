const fs = require("fs");
const path = require("path");
const { parseSMSFromFile } = require("./sms_parser.js");

// Setup logging
const logFile = fs.createWriteStream("unprocessed_messages.log", { flags: "a" });

function logWarning(message) {
    logFile.write(`[WARNING] ${new Date().toISOString()} - ${message}\n`);
}

// Extract transaction amount
function extractAmount(body) {
    const match = body.match(/(?:received|transferred|payment|withdrawn)\s(\d+)\sRWF/);
    return match ? parseInt(match[1]) : null;
}

// Extract transaction fee
function extractFee(body) {
    const match = body.match(/Fee was:\s(\d+)\sRWF/);
    return match ? parseInt(match[1]) : null;
}

// Extract new balance
function extractNewBalance(body) {
    const match = body.match(/New balance:\s(\d+)\sRWF/);
    return match ? parseInt(match[1]) : null;
}

// Extract transaction date
function extractDate(body) {
    const match = body.match(/at\s(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/);
    return match ? match[1] : "Unknown Date";
}

// Extract transaction ID
function extractTransactionId(body) {
    const match = body.match(/Financial Transaction Id:\s(\d+)/);
    return match ? match[1] : null;
}

// Extract sender details (Incoming Money transactions)
function extractSenderDetails(body) {
    const match = body.match(/from ([\w\s]+) \((\*+\d+)\)/);
    return match ? { sender_name: match[1].trim(), sender_phone: match[2] } : { sender_name: "Unknown Sender", sender_phone: null };
}

// Extract recipient details (Transfers)
function extractRecipientDetails(body) {
    const match = body.match(/transferred to ([\w\s]+) \((\d+)\)/);
    return match ? { recipient_name: match[1].trim(), recipient_phone: match[2] } : { recipient_name: "Unknown Recipient", recipient_phone: null };
}

// Categorize transaction type
function categorizeTransaction(body) {
    const lower = body.toLowerCase();

    if (lower.includes("received")) return "Incoming Money";
    if (lower.includes("transferred to")) return "Transfer to Mobile";
    if (lower.includes("payment")) return "Payment";
    if (lower.includes("withdrawn")) return "Withdrawal";
    if (lower.includes("bundle")) return "Internet/Voice Bundle Purchase";
    if (lower.includes("deposit")) return "Bank Deposit";
    if (lower.includes("airtime")) return "Airtime Bill Payment";
    if (lower.includes("power bill")) return "Cash Power Bill Payment";
    if (lower.includes("wasac")) return "Water Utility Bill Payment";
    if (lower.includes("agent")) return "Withdrawal from Agent";

    logWarning(`Unrecognized transaction: ${body}`);
    return "Unknown";
}

// Clean SMS list
function cleanSMS(smsList) {
    const cleaned = [];

    for (const sms of smsList) {
        const amount = extractAmount(sms.body);
        const fee = extractFee(sms.body);
        const new_balance = extractNewBalance(sms.body);
        const date = extractDate(sms.body);
        const transaction_id = extractTransactionId(sms.body);
        const transactionType = categorizeTransaction(sms.body);

        let sender = {}, recipient = {};
        if (transactionType === "Incoming Money") {
            sender = extractSenderDetails(sms.body);
            recipient = { recipient_name: "User Mobile Account", recipient_phone: null }; // User's own account
        } else if (transactionType === "Transfer to Mobile") {
            recipient = extractRecipientDetails(sms.body);
            sender = { sender_name: "User", sender_phone: null }; // User initiated transfer
        }

        if (!amount) {
            logWarning(`Skipping SMS due to missing amount: ${sms.body}`);
            continue;
        }

        cleaned.push({
            body: sms.body,
            date,
            amount,
            sender_name: sender.sender_name,
            sender_phone: sender.sender_phone,
            recipient_name: recipient.recipient_name,
            recipient_phone: recipient.recipient_phone,
            fee,
            new_balance,
            transaction_id,
            transaction_type: transactionType
        });
    }

    return cleaned;
}

// Debug block
if (require.main === module) {
    const smsData = parseSMSFromFile(path.join(__dirname, "../../sms_data/sms.xml"));
    const cleaned = cleanSMS(smsData);

    console.log("\n--- Cleaned & Categorized Messages ---\n");
    const categorized = cleaned.reduce((acc, msg) => {
        acc[msg.transaction_type] = acc[msg.transaction_type] || [];
        acc[msg.transaction_type].push(msg);
        return acc;
    }, {});

    for (const [type, transactions] of Object.entries(categorized)) {
        console.log(`\n=== ${type} Transactions (${transactions.length}) ===`);
        transactions.slice(0, 3).forEach((msg) => { // Show up to 3 transactions per type
            console.log(`Amount: ${msg.amount} RWF | Sender: ${msg.sender_name} | Recipient: ${msg.recipient_name}`);
            console.log(`Date: ${msg.date} | New Balance: ${msg.new_balance || "N/A"} RWF`);
            console.log(`Transaction ID: ${msg.transaction_id || "N/A"}`);
            console.log(`Message Preview: ${msg.body.slice(0, 60)}...`);
            console.log("-".repeat(40));
        });
    }
}