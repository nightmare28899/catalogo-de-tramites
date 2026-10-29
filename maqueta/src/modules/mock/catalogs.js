// Static catalogs. Ids mirror the legacy system on purpose.
const opt = (value, label) => ({ value, label });

export const ESTATUS = {
    ROMR: 785,
    ADMIN: 1668,
    PUBLICO: 787,
    ACTUALIZAR_COSTOS: 783,
    BAJA: 789,
};

export const ESTATUS_META = {
    785: { label: "ROMR", color: "gold", description: "Borrador: se está capturando; todo trámite nace aquí" },
    1668: { label: "Administrador", color: "blue", description: "En revisión: lo revisa el administrador" },
    787: { label: "Público", color: "green", description: "Publicado: lo ve la ciudadanía" },
    783: { label: "Actualizar costos", color: "orange", description: "Publicado reabierto solo para corregir montos" },
    789: { label: "Dado de baja", color: "default", description: "Fuera del catálogo" },
};

export const ROLES = {
    root: "Root",
    admin: "Administrador",
    romr: "ROMR",
    aux_romr: "Auxiliar de ROMR",
    rua: "RUA",
    aux_rua: "Auxiliar de RUA",
};

// One-line summary shown on the login cards and the user switcher.
export const ROLE_DESCRIPTIONS = {
    root: "Acceso total: captura, revisa y turna cualquier trámite en cualquier estatus.",
    admin: "Revisa y edita trámites en revisión; publica, devuelve, pide actualizar costos o da de baja.",
    romr: "Captura los trámites de su unidad en borrador; en Actualizar costos solo modifica apartados.",
    aux_romr: "Captura los trámites de su dependencia en borrador y en Actualizar costos.",
    rua: "Captura los trámites de su dependencia en borrador y en Actualizar costos.",
    aux_rua: "Captura los trámites de su unidad en borrador; en Actualizar costos solo modifica apartados.",
};

// Workflow order; Object.entries on integer keys would sort them numerically.
const ESTATUS_ORDER = [ESTATUS.ROMR, ESTATUS.ADMIN, ESTATUS.PUBLICO, ESTATUS.ACTUALIZAR_COSTOS, ESTATUS.BAJA];
export const estatusOptions = ESTATUS_ORDER.map((id) => opt(id, ESTATUS_META[id].label));
export const nivelGobiernoOptions = [opt(5105, "Federal"), opt(5106, "Estatal"), opt(5107, "Municipal")];
export const fictaOptions = [opt(42, "Positiva"), opt(43, "Negativa"), opt(44, "No aplica")];
export const digitalizacionOptions = [
    opt(26, "Nivel 1: Información"),
    opt(27, "Nivel 2: Descargar formatos"),
    opt(28, "Nivel 3: Mandar formatos"),
    opt(29, "Nivel 4: 100% digitalizado"),
];
export const vigenciaOptions = [
    opt(4950, "Días naturales"),
    opt(4951, "Días hábiles"),
    opt(4952, "Meses"),
    opt(4953, "Años"),
    opt(4954, "No aplica"),
];
export const OTRO_TIPO_TRAMITE = 1808;
export const DIGITALIZACION_TOTAL = 29;
export const tipoTramiteOptions = [
    opt(6, "Autorización"),
    opt(9, "Registro"),
    opt(11, "Aviso"),
    opt(12, "Pago"),
    opt(20, "Solicitud"),
    opt(2503, "Licencia"),
    opt(2510, "Permiso"),
    opt(OTRO_TIPO_TRAMITE, "Otro"),
];
export const monedaOptions = [
    opt(53, "Pesos Mexicanos"),
    opt(54, "Dólar"),
    opt(55, "Euro"),
    opt(5295, "UDIS"),
    opt(5291, "UMA"),
    opt(5292, "Otro"),
];
export const momentoPagoOptions = [
    opt(65, "Previo al inicio del trámite"),
    opt(66, "Posterior al inicio y previo a la resolución"),
    opt(67, "Posterior a la resolución"),
];
export const MODALIDAD_TIPOS = {
    presencial: "Presencial",
    en_linea: "En Línea",
    hibrida: "Híbrida (Presencial/En Línea)",
    otra: "Otra (WhatsApp, teléfono, etc.)",
};
export const modalidadTipoOptions = Object.entries(MODALIDAD_TIPOS).map(([v, l]) => opt(v, l));
/** Types that publish a URL: online and hybrid modalidades. */
export const modalidadNeedsUrl = (tipo) => tipo === "en_linea" || tipo === "hibrida";
export const tipoOficinaOptions = [
    opt(790, "Unidad administrativa responsable"),
    opt(1683, "Kiosko"),
    opt(1684, "Oficina central"),
    opt(1685, "Delegación"),
    opt(1686, "Ventanilla"),
];
export const ambitoOptions = [opt(4906, "Nacional"), opt(3, "Federal"), opt(4, "Estatal"), opt(5, "Municipal")];
export const tipoOrdenamientoOptions = [
    "Constitución", "Código", "Ley", "Reglamento", "Decreto",
    "Convenio", "Acuerdo", "Programa", "Manual", "Declaratoria",
].map((l) => opt(l, l));
export const tipoDocumentoOptions = [
    opt(776, "Otro"), opt(770, "Comprobante"), opt(771, "Concesión"), opt(772, "Escrito libre"),
    opt(773, "Estudio técnico"), opt(774, "Formato"), opt(775, "Licencia"),
];
export const naturalezaOptions = [
    opt(5141, "Documento para entrega"), opt(5142, "Para cotejo"), opt(5143, "No documental"),
];
export const tipoInstitucionOptions = [
    opt(763, "Ciudadano"), opt(764, "Estatal"), opt(766, "Gobierno federal"),
    opt(767, "Municipal"), opt(769, "Sector privado"),
];
export const lineaPasoOptions = [opt(0, "Lista A"), opt(1, "Lista B"), opt(2, "Subpaso")];

export const labelOf = (options, value) => options.find((o) => o.value === value)?.label ?? "-";

export const solicitanteOptions = [
    opt("fisica", "Persona física"),
    opt("moral", "Persona moral"),
    opt("ambas", "Persona física o moral"),
];
export const sectorOptions = [
    "Salud", "Medio ambiente", "Finanzas", "Comercio", "Educación", "Desarrollo urbano", "Agricultura",
].map((l) => opt(l, l));

// Shared http/https URL check (api validation and form rules).
export const URL_PATTERN = /^https?:\/\/[^\s/$.?#][^\s]*$/i;
export const yesNoOptions = [opt(true, "Sí"), opt(false, "No")];
