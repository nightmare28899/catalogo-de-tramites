// Asserts the role x status permission matrix against the confirmed legacy rules.
// Run: node scripts/check-permissions.mjs
import {
    can, matrixFor, allowedTransitions, autoPromotionTarget, completeness, fixedOrg, orgScope, ROLE_KEYS,
} from "../src/modules/mock/permissions.js";
import { rankSuggestions, MIN_SUGGEST_CHARS } from "../src/modules/tramites/api/suggestions.js";

const [S785, S1668, S787, S783, S789] = [785, 1668, 787, 783, 789];
const STATUSES = [S785, S1668, S787, S783, S789];
const ORG = { dependenciaId: 1, unidadId: 11 };
const userOf = (rol) => ({ id: rol, rol, ...(["root", "admin"].includes(rol) ? {} : ORG) });
const tramite = (estatus, extra = {}) => ({ ...ORG, estatus, ...extra });

// Independent expectation: [edit statuses, apartados statuses, turnar statuses]
const EXPECTED = {
    root: [STATUSES, STATUSES, [S785, S1668, S787, S783]],
    admin: [[S1668], [S1668], [S1668, S787, S783]],
    romr: [[S785], [S785, S783], [S785, S783]],
    aux_romr: [[S785, S783], [S785, S783], [S785, S783]],
    rua: [[S785, S783], [S785, S783], [S785, S783]],
    aux_rua: [[S785], [S785, S783], [S785, S783]],
};

const failures = [];
const expect = (label, actual, expected) => {
    if (actual !== expected) failures.push(`${label}: got ${actual}, expected ${expected}`);
};

const rows = [];
ROLE_KEYS.forEach((rol) => {
    const u = userOf(rol);
    const [edit, apartados, turnar] = EXPECTED[rol];
    const cells = STATUSES.map((est) => {
        const t = tramite(est);
        const got = { edit: can(u, "edit", t), apartados: can(u, "apartados", t), turnar: can(u, "turnar", t) };
        expect(`${rol}@${est} edit`, got.edit, edit.includes(est));
        expect(`${rol}@${est} apartados`, got.apartados, apartados.includes(est));
        expect(`${rol}@${est} turnar`, got.turnar, turnar.includes(est));
        const m = matrixFor(rol, est);
        ["edit", "apartados", "turnar"].forEach((k) => expect(`matrixFor ${rol}@${est} ${k}`, m[k], got[k]));
        return [got.edit && "E", got.apartados && "A", got.turnar && "T"].filter(Boolean).join("") || "-";
    });
    rows.push([rol.padEnd(9), ...cells.map((c) => c.padEnd(5))].join(" "));
});

// Create: everyone except admin.
ROLE_KEYS.forEach((rol) => expect(`${rol} create`, can(userOf(rol), "create", null), rol !== "admin"));

// Scope: capture roles only see their org; unidad-scoped roles do not see other units.
const otherUnit = tramite(S785, { unidadId: 12 });
const otherDep = tramite(S785, { dependenciaId: 2, unidadId: 21 });
[["romr", false, false], ["aux_rua", false, false], ["aux_romr", true, false], ["rua", true, false], ["admin", true, true], ["root", true, true]]
    .forEach(([rol, unit, dep]) => {
        expect(`${rol} sees other unit`, can(userOf(rol), "view", otherUnit), unit);
        expect(`${rol} sees other dependencia`, can(userOf(rol), "view", otherDep), dep);
    });

// Fixed org on create: restricted roles only.
ROLE_KEYS.forEach((rol) => expect(`${rol} fixedOrg`, Boolean(fixedOrg(userOf(rol))), rol === "romr" || rol === "aux_rua"));
expect("rua orgScope.unidadId", orgScope(userOf("rua")).unidadId, null);
expect("romr orgScope.unidadId", orgScope(userOf("romr")).unidadId, 11);

// Auto-promotion 783 -> 1668 for every role that can edit apartados in 783 (never from other statuses).
ROLE_KEYS.forEach((rol) => {
    const u = userOf(rol);
    expect(`${rol} autoPromotion@783`, autoPromotionTarget(u, tramite(S783)), ["admin"].includes(rol) ? null : S1668);
    expect(`${rol} autoPromotion@785`, autoPromotionTarget(u, tramite(S785)), null);
});

