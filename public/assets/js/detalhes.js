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

// Função removida - Sem funcionalidade de reivindicação

// Mostrar informações de contato no modal
function showContactInfo(user) {
  if (!user) {
    showToast('Não foi possível identificar o dono deste item.', 'warning');
    return;
  }

  const $modalBody = $('#contactModalBody');
  const $emailButton = $('#emailButton');
  const $whatsappButton = $('#whatsappButton');

  // Atualiza o modal com as informações do usuário e cards de contato
  $modalBody.html(`
    <div class="text-center mb-4">
      <div class="author-avatar mx-auto mb-3">
        <i class="ri-user-fill"></i>
      </div>
      <h5 class="mb-1">${user.name || 'Usuário anônimo'}</h5>
    </div>
    
    <div class="row">
      ${
        user.phone
          ? `
      <div class="col-md-6 mb-3">
        <div class="card contact-card">
          <div class="card-body text-center">
            <div class="contact-icon mb-3">
              <i class="ri-whatsapp-line"></i>
            </div>
            <h6 class="card-title">WhatsApp</h6>
            <p class="card-text text-muted">${user.phone}</p>
            <a href="https://wa.me/${user.phone.replace(/\D/g, '')}" target="_blank" class="btn btn-success w-100">
              <i class="ri-whatsapp-line me-2"></i>Enviar Mensagem
            </a>
          </div>
        </div>
      </div>
      `
          : ''
      }
      
      ${
        user.email
          ? `
      <div class="col-md-${user.phone ? '6' : '12'} mb-3">
        <div class="card contact-card">
          <div class="card-body text-center">
            <div class="contact-icon mb-3">
              <i class="ri-mail-line"></i>
            </div>
            <h6 class="card-title">E-mail</h6>
            <p class="card-text text-muted">${user.email}</p>
            <a href="mailto:${user.email}?subject=Encontrei seu item no FindForMe" class="btn btn-primary w-100">
              <i class="ri-mail-line me-2"></i>Enviar E-mail
            </a>
          </div>
        </div>
      </div>
      `
          : ''
      }
    </div>
    
    ${
      !user.phone && !user.email
        ? `
    <div class="alert alert-warning">
      <i class="ri-information-line me-2"></i>Este usuário não forneceu informações de contato.
    </div>
    `
        : ''
    }
  `);

  $contactModal.show();
}

// Inicialização da página
$(document).ready(() => {
  const itemId = getItemIdFromUrl();

  if (!itemId) {
    showError();
    return;
  }

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
