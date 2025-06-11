import sqlite3

#In this file we are going to create all the necessary tables for our database
class DatabaseTransactions:
    def __init__(self, table_file="transactions.db"):
        
        self.conn = sqlite3.connect(table_file)
        self.cursor = self.conn.cursor()

    def execute_query(self, query, params=None):
        if params:
            self.cursor.execute(query, params)
        else:
            self.cursor.execute(query)
        self.conn.commit()

    def fetch_all(self, query):
        self.cursor.execute(query)
        return self.cursor.fetchall()

db = DatabaseTransactions()
