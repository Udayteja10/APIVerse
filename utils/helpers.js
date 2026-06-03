// ============================================================
// APIVerse — Shared Utilities
// Used by RequestBuilder, ResponseInspector, APICard
// ============================================================

let _treeId = 0;

export function copyToClipboard(text) {
  const str = String(text ?? '');
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(str);
  }
  const ta = document.createElement('textarea');
  ta.value = str;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

export function downloadJSON(data, filename = 'response.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function syntaxHighlight(data) {
  const json = JSON.stringify(data, null, 2);
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-num';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-str';
      } else if (/true|false/.test(match)) {
        cls = 'json-bool';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${escHtml(match)}</span>`;
    }
  );
}

export function buildJsonTree(data, key = null, depth = 0) {
  const id = `jtree-${++_treeId}`;

  if (data === null || typeof data !== 'object') {
    const valClass =
      typeof data === 'string' ? 'json-str' : typeof data === 'number' ? 'json-num' : typeof data === 'boolean' ? 'json-bool' : 'json-null';
    const display = data === null ? 'null' : typeof data === 'string' ? `"${escHtml(data)}"` : escHtml(String(data));
    const keyPart = key !== null ? `<span class="jtree-key">${escHtml(key)}</span><span class="jtree-colon">: </span>` : '';
    return `<div class="jtree-leaf">${keyPart}<span class="${valClass}">${display}</span></div>`;
  }

  const isArr = Array.isArray(data);
  const entries = isArr ? data.map((v, i) => [String(i), v]) : Object.entries(data);
  const count = entries.length;
  const open = isArr ? '[' : '{';
  const close = isArr ? ']' : '}';

  if (count === 0) {
    const keyPart = key !== null ? `<span class="jtree-key">${escHtml(key)}</span><span class="jtree-colon">: </span>` : '';
    return `<div class="jtree-leaf">${keyPart}<span class="jtree-brace">${open}${close}</span></div>`;
  }

  const keyPart =
    key !== null
      ? `<span class="jtree-toggle" data-target="${id}">▼</span><span class="jtree-key">${escHtml(key)}</span><span class="jtree-colon">: </span>`
      : `<span class="jtree-toggle" data-target="${id}">▼</span>`;

  const children = entries
    .map(([k, v]) => {
      const child = buildJsonTree(v, isArr ? null : k, depth + 1);
      const prefix = isArr ? '' : '';
      return isArr ? child : child;
    })
    .join('');

  return `
    <div class="jtree-node" style="padding-left:${depth * 12}px">
      ${keyPart}<span class="jtree-brace">${open}</span><span class="jtree-count">${count} items</span>
      <div class="jtree-children" id="${id}">${children}</div>
      <div class="jtree-brace" style="padding-left:${depth * 12}px">${close}</div>
    </div>
  `;
}

export function categoryIcon(category) {
  const icons = {
    Weather: '🌤',
    Movies: '🎬',
    Crypto: '₿',
    GitHub: '🐙',
    Countries: '🌍',
  };
  return icons[category] ?? '🔌';
}

export function methodColor(method) {
  const colors = {
    GET: '#22c55e',
    POST: '#3b82f6',
    PUT: '#f59e0b',
    PATCH: '#a855f7',
    DELETE: '#ef4444',
    HEAD: '#8b949e',
  };
  return colors[method?.toUpperCase()] ?? 'var(--tx-secondary)';
}

export function toCurl({ method = 'GET', url = '', headers = {}, params = {}, body = null } = {}) {
  const u = new URL(url, url.startsWith('http') ? undefined : 'https://placeholder.local');
  Object.entries(params).forEach(([k, v]) => {
    if (k) u.searchParams.set(k, v);
  });
  const finalUrl = url.startsWith('http') ? u.toString().replace('https://placeholder.local', '') : u.pathname + u.search;

  const parts = [`curl -X ${method.toUpperCase()}`];
  const quotedUrl = finalUrl.startsWith('http') ? `"${finalUrl}"` : `"${url}"`;
  parts.push(quotedUrl);

  Object.entries(headers).forEach(([k, v]) => {
    if (k) parts.push(`-H "${k}: ${v}"`);
  });

  if (body != null && method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD') {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    parts.push(`-d '${bodyStr.replace(/'/g, "'\\''")}'`);
  }

  return parts.join(' \\\n  ');
}
