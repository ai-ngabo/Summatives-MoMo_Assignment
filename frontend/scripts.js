document.addEventListener("DOMContentLoaded", () => {
    fetch("../backend/models/transactions.json") // Load local JSON file
        .then(response => response.json())
        .then(transactions => {
            console.log("Fetched Data:", transactions); // Debugging Step
            populateTransactionTypes(transactions);
            calculateTotals(transactions);
            generateCharts(transactions);
        })
        .catch(error => console.error("Fetch Error:", error));
});

function populateTransactionTypes(transactions) {
    const transactionType = document.getElementById("transactionType");
    const uniqueTypes = [...new Set(transactions.map(tx => tx.transaction_type))];
    uniqueTypes.forEach(type => {
        transactionType.innerHTML += `<option value="${type}">${type}</option>`;
    });
}

function calculateTotals(transactions) {
    console.log("Raw Transactions:", transactions); // Debugging Step

    let received = 0, sent = 0;

    transactions.forEach(tx => {
        if (tx.transaction_type.includes("Deposit") || tx.transaction_type.includes("Incoming")) {
            received += tx.amount; // Only bank deposits & incoming money
        } else {
            sent += tx.amount; // Everything else counts as money sent
        }
    });

    console.log("Total Received:", received, "Total Sent:", sent); // Debugging Step
    document.getElementById("totalReceived").textContent = `${received} RWF`;
    document.getElementById("totalSent").textContent = `${sent} RWF`;
}

function generateCharts(transactions) {
    const ctxBar = document.getElementById("barChart").getContext("2d");
    const ctxPie = document.getElementById("pieChart").getContext("2d");

    const transactionCounts = {};
    transactions.forEach(tx => {
        transactionCounts[tx.transaction_type] = (transactionCounts[tx.transaction_type] || 0) + 1;
    });

    new Chart(ctxBar, {
        type: "bar",
        data: {
            labels: Object.keys(transactionCounts),
            datasets: [{
                label: "Transaction Volume",
                data: Object.values(transactionCounts),
                backgroundColor: "#007bff",
            }]
        }
    });

    new Chart(ctxPie, {
        type: "pie",
        data: {
            labels: Object.keys(transactionCounts),
            datasets: [{
                data: Object.values(transactionCounts),
                backgroundColor: ["#007bff", "#dc3545", "#28a745"],
            }]
        }
    });
}

function fetchAPI() {
    window.location.href = "https://summatives-momo-assignment.onrender.com/transactions";
}
