/**
 * Sistema de notificação toast para ser usado em todo o projeto
 * Substitui os alerts padrão por notificações estilizadas
 */

/**
 * Exibe uma mensagem toast personalizada
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo de toast: 'success', 'danger', 'warning', 'info'
 * @param {number} duration - Duração em milissegundos (padrão: 3000ms)
 */
export function showToast(message, type = 'success', duration = 3000) {
  // Cria o container de toasts se não existir
  if (!$('#toast-container').length) {
    $('body').append(`
      <div id="toast-container" class="position-fixed bottom-0 end-0 p-3" style="z-index: 1500"></div>
    `);
  }

  // Gera ID único para o toast
  const toastId = 'toast-' + Date.now();

  // Determina classes e ícone baseados no tipo
  let bgClass, icon;

  switch (type) {
    case 'success':
      bgClass = 'bg-success';
      icon = 'ri-checkbox-circle-line';
      break;
    case 'danger':
    case 'error':
      bgClass = 'bg-danger';
      icon = 'ri-error-warning-line';
      break;
    case 'warning':
      bgClass = 'bg-warning';
      icon = 'ri-alert-line';
      break;
    case 'info':
    default:
      bgClass = 'bg-info';
      icon = 'ri-information-line';
      break;
  }

  // Adiciona o toast ao container
  $('#toast-container').append(`
    <div id="${toastId}" class="toast align-items-center ${bgClass} text-white border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <i class="${icon} me-2"></i> ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `);

  // Inicializa e mostra o toast
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    delay: duration,
  });
  toast.show();

  // Remove o toast do DOM após ele ser escondido
  $(toastElement).on('hidden.bs.toast', function () {
    $(this).remove();
  });
}
