import { getLoggedUser } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const userInfo = document.getElementById('user-info');
  const user = getLoggedUser();

  if (!userInfo) return;

  if (user) {
    userInfo.innerHTML = `
      <span class="me-2 text-dark fw-semibold" title="${user.email}">
        ${user.name.split(' ')[0]}
      </span>
      <button id="logoutBtn" class="btn btn-outline-secondary btn-sm">Sair</button>
    `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('loggedUser');
      location.reload();
    });
  } else {
    userInfo.innerHTML = `
      <a href="login-usuario.html" class="btn btn-outline-dark btn-sm">
        Entrar
      </a>
    `;
  }
});
