import { getLoggedUser } from './auth.js';
import { showToast } from './toast.js';

// Busca notificações do usuário no servidor
async function fetchUserNotifications(userId) {
  try {
    const res = await fetch(
      `http://localhost:3000/notifications?userId=${userId}&_sort=createdAt&_order=desc`
    );
    return res.ok ? await res.json() : [];
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }
}

// Formata o tempo relativo para exibição amigável (ex: há 5 minutos)
function getRelativeTimeText(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 7) return `${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
  return date.toLocaleDateString('pt-BR');
}

// Renderiza o dropdown de notificações
function renderNotifications(notifications) {
  const notifIcon = document.getElementById('notification-icon');
  const notifDropdown = document.getElementById('notification-dropdown');
  if (!notifIcon || !notifDropdown) return;

  notifIcon.classList.remove('d-none');
  notifDropdown.innerHTML = '';

  // Contar notificações não lidas
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Adicionar cabeçalho com contagem
  const headerHtml = `
    <div class="notification-header">
      <h6>Notificações ${unreadCount > 0 ? `<span class="ms-2 badge bg-danger">${unreadCount}</span>` : ''}</h6>
      ${unreadCount > 0 ? `<a href="#" class="notification-clear-all" id="mark-all-read">Marcar todas como lidas</a>` : ''}
    </div>
  `;
  notifDropdown.innerHTML = headerHtml;

  // Verificar se há notificações
  if (!notifications.length) {
    notifDropdown.innerHTML += `
      <div class="notification-empty">
        <i class="ri-notification-off-line"></i>
        <p>Nenhuma notificação no momento</p>
      </div>
    `;
    notifIcon.classList.remove('has-unread');
    return;
  }

  // Adicionar contador no ícone
  if (unreadCount > 0) {
    notifIcon.innerHTML = `
      <i class="ri-notification-line"></i>
      ${unreadCount > 1 ? `<span class="notification-count">${unreadCount > 99 ? '99+' : unreadCount}</span>` : ''}
    `;
    notifIcon.classList.add('has-unread');
  } else {
    notifIcon.innerHTML = `<i class="ri-notification-line"></i>`;
    notifIcon.classList.remove('has-unread');
  }

  // Adicionar lista de notificações
  const notificationList = document.createElement('div');
  notificationList.className = 'notification-list';

  // Renderizar cada notificação
  notifications.forEach((notif) => {
    const notifDate = new Date(notif.createdAt);
    const timeText = getRelativeTimeText(notifDate);

    const notificationItem = document.createElement('div');
    notificationItem.className = `notification-item position-relative ${notif.read ? '' : 'unread'}`;
    notificationItem.dataset.itemId = notif.relatedItemId || '';
    notificationItem.dataset.notifId = notif.id;

    // Usar ícone específico para itens encontrados
    notificationItem.innerHTML = `
      <a href="#" class="notification-link">
        <div class="notification-content">
          <div class="notification-icon">
            <i class="ri-checkbox-circle-line"></i>
          </div>
          <div class="notification-text" data-category="Encontrado">
            <h6 class="notification-title">${notif.title}</h6>
            <p class="notification-message">${notif.message}</p>
            <span class="notification-time">${timeText}</span>
          </div>
        </div>
      </a>
    `;

    notificationList.appendChild(notificationItem);
  });

  notifDropdown.appendChild(notificationList);

  // Adicionar footer para consistência visual
  const footerHtml = `<div class="notification-footer"></div>`;
  notifDropdown.innerHTML += footerHtml;

  // Configurar evento de marcar todas como lidas
  setupMarkAllReadButton(notifications);
}

// Configura o botão "marcar todas como lidas"
function setupMarkAllReadButton(notifications) {
  const markAllReadBtn = document.getElementById('mark-all-read');
  if (!markAllReadBtn) return;

  markAllReadBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const user = getLoggedUser();
    if (!user) return;

    // Mostrar feedback visual
    markAllReadBtn.innerHTML =
      '<i class="ri-loader-2-line ri-spin"></i> Processando...';

    // Obter todas notificações não lidas
    const unreadNotifs = notifications.filter((n) => !n.read);

    try {
      // Marcar todas como lidas em paralelo
      await Promise.all(
        unreadNotifs.map((notif) =>
          fetch(`http://localhost:3000/notifications/${notif.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ read: true }),
          })
        )
      );

      // Atualizar a interface
      document.querySelectorAll('.notification-item.unread').forEach((item) => {
        item.classList.remove('unread');
      });

      // Atualizar o header e ícone
      const notifHeader = document.querySelector('.notification-header');
      if (notifHeader) notifHeader.innerHTML = '<h6>Notificações</h6>';

      const notifIcon = document.getElementById('notification-icon');
      if (notifIcon) {
        notifIcon.classList.remove('has-unread');
        notifIcon.innerHTML = '<i class="ri-notification-line"></i>';
      }
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
      markAllReadBtn.innerHTML = 'Marcar todas como lidas';
    }
  });
}

