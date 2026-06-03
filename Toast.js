// ============================================================
// APIVerse — Toast Notification System
// ============================================================

let container = null;

function getContainer() {
  if (!container) {
    container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
  }
  return container;
}

export function toast(message, type = 'info', duration = 3000) {
  const c = getContainer();
  const el = document.createElement('div');
  el.className = `toast ${type}`;

  const icon = { success: '✓', error: '✕', info: 'ℹ', warn: '⚠' }[type] || 'ℹ';
  el.innerHTML = `<span style="font-size:14px">${icon}</span> <span>${message}</span>`;
  c.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(16px)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

export const Toast = {
  success: (msg, dur) => toast(msg, 'success', dur),
  error:   (msg, dur) => toast(msg, 'error', dur),
  info:    (msg, dur) => toast(msg, 'info', dur),
  warn:    (msg, dur) => toast(msg, 'warn', dur),
};