import { getLoggedUser } from './auth.js';
import { showToast } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const catSel = document.getElementById('category');
  const locSel = document.getElementById('location');
  const imagePreview = document.getElementById('imagePreview');
  const form = document.getElementById('lost-item-form');
  const photoUrlInput = document.getElementById('photoUrl');

  async function loadSelectData() {
    try {
      const [catRes, locRes] = await Promise.all([
        fetch('http://localhost:3000/categories'),
        fetch('http://localhost:3000/locations'),
      ]);

      const [categories, locations] = await Promise.all([
        catRes.json(),
        locRes.json(),
      ]);

      categories.forEach((cat) => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        catSel.appendChild(opt);
      });

      locations.forEach((loc) => {
        const opt = document.createElement('option');
        opt.value = loc.id;
        opt.textContent = loc.name;
        locSel.appendChild(opt);
      });
    } catch (error) {
      console.error('Erro ao carregar categorias ou locais:', error);
      showToast(
        'Erro ao carregar categorias ou locais. Tente novamente mais tarde.',
        'danger'
      );
    }
  }

  loadSelectData();

  // Atualiza o preview da imagem ao digitar/colar o link
  photoUrlInput.addEventListener('input', function () {
    const url = this.value.trim();
    if (url) {
      imagePreview.src = url;
      imagePreview.classList.remove('d-none');
    } else {
      imagePreview.src = './assets/img/placeholder.svg';
      imagePreview.classList.add('d-none');
    }
  });

  // Submissão do formulário
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const user = getLoggedUser();
    if (!user) {
      showToast(
        'Você precisa estar logado para registrar um item perdido.',
        'warning'
      );
      setTimeout(() => {
        window.location.href = 'login-usuario.html';
      }, 1500);
      return;
    }

    const title =
      document.getElementById('title')?.value.trim() ||
      document.getElementById('name').value.trim();
    const description = document.getElementById('description').value.trim();
    const categoryId = parseInt(catSel.value);
    const locationId = parseInt(locSel.value);
    const lostAt = new Date(
      document.getElementById('lostAt').value
    ).toISOString();

    // Usa o link informado pelo usuário
    let photoUrl = photoUrlInput.value.trim();
    if (!photoUrl) {
      photoUrl = './assets/img/placeholder.svg';
    }

    const newItem = {
      name: title,
      description,
      locationId,
      categoryId,
      status: 'lost',
      photoUrl,
      reportedBy: user.id,
      lostAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('http://localhost:3000/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (!res.ok) throw new Error('Erro ao registrar o item.');

      showToast('Item perdido registrado com sucesso!', 'success');
      form.reset();
      imagePreview.src = './assets/img/placeholder.svg';
      imagePreview.classList.add('d-none');

      // Redireciona após um breve intervalo
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } catch (error) {
      console.error(error);
      showToast('Erro ao registrar o item.', 'danger');
    }
  });
});
