// ============================================================
// APIVerse — Local Storage Stores
// Used by APICard (favorites), app.js (history, collections)
// ============================================================

const KEYS = {
  favorites: 'apiverse_favorites',
  history: 'apiverse_history',
  collections: 'apiverse_collections',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const FavoriteStore = {
  load() {
    return read(KEYS.favorites, []);
  },

  save(ids) {
    write(KEYS.favorites, ids);
    return ids;
  },

  isFav(id) {
    return this.load().includes(id);
  },

  toggle(id) {
    const ids = this.load();
    const idx = ids.indexOf(id);
    if (idx >= 0) {
      ids.splice(idx, 1);
      this.save(ids);
      return false;
    }
    ids.push(id);
    this.save(ids);
    return true;
  },

  remove(id) {
    const ids = this.load().filter((x) => x !== id);
    this.save(ids);
    return ids;
  },
};

export const HistoryStore = {
  load() {
    return read(KEYS.history, []);
  },

  save(entries) {
    write(KEYS.history, entries);
    return entries;
  },

  add(entry) {
    const items = this.load();
    const record = {
      id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      ...entry,
    };
    items.unshift(record);
    if (items.length > 100) items.length = 100;
    this.save(items);
    return record;
  },

  remove(id) {
    const items = this.load().filter((h) => h.id !== id);
    this.save(items);
    return items;
  },

  clear() {
    this.save([]);
    return [];
  },
};

export const CollectionStore = {
  load() {
    return read(KEYS.collections, []);
  },

  save(collections) {
    write(KEYS.collections, collections);
    return collections;
  },

  add(name) {
    const cols = this.load();
    const col = {
      id: `col_${Date.now()}`,
      name: name || 'Untitled Collection',
      requests: [],
      createdAt: Date.now(),
    };
    cols.push(col);
    this.save(cols);
    return col;
  },

  toggleRequest(collectionId, request) {
    const cols = this.load();
    const col = cols.find((c) => c.id === collectionId);
    if (!col) return cols;
    const idx = col.requests.findIndex((r) => r.url === request.url && r.method === request.method);
    if (idx >= 0) {
      col.requests.splice(idx, 1);
    } else {
      col.requests.push({ ...request, savedAt: Date.now() });
    }
    this.save(cols);
    return cols;
  },

  remove(collectionId) {
    const cols = this.load().filter((c) => c.id !== collectionId);
    this.save(cols);
    return cols;
  },
};
