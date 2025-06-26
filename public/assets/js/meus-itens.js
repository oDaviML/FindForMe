import { getLoggedUser } from './auth.js';
import { showToast } from './toast.js';

$(document).ready(function () {
  const user = getLoggedUser();
  if (!user) {
    window.location.href = 'login-usuario.html';
    return;
  }

  loadUserItems(user.id);
  loadCategories();
  loadLocations();

  // Event listener para abrir o modal de edição
  $(document).on('click', '.item-card', function () {
    const itemId = $(this).data('item-id');
    // Prevenir eventos padrão para garantir que o modal abra corretamente
    loadItemDetailsIntoModal(itemId);
    return false;
  });

  // Event listener para salvar as alterações do item
  $('#saveChangesBtn').on('click', function () {
    saveItemChanges();
  });
});

// Função para carregar categorias disponíveis
async function loadCategories() {
  try {
    const response = await fetch('http://localhost:3000/categories');
    const categories = await response.json();

    const categorySelect = $('#edit-itemCategory');
    categorySelect.empty();

    categories.forEach((category) => {
      categorySelect.append(
        `<option value="${category.id}">${category.name}</option>`
      );
    });

    return categories;
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    return [];
  }
}

// Função para carregar locais disponíveis
async function loadLocations() {
  try {
    const response = await fetch('http://localhost:3000/locations');
    const locations = await response.json();

    const locationSelect = $('#edit-itemLocation');
    locationSelect.empty();

    locations.forEach((location) => {
      locationSelect.append(
        `<option value="${location.id}">${location.name}</option>`
      );
    });

    return locations;
  } catch (error) {
    console.error('Erro ao carregar locais:', error);
    return [];
  }
}

async function loadUserItems(userId) {
  try {
    const response = await fetch(
      `http://localhost:3000/items?reportedBy=${userId}&_expand=category&_expand=location`
    );
    const items = await response.json();
    renderItems(items);
  } catch (error) {
    console.error('Erro ao carregar os itens do usuário:', error);
  }
}

