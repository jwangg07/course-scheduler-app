// In memory cache to stop server from refetching same courses from UBC
// for politeness and performance

const store = new Map();

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

// Cache for 30 minutes
export function cacheSet(key, value, ttlMs = 30 * 60 * 1000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}
