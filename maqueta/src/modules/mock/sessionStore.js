import { create } from "zustand";
import { getDb } from "./db";

const KEY = "maqueta-session-user";
const read = () => {
    try { return localStorage.getItem(KEY); } catch { return null; }
};

export const useSessionStore = create((set) => ({
    userId: read(),
    login: (userId) => {
        try { localStorage.setItem(KEY, userId); } catch { /* ignore */ }
        set({ userId });
    },
    logout: () => {
        try { localStorage.removeItem(KEY); } catch { /* ignore */ }
        set({ userId: null });
    },
}));

/** Demo user object for the active session (or null). */
export function useCurrentUser() {
    const userId = useSessionStore((s) => s.userId);
    return userId ? getDb().users.find((u) => u.id === userId) ?? null : null;
}
