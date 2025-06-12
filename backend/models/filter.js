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
    const match = body.match(/(\d+)\sRWF/);
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

// Extract recipient details (name & phone number)
function extractRecipientDetails(body) {
    const match = body.match(/transferred to ([\w\s]+) \((\d+)\)/);
    return match ? { recipient_name: match[1].trim(), recipient_phone: match[2] } : { recipient_name: "Unknown", recipient_phone: null };
}

// Extract sender details
function extractSender(body) {
    const match = body.match(/from (\d+)/);
    return match ? match[1] : "Unknown Sender";
}

// Categorize transaction based on keywords
function categorizeTransaction(body) {
    const lower = body.toLowerCase();

    if (lower.includes("transferred to")) return "Transfer to Mobile";
    if (lower.includes("received")) return "Incoming Money";
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
        const sender = extractSender(sms.body);
        const { recipient_name, recipient_phone } = extractRecipientDetails(sms.body);
        const transactionType = categorizeTransaction(sms.body);

        if (!amount) {
            logWarning(`Skipping SMS due to missing amount: ${sms.body}`);
            continue;
        }

        cleaned.push({
            body: sms.body,
            date,
            amount,
            sender,
            recipient_name,
            recipient_phone,
            fee,
            new_balance,
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
    for (const msg of cleaned.slice(0, 5)) {
        console.log(`Type: ${msg.transaction_type}`);
        console.log(`Amount: ${msg.amount} RWF`);
        console.log(`Fee: ${msg.fee || "N/A"} RWF`);
        console.log(`New Balance: ${msg.new_balance || "N/A"} RWF`);
        console.log(`Sender: ${msg.sender}`);
        console.log(`Recipient Name: ${msg.recipient_name}`);
        console.log(`Recipient Phone: ${msg.recipient_phone || "N/A"}`);
        console.log(`Date: ${msg.date}`);
        console.log(`Message: ${msg.body.slice(0, 60)}...`);
        console.log("-".repeat(40));
    }
}