import { getLoggedUser } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const catSel = document.getElementById('category');
  const locSel = document.getElementById('location');
  const imagePreview = document.getElementById('imagePreview');
  const form = document.getElementById('lost-item-form');

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
      alert(
        'Erro ao carregar categorias ou locais. Tente novamente mais tarde.'
      );
    }
  }

  loadSelectData();

  // Preview da imagem
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

  // Submissão do formulário
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const user = getLoggedUser();
    if (!user) {
      alert('Você precisa estar logado para registrar um item perdido.');
      window.location.href = 'login-usuario.html';
      return;
    }

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const categoryId = parseInt(catSel.value);
    const locationId = parseInt(locSel.value);
    const lostAt = new Date(
      document.getElementById('lostAt').value
    ).toISOString();

    const photoInput = document.getElementById('photo');
    let photoUrl = '';
    if (photoInput.files.length > 0) {
      photoUrl = '/photos/default-lost.jpg'; // Placeholder
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

      alert('Item perdido registrado com sucesso!');
      form.reset();
      imagePreview.textContent = 'Imagem';
    } catch (error) {
      console.error(error);
      alert('Erro ao registrar o item.');
    }
  });
});
