import re
import logging
from models.sms_parser import parse_sms

logging.basicConfig(filename="unprocessed_messages.log", level=logging.WARNING)

def extract_amount(sms_body):
    """Extracts the transaction amount from an SMS."""
    match = re.search(r"(\d+)\sRWF", sms_body)
    return int(match.group(1)) if match else None

def extract_sender(sms_body):
    """Extracts sender details when available."""
    match = re.search(r"from ([\w\s]+) \(\d+\)", sms_body)
    return match.group(1) if match else "Unknown Sender"

def extract_recipient(sms_body):
    """Extracts recipient details if present in transaction."""
    match = re.search(r"to ([\w\s]+) \(\d+\)", sms_body)
    return match.group(1) if match else "Unknown Recipient"

def categorize_transaction(sms_body):
    """Categorizes SMS messages based on keywords."""
    if "received" in sms_body.lower():
        return "Incoming Money"
    elif "payment" in sms_body.lower():
        return "Payment"
    elif "transferred" in sms_body.lower():
        return "Bank Transfer"
    elif "withdrawn" in sms_body.lower():
        return "Withdrawal"
    elif "bundle" in sms_body.lower():
        return "Internet/Voice Bundle Purchase"
    elif "deposit" in sms_body.lower():
        return "Bank Deposit"
    elif "airtime" in sms_body.lower():
        return "Airtime Bill Payment"
    elif "power bill" in sms_body.lower():
        return "Cash Power Bill Payment"
    elif "wasac" in sms_body.lower():
        return "Water Utility Bill Payment"
    elif "agent" in sms_body.lower():
        return "Withdrawal from Agent"
    else:
        logging.warning(f"Unrecognized transaction: {sms_body}")
        return "Unknown"

def clean_sms(sms_list):
    """Processes and categorizes a list of SMS messages."""
    cleaned_data = []
    
    for sms in sms_list:
        amount = extract_amount(sms["body"])
        sender = extract_sender(sms["body"])
        recipient = extract_recipient(sms["body"])
        transaction_type = categorize_transaction(sms["body"])

        if amount is None:
            logging.warning(f"Skipping SMS due to missing amount: {sms['body']}")
            continue

        cleaned_data.append({
            "body": sms["body"],
            "date": sms["date"],
            "amount": amount,
            "sender": sender,
            "recipient": recipient,
            "transaction_type": transaction_type
        })
    
    return cleaned_data

# Debugging block
if __name__ == "__main__":
    sms_data = parse_sms("sms_data/raw_sms.xml")
    cleaned = clean_sms(sms_data)

    print("\n--- Cleaned & Categorized Messages ---\n")
    for msg in cleaned[:5]:  # Just show a few to verify
        print(f"Type: {msg['transaction_type']}")
        print(f"Amount: {msg['amount']} RWF")
        print(f"Sender: {msg['sender']}")
        print(f"Recipient: {msg['recipient']}")
        print(f"Date: {msg['date']}")
        print(f"Message: {msg['body'][:60]}...")
        print("-" * 40)
