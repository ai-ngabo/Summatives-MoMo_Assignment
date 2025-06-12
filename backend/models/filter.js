const fs = require("fs");
const path = require("path");
const { parseSMSFromFile } = require("./sms_parser.js");

// Setup logging
const logFile = fs.createWriteStream("../logs/unprocessed_data.log", { flags: "a" });

function logWarning(message) {
    logFile.write(`[WARNING] ${new Date().toISOString()} - ${message}\n`);
}

// Extract sender
function extractSender(body) {
    const match = body.match(/from ([\w\s]+) \(\*+\d+\)/i);
    return match ? match[1].trim().toLowerCase() : "unknown sender";
}

// Extract date
function extractDate(body) {
    const match = body.match(/at\s(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})/);
    return match ? match[1] : null;
}

// Extract amount
function extractAmount(body) {
    const match = body.match(/([\d,]+)\sRWF/i);
    return match ? parseInt(match[1].replace(/,/g, ""), 10) : null;
}

// Extract fee
function extractFee(body) {
    const match = body.match(/Fee was:\s(\d+)\sRWF/i);
    return match ? parseInt(match[1], 10) : null;
}

// Extract new balance
function extractNewBalance(body) {
    const match = body.match(
        /Your new balance:\s(\d+)\sRWF|Your NEW BALANCE :(\d+)\sRWF|New balance:\s(\d+)\sRWF|Your new balance:(\d+)\sRWF/i
    );
    return match ? parseInt(match[1] || match[2] || match[3] || match[4], 10) : null;
}

// Extract recipient name and phone
function extractRecipientDetails(body) {
    const match = body.match(/to ([\w\s]+?) (\d{4,})|to ([\w\s]+) \((\d+)\)/i);
    const name = match ? (match[1] || match[3]) : "unknown";
    const phone = match ? (match[2] || match[4]) : null;
    return {
        recipient_name: name ? name.trim().toLowerCase() : "unknown",
        recipient_phone: phone || "N/A"
    };
}

// Normalize date to "YYYY-MM-DD HH:MM:SS"
function normalizeDate(rawDate) {
    const d = new Date(rawDate);
    return isNaN(d.getTime()) ? "unknown date" : d.toISOString().replace("T", " ").slice(0, 19);
}

// Categorize transaction type
function categorizeTransaction(body) {
    const lower = body.toLowerCase();

    if (lower.includes("you have received")) return "Incoming Money";
    if (lower.includes("you have transferred") || lower.includes("transferred")) return "Transfer to Mobile";
    if (lower.includes("payment to code") || lower.includes("payment of")) return "Payment to Code Holder";
    if (lower.includes("bank deposit") || lower.includes("cash deposit")) return "Bank Deposit";
    if (lower.includes("withdrawn") && lower.includes("via agent")) return "Withdrawal from Agent";
    if (lower.includes("bank transfer")) return "Bank Transfer";
    if (lower.includes("airtime")) return "Airtime Bill Payment";
    if (lower.includes("power bill")) return "Cash Power Bill Payment";
    if (lower.includes("wasac")) return "Water Utility Bill Payment";
    if (lower.includes("bundle")) return "Internet/Voice Bundle Purchase";
    if (lower.includes("a transaction of") && lower.includes("by")) return "Transactions Initiated by Third Parties";

    logWarning(`Unrecognized transaction: ${body}`);
    return "Unknown";
}

// Clean SMS list
function cleanSMS(smsList) {
    const cleaned = [];

    for (const sms of smsList) {
        const amount = extractAmount(sms.body);
        if (!amount) {
            logWarning(`Skipping SMS due to missing amount: ${sms.body}`);
            continue;
        }

        const fee = extractFee(sms.body) || 0;
        const new_balance = extractNewBalance(sms.body) || "N/A";
        const date = normalizeDate(extractDate(sms.body));
        const senderRaw = extractSender(sms.body);
        const sender = senderRaw ? senderRaw.trim().toLowerCase() : "unknown sender";
        const { recipient_name, recipient_phone } = extractRecipientDetails(sms.body);
        const transaction_type = categorizeTransaction(sms.body) || "Unknown";

        cleaned.push({
            body: sms.body,
            date,
            amount,
            sender,
            recipient_name,
            recipient_phone,
            fee,
            new_balance,
            transaction_type
        });
    }

    return cleaned;
}

// Export if used as module
module.exports = { cleanSMS };

// Run if executed directly
if (require.main === module) {
    const smsData = parseSMSFromFile(path.join(__dirname, "../../sms_data/sms.xml"));
    const cleaned = cleanSMS(smsData);

    console.log("✅ Is cleaned an array?", Array.isArray(cleaned));
    console.log(`📊 Number of cleaned SMS: ${cleaned.length}`);

    console.log("\n--- Sample Cleaned Transactions ---\n");
    for (const msg of cleaned.slice(0, 5)) {
        console.log(`Type: ${msg.transaction_type}`);
        console.log(`Amount: ${msg.amount} RWF`);
        console.log(`Fee: ${msg.fee} RWF`);
        console.log(`New Balance: ${msg.new_balance}`);
        console.log(`Sender: ${msg.sender}`);
        console.log(`Recipient Name: ${msg.recipient_name}`);
        console.log(`Recipient Phone: ${msg.recipient_phone}`);
        console.log(`Date: ${msg.date}`);
        console.log(`Message: ${msg.body.slice(0, 60)}...`);
        console.log("-".repeat(40));
    }
}