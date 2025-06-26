import { showToast } from './toast.js';

// Constantes
const API_BASE_URL = 'http://localhost:3000';
const STATUS_LABELS = {
  found: 'Encontrado',
  lost: 'Perdido',
  returned: 'Devolvido',
};

// Elementos DOM
const $contactModal = new bootstrap.Modal(
  document.getElementById('contactModal')
);
let currentItem = null;

// Obter o ID do item da URL
function getItemIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Carregar os detalhes do item
async function loadItemDetails(itemId) {
  try {
    // Carregar item com os relacionamentos
    const [item, user] = await Promise.all([
      $.get(
        `${API_BASE_URL}/items/${itemId}?_expand=category&_expand=location`
      ),
      // Primeiro pega o item para obter o ID do usuário
      (async () => {
        const itemData = await $.get(`${API_BASE_URL}/items/${itemId}`);
        if (itemData.reportedBy) {
          return $.get(`${API_BASE_URL}/users/${itemData.reportedBy}`);
        }
        return null;
      })(),
    ]);

    currentItem = item;
    currentItem.reportedByUser = user; // Armazena os dados completos do usuário

    // Formatar a data
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Preencher os dados na página
    $('#item-name').text(item.name);
    $('#item-description').text(item.description || 'Sem descrição fornecida.');
    $('#item-category').text(item.category?.name || 'Não especificada');
    $('#item-location').text(item.location?.name || 'Local desconhecido');
    $('#item-date').text(formattedDate);

    // Configurar a imagem
    if (item.photoUrl) {
      $('#item-image')
        .attr('src', item.photoUrl)
        .on('error', function () {
          $(this).attr('src', './assets/img/placeholder.svg');
        });
    } else {
      $('#item-image').attr('src', './assets/img/placeholder.svg');
    }

    // Preencher informações do autor
    if (user) {
      $('#author-name').text(user.name || 'Usuário anônimo');
      $('#author-email').text(user.email || '');
    } else {
      $('#author-name').text('Usuário anônimo');
      $('#author-email').text('');
    }

    // Configurar o status
    const statusElement = $('#item-status');
    const statusClass = `status-${item.status}`;
    const statusText = STATUS_LABELS[item.status] || item.status;
    statusElement
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

// Reivindicar
function handleClaimItem() {
  showToast(
    'Funcionalidade de reivindicação será implementada em breve!',
    'info'
  );
}

// Mostrar informações de contato no modal
function showContactInfo(user) {
  if (!user) {
    showToast('Não foi possível identificar o dono deste item.', 'warning');
    return;
  }

  const $modalBody = $('#contactModalBody');
  const $emailButton = $('#emailButton');

  // Atualiza o modal com as informações do usuário
  $modalBody.html(`
    <div class="text-center mb-4">
      <div class="author-avatar mx-auto mb-3">
        <i class="ri-user-fill"></i>
      </div>
      <h5 class="mb-1">${user.name || 'Usuário anônimo'}</h5>
      ${user.email ? `<p class="text-muted mb-2">${user.email}</p>` : ''}
      ${user.phone ? `<p class="mb-0"><i class="ri-phone-line me-2"></i>${user.phone}</p>` : ''}
    </div>
  `);

  // Configura o botão de email se disponível
  if (user.email) {
    $emailButton
      .attr(
        'href',
        `mailto:${user.email}?subject=Encontrei seu item no FindForMe`
      )
      .removeClass('d-none');
  } else {
    $emailButton.addClass('d-none');
  }

  $contactModal.show();
}

// Inicialização da página
$(document).ready(() => {
  const itemId = getItemIdFromUrl();

  if (!itemId) {
    showError();
    return;
  }

  // Reivindicar
  $('#claim-item').on('click', handleClaimItem);

  // Contato
  $('#contact-button').on('click', (e) => {
    e.preventDefault();
    if (currentItem?.reportedByUser) {
      showContactInfo(currentItem.reportedByUser);
    } else {
      showToast('Não foi possível identificar o dono deste item.', 'warning');
    }
  });

  // Carregar os detalhes do item
  loadItemDetails(itemId);
});
