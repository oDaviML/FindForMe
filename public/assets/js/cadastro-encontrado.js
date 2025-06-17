import { getLoggedUser } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const catSel = document.getElementById('category');
  const locSel = document.getElementById('location');
  const imagePreview = document.getElementById('imagePreview');
  const form = document.getElementById('found-item-form');
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
    } catch (err) {
      console.error('Erro ao carregar categorias/locais:', err);
      alert('Erro ao carregar categorias e locais.');
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

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const user = getLoggedUser();
    if (!user) {
      alert('Você precisa estar logado para registrar um item encontrado.');
      window.location.href = 'login-usuario.html';
      return;
    }

    const name = document.getElementById('name').value.trim();
    const description = document.getElementById('description').value.trim();
    const categoryId = parseInt(catSel.value);
    const locationId = parseInt(locSel.value);
    const foundAt = new Date(
      document.getElementById('foundAt').value
    ).toISOString();

    // Usa o link informado pelo usuário
    let photoUrl = photoUrlInput.value.trim();
    if (!photoUrl) {
      photoUrl = './assets/img/placeholder.svg';
    }

    const newItem = {
      name,
      description,
      locationId,
      categoryId,
      status: 'found',
      photoUrl,
      reportedBy: user.id,
      foundAt,
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

      alert('Item encontrado registrado com sucesso!');
      form.reset();
      imagePreview.src = './assets/img/placeholder.svg';
      imagePreview.classList.add('d-none');
    } catch (error) {
      console.error(error);
      alert('Erro ao registrar o item encontrado.');
    }
  });
});
