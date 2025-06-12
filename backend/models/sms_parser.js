const { XMLParser } = require("fast-xml-parser");
const fs = require("fs");

function parseSMSFromFile(filePath) {
    try {
        const xmlData = fs.readFileSync(filePath, "utf-8");
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
        const result = parser.parse(xmlData);

        const smsArray = result.smses.sms || [];
        const smsList = Array.isArray(smsArray) ? smsArray : [smsArray];

        return smsList.map(sms => ({
            body: (sms.body || "").trim(),
            date: sms.date || ""
        }));
    } catch (e) {
        console.error("Error parsing XML file:", e);
        return [];
    }
}

// Example usage
const smsList = parseSMSFromFile("../../sms_data/sms.xml");
console.log(smsList);
