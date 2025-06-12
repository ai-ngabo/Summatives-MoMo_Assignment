import xml.etree.ElementTree as ET

def parse_sms(file_path):
    """Reads an XML file and extracts SMS message details."""
    try:
        tree = ET.parse(file_path)  # Load and parse XML file
        root = tree.getroot()  # Get the root element

        sms_list = []  # Store parsed messages

        for sms in root.findall("sms"):  # Loop through all SMS entries
            sms_data = {
                "body": sms.attrib.get("body", "").strip(),
                "date": sms.attrib.get("date", ""),
            }
            sms_list.append(sms_data)  # Add to list

        return sms_list  # Return extracted SMS messages

    except Exception as e:
        print(f"Error parsing XML file: {e}")
        return []

# Example usage:
sms_data = parse_sms("../sms_data/sms.xml")
#debugging
print(sms_data[:5])  # Show first few parsed messages