// ============================================================
// APIVerse — UI Layer
// View switching, navigation, toasts, modals
// ============================================================

import { Toast } from '../Toast.js';
import { FavoriteStore, HistoryStore } from '../storage/store.js';

const VIEW_IDS = ['marketplace', 'playground', 'history', 'favorites', 'collections'];

let activeView = 'marketplace';
const listeners = { viewChange: [] };

export function getActiveView() {
  return activeView;
}

export function onViewChange(fn) {
  listeners.viewChange.push(fn);
  return () => {
    listeners.viewChange = listeners.viewChange.filter((f) => f !== fn);
  };
}

export function switchView(viewId) {
  if (!VIEW_IDS.includes(viewId)) return;
  activeView = viewId;

  document.querySelectorAll('#sidebar .nav-item[data-view]').forEach((el) => {
    el.classList.toggle('active', el.dataset.view === viewId);
  });

  document.querySelectorAll('#content > .view').forEach((el) => {
    const match =
      el.id === `view-${viewId}` ||
      (viewId === 'favorites' && el.id === 'view-favorites') ||
      el.dataset.viewId === viewId;
    el.classList.toggle('active', match);
  });

  listeners.viewChange.forEach((fn) => fn(viewId));
}

export function initNavigation() {
  document.querySelectorAll('#sidebar .nav-item[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.getElementById('logo-home')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('marketplace');
  });

  document.getElementById('header-new-request')?.addEventListener('click', () => {
    switchView('playground');
  });
}

export function updateBadges({ apiCount, historyCount, favCount } = {}) {
  const apiBadge = document.getElementById('api-count-badge');
  const histBadge = document.getElementById('history-count-badge');
  const favBadge = document.getElementById('fav-count-badge');

  if (apiCount != null && apiBadge) apiBadge.textContent = apiCount;
  if (historyCount != null && histBadge) histBadge.textContent = historyCount;
  if (favCount != null && favBadge) favBadge.textContent = favCount;
}

export function refreshStoreBadges(apiTotal) {
  updateBadges({
    apiCount: apiTotal,
    historyCount: HistoryStore.load().length,
    favCount: FavoriteStore.load().length,
  });
}

// ── Toasts ───────────────────────────────────────────────────
export const notify = {
  success: (msg, dur) => Toast.success(msg, dur),
  error: (msg, dur) => Toast.error(msg, dur),
  info: (msg, dur) => Toast.info(msg, dur),
  warn: (msg, dur) => Toast.warn(msg, dur),
};

// ── Modals ───────────────────────────────────────────────────
export function openModal({ title = 'Details', html = '' } = {}) {
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  if (!overlay || !titleEl || !bodyEl) return;

  titleEl.textContent = title;
  bodyEl.innerHTML = html;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
}

export function initModal() {
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ── Theme ────────────────────────────────────────────────────
export function initTheme() {
  const saved = localStorage.getItem('apiverse_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('apiverse_theme', next);
  });
}

// ── Method selector color ──────────────────────────────────────
export function applyMethodColor(method) {
  const el = document.getElementById('method-selector');
  if (!el) return;
  const { methodColor } = window.__apiverseHelpers || {};
  if (methodColor) el.style.color = methodColor(method);
}
