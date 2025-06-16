<center> <h1>MoMo Tracker App</h1> </center>

![image alt](https://github.com/ai-ngabo/Summatives-MoMo_Assignment/blob/main/momo.png?raw=true)

This repository contains the initial stage of summatives assignment to build MTN Momo Analytics App from the given 1600+ Momo SMS in an xml file. This Web app will allow the users to analyze and filter the data and the respective date and get free API generated from those sms.

---
## 🗃️ Project Structure
```
├── backend/
    ├── logs/
        ├── unprocessed_data.log
    ├── models/
        ├── node_modules/
        ├── sms_parser.js
        ├── filter.js
        ├── insert_into_db.js
        ├── transactions.db
        ├── create_json.py
        ├── transactions.json
├── sms_data/
    ├── sms.xml
├── frontend
    ├── Index.html
    ├── styles.css
    ├── script.js
├── node_modules/
├── api.js
├── momo.png
├── README.md
```

## 🧬 Application Objectives

    ✒️ SMS Data Extraction
    ✒️ Process The data and clean it in the backend
    ✒️ Push it to the database and format it
    ✒️ Generating the API from the database
    ✒️ Finally, Displaying it through frontend dashboard

## Application Features

 **Data Extraction & Processing**:
  - Parse an xml file from sms_data/
  - Data cleaning and filtering
  - Categorization into transaction types such as bank deposits, Incoming Money,...

 **Presenting Data in Database**:
  - SQLite was used as RDMS
  - Inserting the Cleaned Data into database (transactions.db)
  - Saving the unprocessed Data into backend/logs/ (unprocessed_data.log)

 **Frontend Dashboard**:
  - Allows Filtering the transaction  types and the dates
  - Data visualization using bar chart and a pi chart
  - Transactions summary in the table 

 **API INTEGRATION**:
  - Presenting the Cleaned data into an API
  - Deploy it using render Running on, [API LINK](https://summatives-momo-assignment.onrender.com/transactions)

## Languages & Frameworks used
  - **Backend** : Javascript & Python, Node
  - **Database** : Sqlite3
  - **Frontend** : Html, Css & Jvascript
  - **API** : Javascript, Render

## Project Setup
  1. **Cloning the repo:**
       ```bash
       git clone https://github.com/ai-ngabo/Summatives-MoMo_Assignment.git
       cd Summatives-MoMo_Assignment
       ```
  2. **Dependencies Installation:**
       ```bash
       npm init -y
       npm install fast-xml-parser chart.js express fs sqlite3
       ```
  3. **Parse and Clean the data:**
       ```bash
       node ./backend/models/sms_parser.js
       node ./backend/models/filter.js
       ```
  4. **Create and load data into db:**
       ```bash
       sqlite3 transactions.db < backend/models/sms.sql
       node insert_into_db.js
       ```
  5. **Run the program**
       ```bash
       npm install -g serve
       serve frontend/
       ```
## Authors
    Alain Ishimwe Ngabo

## Additional Links
-**The Project Tutorial Video :** [Click This Link](https://youtu.be/DyOCMcfnlTE)
   
-**The project Report file(pdf):** [Click This Link](https://docs.google.com/document/d/1oLYNRXmmPJyO_jSDgb2NMhC4QuGw5VRRwiVLOXRk7EI/edit?tab=t.0#heading=h.gl1e368ejadr)
    
