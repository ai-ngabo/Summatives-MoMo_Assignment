let data = [];
let chart, circularChart;

async function load() {
  try {
    const res = await fetch("../backend/models/transactions.json");
    data = await res.json();
    fillTypes();
    draw();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function fillTypes() {
  const set = new Set(data.map(d => d.transaction_type));
  const sel = document.getElementById("type");
  set.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    sel.appendChild(opt);
  });
}

function draw() {
  updateVisuals(data);
  updateTable(data);
}

function apply() {
  const type = document.getElementById("type").value;
  const start = new Date(document.getElementById("start").value);
  const end = new Date(document.getElementById("end").value);

  const filtered = data.filter(d => {
    const date = new Date(d.date);
    return (type === "all" || d.transaction_type === type) &&
           (!isNaN(start) ? date >= start : true) &&
           (!isNaN(end) ? date <= end : true);
  });

  updateVisuals(filtered);
  updateTable(filtered);
}

function updateVisuals(dataset) {
  const counts = {};
  let received = 0, sent = 0;

  dataset.forEach(d => {
    const t = d.transaction_type || "Unknown";
    counts[t] = (counts[t] || 0) + 1;

    if (t === "Bank Deposit" || t === "Incoming Money") {
      received += d.amount;
    } else {
      sent += d.amount;
    }
  });

  document.getElementById("receivedBox").textContent = `Total Received: ${received.toLocaleString()} RWF`;
  document.getElementById("sentBox").textContent = `Total Sent: ${sent.toLocaleString()} RWF`;

  const labels = Object.keys(counts);
  const values = Object.values(counts);
  const colors = generateColors(labels.length);

  drawBarChart(labels, values, colors);
  drawCircularChart(labels, values, colors);
}

function drawBarChart(labels, values, colors) {
  const ctx = document.getElementById("barChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Transaction Types",
        data: values,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function drawCircularChart(labels, values, colors) {
  const ctx = document.getElementById("circularChart").getContext("2d");
  if (circularChart) circularChart.destroy();

  circularChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function updateTable(rows) {
  const tbody = document.getElementById("table");
  tbody.innerHTML = "";

  rows.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.date}</td>
      <td>${d.recipient_name}</td>
      <td>${d.recipient_phone}</td>
      <td>${d.transaction_type}</td>
      <td>${d.amount.toLocaleString()} RWF</td>
    `;
    tbody.appendChild(tr);
  });
}

function generateColors(n) {
  const palette = [
    "#f39c12", "#27ae60", "#e74c3c", "#3498db", "#9b59b6",
    "#16a085", "#f1c40f", "#2c3e50", "#d35400", "#7f8c8d"
  ];
  return Array.from({ length: n }, (_, i) => palette[i % palette.length]);
}

load();