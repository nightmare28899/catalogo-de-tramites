// Pure helpers for the search autocomplete. No aliased imports so scripts/check-permissions.mjs can run them.
export const MIN_SUGGEST_CHARS = 2;

export const normalizeName = (s = "") =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

/** Lower is better: nombre prefix, id prefix, word start, nombre substring, id substring; -1 = no match. */
function matchRank(t, needle) {
    const name = normalizeName(t.nombre);
    const id = String(t.id);
    if (name.startsWith(needle)) return 0;
    if (id.startsWith(needle)) return 1;
    if (name.includes(` ${needle}`)) return 2;
    if (name.includes(needle)) return 3;
    if (id.includes(needle)) return 4;
    return -1;
}

/** Filters rows by q (accent/case-insensitive, nombre or id) and ranks prefix matches first. */
export function rankSuggestions(rows, q, limit = 6) {
    const needle = normalizeName(q);
    if (needle.length < MIN_SUGGEST_CHARS) return [];
    return rows
        .map((t) => ({ t, rank: matchRank(t, needle) }))
        .filter((x) => x.rank >= 0)
        .sort((a, b) => a.rank - b.rank || a.t.nombre.length - b.t.nombre.length || a.t.nombre.localeCompare(b.t.nombre))
        .slice(0, limit)
        .map((x) => x.t);
}
