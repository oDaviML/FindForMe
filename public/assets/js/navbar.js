import { getLoggedUser } from './auth.js';

$(document).ready(function () {
  // Carrega o header reutilizável
  $('#header-container').load('header.html', function () {
    // Define o título da página dinamicamente
    const pageTitle = document.title.split('-')[1]?.trim() || 'FindForMe';
    $('#page-title-placeholder').text(pageTitle);

    setupUserMenu();
  });
});

function setupUserMenu() {
  const user = getLoggedUser();
  const userMenu = $('#user-menu');

  if (user) {
    userMenu.html(`
      <button class="btn border-0 dropdown-toggle d-flex align-items-center" type="button" id="userMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="ri-user-line me-2"></i>
        <span class="fw-semibold">${user.name.split(' ')[0]}</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuButton">
        <li><a class="dropdown-item" href="meus-itens.html">Meus Itens</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item" id="logoutBtn">Sair</button></li>
      </ul>
    `);

    $('#logoutBtn').on('click', () => {
      localStorage.removeItem('loggedUser');
      window.location.href = 'login-usuario.html';
    });
  } else {
    userMenu.html(`
      <a href="login-usuario.html" class="btn btn-outline-dark btn-sm">
        <i class="ri-login-box-line me-1"></i>
        Entrar
      </a>
    `);
  }
}
