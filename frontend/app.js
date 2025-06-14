document.addEventListener("DOMContentLoaded", () => {
    const transactionsTable = document.querySelector("#transactionsTable tbody");
    const transactionType = document.querySelector("#transactionType");
    const totalTransactions = document.querySelector("#totalTransactions");
    const totalInflow = document.querySelector("#totalInflow");
    const totalOutflow = document.querySelector("#totalOutflow");

    // Load Data from SQLite via JSON
    fetch("transactions.json")
        .then(response => response.json())
        .then(transactions => {
            populateTransactionTypes(transactions); // Populate dropdown
            displayTransactions(transactions); // Show transactions in table
            generateCharts(transactions); // Create graphs
        });

    function populateTransactionTypes(transactions) {
    const transactionType = document.getElementById("transactionType");
    transactionType.innerHTML = `<option value="All">All</option>`; // Default option

    const uniqueTypes = [...new Set(transactions.map(tx => tx.transaction_type))]; // Get unique types
    uniqueTypes.forEach(type => {
        transactionType.innerHTML += `<option value="${type}">${type}</option>`;
    });
}


    function displayTransactions(transactions) {
        transactionsTable.innerHTML = "";
        transactions.forEach(tx => {
            const row = `<tr>
                <td>${tx.date}</td>
                <td>${tx.amount}</td>
                <td>${tx.sender}</td>
                <td>${tx.recipient_name}</td>
                <td>${tx.transaction_type}</td>
            </tr>`;
            transactionsTable.innerHTML += row;
        });
    }

    function calculateStats(transactions) {
        totalTransactions.textContent = transactions.length;
        totalInflow.textContent = transactions.filter(tx => tx.amount > 0).length;
        totalOutflow.textContent = transactions.filter(tx => tx.amount < 0).length;
    }

    transactionType.addEventListener("change", () => {
        fetch("transactions.json")
            .then(response => response.json())
            .then(transactions => {
                const filtered = transactions.filter(tx => transactionType.value === "All" || tx.transaction_type === transactionType.value);
                displayTransactions(filtered);
            });
    });
});