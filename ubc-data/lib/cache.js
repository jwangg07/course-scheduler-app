// In memory cache to stop server from refetching same courses from UBC
// for politeness and performance

const store = new Map();

/**
 * Retrieves a cached value by key, if present and not yet expired.
 * Expired entries are lazily evicted on read.
 * @param {string} key - Cache key to look up.
 * @returns {*|null} The cached value, or `null` if missing/expired.
 */
export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Stores a value under a key for an amount of time.
 * @param {string} key - Cache key to store under.
 * @param {*} value - Value to cache.
 * @param {number} [ttlMs=1800000] - Cache length in milliseconds.
 * @returns {void}
 */
export function cacheSet(key, value, ttlMs = 30 * 60 * 1000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}
