// Async adapter over the localStorage "database". Same shape as a real REST client.
import { getDb, saveDb, resetDb, nextId, delay } from "@/modules/mock/db";
import { searchLeyes, isCelemDown } from "@/modules/mock/celem";
import { FIELD_KEYS, FIELD_DEFS, formatFieldValue } from "@/modules/mock/fieldDefs";
import {
    can, explain, allowedTransitions, autoPromotionTarget, completeness, fixedOrg, SECTIONS,
} from "@/modules/mock/permissions";
import { ESTATUS, MODALIDAD_TIPOS, modalidadNeedsUrl, URL_PATTERN } from "@/modules/mock/catalogs";
import { normalizeName, rankSuggestions } from "@/modules/tramites/api/suggestions";

const fail = (status, message, extra = {}) => Object.assign(new Error(message), { status, ...extra });
const now = () => new Date().toISOString();

export { normalizeName };

const SINGULAR = {
    modalidades: "modalidad", oficinas: "oficina", pasos: "paso",
    costos: "costo", fundamentos: "fundamento", requisitos: "requisito",
};

// ---------- helpers ----------
const visibleTo = (user, t) => can(user, "view", t);

function embed(db, t) {
    const byTramite = (list) => list.filter((i) => i.tramiteId === t.id);
    const apartados = {};
    SECTIONS.forEach((s) => { apartados[s] = byTramite(db[s]); });
    apartados.oficinas = apartados.oficinas.map((o) => ({
        ...o, oficina: db.oficinasCatalogo.find((c) => c.id === o.oficinaId) ?? null,
    }));
    const sortDesc = (a, b) => b.at.localeCompare(a.at);
    return {
        ...t,
        dependenciaNombre: db.dependencias.find((d) => d.id === t.dependenciaId)?.nombre ?? "-",
        unidadNombre: db.unidades.find((u) => u.id === t.unidadId)?.nombre ?? "-",
        apartados,
        turnos: byTramite(db.turnos).sort(sortDesc),
        auditoria: byTramite(db.auditoria).sort(sortDesc),
    };
}

function findTramite(db, id, user) {
    const t = db.tramites.find((x) => x.id === Number(id));
    if (!t) throw fail(404, "El trámite solicitado no existe.");
    if (!visibleTo(user, t)) throw fail(403, "No tiene permiso para consultar este trámite.");
    return t;
}

function audit(db, tramiteId, user, accion, cambios = []) {
    db.auditoria.push({ id: nextId("auditoria"), tramiteId, userName: user.nombre, accion, at: now(), cambios });
}

function assertCan(user, action, t) {
    const r = explain(user, action, t);
    if (!r.allowed) throw fail(403, r.reason);
}

/** Server-side rules for a modalidad: tipo and nombre are mandatory, URL only for online/hybrid. */
function validateModalidad(values) {
    const nombre = (values.nombre ?? "").trim();
    if (!MODALIDAD_TIPOS[values.tipo]) throw fail(422, "Seleccione el tipo de modalidad.");
    if (!nombre) throw fail(422, "Capture el nombre de la modalidad.");
    if (nombre.length > 255) throw fail(422, "El nombre de la modalidad admite máximo 255 caracteres.");
    if ((values.nota ?? "").length > 500) throw fail(422, "La nota admite máximo 500 caracteres.");
    const needsUrl = modalidadNeedsUrl(values.tipo);
    const url = (values.url ?? "").trim();
    if (needsUrl && !URL_PATTERN.test(url)) throw fail(422, "Capture una URL válida (por ejemplo https://sitio.gob.mx).");
    return { ...values, nombre, url: needsUrl ? url : "", nota: values.nota ?? "", gratuita: Boolean(values.gratuita) };
}

const BOOL_REQUISITO = [
    "esDocumento", "original", "copiasCertificadas", "requiereFirma", "esTramite", "revisionTercero", "parteFormato",
];
const BOOL_FUNDAMENTO = ["aplicaInspeccion", "aplicaFicta"];
const FUNDAMENTO_TEXTS = ["fraccion", "inciso", "parrafo", "numero", "letra"];

const checkMax = (value, max, label) => {
    if ((value ?? "").length > max) throw fail(422, `${label} admite máximo ${max} caracteres.`);
};
const checkUrl = (value, label) => {
    const url = (value ?? "").trim();
    if (url && !URL_PATTERN.test(url)) throw fail(422, `${label}: capture una URL válida (por ejemplo https://sitio.gob.mx).`);
    return url;
};

/** Optional extra fields of a requisito; undefined flags mean "No". */
function validateRequisito(values) {
    checkMax(values.descripcion, 1000, "La descripción del requisito");
    checkMax(values.institucionEmite, 255, "La institución que emite");
    const out = { ...values, urlFormato: checkUrl(values.urlFormato, "URL de descarga del formato") };
    BOOL_REQUISITO.forEach((k) => { out[k] = Boolean(values[k]); });
    if (!out.esTramite) {
        out.tramiteVinculadoId = undefined;
        out.tramiteVinculadoNombre = undefined;
    }
    return out;
}

