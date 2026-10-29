// Single source of truth for authorization and completeness. Pure functions only.
// Every screen must ask this module; never hard-code role checks elsewhere.
import { ESTATUS, DIGITALIZACION_TOTAL } from "./catalogs.js";

const { ROMR, ADMIN, PUBLICO, ACTUALIZAR_COSTOS, BAJA } = ESTATUS;

export const SECTIONS = ["modalidades", "oficinas", "pasos", "costos", "fundamentos", "requisitos"];
export const ROLE_KEYS = ["root", "admin", "romr", "aux_romr", "rua", "aux_rua"];
const STATUS_IDS = [ROMR, ADMIN, PUBLICO, ACTUALIZAR_COSTOS, BAJA];

// Permission groups (legacy parity). edit = datos generales; apartados = modalidades, oficinas,
// pasos, costos, fundamentos y requisitos. scope: how much of the catalog the role can see.
const GROUPS = {
    root: { label: "Root", edit: STATUS_IDS, apartados: STATUS_IDS, scope: "all", lockedOrg: false },
    admin: { label: "Administración", edit: [ADMIN], apartados: [ADMIN], scope: "all", lockedOrg: false },
    amplia: { label: "Captura amplia", edit: [ROMR, ACTUALIZAR_COSTOS], apartados: [ROMR, ACTUALIZAR_COSTOS], scope: "dependencia", lockedOrg: false },
    restringida: { label: "Captura restringida", edit: [ROMR], apartados: [ROMR, ACTUALIZAR_COSTOS], scope: "unidad", lockedOrg: true },
};
const ROLE_GROUP = { root: "root", admin: "admin", aux_romr: "amplia", rua: "amplia", romr: "restringida", aux_rua: "restringida" };
const CREATORS = ["root", "romr", "aux_romr", "rua", "aux_rua"];
const CAPTURE_ROLES = ["romr", "aux_romr", "rua", "aux_rua"];

const groupOf = (user) => GROUPS[ROLE_GROUP[user?.rol]] ?? null;
export const roleGroupLabel = (rol) => GROUPS[ROLE_GROUP[rol]]?.label ?? "-";

const CAPTURE_TRANSITIONS = [
    { from: ROMR, to: ADMIN, label: "Enviar a revisión", requiresComplete: true },
    { from: ROMR, to: BAJA, label: "Dar de baja", requiresObservation: true },
    { from: ACTUALIZAR_COSTOS, to: ADMIN, label: "Enviar a revisión", requiresComplete: true },
];
const ADMIN_TRANSITIONS = [
    { from: ADMIN, to: PUBLICO, label: "Publicar" },
    { from: ADMIN, to: ROMR, label: "Devolver al responsable", requiresObservation: true },
    { from: PUBLICO, to: ACTUALIZAR_COSTOS, label: "Solicitar actualización de costos", requiresObservation: true },
    { from: PUBLICO, to: BAJA, label: "Dar de baja", requiresObservation: true },
    { from: ACTUALIZAR_COSTOS, to: ADMIN, label: "Enviar a revisión" },
];
const TRANSITIONS = { admin: ADMIN_TRANSITIONS };
CAPTURE_ROLES.forEach((r) => { TRANSITIONS[r] = CAPTURE_TRANSITIONS; });
// Root can do any transition; admin versions win when the same from/to pair exists in both lists.
TRANSITIONS.root = [
    ...ADMIN_TRANSITIONS,
    ...CAPTURE_TRANSITIONS.filter((c) => !ADMIN_TRANSITIONS.some((a) => a.from === c.from && a.to === c.to)),
];

const inScope = (user, tramite) => {
    const group = groupOf(user);
    if (!group) return false;
    if (group.scope === "all" || !tramite) return true;
    if (group.scope === "dependencia") return tramite.dependenciaId === user.dependenciaId;
    return tramite.dependenciaId === user.dependenciaId && tramite.unidadId === user.unidadId;
};

const deny = (reason) => ({ allowed: false, reason });
const allow = () => ({ allowed: true, reason: "" });

const STATUS_PHRASE = {
    [ROMR]: "borrador (ROMR)",
    [ADMIN]: "revisión (Administrador)",
    [PUBLICO]: "Público",
    [ACTUALIZAR_COSTOS]: "Actualizar costos",
    [BAJA]: "Dado de baja",
};
const ACTION_VERB = { edit: "editar los datos generales", apartados: "modificar los apartados" };

function statusRule(group, action, tramite) {
    const allowed = group[action];
    if (allowed.includes(tramite.estatus)) return allow();
    const current = STATUS_PHRASE[tramite.estatus] ?? tramite.estatus;
    if (tramite.estatus === PUBLICO || tramite.estatus === BAJA) {
        return deny(`Un trámite en estatus ${current} no se puede modificar; solo cambia de estatus mediante un turno.`);
    }
    const names = allowed.map((s) => STATUS_PHRASE[s]).join(" o ");
    const hint = action === "edit" && group.apartados.includes(tramite.estatus)
        ? " En este estatus solo puede modificar los apartados."
        : "";
    return deny(`Su rol (${group.label.toLowerCase()}) solo puede ${ACTION_VERB[action]} cuando el trámite está en ${names}; este trámite está en ${current}.${hint}`);
}

