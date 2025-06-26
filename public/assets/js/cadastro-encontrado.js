import { getLoggedUser } from './auth.js';
import { showToast } from './toast.js';

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
      showToast('Erro ao carregar categorias e locais.', 'danger');
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
      showToast(
        'Você precisa estar logado para registrar um item encontrado.',
        'warning'
      );
      setTimeout(() => {
        window.location.href = 'login-usuario.html';
      }, 1500);
      return;
    }

    const name = document.getElementById('name').value.trim();
    const description = document.getElementById('description').value.trim();
    const categoryId = parseInt(catSel.value);
    const locationId = parseInt(locSel.value);
    const foundAt = new Date(
      document.getElementById('foundAt').value
    ).toISOString();

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

      const createdItem = await res.json();

      try {
        const lostRes = await fetch(`http://localhost:3000/items?status=lost`);
        const lostItems = await lostRes.json();
        function isSimilar(a, b) {
          if (!a || !b) return false;
          const aNorm = a.toLowerCase();
          const bNorm = b.toLowerCase();
          return (
            aNorm.includes(bNorm) ||
            bNorm.includes(aNorm) ||
            aNorm.split(' ').some((w) => bNorm.includes(w) && w.length > 3)
          );
        }
        const similarLost = lostItems.find(
          (item) =>
            isSimilar(item.name, name) ||
            isSimilar(item.description, description)
        );
        if (similarLost) {
          const userRes = await fetch(
            `http://localhost:3000/users/${similarLost.reportedBy}`
          );
          const lostUser = await userRes.json();
          if (lostUser && lostUser.id) {
            await fetch('http://localhost:3000/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: lostUser.id,
                title: 'Item semelhante encontrado',
                message: `Um item semelhante ao que você perdeu foi encontrado. Veja os detalhes!`,
                relatedItemId: createdItem.id,
                read: false,
                createdAt: new Date().toISOString(),
              }),
            });
          }
        }
      } catch (notifyErr) {
        console.warn(
          'Não foi possível notificar usuário de item perdido:',
          notifyErr
        );
      }

      showToast('Item encontrado registrado com sucesso!', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } catch (error) {
      console.error(error);
      showToast('Erro ao registrar o item encontrado.', 'danger');
    }
  });
});