/** A fundamento may be saved without ley only while CELEM is unavailable (flagged "Sin vincular"). */
function validateFundamento(values) {
    if (!values.leyId && !isCelemDown()) throw fail(422, "Busque y seleccione un ordenamiento.");
    const out = { ...values };
    FUNDAMENTO_TEXTS.forEach((k) => {
        checkMax(values[k], 50, `El campo ${k}`);
        out[k] = (values[k] ?? "").trim();
    });
    BOOL_FUNDAMENTO.forEach((k) => { out[k] = Boolean(values[k]); });
    return out;
}

function validatePaso(values) {
    return { ...values, url: checkUrl(values.url, "URL del paso") };
}

const VALIDATORS = {
    modalidades: validateModalidad, requisitos: validateRequisito, fundamentos: validateFundamento, pasos: validatePaso,
};

function findDuplicate(db, values, ignoreId) {
    const key = normalizeName(values.nombre);
    return db.tramites.find((x) =>
        x.id !== ignoreId && x.dependenciaId === values.dependenciaId &&
        x.unidadId === values.unidadId && normalizeName(x.nombre) === key);
}

/** Partial-save state stored beside the fields: flag plus the form step where capture stopped. */
const captureState = (parcial, pasoActual) => ({
    parcial: Boolean(parcial),
    pasoActual: parcial && Number.isInteger(pasoActual) && pasoActual > 0 ? pasoActual : 0,
});

/** Minimum to persist a record: a nombre and a dependencia (the latter defaults to the user's own). */
function assertMinimum(data) {
    if (!(data.nombre ?? "").trim()) throw fail(422, "Capture al menos el nombre del trámite para guardar el avance.");
    if (!data.dependenciaId) throw fail(422, "Seleccione la dependencia para guardar el avance.");
}

function pickFields(values) {
    const out = {};
    FIELD_KEYS.forEach((k) => { if (values[k] !== undefined) out[k] = values[k]; });
    return out;
}

