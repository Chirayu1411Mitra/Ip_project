// Simple in-memory cache utility
class Cache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Store TTL for each key
  }

  // Set a value in cache with optional TTL (in seconds)
  set(key, value, ttlSeconds = 300) {
    this.cache.set(key, value);

    // Clear existing timeout if any
    if (this.ttl.has(key)) {
      clearTimeout(this.ttl.get(key).timeoutId);
    }

    // Set new timeout to delete the key after TTL
    const timeoutId = setTimeout(() => {
      this.cache.delete(key);
      this.ttl.delete(key);
    }, ttlSeconds * 1000);

    this.ttl.set(key, { timeoutId, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  // Get a value from cache
  get(key) {
    return this.cache.get(key);
  }

  // Check if key exists and is not expired
  has(key) {
    return this.cache.has(key);
  }

  // Delete a specific key
  delete(key) {
    if (this.ttl.has(key)) {
      clearTimeout(this.ttl.get(key).timeoutId);
      this.ttl.delete(key);
    }
    this.cache.delete(key);
  }

  // Clear all cache
  clear() {
    for (const { timeoutId } of this.ttl.values()) {
      clearTimeout(timeoutId);
    }
    this.cache.clear();
    this.ttl.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create a singleton instance
const cacheInstance = new Cache();

export default cacheInstance;
