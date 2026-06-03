// ============================================================
// APIVerse — HTTP Request Layer
// Executes playground requests; consumed by app.js on Send
// ============================================================

function buildUrl(url, params = {}) {
  const base = url.startsWith('http') ? url : `https://${url}`;
  const u = new URL(base);
  Object.entries(params).forEach(([k, v]) => {
    if (k && v !== undefined && v !== '') u.searchParams.set(k, String(v));
  });
  return u.toString();
}

function applyAuth(headers, auth = {}) {
  const h = { ...headers };
  const type = auth?.type || 'none';

  if (type === 'bearer' && auth.token) {
    h.Authorization = `Bearer ${auth.token}`;
  } else if (type === 'basic' && auth.username) {
    const encoded = btoa(`${auth.username}:${auth.password || ''}`);
    h.Authorization = `Basic ${encoded}`;
  } else if (type === 'apikey' && auth.in === 'header' && auth.keyName && auth.keyVal) {
    h[auth.keyName] = auth.keyVal;
  }

  return h;
}

/**
 * Send an HTTP request from the playground.
 * @param {{ method: string, url: string, headers?: object, params?: object, body?: any, auth?: object }} config
 */
export async function sendRequest({ method = 'GET', url, headers = {}, params = {}, body = null, auth = {} } = {}) {
  const start = performance.now();
  const finalUrl = buildUrl(url, params);
  const reqHeaders = applyAuth({ ...headers }, auth);

  const upper = method.toUpperCase();
  const init = {
    method: upper,
    headers: reqHeaders,
  };

  if (body != null && upper !== 'GET' && upper !== 'HEAD') {
    if (typeof body === 'object') {
      init.body = JSON.stringify(body);
      if (!reqHeaders['Content-Type'] && !reqHeaders['content-type']) {
        init.headers = { ...init.headers, 'Content-Type': 'application/json' };
      }
    } else {
      init.body = String(body);
    }
  }

  try {
    const res = await fetch(finalUrl, init);
    const elapsed = Math.round(performance.now() - start);
    const rawText = await res.text();
    const size = new Blob([rawText]).size;

    const resHeaders = {};
    res.headers.forEach((v, k) => {
      resHeaders[k] = v;
    });

    let data = null;
    let parseError = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch (e) {
        parseError = e.message;
      }
    }

    return {
      status: res.status,
      statusText: res.statusText,
      elapsed,
      size,
      data,
      headers: resHeaders,
      rawText,
      parseError,
      url: finalUrl,
      method: upper,
    };
  } catch (err) {
    const elapsed = Math.round(performance.now() - start);
    return {
      status: 0,
      statusText: 'Network Error',
      elapsed,
      size: 0,
      data: null,
      headers: {},
      rawText: '',
      networkError: err.message || 'Failed to fetch',
      url: finalUrl,
      method: upper,
    };
  }
}
