// ============================================================
// APIVerse — Request Builder Component
// Manages params, headers, auth, body editors
// ============================================================

import { toCurl } from '../utils/helpers.js';

export class RequestBuilder {
  constructor(container) {
    this.container = container;
    this.params    = [{ key: '', val: '' }];
    this.headers   = [{ key: '', val: '' }];
    this.auth      = { type: 'none' };
    this.body      = '';
    this.method    = 'GET';
    this.url       = '';
    this._render();
    this._bindTabs();
  }

  _render() {
    this.container.innerHTML = `
      <div class="tabs" id="req-tabs">
        <button class="tab active" data-tab="params">Params <span class="tab-count" id="params-count">0</span></button>
        <button class="tab" data-tab="headers">Headers <span class="tab-count" id="headers-count">0</span></button>
        <button class="tab" data-tab="auth">Auth</button>
        <button class="tab" data-tab="body">Body</button>
        <button class="tab" data-tab="curl">cURL</button>
      </div>
      <div class="tab-panel active" data-panel="params">
        <div class="kv-editor" id="params-editor"></div>
        <button class="add-row-btn" id="add-param">+ Add Parameter</button>
      </div>
      <div class="tab-panel" data-panel="headers">
        <div class="kv-editor" id="headers-editor"></div>
        <button class="add-row-btn" id="add-header">+ Add Header</button>
      </div>
      <div class="tab-panel" data-panel="auth">
        <div class="auth-section" id="auth-section">
          <div>
            <div class="field-label">Auth Type</div>
            <select class="auth-type-select" id="auth-type">
              <option value="none">No Auth</option>
              <option value="bearer">Bearer Token</option>
              <option value="apikey">API Key</option>
              <option value="basic">Basic Auth</option>
            </select>
          </div>
          <div id="auth-fields"></div>
        </div>
      </div>
      <div class="tab-panel" data-panel="body">
        <div style="margin-bottom:8px">
          <div class="field-label">Content Type</div>
          <select class="auth-type-select" id="body-ct" style="width:auto;min-width:180px">
            <option value="application/json">application/json</option>
            <option value="application/x-www-form-urlencoded">form-urlencoded</option>
            <option value="text/plain">text/plain</option>
          </select>
        </div>
        <textarea class="body-editor" id="body-editor" placeholder='{"key": "value"}'></textarea>
      </div>
      <div class="tab-panel" data-panel="curl">
        <div class="field-label" style="margin-bottom:8px">Generated cURL Command</div>
        <pre class="curl-output" id="curl-output">Fill in the request above and select this tab to see the cURL command.</pre>
        <button class="btn btn-secondary" id="copy-curl" style="margin-top:8px;font-size:11px;padding:5px 10px">Copy cURL</button>
      </div>
    `;

    this._renderKV('params');
    this._renderKV('headers');
    this._bindAuthType();
    this._bindBody();
    this._bindCurlTab();
  }

