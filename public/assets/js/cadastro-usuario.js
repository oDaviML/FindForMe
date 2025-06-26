import { showToast } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');

  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          createdAt,
          updatedAt,
        }),
      });

      if (response.ok) {
        showToast('Usuário registrado com sucesso!', 'success');
        setTimeout(() => {
          window.location.href = 'login-usuario.html';
        }, 1000);
      } else {
        showToast('Erro ao registrar. Tente novamente.', 'danger');
      }
    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao conectar com o servidor.', 'danger');
    }
  });
});
