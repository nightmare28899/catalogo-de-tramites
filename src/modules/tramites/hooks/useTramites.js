import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tramitesApi } from "@/modules/tramites/api/tramitesApi";
import { MIN_SUGGEST_CHARS, normalizeName } from "@/modules/tramites/api/suggestions";
import { useCurrentUser } from "@/modules/mock/sessionStore";

const ROOT = "tramites";

export const useOrgs = () =>
    useQuery({ queryKey: [ROOT, "orgs"], queryFn: tramitesApi.listOrgs, staleTime: Infinity });

export const useDemoUsers = () =>
    useQuery({ queryKey: [ROOT, "users"], queryFn: tramitesApi.listUsers, staleTime: Infinity });

export const useTramitesList = (params) => {
    const user = useCurrentUser();
    return useQuery({
        queryKey: [ROOT, "list", user?.id, params],
        queryFn: () => tramitesApi.list({ user, ...params }),
        enabled: Boolean(user),
        placeholderData: keepPreviousData,
    });
};

/** Returns `value` after it stops changing for `ms`. */
function useDebouncedValue(value, ms) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return debounced;
}

/** Autocomplete for the search box; `term` is the debounced text the suggestions correspond to. */
export const useTramiteSuggestions = (q) => {
    const user = useCurrentUser();
    const term = useDebouncedValue(q.trim(), 250);
    const enabled = Boolean(user) && normalizeName(term).length >= MIN_SUGGEST_CHARS;
    const query = useQuery({
        queryKey: [ROOT, "suggest", user?.id, term],
        queryFn: () => tramitesApi.suggest({ user, q: term }),
        enabled,
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });
    // pending: typed text is not yet the debounced term, or the request is in flight.
    const pending = enabled ? q.trim() !== term || query.isFetching : false;
    return { term, enabled, items: enabled ? query.data ?? [] : [], pending };
};

export const useTramite = (id) => {
    const user = useCurrentUser();
    return useQuery({
        queryKey: [ROOT, "detail", user?.id, String(id)],
        queryFn: () => tramitesApi.get({ user, id }),
        enabled: Boolean(user && id),
        retry: false,
    });
};

/** Wraps a mutation so every write refreshes lists and details. */
function useWrite(fn) {
    const qc = useQueryClient();
    const user = useCurrentUser();
    return useMutation({
        mutationFn: (vars) => fn({ user, ...vars }),
        onSuccess: () => qc.invalidateQueries({ queryKey: [ROOT] }),
    });
}

export const useCreateTramite = () => useWrite(tramitesApi.create);
export const useUpdateTramite = () => useWrite(tramitesApi.update);
export const useSaveItem = () => useWrite(tramitesApi.saveItem);
export const useToggleItem = () => useWrite(tramitesApi.toggleItem);
export const useTurnar = () => useWrite(tramitesApi.turnar);

export function useResetData() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: tramitesApi.resetData,
        onSuccess: () => qc.invalidateQueries({ queryKey: [ROOT] }),
    });
}
