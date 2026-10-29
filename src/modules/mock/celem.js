// Fake CELEM (laws catalog) used by the Fundamentos tab.
export const LAWS = [
    [101, "Constitución Política del Estado Libre y Soberano de Michoacán de Ocampo", "Constitución", 4, "1918-02-05"],
    [102, "Ley de Procedimiento Administrativo del Estado de Michoacán", "Ley", 4, "2010-12-30"],
    [103, "Código Fiscal del Estado de Michoacán de Ocampo", "Código", 4, "1999-12-31"],
    [104, "Ley de Hacienda del Estado de Michoacán de Ocampo", "Ley", 4, "2002-12-31"],
    [105, "Ley de Salud del Estado de Michoacán de Ocampo", "Ley", 4, "2003-07-21"],
    [106, "Reglamento de la Ley de Salud en materia de control sanitario", "Reglamento", 4, "2008-03-14"],
    [107, "Ley Ambiental y de Protección del Patrimonio Natural", "Ley", 4, "2013-06-10"],
    [108, "Ley General de Salud", "Ley", 3, "1984-02-07"],
    [109, "Ley Federal de Procedimiento Administrativo", "Ley", 3, "1994-08-04"],
    [110, "Ley General del Equilibrio Ecológico y la Protección al Ambiente", "Ley", 3, "1988-01-28"],
    [111, "Ley Orgánica Municipal del Estado de Michoacán", "Ley", 5, "2001-03-27"],
    [112, "Decreto de simplificación administrativa", "Decreto", 4, "2019-05-17"],
    [113, "Acuerdo de mejora regulatoria del Poder Ejecutivo", "Acuerdo", 4, "2020-09-01"],
    [114, "Ley de Mejora Regulatoria del Estado de Michoacán", "Ley", 4, "2018-11-12"],
].map(([id, nombre, tipo, ambito, fecha]) => ({ id, nombre, tipo, ambito, fecha }));

const FLAG_KEY = "maqueta-celem-down";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const isCelemDown = () => {
    try { return localStorage.getItem(FLAG_KEY) === "1"; } catch { return false; }
};
export const setCelemDown = (down) => {
    try { localStorage.setItem(FLAG_KEY, down ? "1" : "0"); } catch { /* ignore */ }
};

const normalize = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export async function searchLeyes(query) {
    await delay(250);
    if (isCelemDown()) {
        const error = new Error("CELEM no disponible");
        error.status = 503;
        throw error;
    }
    const q = normalize(query ?? "");
    if (q.length < 3) return [];
    return LAWS.filter((l) => normalize(l.nombre).includes(q) || normalize(l.tipo).includes(q));
}
