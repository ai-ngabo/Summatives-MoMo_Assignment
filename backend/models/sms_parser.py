import os
import xml.etree.ElementTree as ET

_file__path = ""
def parse_xml(file_path):
    with open(file_path, 'r') as f:
        file_path = f.read()

    root = ET.fromstring(xml_string)
    return root