// Transitions and their flags.
const tr = (rol, est) => allowedTransitions(userOf(rol), tramite(est));
const find = (rol, est, to) => tr(rol, est).find((t) => t.to === to);
["romr", "aux_romr", "rua", "aux_rua"].forEach((rol) => {
    expect(`${rol} 785->1668 complete`, find(rol, S785, S1668)?.requiresComplete, true);
    expect(`${rol} 785->789 obs`, find(rol, S785, S789)?.requiresObservation, true);
    expect(`${rol} 783->1668`, Boolean(find(rol, S783, S1668)), true);
    expect(`${rol} 1668 none`, tr(rol, S1668).length, 0);
});
["admin", "root"].forEach((rol) => {
    expect(`${rol} publish`, Boolean(find(rol, S1668, S787)), true);
    expect(`${rol} devolver obs`, find(rol, S1668, S785)?.requiresObservation, true);
    expect(`${rol} 787->783 obs`, find(rol, S787, S783)?.requiresObservation, true);
    expect(`${rol} 787->789 obs`, find(rol, S787, S789)?.requiresObservation, true);
    expect(`${rol} 783->1668`, Boolean(find(rol, S783, S1668)), true);
});
expect("root 785->1668", Boolean(find("root", S785, S1668)), true);
expect("admin 785 none", tr("admin", S785).length, 0);

// Partial save ("captura parcial"): a trámite flagged parcial is never complete, so 785 -> 1668 stays blocked.
const activeItem = [{ activo: true }];
const fullTramite = {
    ...ORG, estatus: S785, nombre: "Demo", descripcion: "Demo", tipoTramite: 9, digitalizacion: 26,
    apartados: { modalidades: activeItem, pasos: activeItem, oficinas: activeItem, fundamentos: activeItem, costos: [], requisitos: [] },
};
expect("full tramite complete", completeness(fullTramite).complete, true);
expect("legacy record without parcial flag complete", completeness({ ...fullTramite, parcial: undefined }).complete, true);
expect("parcial=false complete", completeness({ ...fullTramite, parcial: false }).complete, true);
const partial = completeness({ ...fullTramite, parcial: true });
expect("parcial=true not complete", partial.complete, false);
expect("parcial=true missing captura", partial.missing.map((m) => m.key).join(","), "captura");
expect("parcial missing label", /parcial|terminad/i.test(partial.missing[0]?.label ?? ""), true);
expect("capture roles gate 785->1668 on completeness", find("romr", S785, S1668)?.requiresComplete, true);

// Autocomplete ranking: accent/case-insensitive, prefix first, then word start, then substring, then id; capped.
const pool = [
    { id: 7, nombre: "Licencia de construcción" },
    { id: 8, nombre: "Constancia de licencia" },
    { id: 9, nombre: "Permiso de Licencias comerciales" },
    { id: 10, nombre: "Licencia de conducir" },
    { id: 1007, nombre: "Registro civil" },
    { id: 11, nombre: "Acta de nacimiento" },
];
const names = (q, limit) => rankSuggestions(pool, q, limit).map((t) => t.id).join(",");
expect("min chars constant", MIN_SUGGEST_CHARS, 2);
expect("suggest short query empty", names("l"), "");
expect("suggest blank query empty", names("   "), "");
expect("suggest prefix first, then shorter name", names("LICENCIA"), "10,7,8,9");
expect("suggest accent-insensitive", names("construccion"), "7");
expect("suggest word-start before substring", names("licen", 6), "10,7,8,9");
expect("suggest by numeric id", names("100"), "1007");
expect("suggest limit", names("licencia", 2), "10,7");
expect("suggest no match", names("zzz"), "");

console.log("rol       " + STATUSES.map((s) => String(s).padEnd(5)).join(" ") + "   (E=Editar A=Apartados T=Turnar)");
rows.forEach((r) => console.log(r));
if (failures.length) {
    console.error(`\nFAILED (${failures.length}):\n- ${failures.join("\n- ")}`);
    process.exit(1);
}
console.log("\nOK: all permission assertions passed.");
