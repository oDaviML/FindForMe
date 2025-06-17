import { getLoggedUser } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const catSel = document.getElementById('category');
  const locSel = document.getElementById('location');
  const imagePreview = document.getElementById('imagePreview');
  const form = document.getElementById('found-item-form');

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

  document.getElementById('photo').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">`;
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.textContent = 'Imagem';
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

    let photoUrl = '';
    const file = document.getElementById('photo').files[0];
    if (file) {
      photoUrl = '/photos/default-found.jpg'; // Placeholder
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
      imagePreview.textContent = 'Imagem';
    } catch (error) {
      console.error(error);
      alert('Erro ao registrar o item encontrado.');
    }
  });
});
