let data = [];
let chart;

async function load() {
  const res = await fetch('../backend/models/transactions.json');
  data = await res.json();
  fillTypes();
  draw();
}

function fillTypes() {
  const set = new Set(data.map(d => d.transaction_type));
  const sel = document.getElementById('type');
  set.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    sel.appendChild(opt);
  });
}

function draw() {
  const counts = {};
  const totals = {};

  data.forEach(d => {
    const t = d.transaction_type || 'Unknown';
    counts[t] = (counts[t] || 0) + 1;
    totals[t] = (totals[t] || 0) + d.amount;
  });

  const ctx = document.getElementById('barChart').getContext('2d');
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(totals),
      datasets: [{
        label: 'Total Amount (RWF)',
        data: Object.values(totals),
        backgroundColor: 'rgba(0, 119, 204, 0.7)'
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              return `${label}: ${context.parsed.y.toLocaleString()} RWF`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  updateTable(data);
}

function apply() {
  const type = document.getElementById('type').value;
  const start = new Date(document.getElementById('start').value);
  const end = new Date(document.getElementById('end').value);

  const filtered = data.filter(d => {
    const date = new Date(d.date);
    return (type === 'all' || d.transaction_type === type) &&
           (!isNaN(start) ? date >= start : true) &&
           (!isNaN(end) ? date <= end : true);
  });

  updateTable(filtered);
  updateChart(filtered);
}

function updateChart(filtered) {
  const totals = {};
  filtered.forEach(d => {
    const t = d.transaction_type || 'Unknown';
    totals[t] = (totals[t] || 0) + d.amount;
  });

  chart.data.labels = Object.keys(totals);
  chart.data.datasets[0].data = Object.values(totals);
  chart.update();
}

function updateTable(rows) {
  const tbody = document.getElementById('table');
  tbody.innerHTML = '';

  rows.forEach(d => {
    const tr = document.createElement('tr');
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

load();
