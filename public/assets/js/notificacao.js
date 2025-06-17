import { getLoggedUser } from './auth.js';

async function fetchUserNotifications(userId) {
  const res = await fetch(
    `http://localhost:3000/notifications?userId=${userId}&_sort=createdAt&_order=desc`
  );
  return res.ok ? res.json() : [];
}

function renderNotifications(notifications) {
  const notifIcon = document.getElementById('notification-icon');
  const notifDropdown = document.getElementById('notification-dropdown');
  if (!notifIcon || !notifDropdown) return;

  notifIcon.classList.remove('d-none');
  notifDropdown.innerHTML = '';

  if (!notifications.length) {
    notifDropdown.innerHTML =
      '<li class="dropdown-item text-muted">Nenhuma notificação</li>';
    notifIcon.classList.remove('has-unread');
    return;
  }

  let hasUnread = false;
  notifications.forEach((notif) => {
    if (!notif.read) hasUnread = true;
    notifDropdown.innerHTML += `
      <li class="dropdown-item${notif.read ? '' : ' fw-bold'}" data-item-id="${notif.relatedItemId}" data-notif-id="${notif.id}">
        <span>${notif.title}</span><br>
        <small>${notif.message}</small>
      </li>
    `;
  });
  if (hasUnread) notifIcon.classList.add('has-unread');
  else notifIcon.classList.remove('has-unread');
}

// Marcar como lida e redirecionar
function setupNotificationClick() {
  const notifDropdown = document.getElementById('notification-dropdown');
  if (!notifDropdown) return;
  notifDropdown.addEventListener('click', async (e) => {
    const li = e.target.closest('li[data-item-id]');
    if (!li) return;
    const itemId = li.getAttribute('data-item-id');
    const notifId = li.getAttribute('data-notif-id');
    // Marcar como lida
    await fetch(`http://localhost:3000/notifications/${notifId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });
    window.location.href = `detalhes.html?id=${itemId}`;
  });
}

export async function initNotifications() {
  const user = getLoggedUser();
  if (!user) return;
  const notifications = await fetchUserNotifications(user.id);
  renderNotifications(notifications);
  setupNotificationClick();
}

document.addEventListener('DOMContentLoaded', initNotifications);
