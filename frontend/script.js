// let data = [];
// let chart;

// async function load() {
//   const res = await fetch('../backend/models/transactions.json');
//   data = await res.json();
//   fillTypes();
//   draw();
// }

// function fillTypes() {
//   const set = new Set(data.map(d => d.transaction_type));
//   const sel = document.getElementById('type');
//   set.forEach(t => {
//     const opt = document.createElement('option');
//     opt.value = t;
//     opt.textContent = t;
//     sel.appendChild(opt);
//   });
// }

// function draw() {
//   const counts = {};
//   const totals = {};

//   data.forEach(d => {
//     const t = d.transaction_type || 'Unknown';
//     counts[t] = (counts[t] || 0) + 1;
//     totals[t] = (totals[t] || 0) + d.amount;
//   });

//   const ctx = document.getElementById('barChart').getContext('2d');
//   if (chart) chart.destroy();

//   chart = new Chart(ctx, {
//     type: 'bar',
//     data: {
//       labels: Object.keys(totals),
//       datasets: [{
//         label: 'Total Amount (RWF)',
//         data: Object.values(totals),
//         backgroundColor: 'rgba(0, 119, 204, 0.7)'
//       }]
//     },
//     options: {
//       plugins: {
//         legend: { display: false },
//         tooltip: {
//           callbacks: {
//             label: function(context) {
//               const label = context.dataset.label || '';
//               return `${label}: ${context.parsed.y.toLocaleString()} RWF`;
//             }
//           }
//         }
//       },
//       scales: {
//         y: {
//           beginAtZero: true
//         }
//       }
//     }
//   });

//   updateTable(data);
// }

// function apply() {
//   const type = document.getElementById('type').value;
//   const start = new Date(document.getElementById('start').value);
//   const end = new Date(document.getElementById('end').value);

//   const filtered = data.filter(d => {
//     const date = new Date(d.date);
//     return (type === 'all' || d.transaction_type === type) &&
//            (!isNaN(start) ? date >= start : true) &&
//            (!isNaN(end) ? date <= end : true);
//   });

//   updateTable(filtered);
//   updateChart(filtered);
// }

// function updateChart(filtered) {
//   const totals = {};
//   filtered.forEach(d => {
//     const t = d.transaction_type || 'Unknown';
//     totals[t] = (totals[t] || 0) + d.amount;
//   });

//   chart.data.labels = Object.keys(totals);
//   chart.data.datasets[0].data = Object.values(totals);
//   chart.update();
// }

// function updateTable(rows) {
//   const tbody = document.getElementById('table');
//   tbody.innerHTML = '';

//   rows.forEach(d => {
//     const tr = document.createElement('tr');
//     tr.innerHTML = `
//       <td>${d.date}</td>
//       <td>${d.recipient_name}</td>
//       <td>${d.recipient_phone}</td>
//       <td>${d.transaction_type}</td>
//       <td>${d.amount.toLocaleString()} RWF</td>
//     `;
//     tbody.appendChild(tr);
//   });
// }

// load();

// script.js
// script.js

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("json-file");
  const transactionsTableBody = document.getElementById("transactions-table-body");
  const transactionTypeFilter = document.getElementById("transaction-type-filter");
  const dateFilter = document.getElementById("date-filter");

  const totalSentBox = document.getElementById("total-sent");
  const totalReceivedBox = document.getElementById("total-received");
  const totalUnknownBox = document.getElementById("total-unknown");

  const barChartCanvas = document.getElementById("bar-chart");
  const pieChartCanvas = document.getElementById("pie-chart");

  let originalData = [];

  fileInput.addEventListener("change", handleFileUpload);

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          originalData = JSON.parse(e.target.result);
          updateDashboard(originalData);
        } catch (error) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  }

  function updateDashboard(data) {
    populateFilters(data);
    transactionTypeFilter.addEventListener("change", () => applyFilters(data));
    dateFilter.addEventListener("change", () => applyFilters(data));
    applyFilters(data);
  }

  function populateFilters(data) {
    const types = [...new Set(data.map(tx => tx.transaction_type))];
    transactionTypeFilter.innerHTML = '<option value="">All Types</option>';
    types.forEach(type => {
      transactionTypeFilter.innerHTML += `<option value="${type}">${type}</option>`;
    });
  }

  function applyFilters(data) {
    const selectedType = transactionTypeFilter.value;
    const selectedDate = dateFilter.value;
    let filteredData = data;

    if (selectedType) {
      filteredData = filteredData.filter(tx => tx.transaction_type === selectedType);
    }

    if (selectedDate) {
      filteredData = filteredData.filter(tx => tx.date.startsWith(selectedDate));
    }

    updateTable(filteredData);
    updateTotals(filteredData);
    renderBarChart(filteredData);
    renderPieChart(filteredData);
  }

  function updateTable(data) {
    transactionsTableBody.innerHTML = "";
    data.forEach(tx => {
      transactionsTableBody.innerHTML += `
        <tr>
          <td>${tx.date}</td>
          <td>${tx.sender}</td>
          <td>${tx.recipient_name}</td>
          <td>${tx.transaction_type}</td>
          <td>${tx.amount} RWF</td>
        </tr>`;
    });
  }

  function updateTotals(data) {
    let totalSent = 0;
    let totalReceived = 0;
    let totalUnknown = 0;

    data.forEach(tx => {
      if (tx.transaction_type === "Bank Deposit" || tx.transaction_type === "Incoming Money") {
        totalReceived += tx.amount;
      } else if (tx.transaction_type === "Unknown") {
        totalUnknown += tx.amount;
      } else {
        totalSent += tx.amount;
      }
    });

    totalSentBox.textContent = formatCurrency(totalSent);
    totalReceivedBox.textContent = formatCurrency(totalReceived);
    totalUnknownBox.textContent = formatCurrency(totalUnknown);
  }

  function renderBarChart(data) {
    const ctx = barChartCanvas.getContext("2d");
    if (window.barChart) window.barChart.destroy();

    const grouped = {};
    data.forEach(tx => {
      grouped[tx.transaction_type] = (grouped[tx.transaction_type] || 0) + tx.amount;
    });

    window.barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(grouped),
        datasets: [{
          label: "Total Amount (RWF)",
          data: Object.values(grouped),
          backgroundColor: "#4CAF50"
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
  }

  function renderPieChart(data) {
    const ctx = pieChartCanvas.getContext("2d");
    if (window.pieChart) window.pieChart.destroy();

    const grouped = {};
    data.forEach(tx => {
      grouped[tx.transaction_type] = (grouped[tx.transaction_type] || 0) + tx.amount;
    });

    window.pieChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(grouped),
        datasets: [{
          data: Object.values(grouped),
          backgroundColor: [
            "#4CAF50", "#FFC107", "#03A9F4", "#FF5722", "#9C27B0", "#795548", "#607D8B"
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "right"
          }
        }
      }
    });
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("rw-RW", {
      style: "currency",
      currency: "RWF"
    }).format(amount);
  }
});
