// Busca itens encontrados diretamente do db.json via json-server e renderiza na home
let allItems = [];
let categories = [];
let locations = [];
const STATUS_LABELS = {
  found: 'Encontrado',
  lost: 'Perdido',
  returned: 'Devolvido',
};
async function fetchAllItems() {
  try {
    const itemsRes = await fetch(
      'http://localhost:3000/items?_expand=category&_expand=location'
    );
    const items = await itemsRes.json();
    allItems = items.map((item) => ({
      ...item,
      category: item.category || {},
      location: item.location?.name || 'Desconhecido',
    }));
    renderAllItems();
  } catch (e) {
    document.getElementById('found-items-list').innerHTML =
      '<div class="col-12 text-center text-danger py-5">Erro ao carregar itens do servidor.</div>';
  }
}
function renderAllItems() {
  const list = document.getElementById('found-items-list');
  let filtered = allItems.slice().sort((a, b) => {
    const dateA = new Date(a.foundAt || a.lostAt || a.createdAt);
    const dateB = new Date(b.foundAt || b.lostAt || b.createdAt);
    return dateB - dateA;
  });
  if (filtered.length === 0) {
    list.innerHTML =
      '<div class="col-12 text-center text-muted py-5">Nenhum item encontrado.</div>';
    return;
  }
  list.innerHTML = filtered
    .map((item) => {
      const statusClass = `badge-${item.status}`;
      const statusLabel = STATUS_LABELS[item.status] || item.status;
      return `
      <div class="col-lg-4 col-md-6 col-12 mb-4">
        <div class="item-card" data-id="${item.id}" style="cursor:pointer;">
          <div class="item-image">
            <img src="${item.photoUrl ? item.photoUrl : './assets/img/placeholder.svg'}" alt="${item.name}" onerror="this.src='./assets/img/placeholder.svg'" />
          </div>
          <div class="item-body">
            <h5 class="item-title">${item.name}</h5>
            <p class="item-description">${item.description}</p>
            <div class="item-meta">
              <span><i class="ri-price-tag-3-line"></i> ${item.category.name || 'Sem categoria'}</span>
              <span class="item-badge ${statusClass}">${statusLabel}</span>
            </div>
          </div>
        </div>
      </div>
      `;
    })
    .join('');
  // Adicionar evento de clique nos cards
  document.querySelectorAll('.item-card').forEach((card) => {
    card.addEventListener('click', function () {
      const itemId = this.getAttribute('data-id');
      window.location.href = `detalhes.html?id=${itemId}`;
    });
  });
}
document.addEventListener('DOMContentLoaded', function () {
  fetchAllItems();
});
