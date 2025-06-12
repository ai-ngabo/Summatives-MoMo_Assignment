from models.sms_parser import parse_sms

sms_s = parse_sms("../../sms_data/sms.xml")
print(sms_s[:3])
