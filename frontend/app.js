import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import "./styles.css";

function App() {
    const [transactions, setTransactions] = useState([]);
    const [totalSent, setTotalSent] = useState(0);
    const [totalReceived, setTotalReceived] = useState(0);

    useEffect(() => {
        axios.get("transactions.json")
            .then(response => {
                setTransactions(response.data);
                calculateTotals(response.data);
            });
    }, []);

    const calculateTotals = (data) => {
        let sent = 0, received = 0;
        data.forEach(tx => {
            if (tx.amount < 0) sent += Math.abs(tx.amount);
            else received += tx.amount;
        });
        setTotalSent(sent);
        setTotalReceived(received);
    };

    return (
        <div className="dashboard">
            <h1>MoMo Analytics</h1>
            <div className="stats">
                <div>Total Transactions: {transactions.length}</div>
                <div>Total Sent: ${totalSent}</div>
                <div>Total Received: ${totalReceived}</div>
            </div>
            <div className="charts">
                <ResponsiveContainer width="50%" height={300}>
                    <LineChart data={transactions}>
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