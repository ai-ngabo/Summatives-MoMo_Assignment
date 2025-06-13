 function generateCharts(transactions) {
    const ctxTrends = document.getElementById("transactionTrends").getContext("2d");
    const ctxBreakdown = document.getElementById("transactionBreakdown").getContext("2d");

    // 📊 Transaction Trends Over Time (Line Chart)
    const groupedByDate = transactions.reduce((acc, tx) => {
        acc[tx.date] = (acc[tx.date] || 0) + tx.amount;
        return acc;
    }, {});

    new Chart(ctxTrends, {
        type: "line",
        data: {
            labels: Object.keys(groupedByDate),
            datasets: [{
                label: "Transaction Trends",
                data: Object.values(groupedByDate),
                borderColor: "#007bff",
                fill: false,
            }]
        }
    });

    // 🔄 Transaction Breakdown by Type (Pie Chart)
    const groupedByType = transactions.reduce((acc, tx) => {
        acc[tx.transaction_type] = (acc[tx.transaction_type] || 0) + 1;
        return acc;
    }, {});

    new Chart(ctxBreakdown, {
        type: "pie",
        data: {
            labels: Object.keys(groupedByType),
            datasets: [{
                data: Object.values(groupedByType),
                backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"],
            }]
        }
    });
}

// 🔹 Load data & generate charts
fetch("transactions.json")
    .then(response => response.json())
    .then(transactions => {
        displayTransactions(transactions);
        generateCharts(transactions);
    });