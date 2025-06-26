import { showToast } from './toast.js';

// Variáveis globais
let items = [];
let categories = [];
let locations = [];
let filteredItems = [];

// Constantes
const API_BASE_URL = 'http://localhost:3000';
const STATUS_LABELS = {
  found: 'Encontrado',
  lost: 'Perdido',
  returned: 'Devolvido',
};

// Função para inicializar a página
$(document).ready(() => {
  // Carregar dados iniciais
  loadData();

  // Configurar eventos
  setupEventListeners();
});

// Carrega os dados iniciais da API
function loadData() {
  // Mostrar loading
  showLoading();

  // Fazer requisições em paralelo
  Promise.all([
    $.get(`${API_BASE_URL}/items?_expand=category&_expand=location`),
    $.get(`${API_BASE_URL}/categories`),
    $.get(`${API_BASE_URL}/locations`),
  ])
    .then(([itemsData, categoriesData, locationsData]) => {
      items = itemsData;
      categories = categoriesData;
      locations = locationsData;

      // Renderizar filtros
      renderCategoryFilters();
      renderLocationFilters();

      // Aplicar filtros iniciais
      applyFilters();
    })
    .catch((error) => {
      console.error('Erro ao carregar dados:', error);
      showError(
        'Erro ao carregar os dados. Por favor, tente novamente mais tarde.'
      );
    });
}

// Configura os event listeners
function setupEventListeners() {
  // Busca em tempo real
  $('#search-input').on('input', debounce(applyFilters, 300));

  // Filtros de categoria
  $(document).on('change', '.category-filter', applyFilters);

  // Filtros de localização
  $(document).on('change', '.location-filter', applyFilters);

  // Filtros de status
  $(document).on('change', '.status-filter', applyFilters);

  // Botão limpar filtros
  $('#clear-filters').on('click', clearFilters);

  // Botão entrar em contato
  $(document).on('click', '#contact-item', handleContactItem);
}

// Renderiza os filtros de categoria
function renderCategoryFilters() {
  const $container = $('#category-filters');
  $container.empty();

  if (categories.length === 0) {
    $container.html(
      '<div class="text-muted">Nenhuma categoria encontrada.</div>'
    );
    return;
  }

  for (const category of categories) {
    $container.append(`
      <div class="form-check">
        <input class="form-check-input category-filter" type="checkbox" 
               value="${category.id}" id="category-${category.id}">
        <label class="form-check-label" for="category-${category.id}">
          ${category.name}
        </label>
      </div>
    `);
  }
}

// Renderiza os filtros de localização
function renderLocationFilters() {
  const $container = $('#location-filters');
  $container.empty();

  if (locations.length === 0) {
    $container.html('<div class="text-muted">Nenhum local encontrado.</div>');
    return;
  }

  for (const location of locations) {
    $container.append(`
      <div class="form-check">
        <input class="form-check-input location-filter" type="checkbox" 
               value="${location.id}" id="location-${location.id}">
        <label class="form-check-label" for="location-${location.id}">
          ${location.name}
        </label>
      </div>
    `);
  }
}

// Aplica os filtros e renderiza os itens
function applyFilters() {
  const searchTerm = $('#search-input').val().toLowerCase();
  const selectedCategories = getSelectedValues('.category-filter:checked');
  const selectedLocations = getSelectedValues('.location-filter:checked');
  const selectedStatus = getSelectedValues('.status-filter:checked');

  // Filtrar itens
  filteredItems = items.filter((item) => {
    // Filtrar por termo de busca
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm);

    // Filtrar por categoria
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.categoryId.toString());

    // Filtrar por localização
    const matchesLocation =
      selectedLocations.length === 0 ||
      selectedLocations.includes(item.locationId.toString());

    // Filtrar por status
    const matchesStatus =
      selectedStatus.length === 0 || selectedStatus.includes(item.status);

    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  // Renderizar itens filtrados
  renderItems();

  // Atualizar contador de resultados
  updateResultsCount(filteredItems.length);
}

