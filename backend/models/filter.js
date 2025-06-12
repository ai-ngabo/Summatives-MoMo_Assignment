const fs = require("fs");
const path = require("path");
const { parseSMSFromFile } = require("./sms_parser.js");

// Setup logging
const logFile = fs.createWriteStream("unprocessed_messages.log", { flags: "a" });

function logWarning(message) {
    logFile.write(`[WARNING] ${new Date().toISOString()} - ${message}\n`);
}

function logError(message) {
    logFile.write(`[ERROR] ${new Date().toISOString()} - ${message}\n`);
}

// Extract amount from SMS body
function extractAmount(body) {
    const match = body.match(/(\d+)\sRWF/);
    return match ? parseInt(match[1]) : null;
}

// Extract sender from body
function extractSender(body) {
    const match = body.match(/from ([\w\s]+) \(\d+\)/i);
    return match ? match[1].trim() : "Unknown Sender"; // Should always exist
}

// Extract recipient & recipient code
function extractRecipientDetails(body) {
    const match = body.match(/to ([\w\s]+) (\d+)\s/i);
    if (match) {
        return { recipient_name: match[1].trim(), recipient_code: match[2].trim() };
    }

    const fallbackMatch = body.match(/to ([\w\s]+)/i);
    return fallbackMatch ? { recipient_name: fallbackMatch[1].trim(), recipient_code: null } : { recipient_name: "Unknown Recipient", recipient_code: null };
}

// Categorize based on keywords
function categorizeTransaction(body) {
    const lower = body.toLowerCase();

    if (lower.includes("wasac") || lower.includes("water bill")) return "Water Utility Bill Payment";
    if (lower.includes("power bill") || lower.includes("electricity")) return "Cash Power Bill Payment";
    if (lower.includes("airtime")) return "Airtime Bill Payment";
    if (lower.includes("bundle")) return "Internet/Voice Bundle Purchase";
    if (lower.includes("deposit")) return "Bank Deposit";
    if (lower.includes("withdrawn") || lower.includes("agent")) return "Withdrawal from Agent";
    if (lower.includes("transferred")) return "Bank Transfer";
    if (lower.includes("payment")) return "Payment";
    if (lower.includes("received")) return "Incoming Money";

    logWarning(`Unrecognized transaction: ${body}`);
    return "Unknown";
}

// Clean SMS list
function cleanSMS(smsList) {
    const cleaned = [];

    for (const sms of smsList) {
        const amount = extractAmount(sms.body);
        const sender = extractSender(sms.body);
        const { recipient_name, recipient_code } = extractRecipientDetails(sms.body);
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
            recipient_name,
            recipient_code,
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
        console.log(`Recipient Name: ${msg.recipient_name}`);
        console.log(`Recipient Code: ${msg.recipient_code || "N/A"}`);
        console.log(`Date: ${msg.date}`);
        console.log(`Message: ${msg.body.slice(0, 60)}...`);
        console.log("-".repeat(40));
    }
}