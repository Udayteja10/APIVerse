
// ============================================================
// APIVerse — API Card Component
// ============================================================

import { categoryIcon, methodColor } from '../utils/helpers.js';
import { FavoriteStore } from '../storage/store.js';

export function renderAPICard(api, { onTest, onLearn, onFavToggle } = {}) {
  const isFav = FavoriteStore.isFav(api.id);
  const popPct = api.popularity;

  const div = document.createElement('div');
  div.className = 'api-card';
  div.dataset.apiId = api.id;

  div.innerHTML = `
    <div class="api-card-header">
      <div class="api-card-icon">${categoryIcon(api.category)}</div>
      <div class="api-card-meta">
        <div class="api-card-name">${api.name}</div>
        <div class="api-card-category">${api.category}</div>
      </div>
      <button class="fav-btn ${isFav ? 'active' : ''}" data-tip="${isFav ? 'Remove bookmark' : 'Bookmark API'}">
        ${isFav ? '★' : '☆'}
      </button>
    </div>
    <div class="api-card-desc">${api.description}</div>
    <div class="api-card-footer">
      <span class="auth-badge">${api.authType}</span>
      <div class="popularity-bar">
        <div class="pop-track"><div class="pop-fill" style="width:${popPct}%"></div></div>
        <span class="pop-label">${popPct}</span>
      </div>
    </div>
    <div class="api-card-actions">
      <button class="btn-xs" data-action="learn">📖 Learn</button>
      <button class="btn-xs primary" data-action="test">⚡ Test API</button>
    </div>
  `;

  // Fav button
  div.querySelector('.fav-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const isnow = FavoriteStore.toggle(api.id);
    const btn = e.currentTarget;
    btn.textContent = isnow ? '★' : '☆';
    btn.classList.toggle('active', isnow);
    btn.dataset.tip = isnow ? 'Remove bookmark' : 'Bookmark API';
    onFavToggle?.(api.id, isnow);
  });

  div.querySelector('[data-action="test"]').addEventListener('click', (e) => {
    e.stopPropagation();
    onTest?.(api);
  });

  div.querySelector('[data-action="learn"]').addEventListener('click', (e) => {
    e.stopPropagation();
    onLearn?.(api);
  });

  return div;
}