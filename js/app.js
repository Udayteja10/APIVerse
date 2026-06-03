// ============================================================
// APIVerse — Application Bootstrap
// Wires marketplace, playground, and history together
// ============================================================

import { renderAPICard } from '../components/APICard.js';
import { RequestBuilder } from '../components/RequestBuilder.js';
import { ResponseInspector } from '../components/ResponseInspector.js';
import { APIS, filterApis, getApiById, getDefaultEndpoint } from '../data/apis.js';
import { sendRequest } from './api.js';
import { HistoryStore, FavoriteStore } from '../storage/store.js';
import * as helpers from '../utils/helpers.js';
import {
  switchView,
  initNavigation,
  initModal,
  initTheme,
  refreshStoreBadges,
  notify,
  openModal,
  applyMethodColor,
} from './ui.js';

// Expose for ui.js method coloring without circular import
window.__apiverseHelpers = helpers;

let requestBuilder = null;
let responseInspector = null;
let activeCategory = 'all';
let searchQuery = '';
let currentApi = null;

function initPlayground() {
  const rbContainer = document.getElementById('request-builder');
  const riContainer = document.getElementById('response-inspector');

  requestBuilder = new RequestBuilder(rbContainer);
  responseInspector = new ResponseInspector(riContainer);

  const methodEl = document.getElementById('method-selector');
  const urlEl = document.getElementById('url-input');
  const sendBtn = document.getElementById('send-btn');

  methodEl?.addEventListener('change', () => {
    requestBuilder.method = methodEl.value;
    applyMethodColor(methodEl.value);
  });

  urlEl?.addEventListener('input', () => {
    requestBuilder.url = urlEl.value;
  });

  sendBtn?.addEventListener('click', handleSend);
}

async function handleSend() {
  const sendBtn = document.getElementById('send-btn');
  const methodEl = document.getElementById('method-selector');
  const urlEl = document.getElementById('url-input');

  requestBuilder.method = methodEl?.value || 'GET';
  requestBuilder.url = urlEl?.value || '';

  const config = requestBuilder.getRequestConfig();
  if (!config.url?.trim()) {
    notify.warn('Enter a URL before sending');
    return;
  }

  sendBtn?.classList.add('loading');
  sendBtn.disabled = true;
  responseInspector.setLoading();

  try {
    const result = await sendRequest(config);
    responseInspector.setResult(result);

    HistoryStore.add({
      method: config.method,
      url: config.url,
      status: result.status,
      elapsed: result.elapsed,
      apiId: currentApi?.id,
      apiName: currentApi?.name,
    });

    refreshStoreBadges(APIS.length);
    if (document.getElementById('view-history')?.classList.contains('active')) {
      renderHistory();
    }
  } catch (err) {
    responseInspector.setError(err.message || 'Request failed');
    notify.error(err.message || 'Request failed');
  } finally {
    sendBtn?.classList.remove('loading');
    sendBtn.disabled = false;
  }
}

function openPlayground(api, endpoint) {
  currentApi = api;
  const ep = endpoint || getDefaultEndpoint(api);

  document.getElementById('playground-api-name').textContent = api.name;
  document.getElementById('playground-api-desc').textContent = api.description;

  requestBuilder.loadEndpoint(api, ep);

  const methodEl = document.getElementById('method-selector');
  const urlEl = document.getElementById('url-input');
  if (methodEl) {
    methodEl.value = requestBuilder.method;
    applyMethodColor(requestBuilder.method);
  }
  if (urlEl) urlEl.value = requestBuilder.url;

  switchView('playground');
}

