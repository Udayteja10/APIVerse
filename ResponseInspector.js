// ============================================================
// APIVerse — Response Inspector Component
// Pretty JSON, Raw, Tree views with metrics
// ============================================================

import { syntaxHighlight, buildJsonTree, copyToClipboard, downloadJSON, formatSize } from '../utils/helpers.js';

export class ResponseInspector {
  constructor(container) {
    this.container = container;
    this.result    = null;
    this.viewMode  = 'pretty';
    this._renderEmpty();
  }

  _renderEmpty() {
    this.container.innerHTML = `
      <div class="response-panel">
        <div class="empty-state" id="resp-empty">
          <div class="icon">⚡</div>
          <p>Hit <strong>Send</strong> to fire a request.<br>The response will appear here.</p>
        </div>
      </div>
    `;
  }

  setLoading() {
    this.container.innerHTML = `
      <div class="response-panel" style="align-items:center;justify-content:center">
        <div style="text-align:center;color:var(--tx-muted)">
          <div class="loading-dots" style="margin-bottom:12px">
            <span></span><span></span><span></span>
          </div>
          <div style="font-size:13px">Sending request...</div>
        </div>
      </div>
    `;
  }

  setResult(result) {
    this.result = result;
    this._render();
  }

  setError(msg) {
    this.container.innerHTML = `
      <div class="response-panel">
        <div class="response-header">
          <span class="status-badge status-0">ERR</span>
          <span class="metric"><span>${msg}</span></span>
        </div>
        <div class="response-body">
          <div class="empty-state">
            <div class="icon">⚠️</div>
            <p>${msg}</p>
          </div>
        </div>
      </div>
    `;
  }

  _render() {
    const r = this.result;
    if (!r) return this._renderEmpty();

    const statusClass = r.status === 0 ? 'status-0' : r.status < 300 ? 'status-2xx' : r.status < 500 ? 'status-4xx' : 'status-5xx';
    const statusText = r.status === 0 ? 'ERROR' : `${r.status} ${r.statusText}`;

    this.container.innerHTML = `
      <div class="response-panel">
        <div class="response-header">
          <span class="status-badge ${statusClass}">${statusText}</span>
          <span class="metric">⏱ <span>${r.elapsed}ms</span></span>
          <span class="metric">⬇ <span>${formatSize(r.size)}</span></span>
          <div class="response-actions">
            <button class="btn-icon" id="resp-copy" data-tip="Copy response">⎘</button>
            <button class="btn-icon" id="resp-download" data-tip="Download JSON">⬇</button>
          </div>
        </div>
        <div class="tabs" style="padding:0 12px">
          <button class="tab ${this.viewMode === 'pretty' ? 'active' : ''}" data-view="pretty">Pretty</button>
          <button class="tab ${this.viewMode === 'raw' ? 'active' : ''}" data-view="raw">Raw</button>
          <button class="tab ${this.viewMode === 'tree' ? 'active' : ''}" data-view="tree">Tree</button>
          <button class="tab ${this.viewMode === 'headers' ? 'active' : ''}" data-view="headers">Headers</button>
        </div>
        <div class="response-body" id="resp-body">
          ${this._renderView()}
        </div>
      </div>
    `;

    // View mode tabs
    this.container.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.viewMode = btn.dataset.view;
        this.container.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b === btn));
        this.container.querySelector('#resp-body').innerHTML = this._renderView();
        this._bindTree();
      });
    });

    // Copy
    this.container.querySelector('#resp-copy')?.addEventListener('click', () => {
      copyToClipboard(r.rawText || JSON.stringify(r.data, null, 2));
      const btn = this.container.querySelector('#resp-copy');
      btn.textContent = '✓';
      setTimeout(() => btn.textContent = '⎘', 1500);
    });

    // Download
    this.container.querySelector('#resp-download')?.addEventListener('click', () => {
      if (r.data) downloadJSON(r.data);
      else { const b = new Blob([r.rawText], {type:'text/plain'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download='response.txt'; a.click(); }
    });

    this._bindTree();
  }

  _renderView() {
    const r = this.result;

    if (this.viewMode === 'pretty') {
      if (r.networkError) {
        return `<div class="json-pretty" style="color:var(--c-err)">Network Error: ${r.networkError}<br><br>This may be caused by CORS restrictions. Try using a CORS proxy or test from a server environment.</div>`;
      }
      if (!r.data && r.parseError) {
        return `<div class="json-pretty" style="color:var(--tx-secondary)">${escHtml(r.rawText)}</div>`;
      }
      return `<div class="json-pretty">${syntaxHighlight(r.data)}</div>`;
    }

    if (this.viewMode === 'raw') {
      return `<div class="json-pretty" style="color:var(--tx-secondary)">${escHtml(r.rawText)}</div>`;
    }

    if (this.viewMode === 'tree') {
      if (!r.data) return `<div class="empty-state"><p>No JSON data to display</p></div>`;
      return `<div style="font-family:var(--font-mono)">${buildJsonTree(r.data)}</div>`;
    }

    if (this.viewMode === 'headers') {
      const entries = Object.entries(r.headers || {});
      if (!entries.length) return `<div class="empty-state"><p>No headers</p></div>`;
      return `<div class="kv-editor" style="gap:4px">
        ${entries.map(([k, v]) => `
          <div class="kv-row" style="pointer-events:none">
            <input readonly value="${escHtml(k)}" style="flex:0 0 200px;color:var(--json-key,#79c0ff)">
            <input readonly value="${escHtml(v)}" style="flex:1;color:var(--tx-secondary)">
          </div>`).join('')}
      </div>`;
    }

    return '';
  }

  _bindTree() {
    this.container.querySelectorAll('.jtree-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const target = document.getElementById(targetId);
        if (target) {
          target.classList.toggle('hidden');
          btn.classList.toggle('collapsed');
        }
      });
    });
  }
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}