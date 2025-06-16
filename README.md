<center> <h1>MoMo Tracker App</h1> </center>

This repository contains the initial stage of summatives assignment to build MTN Momo Analytics App from the given 1600+ Momo SMS in an xml file. This Web app will allow the users to analyze and filter the data and the respective date and get free API generated from those sms.

---

<center> <h3>Project Structure</h3></center>

<pre><code>## 📁 Project Structure Summatives-MoMo_Assignment/├── sms_data/                        # Raw SMS data from phone│   └── sms.xml                     # Exported XML file containing SMS history├── backend/│   ├── models/│   │   ├── sms_parser.js           # Script to extract and parse SMS from XML│   │   ├── filter.js               # Filters and cleans parsed data│   │   ├── sms.sql                 # SQL setup script│   │   ├── insert_into_db.js       # Inserts cleaned data into database│   │   ├── transactions.db         # SQLite database storing processed transactions│   │   ├── create_json.py          # Converts DB data to JSON│   │   └── transactions.json       # Exported transaction data│   └── logs/│       ├── unprocessed_data.log    # Logs of skipped/failed SMS parsing│       └── transactions.csv        # Optional CSV export of data├── frontend/│   ├── index.html                  # Main dashboard page│   ├── styles.css                  # Dashboard layout and design│   └── script.js                   # JavaScript for interactivity and charts├── node_modules/                   # Node dependencies (auto-generated)├── api.js                          # Optional API bridge for backend/frontend└── README.md                       # Project overview and usage guide</code></pre>

<center> <h3>Repository Contents</h3> </center>