// ---------- public API ----------
export const tramitesApi = {
    async listUsers() {
        await delay();
        return getDb().users;
    },

    async listOrgs() {
        await delay(150, 250);
        const db = getDb();
        return { dependencias: db.dependencias, unidades: db.unidades, oficinas: db.oficinasCatalogo };
    },

    async list({ user, page = 1, pageSize = 10, q = "", dependenciaId, unidadId, estatus }) {
        await delay();
        const db = getDb();
        const needle = normalizeName(q);
        let rows = db.tramites.filter((t) => visibleTo(user, t));
        if (dependenciaId) rows = rows.filter((t) => t.dependenciaId === Number(dependenciaId));
        if (unidadId) rows = rows.filter((t) => t.unidadId === Number(unidadId));
        if (estatus) rows = rows.filter((t) => t.estatus === Number(estatus));
        if (needle) rows = rows.filter((t) => normalizeName(t.nombre).includes(needle) || String(t.id).includes(needle));
        rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        const total = rows.length;
        const data = rows.slice((page - 1) * pageSize, page * pageSize).map((t) => ({
            ...t,
            dependenciaNombre: db.dependencias.find((d) => d.id === t.dependenciaId)?.nombre,
            unidadNombre: db.unidades.find((u) => u.id === t.unidadId)?.nombre,
            modalidades: db.modalidades.filter((m) => m.tramiteId === t.id),
            costos: db.costos.filter((c) => c.tramiteId === t.id && c.activo),
        }));
        return { data, total, page, pageSize };
    },

    /** Light autocomplete items; same visibility scope and matching as `list`. */
    async suggest({ user, q = "", limit = 6 }) {
        await delay(120, 250);
        const db = getDb();
        const rows = rankSuggestions(db.tramites.filter((t) => visibleTo(user, t)), q, limit);
        return rows.map((t) => ({
            id: t.id,
            nombre: t.nombre,
            dependenciaNombre: db.dependencias.find((d) => d.id === t.dependenciaId)?.nombre ?? "-",
            estatus: t.estatus,
        }));
    },

    async get({ user, id }) {
        await delay();
        const db = getDb();
        return embed(db, findTramite(db, id, user));
    },

    async create({ user, values, parcial = false, pasoActual = 0 }) {
        await delay();
        assertCan(user, "create", null);
        const db = getDb();
        const data = pickFields(values);
        const locked = fixedOrg(user);
        if (locked) Object.assign(data, locked);
        if (!data.dependenciaId && user.dependenciaId) data.dependenciaId = user.dependenciaId;
        assertMinimum(data);
        if (!can(user, "view", data)) throw fail(403, "Su rol solo puede crear trámites dentro de su dependencia o unidad.");
        const dup = findDuplicate(db, data);
        if (dup) throw fail(409, "Ya existe un trámite con el mismo nombre en esta dependencia y unidad.", { existingId: dup.id, existingName: dup.nombre });
        const t = {
            ...data, ...captureState(parcial, pasoActual), id: nextId("tramites") + 1000, estatus: ESTATUS.ROMR,
            createdBy: user.id, createdAt: now(), updatedAt: now(),
        };
        db.tramites.push(t);
        audit(db, t.id, user, parcial ? "Creación del trámite (captura parcial)" : "Creación del trámite");
        saveDb();
        return embed(db, t);
    },

    async update({ user, id, values, parcial = false, pasoActual = 0 }) {
        await delay();
        const db = getDb();
        const t = findTramite(db, id, user);
        assertCan(user, "edit", t);
        const next = { ...t, ...pickFields(values) };
        if (fixedOrg(user)) { next.dependenciaId = t.dependenciaId; next.unidadId = t.unidadId; }
        assertMinimum(next);
        const dup = findDuplicate(db, next, t.id);
        if (dup) throw fail(409, "Ya existe un trámite con el mismo nombre en esta dependencia y unidad.", { existingId: dup.id, existingName: dup.nombre });
        const lookup = {
            dependenciaId: (v) => db.dependencias.find((d) => d.id === v)?.nombre,
            unidadId: (v) => db.unidades.find((u) => u.id === v)?.nombre,
        };
        const cambios = FIELD_KEYS
            .filter((k) => (t[k] ?? "") !== (next[k] ?? ""))
            .map((k) => ({
                campo: FIELD_DEFS[k].label,
                antes: formatFieldValue(k, t[k], lookup),
                despues: formatFieldValue(k, next[k], lookup),
            }));
        const wasPartial = Boolean(t.parcial);
        Object.assign(t, next, captureState(parcial, pasoActual), { updatedAt: now() });
        const accion = parcial ? "Guardado parcial de datos generales"
            : wasPartial ? "Captura de datos generales terminada"
                : cambios.length ? "Edición de datos generales" : "Guardado sin cambios";
        audit(db, t.id, user, accion, cambios);
        saveDb();
        return embed(db, t);
    },

    async saveItem({ user, tramiteId, section, values: rawValues, itemId }) {
        await delay();
        const db = getDb();
        const t = findTramite(db, tramiteId, user);
        assertCan(user, "apartados", t);
        const list = db[section];
        const label = SINGULAR[section];
        const values = VALIDATORS[section] ? VALIDATORS[section](rawValues) : rawValues;
        let item;
        if (section === "oficinas" && !itemId &&
            list.some((o) => o.tramiteId === t.id && o.oficinaId === values.oficinaId && o.activo)) {
            throw fail(409, "La oficina ya está vinculada a este trámite.");
        }
        if (itemId) {
            item = list.find((i) => i.id === itemId && i.tramiteId === t.id);
            if (!item) throw fail(404, `No se encontró el registro de ${label}.`);
            Object.assign(item, values);
            audit(db, t.id, user, `Edición de ${label}`);
        } else {
            item = { id: nextId(section), tramiteId: t.id, activo: true, ...values };
            if (section === "pasos") item.orden = Math.max(0, ...list.filter((p) => p.tramiteId === t.id).map((p) => p.orden)) + 1;
            list.push(item);
            audit(db, t.id, user, `Alta de ${label}`);
        }
        t.updatedAt = now();
        let promoted = false;
        const target = section === "costos" ? autoPromotionTarget(user, t) : null;
        if (target) {
            db.turnos.push({
                id: nextId("turnos"), tramiteId: t.id, userId: user.id, userName: user.nombre,
                from: t.estatus, to: target, at: now(),
                observacion: "Promoción automática: costos actualizados; el trámite pasa a revisión.",
            });
            t.estatus = target;
            promoted = true;
        }
        saveDb();
        return { item, promoted, estatus: t.estatus };
    },

    async toggleItem({ user, tramiteId, section, itemId }) {
        await delay();
        const db = getDb();
        const t = findTramite(db, tramiteId, user);
        assertCan(user, "apartados", t);
        const item = db[section].find((i) => i.id === itemId && i.tramiteId === t.id);
        if (!item) throw fail(404, "No se encontró el registro.");
        item.activo = !item.activo;
        t.updatedAt = now();
        audit(db, t.id, user, `${item.activo ? "Activación" : "Desactivación"} de ${SINGULAR[section]}`);
        saveDb();
        return item;
    },

    async turnar({ user, id, to, observacion }) {
        await delay();
        const db = getDb();
        const t = findTramite(db, id, user);
        const transition = allowedTransitions(user, t).find((x) => x.to === to);
        if (!transition) throw fail(403, "Su rol no puede realizar este cambio de estatus.");
        const obs = (observacion ?? "").trim();
        if (transition.requiresObservation && !obs) throw fail(422, "La observación es obligatoria para este cambio de estatus.");
        if (transition.requiresComplete) {
            const check = completeness(embed(db, t));
            if (!check.complete) throw fail(422, "El trámite está incompleto.", { missing: check.missing });
        }
        db.turnos.push({
            id: nextId("turnos"), tramiteId: t.id, userId: user.id, userName: user.nombre,
            from: t.estatus, to, observacion: obs, at: now(),
        });
        t.estatus = to;
        t.updatedAt = now();
        saveDb();
        return embed(db, t);
    },

    searchLeyes: (q) => searchLeyes(q),

    async resetData() {
        await delay();
        resetDb();
        return true;
    },
};
