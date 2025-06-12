const fs = require("fs");
const path = require("path");
const { parseSMSFromFile } = require("./sms_parser.js"); // adjust path as needed

// Setup logging to a file
const logFile = fs.createWriteStream("unprocessed_messages.log", { flags: "a" });

// Utility: Write log
function logWarning(message) {
    logFile.write(`[WARNING] ${new Date().toISOString()} - ${message}\n`);
}

// Extract amount from SMS body (e.g., "2000 RWF")
function extractAmount(body) {
    const match = body.match(/(\d+)\sRWF/);
    return match ? parseInt(match[1]) : null;
}

// Extract sender from body (e.g., "from John Doe (12345)")
function extractSender(body) {
    const match = body.match(/from ([\w\s]+) \(\d+\)/i);
    return match ? match[1].trim() : "Unknown Sender";
}

// Extract recipient from body (e.g., "to Jane Doe (67890)")
function extractRecipient(body) {
    const match = body.match(/to ([\w\s]+) \(\d+\)/i);
    return match ? match[1].trim() : "Unknown Recipient";
}

// Categorize based on keywords
function categorizeTransaction(body) {
    const lower = body.toLowerCase();

    if (lower.includes("received")) return "Incoming Money";
    if (lower.includes("payment")) return "Payment";
    if (lower.includes("transferred")) return "Bank Transfer";
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
        const sender = extractSender(sms.body);
        const recipient = extractRecipient(sms.body);
        const transactionType = categorizeTransaction(sms.body);

        if (amount === null) {
            logWarning(`Skipping SMS due to missing amount: ${sms.body}`);
            continue;
        }

        cleaned.push({
            body: sms.body,
            date: sms.date,
            amount,
            sender,
            recipient,
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
        console.log(`Sender: ${msg.sender}`);
        console.log(`Recipient: ${msg.recipient}`);
        console.log(`Date: ${msg.date}`);
        console.log(`Message: ${msg.body.slice(0, 60)}...`);
        console.log("-".repeat(40));
    }
}
