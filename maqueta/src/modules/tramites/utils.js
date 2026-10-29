import dayjs from "dayjs";

export const formatDate = (iso) => dayjs(iso).format("DD/MM/YYYY HH:mm");

/** Auto-numbering: Lista A -> A1, A2; Lista B -> B1, B2; Subpaso -> <parent>.1 (active steps only). */
export function numberPasos(pasos) {
    const sorted = [...pasos].sort((a, b) => a.orden - b.orden);
    const counters = { 0: 0, 1: 0 };
    let parent = "";
    let subCount = 0;
    const labels = {};
    sorted.forEach((p) => {
        if (!p.activo) { labels[p.id] = "-"; return; }
        if (p.linea === 2) {
            subCount += 1;
            labels[p.id] = `${parent || "·"}.${subCount}`;
        } else {
            counters[p.linea] += 1;
            parent = `${p.linea === 0 ? "A" : "B"}${counters[p.linea]}`;
            subCount = 0;
            labels[p.id] = parent;
        }
    });
    return { sorted, labels };
}

/** Lowest active, non-free amount in pesos (53) across the trámite; null when there is none. */
export const costoDesde = (tramite) => {
    const montos = tramite.apartados.costos.filter((c) => c.activo && !c.gratuito && c.moneda === 53).map((c) => Number(c.monto));
    return montos.length ? Math.min(...montos) : null;
};