function renderItems(items) {
  const itemsList = $('#items-list');
  itemsList.empty();

  if (items.length === 0) {
    itemsList.html(`
      <div class="col-12 text-center py-5">
        <i class="ri-file-list-3-line fs-1 text-secondary mb-3"></i>
        <h5>Nenhum item cadastrado</h5>
        <p class="text-secondary">Você ainda não cadastrou nenhum item perdido ou encontrado.</p>
        <div class="mt-4">
          <a href="cadastro-item-perdido.html" class="btn btn-primary me-2">
            <i class="ri-search-line me-1"></i> Cadastrar Item Perdido
          </a>
          <a href="cadastro-item-encontrado.html" class="btn btn-outline-primary">
            <i class="ri-hand-heart-line me-1"></i> Cadastrar Item Encontrado
          </a>
        </div>
      </div>
    `);
    return;
  }

  items.forEach((item) => {
    const statusClass = `badge-${item.status}`;
    const statusLabel = getStatusLabel(item.status);
    const itemCard = `
      <div class="col-lg-4 col-md-6 col-12 mb-4">
        <div class="item-card" data-item-id="${item.id}">
          <div class="item-image">
            <img src="${item.photoUrl ? item.photoUrl : './assets/img/placeholder.svg'}" alt="${item.name}" 
                 onerror="this.src='./assets/img/placeholder.svg'" />
          </div>
          <div class="item-body">
            <h5 class="item-title">${item.name}</h5>
            <p class="item-description">${item.description || 'Sem descrição'}</p>
            <div class="item-meta">
              <span><i class="ri-price-tag-3-line"></i> ${item.category?.name || 'Sem categoria'}</span>
              <span class="item-badge ${statusClass}">${statusLabel}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    itemsList.append(itemCard);
  });
}

async function loadItemDetailsIntoModal(itemId) {
  // Mostrar o modal com indicador de carregamento
  const editModal = new bootstrap.Modal($('#editItemModal'));

  // Resetar o formulário e mostrar indicador de carregamento
  $('#editItemForm').html(`
    <div class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
      <p class="mt-2">Carregando dados do item...</p>
    </div>
  `);

  // Desabilitar botão de salvar enquanto carrega
  $('#saveChangesBtn').prop('disabled', true);

  // Mostrar o modal vazio enquanto carrega
  editModal.show();

  try {
    // Carregar dados do item com detalhes expandidos
    const response = await fetch(
      `http://localhost:3000/items/${itemId}?_expand=category&_expand=location`
    );
    const item = await response.json();

    // Restaurar o formulário
    $('#editItemForm').html(`
      <input type="hidden" id="edit-itemId" />
      <div class="mb-3">
        <label for="edit-itemName" class="form-label">Nome do Item</label>
        <input type="text" class="form-control" id="edit-itemName" required />
      </div>
      <div class="mb-3">
        <label for="edit-itemDescription" class="form-label">Descrição</label>
        <textarea class="form-control" id="edit-itemDescription" rows="3" required></textarea>
      </div>
      <div class="mb-3">
        <label for="edit-itemCategory" class="form-label">Categoria</label>
        <select class="form-select" id="edit-itemCategory" required>
          <!-- Categorias serão carregadas dinamicamente -->
        </select>
      </div>
      <div class="mb-3">
        <label for="edit-itemLocation" class="form-label">Local</label>
        <select class="form-select" id="edit-itemLocation" required>
          <!-- Locais serão carregados dinamicamente -->
        </select>
      </div>
      <div class="mb-3">
        <label for="edit-itemStatus" class="form-label">Status</label>
        <select class="form-select" id="edit-itemStatus" required>
          <option value="lost">Perdido</option>
          <option value="found">Encontrado</option>
          <option value="returned">Devolvido</option>
        </select>
      </div>
      
      <!-- Campos adicionais para devolução, inicialmente ocultos -->
      <div id="returned-fields" style="display: none;">
        <hr>
        <h5>Informações do Dono</h5>
        <div class="mb-3">
          <label for="owner-name" class="form-label">Nome do Dono</label>
          <input type="text" class="form-control" id="owner-name" />
        </div>
        <div class="mb-3">
          <label for="owner-phone" class="form-label">Telefone</label>
          <input type="tel" class="form-control" id="owner-phone" />
        </div>
        <div class="mb-3">
          <label for="owner-email" class="form-label">Email</label>
          <input type="email" class="form-control" id="owner-email" />
        </div>
        <div class="mb-3">
          <label for="owner-type" class="form-label">Tipo</label>
          <select class="form-select" id="owner-type">
            <option value="student">Estudante</option>
            <option value="staff">Funcionário</option>
            <option value="visitor">Visitante</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="return-notes" class="form-label">Observações</label>
          <textarea class="form-control" id="return-notes" rows="2"></textarea>
        </div>
      </div>
    `);

    // Preencher os campos com os valores do item
    $('#edit-itemId').val(item.id);
    $('#edit-itemName').val(item.name);
    $('#edit-itemDescription').val(item.description);

    // Carregando categoria e local corretamente - aguardar que sejam carregados
    await Promise.all([
      loadCategories().then(() => $('#edit-itemCategory').val(item.categoryId)),
      loadLocations().then(() => $('#edit-itemLocation').val(item.locationId)),
    ]);

    $('#edit-itemStatus').val(item.status);

    // Mostrar campos de devolução se o status for "returned"
    if (item.status === 'returned') {
      $('#returned-fields').show();
    }

    // Adicionar listener para mostrar/ocultar campos de devolução quando o status mudar
    $('#edit-itemStatus').on('change', function () {
      if ($(this).val() === 'returned') {
        $('#returned-fields').show();
      } else {
        $('#returned-fields').hide();
      }
    });

    // Mostrar o título do modal com o nome do item
    $('#editItemModalLabel').text(`Editar Item: ${item.name}`);

    // Habilitar botão de salvar
    $('#saveChangesBtn').prop('disabled', false);
  } catch (error) {
    console.error('Erro ao carregar detalhes do item:', error);
    showToast('Erro ao carregar detalhes do item', 'danger');

    // Fechar o modal em caso de erro
    editModal.hide();
  }
}

