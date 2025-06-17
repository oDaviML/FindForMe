$(document).ready(function () {
  const API_BASE_URL = 'http://localhost:3000';
  let categorias = [];
  let locais = [];
  const usuarioId = 1; // ID estático, altere quando houver login

  function carregarCategoriasELocais() {
    $.when(
      $.get(`${API_BASE_URL}/categories`),
      $.get(`${API_BASE_URL}/locations`)
    ).done(function (cats, locs) {
      categorias = cats[0];
      locais = locs[0];
      renderizarSelects();
    });
  }

  function renderizarSelects() {
    const $cat = $('#category');
    const $loc = $('#location');
    $cat.empty();
    $loc.empty();
    $cat.append('<option value="">Selecione</option>');
    $loc.append('<option value="">Selecione</option>');
    categorias.forEach((c) => $cat.append(`<option value="${c.id}">${c.name}</option>`));
    locais.forEach((l) => $loc.append(`<option value="${l.id}">${l.name}</option>`));
  }

  $('#photo').on('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        $('#imagePreview').attr('src', ev.target.result).removeClass('d-none');
      };
      reader.readAsDataURL(file);
    }
  });

  $('#lost-item-form').on('submit', function (e) {
    e.preventDefault();
    const nome = $('#name').val().trim();
    const descricao = $('#description').val().trim();
    const categoria = $('#category').val();
    const local = $('#location').val();
    const file = $('#photo')[0].files[0];
    const lostAt = $('#lostAt').val();
    if (!nome || !categoria || !local || !lostAt) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    let photoUrl = '';
    if (file) {
      photoUrl = `/assets/imagens_itens/${Date.now()}_${file.name}`;
      // Simula upload (em produção, faria upload real)
    }
    const item = {
      name: nome,
      description: descricao,
      categoryId: Number(categoria),
      locationId: Number(local),
      status: 'lost',
      photoUrl: photoUrl,
      reportedBy: usuarioId,
      lostAt: lostAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    $.post(`${API_BASE_URL}/items`, item)
      .done(function () {
        alert('Item cadastrado com sucesso!');
        window.location.href = 'pesquisa.html';
      })
      .fail(function () {
        alert('Erro ao cadastrar item.');
      });
  });

  carregarCategoriasELocais();
});