/** Returns { allowed, reason } so the UI can explain disabled buttons. */
export function explain(user, action, tramite) {
    if (!user) return deny("Inicie sesión con un usuario de demostración.");
    if (action === "create") {
        return CREATORS.includes(user.rol)
            ? allow()
            : deny("Su rol (administración) no puede crear trámites; los captura ROMR, Auxiliar de ROMR, RUA o Auxiliar de RUA.");
    }
    const group = groupOf(user);
    if (!group) return deny("Rol no reconocido.");
    if (!inScope(user, tramite)) {
        return deny(group.scope === "dependencia"
            ? "El trámite pertenece a otra dependencia."
            : "El trámite pertenece a otra dependencia o unidad.");
    }
    if (action === "view") return allow();
    switch (action) {
        case "edit":
        case "apartados":
            return statusRule(group, action, tramite);
        case "turnar":
            return allowedTransitions(user, tramite).length > 0
                ? allow()
                : deny("No hay turnos disponibles para su rol en el estatus actual.");
        default:
            return deny("Acción no reconocida.");
    }
}

export const can = (user, action, tramite) => explain(user, action, tramite).allowed;

export function allowedTransitions(user, tramite) {
    if (!user || !tramite || !inScope(user, tramite)) return [];
    return (TRANSITIONS[user.rol] ?? []).filter((t) => t.from === tramite.estatus);
}

/** Saving a costo while the tramite is in 783 moves it to 1668 for any role that can edit it. */
export function autoPromotionTarget(user, tramite) {
    return tramite?.estatus === ACTUALIZAR_COSTOS && can(user, "apartados", tramite) ? ADMIN : null;
}

/** Edit / apartados / turnar verdicts for a role in a status (drives the help-page matrix). */
export function matrixFor(rol, estatus) {
    const user = { rol, dependenciaId: 1, unidadId: 11 };
    const tramite = { dependenciaId: 1, unidadId: 11, estatus };
    return {
        edit: can(user, "edit", tramite),
        apartados: can(user, "apartados", tramite),
        turnar: can(user, "turnar", tramite),
    };
}

export const requiresObservation = (transition) => Boolean(transition?.requiresObservation);

const active = (list) => (list ?? []).filter((i) => i.activo);

/** True when the tramite was saved partially and its general-data form is still unfinished. */
export const isPartial = (tramite) => Boolean(tramite?.parcial);

/** Checklist used by the completeness card and the 785 -> 1668 gate. */
export function completeness(tramite) {
    const a = tramite?.apartados ?? {};
    const generalOk = Boolean(
        tramite?.nombre?.trim() &&
        tramite?.descripcion?.trim() &&
        tramite?.dependenciaId &&
        tramite?.unidadId &&
        tramite?.tipoTramite &&
        (tramite?.digitalizacion !== DIGITALIZACION_TOTAL || tramite?.urlDigital?.trim()),
    );
    const items = [
        { key: "datos", label: "Datos generales completos", ok: generalOk, required: true },
        // A partial save ("captura parcial") keeps this false until a full save of the form clears the flag.
        { key: "captura", label: "Formulario de datos generales terminado (sin captura parcial)", ok: !tramite?.parcial, required: true },
        { key: "modalidades", label: "Al menos una modalidad activa", ok: active(a.modalidades).length > 0, required: true },
        { key: "pasos", label: "Al menos un paso activo", ok: active(a.pasos).length > 0, required: true },
        { key: "oficinas", label: "Al menos una oficina activa", ok: active(a.oficinas).length > 0, required: true },
        { key: "fundamentos", label: "Al menos un fundamento activo", ok: active(a.fundamentos).length > 0, required: true },
        { key: "costos", label: "Costos registrados (opcional)", ok: active(a.costos).length > 0, required: false },
        { key: "requisitos", label: "Requisitos registrados (opcional)", ok: active(a.requisitos).length > 0, required: false },
    ];
    const missing = items.filter((i) => i.required && !i.ok);
    return { items, missing, complete: missing.length === 0 };
}

/** Organization a user is locked to when creating or editing (restricted capture roles). */
export function fixedOrg(user) {
    return groupOf(user)?.lockedOrg ? { dependenciaId: user.dependenciaId, unidadId: user.unidadId } : null;
}

/** Organizations a user can see (null means unrestricted). Used to narrow filter options. */
export function orgScope(user) {
    const scope = groupOf(user)?.scope;
    if (scope === "unidad") return { dependenciaId: user.dependenciaId, unidadId: user.unidadId };
    if (scope === "dependencia") return { dependenciaId: user.dependenciaId, unidadId: null };
    return { dependenciaId: null, unidadId: null };
}