  _bindTabs() {
    this.container.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      const name = tab.dataset.tab;
      this.container.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
      this.container.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === name));
      if (name === 'curl') this._updateCurl();
    });
  }

  _renderKV(type) {
    const arr = type === 'params' ? this.params : this.headers;
    const container = this.container.querySelector(`#${type}-editor`);
    container.innerHTML = '';
    arr.forEach((row, i) => {
      const div = document.createElement('div');
      div.className = 'kv-row';
      div.innerHTML = `
        <input type="text" placeholder="Key" value="${row.key || ''}" data-type="${type}" data-idx="${i}" data-field="key">
        <input type="text" placeholder="Value" value="${row.val || ''}" data-type="${type}" data-idx="${i}" data-field="val">
        <button class="kv-del" data-type="${type}" data-idx="${i}">✕</button>
      `;
      container.appendChild(div);
    });

    container.addEventListener('input', (e) => {
      const { type: t, idx, field } = e.target.dataset;
      if (!t) return;
      const arr2 = t === 'params' ? this.params : this.headers;
      arr2[+idx][field] = e.target.value;
      this._updateCount(t);
    });

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.kv-del');
      if (!btn) return;
      const { type: t, idx } = btn.dataset;
      const arr2 = t === 'params' ? this.params : this.headers;
      arr2.splice(+idx, 1);
      if (arr2.length === 0) arr2.push({ key: '', val: '' });
      this._renderKV(t);
      this._updateCount(t);
    });

    this.container.querySelector(`#add-${type === 'params' ? 'param' : 'header'}`).onclick = () => {
      (type === 'params' ? this.params : this.headers).push({ key: '', val: '' });
      this._renderKV(type);
    };

    this._updateCount(type);
  }

  _updateCount(type) {
    const arr = type === 'params' ? this.params : this.headers;
    const filled = arr.filter(r => r.key).length;
    const el = this.container.querySelector(`#${type}-count`);
    if (el) el.textContent = filled || '';
  }

  _bindAuthType() {
    const sel = this.container.querySelector('#auth-type');
    sel.addEventListener('change', () => { this.auth.type = sel.value; this._renderAuthFields(); });
    this._renderAuthFields();
  }

  _renderAuthFields() {
    const fields = this.container.querySelector('#auth-fields');
    const type = this.auth.type;
    if (type === 'none') { fields.innerHTML = ''; return; }

    let html = '';
    if (type === 'bearer') {
      html = `<div><div class="field-label">Token</div><input class="auth-input" id="auth-token" placeholder="eyJhbGciOiJIUzI1NiIs..." value="${this.auth.token || ''}"></div>`;
    } else if (type === 'apikey') {
      html = `
        <div><div class="field-label">Key Name</div><input class="auth-input" id="auth-key-name" placeholder="X-API-Key" value="${this.auth.keyName || ''}"></div>
        <div><div class="field-label">Value</div><input class="auth-input" id="auth-key-val" placeholder="your-api-key" value="${this.auth.keyVal || ''}"></div>
        <div><div class="field-label">Add to</div><select class="auth-type-select" id="auth-key-in"><option value="header" ${this.auth.in === 'header' ? 'selected' : ''}>Header</option><option value="query" ${this.auth.in === 'query' ? 'selected' : ''}>Query Param</option></select></div>
      `;
    } else if (type === 'basic') {
      html = `
        <div><div class="field-label">Username</div><input class="auth-input" id="auth-user" placeholder="username" value="${this.auth.username || ''}"></div>
        <div><div class="field-label">Password</div><input class="auth-input" id="auth-pass" type="password" placeholder="password" value="${this.auth.password || ''}"></div>
      `;
    }
    fields.innerHTML = html;

    // Bind inputs
    const bind = (id, key) => { const el = fields.querySelector(`#${id}`); if (el) el.addEventListener('input', () => { this.auth[key] = el.value; }); };
    bind('auth-token', 'token');
    bind('auth-key-name', 'keyName');
    bind('auth-key-val', 'keyVal');
    bind('auth-user', 'username');
    bind('auth-pass', 'password');
    const inSel = fields.querySelector('#auth-key-in');
    if (inSel) inSel.addEventListener('change', () => { this.auth.in = inSel.value; });
  }

  _bindBody() {
    const ta = this.container.querySelector('#body-editor');
    ta.addEventListener('input', () => { this.body = ta.value; });
    const ct = this.container.querySelector('#body-ct');
    ct.addEventListener('change', () => { this.auth.contentType = ct.value; });
  }

  _bindCurlTab() {
    const btn = this.container.querySelector('#copy-curl');
    btn?.addEventListener('click', async () => {
      const { copyToClipboard } = await import('../utils/helpers.js');
      copyToClipboard(this.container.querySelector('#curl-output').textContent);
      btn.textContent = '✓ Copied!';
      setTimeout(() => btn.textContent = 'Copy cURL', 1500);
    });
  }

  _updateCurl() {
    const out = this.container.querySelector('#curl-output');
    const params = {};
    this.params.forEach(r => { if (r.key) params[r.key] = r.val; });
    const headers = {};
    this.headers.forEach(r => { if (r.key) headers[r.key] = r.val; });
    let bodyObj = null;
    try { bodyObj = this.body ? JSON.parse(this.body) : null; } catch {}
    out.textContent = toCurl({ method: this.method, url: this.url, headers, params, body: bodyObj });
  }

  // External API: load a preset endpoint
  loadEndpoint(api, endpoint) {
    this.url = api.baseUrl + (endpoint.path || '');
    // Load default params
    const params = endpoint.params || [];
    this.params = params.length ? params.map(p => ({ key: p.key, val: p.val })) : [{ key: '', val: '' }];
    this.method = endpoint.method || 'GET';
    this._renderKV('params');

    // Update URL input
    const urlEl = document.querySelector('#url-input');
    const methodEl = document.querySelector('#method-selector');
    if (urlEl) urlEl.value = this.url;
    if (methodEl) { methodEl.value = this.method; this._updateMethodColor(); }
  }

  _updateMethodColor() {
    const { methodColor } = this;
    // handled externally
  }

  getRequestConfig() {
    const params = {};
    this.params.forEach(r => { if (r.key) params[r.key] = r.val; });
    const headers = {};
    this.headers.forEach(r => { if (r.key) headers[r.key] = r.val; });
    let body = null;
    try { body = this.body ? JSON.parse(this.body) : null; } catch { body = this.body; }

    // Build auth from apikey into query if needed
    let authObj = { ...this.auth };
    if (this.auth.type === 'apikey' && this.auth.in === 'query' && this.auth.keyName && this.auth.keyVal) {
      params[this.auth.keyName] = this.auth.keyVal;
      authObj = { type: 'none' };
    }

    return {
      method: this.method,
      url: this.url,
      params,
      headers,
      body,
      auth: authObj,
    };
  }
}