// Configura o clique nas notificações
function setupNotificationClick() {
  const notifDropdown = document.getElementById('notification-dropdown');
  if (!notifDropdown) return;

  notifDropdown.addEventListener('click', async (e) => {
    const notificationItem = e.target.closest('.notification-item');
    if (!notificationItem) return;
    if (e.target.closest('.notification-footer')) return;

    e.preventDefault();
    e.stopPropagation();

    const itemId = notificationItem.dataset.itemId;
    const notifId = notificationItem.dataset.notifId;
    if (!notifId) return;

    // Adicionar efeito de ripple
    const ripple = document.createElement('span');
    ripple.className = 'notification-ripple';
    notificationItem.appendChild(ripple);
    notificationItem.classList.add('clicked');

    try {
      // Marcar como lida
      await fetch(`http://localhost:3000/notifications/${notifId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });

      // Redirecionar após breve delay para efeito visual
      setTimeout(async () => {
        notificationItem.classList.remove('unread');

        // Verificar se ainda há notificações não lidas
        const user = getLoggedUser();
        if (user) {
          const notifs = await fetchUserNotifications(user.id);
          const hasUnread = notifs.some((n) => !n.read);

          const notifIcon = document.getElementById('notification-icon');
          if (notifIcon && !hasUnread) {
            notifIcon.classList.remove('has-unread');
            notifIcon.innerHTML = '<i class="ri-notification-line"></i>';

            const badge = document.querySelector('.notification-header .badge');
            if (badge) badge.remove();
          }
        }

        // Redirecionar para detalhes do item se disponível
        if (itemId) {
          window.location.href = `detalhes.html?id=${itemId}`;
        }
      }, 300);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      notificationItem.classList.remove('clicked');
      setTimeout(() => ripple.remove(), 600);
    }
  });
}

// Inicializa o sistema de notificações
export async function initNotifications(pollInterval = 60000) {
  const user = getLoggedUser();
  if (!user) return;

  try {
    // Carregar notificações iniciais
    const notifications = await fetchUserNotifications(user.id);
    renderNotifications(notifications);
    setupNotificationClick();

    // Verificar periodicamente por novas notificações
    if (pollInterval > 0) {
      let lastNotificationCount = notifications.length;

      setInterval(async () => {
        const updatedNotifications = await fetchUserNotifications(user.id);

        // Se houver novas notificações
        if (updatedNotifications.length > lastNotificationCount) {
          const newCount = updatedNotifications.length - lastNotificationCount;
          renderNotifications(updatedNotifications);

          // Atualizar contagem
          lastNotificationCount = updatedNotifications.length;

          // Mostrar toast informativo
          if (typeof showToast === 'function' && newCount > 0) {
            showToast(
              `${newCount} nova${newCount > 1 ? 's' : ''} notificação${newCount > 1 ? 'ões' : ''}`,
              'info'
            );
          }
        }
      }, pollInterval);
    }
  } catch (error) {
    console.error('Erro ao inicializar notificações:', error);
  }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initNotifications);
