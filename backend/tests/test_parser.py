from backend.models.sms_parser import parse_sms

def test_parse_valid_xml():
    test_file = "sms_data/raw_sms.xml"
    result = parse_sms(test_file)

    assert len(result) > 0, "Parsed SMS list should not be empty"
    assert isinstance(result, list), "Output should be a list"
    assert isinstance(result[0], dict), "Each SMS should be a dictionary"
