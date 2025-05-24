async function fetchReports() {
  try {
    const res = await fetch(
      'http://localhost:3000/reports?_sort=createdAt&_order=asc'
    );
    const reports = await res.json();
    if (reports.length < 2)
      throw new Error('Pelo menos 2 relatórios são necessários');

    const latest = reports[reports.length - 1];
    const previous = reports[reports.length - 2];

    // Calcula a tendência em relação ao último mês
    const calcTrend = (latestVal, prevVal) => {
      const diff = latestVal - prevVal;
      const percent = ((diff / prevVal) * 100).toFixed(2);
      return {
        trend: diff > 0 ? 'up' : 'down',
        change: (diff >= 0 ? '+' : '') + percent + '%',
      };
    };

    // Gera os dados para a o painel de informação
    const stats = [
      {
        label: 'Total de itens perdidos',
        value: latest.lostItems,
        ...calcTrend(latest.lostItems, previous.lostItems),
      },
      {
        label: 'Total de itens encontrados',
        value: latest.foundItems,
        ...calcTrend(latest.foundItems, previous.foundItems),
      },
      {
        label: 'Itens Devolvidos',
        value: latest.returnedItems,
        ...calcTrend(latest.returnedItems, previous.returnedItems),
      },
      {
        label: 'Itens Ainda Não Devolvidos',
        value: latest.pendingItems,
        ...calcTrend(latest.pendingItems, previous.pendingItems),
      },
    ];

    // Preenche o painel de informação
    $('#stats-container').html('');
    stats.forEach((stat) => {
      const arrow = stat.trend === 'up' ? '↑' : '↓';
      const color = stat.trend === 'up' ? 'badge-up' : 'badge-down';
      $('#stats-container').append(`
        <div class="col-md-3">
          <div class="card-stat">
            <h3>${stat.value}</h3>
            <p>${stat.label}</p>
            <div class="${color}">${arrow} ${stat.change}</div>
          </div>
        </div>
      `);
    });

    // Cria o grafico de rosca (Resumo) usando Chart.js
    const ctxDonut = document.getElementById('donutChart').getContext('2d');
    new Chart(ctxDonut, {
      type: 'doughnut',
      data: {
        labels: ['Perdidos', 'Encontrados', 'Devolvidos'],
        datasets: [
          {
            data: [latest.lostItems, latest.foundItems, latest.returnedItems],
            backgroundColor: ['#1e3a8a', '#f59e0b', '#8b5cf6'],
          },
        ],
      },
    });

    $('#totalItems').text(latest.totalItems);

    // Cria o grafico de linha (Mensal) usando Chart.js
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: reports.map((r) => {
          const date = new Date(r.createdAt);
          return date.toLocaleDateString('pt-BR', { month: 'short' });
        }),
        datasets: [
          {
            label: 'Itens perdidos',
            data: reports.map((r) => r.lostItems),
            borderColor: '#1e3a8a',
            backgroundColor: '#1e3a8a44',
            tension: 0.3,
          },
          {
            label: 'Itens encontrados',
            data: reports.map((r) => r.foundItems),
            borderColor: '#f59e0b',
            backgroundColor: '#f59e0b44',
            tension: 0.3,
          },
        ],
      },
    });
  } catch (err) {
    console.error(err);
    $('.container').prepend(
      `<div class="alert alert-danger">Erro ao carregar relatórios</div>`
    );
  }
}

$(document).ready(fetchReports);