// Renderiza os itens na tela
function renderItems() {
  const $container = $('#items-container');
  const $noResults = $('#no-results');

  if (filteredItems.length === 0) {
    $container.addClass('d-none');
    $noResults.removeClass('d-none');
    return;
  }

  $container.removeClass('d-none');
  $noResults.addClass('d-none');

  // Limpar container
  $container.html('');

  // Adicionar itens ao container
  for (const item of filteredItems) {
    const category = item.category || {};
    const location = item.location || {};
    const statusClass = `badge-${item.status}`;
    const statusLabel = STATUS_LABELS[item.status] || item.status;
    const itemHtml = `
      <div class="col-lg-4 col-md-6 col-12 mb-4">
        <div class="item-card" data-id="${item.id}">
          <div class="item-image">
            <img src="${item.photoUrl ? item.photoUrl : './assets/img/placeholder.svg'}" alt="${item.name}" 
                 onerror="this.src='./assets/img/placeholder.svg'" />
          </div>
          <div class="item-body">
            <h5 class="item-title">${item.name}</h5>
            <p class="item-description">${item.description}</p>
            <div class="item-meta">
              <span><i class="ri-price-tag-3-line"></i> ${category.name || 'Sem categoria'}</span>
              <span class="item-badge ${statusClass}">${statusLabel}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    $container.append(itemHtml);
  }

  // Adicionar evento de clique nos cards
  $('.item-card').on('click', function () {
    const itemId = $(this).data('id');
    const item = items.find((i) => i.id === itemId);
    if (item) {
      showItemDetails(item);
    }
  });
}

// Mostra os detalhes do item em uma nova página
function showItemDetails(item) {
  // Armazenar o ID do item na URL e redirecionar
  window.location.href = `detalhes.html?id=${item.id}`;
}

// Mostra os detalhes do item em um modal
function showItemModal(item) {
  const modal = document.getElementById('itemModal');
  $(modal).data('item-id', item.id);

  // Formatação e preenchimento do modal conforme necessário
  // ...

  // Exibir modal
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
}

// Manipula o clique no botão de contato para direcionar à página de detalhes
function handleContactItem() {
  const itemId = $('#itemModal').data('item-id');
  if (!itemId) return;

  // Redirecionar para a página de detalhes onde o usuário poderá entrar em contato
  const modal = bootstrap.Modal.getInstance(
    document.getElementById('itemModal')
  );
  if (modal) {
    modal.hide();
  }

  // Redirecionar para a página de detalhes
  window.location.href = `detalhes.html?id=${itemId}`;
}

// Limpa todos os filtros
function clearFilters() {
  // Marcar todos os checkboxes
  $('.category-filter, .location-filter, .status-filter').prop(
    'checked',
    false
  );

  // Limpar campo de busca
  $('#search-input').val('');

  // Aplicar filtros
  applyFilters();
}

// Atualiza o contador de resultados
function updateResultsCount(count) {
  $('#results-count').text(count);
}

// Mostra o estado de carregamento
function showLoading() {
  const $container = $('#items-container');
  $container.html(`
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-3">Carregando itens...</p>
    </div>
  `);
}

// Mostra mensagem de erro
function showError(message) {
  const $container = $('#items-container');
  $container.html(`
    <div class="col-12">
      <div class="alert alert-danger">
        <i class="ri-error-warning-line"></i> ${message}
      </div>
    </div>
  `);
}

// Função auxiliar para obter valores dos checkboxes selecionados
function getSelectedValues(selector) {
  return Array.from($(selector)).map((checkbox) => $(checkbox).val());
}

// Função para debounce (evitar múltiplas chamadas rápidas)
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Adicionar um placeholder genérico para imagens quebradas
document.addEventListener(
  'error',
  (e) => {
    if (
      e.target.tagName === 'IMG' &&
      e.target.getAttribute('data-skip-fallback') !== 'true'
    ) {
      e.target.src = './assets/img/placeholder.svg';
    }
  },
  true
);
