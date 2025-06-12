import xml.etree.ElementTree as ET

# A function to parse an XML file and extract SMS message key details!
def parse_sms(_file__path):
    """Reads an XML file and extracts SMS message details."""
    try:
        tree = ET.parse(_file__path)  # Load and parse XML file
        root = tree.getroot()  # Get the root element

        sms_list = []  # Store parsed messages into a list

        for sms in root.findall("sms"):  # Loop through all SMS given
            sms_data = {
                "body": sms.attrib.get("body", "").strip(),
                "date": sms.attrib.get("date", ""),
            }
            sms_list.append(sms_data)  # Add to list

        return sms_list  # Return extracted SMS messages

    except Exception as e:
        print(f"Error parsing XML file: {e}")
        return []