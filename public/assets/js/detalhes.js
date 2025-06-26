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

    // Verificar se o item tem informações do dono (para itens devolvidos)
    if (item.status === 'returned' && item.ownerInfo) {
      // Mostrar a seção de informações do dono
      $('#owner-info-section').removeClass('d-none');

      // Preencher os dados do dono
      $('#owner-name').text(item.ownerInfo.name || 'Nome não informado');

      // Formatar o tipo do dono (estudante, funcionário, visitante)
      let tipoTexto = 'Não informado';
      if (item.ownerInfo.type === 'student') tipoTexto = 'Estudante';
      if (item.ownerInfo.type === 'staff') tipoTexto = 'Funcionário';
      if (item.ownerInfo.type === 'visitor') tipoTexto = 'Visitante';

      $('#owner-type').text(tipoTexto);

      // Mostrar contato (telefone e/ou email)
      const contatoTexto = [];
      if (item.ownerInfo.phone) contatoTexto.push(item.ownerInfo.phone);
      if (item.ownerInfo.email) contatoTexto.push(item.ownerInfo.email);

      $('#owner-contact').text(
        contatoTexto.join(' • ') || 'Contato não informado'
      );

      // Atualizar o texto do botão de contato
      $('#contact-button').html(
        '<i class="ri-information-line me-2"></i> Ver detalhes da devolução'
      );
    } else {
      // Esconder a seção de informações do dono caso não seja um item devolvido
      $('#owner-info-section').addClass('d-none');

      // Manter o texto padrão do botão de contato
      $('#contact-button').html(
        '<i class="ri-chat-3-line me-2"></i> Entrar em contato'
      );
    }

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

  // Verificar se é um item devolvido e tem informações do dono
  if (currentItem?.status === 'returned' && currentItem?.ownerInfo) {
    const ownerInfo = currentItem.ownerInfo;

    // Atualizar título do modal para indicar que são informações do dono
    $('#contactModalLabel').text('Informações de Devolução');

    // Formatar o tipo do dono
    let tipoTexto = 'Não informado';
    if (ownerInfo.type === 'student') tipoTexto = 'Estudante';
    if (ownerInfo.type === 'staff') tipoTexto = 'Funcionário';
    if (ownerInfo.type === 'visitor') tipoTexto = 'Visitante';

    // Atualiza o modal com as informações do dono e informações de contato
    $modalBody.html(`
      <div class="text-center mb-4">
        <div class="author-avatar mx-auto mb-3 bg-success bg-opacity-10">
          <i class="ri-user-received-fill text-success"></i>
        </div>
        <h5 class="mb-1">${ownerInfo.name || 'Nome não informado'}</h5>
        <span class="badge rounded-pill bg-success bg-opacity-10 text-success mb-2">${tipoTexto}</span>
      </div>
      
      <div class="row">
        ${
          ownerInfo.phone
            ? `
        <div class="col-md-6 mb-3">
          <div class="card contact-card">
            <div class="card-body text-center">
              <div class="contact-icon mb-3">
                <i class="ri-whatsapp-line"></i>
              </div>
              <h6 class="card-title">WhatsApp</h6>
              <p class="card-text text-muted">${ownerInfo.phone}</p>
              <a href="https://wa.me/${ownerInfo.phone.replace(/\D/g, '')}" target="_blank" class="btn btn-success w-100">
                <i class="ri-whatsapp-line me-2"></i>Enviar Mensagem
              </a>
            </div>
          </div>
        </div>
        `
            : ''
        }
        
        ${
          ownerInfo.email
            ? `
        <div class="col-md-${ownerInfo.phone ? '6' : '12'} mb-3">
          <div class="card contact-card">
            <div class="card-body text-center">
              <div class="contact-icon mb-3">
                <i class="ri-mail-line"></i>
              </div>
              <h6 class="card-title">E-mail</h6>
              <p class="card-text text-muted">${ownerInfo.email}</p>
              <a href="mailto:${ownerInfo.email}?subject=Sobre seu item no FindForMe" class="btn btn-primary w-100">
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
        !ownerInfo.phone && !ownerInfo.email
          ? `
      <div class="alert alert-warning">
        <i class="ri-information-line me-2"></i>Este dono não possui informações de contato.
      </div>
      `
          : ''
      }
    `);
  } else {
    // Resetar o título do modal para o padrão
    $('#contactModalLabel').text('Informações de Contato');

    // Continuar com o comportamento original para itens não devolvidos
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