async function saveItemChanges() {
  const itemId = $('#edit-itemId').val();

  // Desabilita o botão de salvar e mostra indicador de carregamento
  const $saveBtn = $('#saveChangesBtn');
  const originalBtnText = $saveBtn.html();
  $saveBtn
    .prop('disabled', true)
    .html(
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Salvando...'
    );

  try {
    // Primeiro, obtem o item atual para preservar os campos que não estamos editando
    const getItemResponse = await fetch(
      `http://localhost:3000/items/${itemId}`
    );
    const currentItem = await getItemResponse.json();
    const newStatus = $('#edit-itemStatus').val();
    const statusChanged = currentItem.status !== newStatus;

    // Capturar informações do usuário logado
    const loggedUser = getLoggedUser();

    // Manter os dados originais e atualizar apenas os campos do formulário
    const updatedItem = {
      ...currentItem,
      name: $('#edit-itemName').val(),
      description: $('#edit-itemDescription').val(),
      categoryId:
        parseInt($('#edit-itemCategory').val()) || currentItem.categoryId,
      locationId:
        parseInt($('#edit-itemLocation').val()) || currentItem.locationId,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    // Se o status foi alterado para "returned", adicionar informações do dono
    if (newStatus === 'returned') {
      updatedItem.ownerInfo = {
        name: $('#owner-name').val(),
        phone: $('#owner-phone').val(),
        email: $('#owner-email').val(),
        type: $('#owner-type').val(),
      };
    }

    const response = await fetch(`http://localhost:3000/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedItem),
    });

    if (response.ok) {
      // Se houve mudança de status, registrar no histórico
      if (statusChanged) {
        let notes = '';

        // Criar mensagem específica para cada tipo de mudança de status
        if (newStatus === 'returned') {
          const ownerName = $('#owner-name').val();
          const ownerType = $('#owner-type').val();
          const returnNotes = $('#return-notes').val();

          let ownerTypeText = '';
          switch (ownerType) {
            case 'student':
              ownerTypeText = 'estudante';
              break;
            case 'staff':
              ownerTypeText = 'funcionário';
              break;
            case 'visitor':
              ownerTypeText = 'visitante';
              break;
          }

          notes = `Item devolvido para ${ownerName} (${ownerTypeText})`;
          if (returnNotes) {
            notes += `. Obs: ${returnNotes}`;
          }
        } else if (newStatus === 'found') {
          notes = 'Item marcado como encontrado';
        } else if (newStatus === 'lost') {
          notes = 'Item marcado como perdido';
        }

        // Obter o último ID do histórico para incrementar
        const historyRes = await fetch(
          'http://localhost:3000/itemHistory?_sort=id&_order=desc&_limit=1'
        );
        const lastHistory = await historyRes.json();
        const newHistoryId = lastHistory.length > 0 ? lastHistory[0].id + 1 : 1;

        // Criar nova entrada no histórico
        const historyEntry = {
          id: newHistoryId,
          itemId: parseInt(itemId),
          status: newStatus,
          notes: notes,
          changedBy: loggedUser.id,
          createdAt: new Date().toISOString(),
        };

        // Se for devolução, adicionar informações do dono
        if (newStatus === 'returned') {
          historyEntry.ownerInfo = {
            name: $('#owner-name').val(),
            phone: $('#owner-phone').val(),
            email: $('#owner-email').val(),
            type: $('#owner-type').val(),
          };
        }

        // Salvar no histórico
        await fetch('http://localhost:3000/itemHistory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(historyEntry),
        });
      }

      // Primeiro recarrega a lista de itens
      await loadUserItems(getLoggedUser().id);

      // Só então fecha o modal, evitando a tela preta
      const editModal = bootstrap.Modal.getInstance($('#editItemModal'));
      editModal.hide();

      // Exibe mensagem após o modal fechar
      setTimeout(() => {
        showToast('Item atualizado com sucesso!', 'success');
      }, 300);
    } else {
      showToast('Falha ao atualizar o item.', 'danger');
    }
  } catch (error) {
    console.error('Erro ao salvar as alterações do item:', error);
    showToast('Ocorreu um erro ao atualizar o item.', 'danger');
  } finally {
    // Restaura o estado do botão
    $saveBtn.prop('disabled', false).html(originalBtnText);
  }
}

// Funções utilitárias para exibir o status do item
function getStatusLabel(status) {
  switch (status) {
    case 'lost':
      return 'Perdido';
    case 'found':
      return 'Encontrado';
    case 'returned':
      return 'Devolvido';
    default:
      return status;
  }
}
