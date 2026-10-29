// localStorage-backed database for the mockup.
import { buildSeed, SEED_VERSION } from "./seed";

const KEY = "maqueta-tramites-db";
let cache = null;

export const delay = (min = 200, max = 400) =>
    new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));

const persist = (db) => {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage full or blocked */ }
};

export function getDb() {
    if (cache) return cache;
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // Stale demo data (older seed version) is replaced automatically.
            if (parsed?.seedVersion === SEED_VERSION) {
                cache = parsed;
                return cache;
            }
        }
    } catch { /* corrupted: reseed */ }
    cache = buildSeed();
    persist(cache);
    return cache;
}

export const saveDb = () => persist(getDb());

export function resetDb() {
    cache = buildSeed();
    persist(cache);
    return cache;
}

export function nextId(collection) {
    const db = getDb();
    db.counters[collection] = (db.counters[collection] ?? 0) + 1;
    return db.counters[collection];
}
