// Constantes
const API_BASE_URL = 'http://localhost:3000';
const STATUS_LABELS = {
  found: 'Encontrado',
  lost: 'Perdido',
  returned: 'Devolvido',
};

// Obter o ID do item da URL
function getItemIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Carregar os detalhes do item
async function loadItemDetails(itemId) {
  try {
    // Fazer requisições em paralelo
    const [itemResponse, categoriesResponse, locationsResponse] =
      await Promise.all([
        $.get(`${API_BASE_URL}/items/${itemId}`),
        $.get(`${API_BASE_URL}/categories`),
        $.get(`${API_BASE_URL}/locations`),
      ]);

    const item = itemResponse;
    const categories = categoriesResponse;
    const locations = locationsResponse;

    // Encontrar categoria e localização do item
    const category = categories.find((cat) => cat.id === item.categoryId);
    const location = locations.find((loc) => loc.id === item.locationId);

    // Formatar a data
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Preencher os dados do item
    $('#item-name').text(item.name);
    $('#item-description').text(item.description || 'Sem descrição fornecida');
    $('#item-category').text(category ? category.name : 'Não especificada');
    $('#item-location').text(location ? location.name : 'Local desconhecido');
    $('#item-date').text(formattedDate);

    // Configurar a imagem
    if (item.photoUrl) {
      $('#item-image').attr('src', item.photoUrl);
    } else {
      $('#item-image').attr('src', './assets/img/placeholder.svg');
    }

    // Configurar o status
    const statusClass = `status-${item.status}`;
    const statusText = STATUS_LABELS[item.status] || item.status;
    $('#item-status')
      .removeClass('status-found status-lost status-returned')
      .addClass(statusClass)
      .text(statusText);

    // Mostrar a seção de detalhes e esconder o loading
    $('#loading').addClass('d-none');
    $('#item-details').removeClass('d-none');
  } catch (error) {
    console.error('Erro ao carregar detalhes do item:', error);
    showError();
  }
}

// Mostrar mensagem de erro
function showError() {
  $('#loading').addClass('d-none');
  $('#error-message').removeClass('d-none');
}

// Manipular o clique no botão de reivindicar item
function handleClaimItem() {
  // Aqui você pode adicionar a lógica para reivindicar o item
  alert('Funcionalidade de reivindicação será implementada em breve!');
}

// Inicialização da página
$(document).ready(() => {
  const itemId = getItemIdFromUrl();

  if (!itemId) {
    showError();
    return;
  }

  // Configurar evento de clique no botão de reivindicar
  $('#claim-item').on('click', handleClaimItem);

  // Carregar os detalhes do item
  loadItemDetails(itemId);
});

// Adicionar um placeholder genérico para imagens quebradas
document.addEventListener(
  'error',
  (e) => {
    if (e.target.tagName === 'IMG') {
      e.target.src = './assets/img/placeholder.svg';
    }
  },
  true
);