function renderMarketplaceGrid(containerId, { favoritesOnly = false } = {}) {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  const favIds = favoritesOnly ? FavoriteStore.load() : [];
  const list = filterApis({
    category: favoritesOnly ? 'all' : activeCategory,
    query: searchQuery,
    favoritesOnly,
    favIds,
  });

  grid.innerHTML = '';

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="icon">${favoritesOnly ? '★' : '🔍'}</div>
        <p>${favoritesOnly ? 'No favorites yet. Bookmark APIs from the marketplace.' : 'No APIs match your filters.'}</p>
      </div>`;
    return;
  }

  list.forEach((api) => {
    const card = renderAPICard(api, {
      onTest: (a) => openPlayground(a, getDefaultEndpoint(a)),
      onLearn: (a) => showLearnModal(a),
      onFavToggle: () => {
        refreshStoreBadges(APIS.length);
        if (document.getElementById('view-favorites')?.classList.contains('active')) {
          renderMarketplaceGrid('favorites-grid', { favoritesOnly: true });
        }
      },
    });
    grid.appendChild(card);
  });
}

function showLearnModal(api) {
  const endpoints = (api.endpoints || [])
    .map(
      (ep) =>
        `<div style="margin-bottom:8px"><span class="tag" style="color:${helpers.methodColor(ep.method)}">${ep.method}</span> <code class="url-display">${api.baseUrl}${ep.path}</code></div>`
    )
    .join('');

  openModal({
    title: `${api.name} — Overview`,
    html: `
      <p style="color:var(--tx-secondary);margin-bottom:12px;line-height:1.6">${api.description}</p>
      <div class="divider"></div>
      <div class="field-label">Base URL</div>
      <div class="url-display" style="margin-bottom:12px">${api.baseUrl}</div>
      <div class="field-label">Auth</div>
      <p style="margin-bottom:12px"><span class="auth-badge">${api.authType}</span></p>
      <div class="field-label">Endpoints</div>
      ${endpoints || '<p style="color:var(--tx-muted)">No endpoints defined</p>'}
      <div style="margin-top:16px">
        <button class="btn btn-primary" id="modal-test-btn">⚡ Test in Playground</button>
      </div>
    `,
  });

  document.getElementById('modal-test-btn')?.addEventListener('click', () => {
    document.getElementById('modal-overlay')?.classList.remove('open');
    openPlayground(api, getDefaultEndpoint(api));
  });
}

function renderHistory() {
  const list = document.getElementById('history-list');
  if (!list) return;

  const items = HistoryStore.load();
  list.innerHTML = '';

  if (!items.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="icon">◷</div>
        <p>No requests yet. Send a request from the Playground.</p>
      </div>`;
    return;
  }

  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'history-item';
    const mClass = `m-${(item.method || 'get').toLowerCase()}`;
    const statusClass =
      item.status === 0 ? 'status-0' : item.status < 300 ? 'status-2xx' : item.status < 500 ? 'status-4xx' : 'status-5xx';
    const time = new Date(item.timestamp).toLocaleString();

    row.innerHTML = `
      <span class="method-tag ${mClass}">${item.method}</span>
      <span class="history-url" title="${item.url}">${item.url}</span>
      <span class="history-status ${statusClass}">${item.status || 'ERR'}</span>
      <span class="history-time">${time}</span>
      <div class="history-actions">
        <button class="btn-icon" data-action="replay" data-tip="Replay">↻</button>
        <button class="btn-icon" data-action="delete" data-tip="Delete">✕</button>
      </div>
    `;

    row.querySelector('[data-action="replay"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      replayHistoryItem(item);
    });

    row.querySelector('[data-action="delete"]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      HistoryStore.remove(item.id);
      renderHistory();
      refreshStoreBadges(APIS.length);
    });

    row.addEventListener('click', () => replayHistoryItem(item));
    list.appendChild(row);
  });
}

function replayHistoryItem(item) {
  const api = item.apiId ? getApiById(item.apiId) : null;
  switchView('playground');

  const methodEl = document.getElementById('method-selector');
  const urlEl = document.getElementById('url-input');
  if (methodEl) {
    methodEl.value = item.method || 'GET';
    requestBuilder.method = methodEl.value;
    applyMethodColor(methodEl.value);
  }
  if (urlEl) {
    urlEl.value = item.url;
    requestBuilder.url = item.url;
  }

  if (api) {
    currentApi = api;
    document.getElementById('playground-api-name').textContent = api.name;
    document.getElementById('playground-api-desc').textContent = item.url;
  }
}

function initCategoryPills() {
  document.querySelectorAll('#category-pills .cat-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#category-pills .cat-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      renderMarketplaceGrid('api-grid');
    });
  });
}

function initSearch() {
  const input = document.getElementById('global-search');
  input?.addEventListener('input', () => {
    searchQuery = input.value;
    renderMarketplaceGrid('api-grid');
    if (document.getElementById('view-favorites')?.classList.contains('active')) {
      renderMarketplaceGrid('favorites-grid', { favoritesOnly: true });
    }
  });
}

function initHistoryActions() {
  document.getElementById('clear-history-btn')?.addEventListener('click', () => {
    HistoryStore.clear();
    renderHistory();
    refreshStoreBadges(APIS.length);
    notify.info('History cleared');
  });
}

function renderFavoritesView() {
  renderMarketplaceGrid('favorites-grid', { favoritesOnly: true });
}

function init() {
  initTheme();
  initNavigation();
  initModal();
  initPlayground();
  initCategoryPills();
  initSearch();
  initHistoryActions();

  renderMarketplaceGrid('api-grid');
  renderHistory();
  refreshStoreBadges(APIS.length);

  document.querySelector('[data-view="history"]')?.addEventListener('click', () => {
    setTimeout(renderHistory, 0);
  });

  document.querySelector('[data-view="favorites"]')?.addEventListener('click', () => {
    setTimeout(renderFavoritesView, 0);
  });
}

init();
