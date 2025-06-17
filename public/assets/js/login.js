document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    try {
      const response = await fetch(
        `http://localhost:3000/users?email=${email}&password=${senha}`
      );
      const users = await response.json();

      if (users.length > 0) {
        const user = users[0];
        localStorage.setItem('loggedUser', JSON.stringify(user));

        alert('Login bem-sucedido!');
        window.location.href = 'index.html';
      } else {
        alert('E-mail ou senha incorretos!');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert(
        'Erro ao tentar fazer login. Verifique sua conexão com o servidor.'
      );
    }
  });
});
