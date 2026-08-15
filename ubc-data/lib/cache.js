// In memory cache to stop server from refetching same courses from UBC
// for politeness and performance

const store = new Map();

/**
 * Retrieves a cached value by key, if present and not yet expired.
 * Expired entries are lazily removed on read.
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
 * @returns {void}
 */
export function cacheSet(key, value) {
    const ttlMs = getCacheTTL();
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

const CACHE_TTLS = {
    HIGH: 15 * 60 * 1000, // 1 hour
    MEDIUM: 24 * 60 * 60 * 1000, // 1 day
    LOW: 7 * 24 * 60 * 60 * 1000 // 1 week
}

/**
 * Returns cache length based on time of year.
 * @returns {number} Cache time to live.
 */
function getCacheTTL() {
    const curMonth = new Date().getMonth(); // 0 => January
    const curDay = new Date().getDate();

    if (curMonth === 5 || curMonth === 6) { // June & July
        return CACHE_TTLS.HIGH;
    }

    if (curMonth === 8 || curMonth === 0 || curMonth === 4) { // September & January & May
        return CACHE_TTLS.MEDIUM;
    }

    return CACHE_TTLS.LOW;
}