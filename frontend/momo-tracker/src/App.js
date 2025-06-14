import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import "./App.css";

function App() {
    const [transactions, setTransactions] = useState([]);
    const [totalSent, setTotalSent] = useState(0);
    const [totalReceived, setTotalReceived] = useState(0);
    const [month, setMonth] = useState(""); // chosen month
    const [filtered, setFiltered] = useState([]); // data for that month
    const [type, setType] = useState("All");
    const [types, setTypes] = useState([]); // unique types

    axios.get("transactions.json").then((res) => {
  	const data = res.data;
  	setTransactions(data);
  	setFiltered(data);
  	calculateTotals(data);

  	// extract all unique types
  	const uniqueTypes = [...new Set(data.map(tx => tx.transaction_type))];
  	setTypes(uniqueTypes);
      });
    

    const calculateTotals = (data) => {
        let sent = 0, received = 0;
        data.forEach(tx => {
            if (tx.amount < 0) sent += Math.abs(tx.amount);
            else received += tx.amount;
        });
        setTotalSent(sent);
        setTotalReceived(received);
    };

    const handleMonthChange = (e) => {
  	const selectedMonth = e.target.value;
  	setMonth(selectedMonth);
  	filterByMonthAndType(selectedMonth, type);
     }; 

    const handleTypeChange = (e) => {
  	const selected = e.target.value;
  	setType(selected);
  	filterByMonthAndType(month, selected);
     };

    const filterByMonthAndType = (month, type) => {
  	let data = [...transactions];

  	if (month) {
    	   data = data.filter(tx => tx.date.slice(0, 7) === month);
  	 }

  	if (type !== "All") {
           data = data.filter(tx => tx.transaction_type === type);
         }

  	setFiltered(data);
  	calculateTotals(data);
     };

    return (
        <div className="dashboard">
            <h1>MoMo Analytics</h1>
	    <div className="filters">
  		<label>Filter by Month:</label>
  		<input
    		   type="month"
    		   value={month}
    		   onChange={handleMonthChange}
  		/>
	    </div>
	    <div className="filters">
  		<label>Filter by Type:</label>
 	 	<select value={type} onChange={handleTypeChange}>
    		    <option value="All">All</option>
    		    {types.map((t, index) => (
      			<option key={index} value={t}>{t}</option>
    		    ))}
  		</select>
	    </div>

            <div className="stats">
                <div>Total Transactions: {filtered.length}</div>
                <div>Total Sent: ${totalSent}</div>
                <div>Total Received: ${totalReceived}</div>
            </div>
            <div className="charts">
                <ResponsiveContainer width="50%" height={300}>
                    <LineChart data={filtered}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="amount" stroke="#007bff" />
                    </LineChart>
                </ResponsiveContainer>

                <ResponsiveContainer width="50%" height={300}>
                    <PieChart>
                        <Pie data={[{name: "Sent", value: totalSent}, {name: "Received", value: totalReceived}]} dataKey="value">
                            <Cell fill="#dc3545" />
                            <Cell fill="#28a745" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default App;
