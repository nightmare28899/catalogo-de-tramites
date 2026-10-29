// Deterministic seed for the mockup database.
import { ESTATUS } from "./catalogs";
import { LAWS } from "./celem";

const { ROMR, ADMIN, PUBLICO, ACTUALIZAR_COSTOS, BAJA } = ESTATUS;

export const SEED_VERSION = 4;

const DEPENDENCIAS = [
    { id: 1, nombre: "Secretaría de Finanzas y Administración" },
    { id: 2, nombre: "Secretaría de Salud" },
    { id: 3, nombre: "Secretaría de Medio Ambiente" },
];

const UNIDADES = [
    { id: 11, dependenciaId: 1, nombre: "Dirección de Ingresos" },
    { id: 12, dependenciaId: 1, nombre: "Dirección de Catastro" },
    { id: 13, dependenciaId: 1, nombre: "Subsecretaría de Administración" },
    { id: 21, dependenciaId: 2, nombre: "Dirección de Regulación Sanitaria" },
    { id: 22, dependenciaId: 2, nombre: "Dirección de Servicios de Salud" },
    { id: 31, dependenciaId: 3, nombre: "Dirección de Gestión Ambiental" },
    { id: 32, dependenciaId: 3, nombre: "Dirección de Recursos Naturales" },
];

const USERS = [
    { id: "u-root", nombre: "Usuario Root", rol: "root", dependenciaId: null, unidadId: null },
    { id: "u-admin", nombre: "Carlos Ortega", rol: "admin", dependenciaId: null, unidadId: null },
    { id: "u-romr", nombre: "Laura Méndez", rol: "romr", dependenciaId: 1, unidadId: 11 },
    { id: "u-aux-romr", nombre: "Marco Díaz", rol: "aux_romr", dependenciaId: 1, unidadId: 11 },
    { id: "u-rua", nombre: "Ana Torres", rol: "rua", dependenciaId: 1, unidadId: null },
    { id: "u-aux-rua", nombre: "Elena Ruiz", rol: "aux_rua", dependenciaId: 1, unidadId: 11 },
];

const OFICINAS = [
    [1, "Oficina Central de Recaudación", 1684, "Av. Madero Poniente 369, Centro", "Morelia"],
    [2, "Ventanilla Única Estatal", 1686, "Calle Allende 120, Centro", "Morelia"],
    [3, "Delegación Uruapan", 1685, "Av. Latinoamericana 450", "Uruapan"],
    [4, "Delegación Zamora", 1685, "Calle Hidalgo 88", "Zamora"],
    [5, "Kiosko Plaza Las Américas", 1683, "Plaza Las Américas, local 14", "Morelia"],
    [6, "Unidad Administrativa de Trámites", 790, "Libramiento Poniente 1500", "Morelia"],
    [7, "Delegación Lázaro Cárdenas", 1685, "Av. Lázaro Cárdenas 210", "Lázaro Cárdenas"],
    [8, "Ventanilla Digital Sahuayo", 1686, "Calle Juárez 45", "Sahuayo"],
].map(([id, nombre, tipo, direccion, municipio]) => ({ id, nombre, tipo, direccion, municipio }));

// [dependenciaId, unidadId, name, tipoTramite, estatus]
const TRAMITES = [
    [1, 11, "Inscripción al padrón de contribuyentes estatales", 9, ROMR],
    [1, 11, "Pago del impuesto sobre nóminas", 12, ROMR],
    [1, 11, "Constancia de no adeudo fiscal", 20, ROMR],
    [1, 11, "Autorización de pago en parcialidades", 6, ADMIN],
    [1, 11, "Aviso de cambio de domicilio fiscal", 11, PUBLICO],
    [1, 11, "Devolución de pago de lo indebido", 20, ACTUALIZAR_COSTOS],
    [1, 11, "Registro de contribuyente del impuesto sobre hospedaje", 9, BAJA],
    [1, 11, "Solicitud de condonación de multas", 20, PUBLICO],
    [1, 12, "Certificado de valor catastral", 20, ROMR],
    [1, 12, "Aviso de traslado de dominio", 11, ADMIN],
    [1, 12, "Registro de cédula catastral", 9, PUBLICO],
    [1, 13, "Registro en el padrón de proveedores", 9, ROMR],
    [2, 21, "Licencia sanitaria", 2503, PUBLICO],
    [2, 21, "Aviso de funcionamiento de establecimiento", 11, PUBLICO],
    [2, 21, "Permiso de publicidad de insumos para la salud", 2510, ADMIN],
    [2, 21, "Autorización de certificado de buenas prácticas", 6, ROMR],
    [2, 22, "Solicitud de copia de expediente clínico", 20, PUBLICO],
    [2, 22, "Registro de médicos pasantes en servicio social", 9, ROMR],
    [3, 31, "Autorización de impacto ambiental", 6, PUBLICO],
    [3, 31, "Licencia ambiental de funcionamiento", 2503, ACTUALIZAR_COSTOS],
    [3, 31, "Aviso de generación de residuos de manejo especial", 11, ADMIN],
    [3, 31, "Registro de prestadores de servicios ambientales", 9, ROMR],
    [3, 32, "Permiso de aprovechamiento forestal", 2510, PUBLICO],
    [3, 32, "Opinión técnica de uso de suelo", 1808, BAJA],
    // Extra Finanzas rows so every role has work in every status.
    [1, 11, "Constancia de inscripción en el padrón estatal", 20, ADMIN],
    [1, 11, "Solicitud de devolución de saldo a favor", 20, ADMIN],
    [1, 11, "Pago de derechos de control vehicular", 12, PUBLICO],
    [1, 11, "Actualización de tarifas de licencias de funcionamiento", 2503, ACTUALIZAR_COSTOS],
    [1, 11, "Pago del impuesto sobre adquisición de vehículos", 12, ACTUALIZAR_COSTOS],
    [1, 11, "Registro de recaudadores auxiliares", 9, BAJA],
    [1, 11, "Aviso de modificación de datos del contribuyente", 11, ROMR],
    [1, 12, "Constancia de no propiedad", 20, ACTUALIZAR_COSTOS],
    [1, 12, "Avalúo catastral para operaciones traslativas", 20, BAJA],
    [1, 13, "Registro de arrendadores de inmuebles", 9, PUBLICO],
    [1, 13, "Autorización de bajas de bienes muebles", 6, ADMIN],
];

// Draft (ROMR) tramites that are intentionally incomplete, by index.
const INCOMPLETE = { 0: "pasos", 2: "fundamentos", 8: "oficinas", 11: "modalidades", 17: "datos" };

// Draft tramites saved partially ("captura parcial"), by index: the form step (index in FORM_SECTIONS)
// where capture stopped. Fields of that step and later ones are left empty.
const PARTIAL = { 1: 2, 30: 4 };
const PARTIAL_BLANK = [
    [2, { casos: "", descripcion: "", beneficio: "", tiempoPromedio: "" }],
    [3, { tipoSolicitante: undefined, descSolicitante: "" }],
    [4, { digitalizacion: undefined, urlDigital: "" }],
    [5, { cantidadVigencia: "", plazoRespuesta: "", plazoPrevencion: "" }],
    [6, { volumenAnual: "", resolucionesFavorables: "", numeroFormatos: "", descFormatos: "" }],
];
const partialFields = (step) => Object.assign({}, ...PARTIAL_BLANK.filter(([from]) => step <= from).map(([, f]) => f));

const VENTANILLAS = ["Ventanilla de Ingresos", "Módulo de atención ciudadana", "Ventanilla de la unidad responsable"];
// Builds modalidad i (0..2) of a tramite: presencial, en línea and a hybrid/other variant.
function buildModalidad(i, idx) {
    if (i === 0) {
        return { tipo: "presencial", nombre: VENTANILLAS[idx % 3], url: "", nota: "Presente su documentación en la ventanilla indicada.", gratuita: false };
    }
    if (i === 1) {
        return { tipo: "en_linea", nombre: "Portal estatal", url: "https://tramites.michoacan.gob.mx/portal", nota: "Requiere cuenta ciudadana.", gratuita: false };
    }
    return idx % 2
        ? { tipo: "hibrida", nombre: "Cita en línea y entrega en oficina", url: "https://citas.michoacan.gob.mx/agenda", nota: "Agende su cita y acuda con su acuse.", gratuita: false }
        : { tipo: "otra", nombre: "Orientación por WhatsApp", url: "", nota: "Atención al 443 000 0000 en horario de oficina.", gratuita: true };
}
const REQUISITOS = [
    ["Identificación oficial vigente", 770, 5142, 763],
    ["Formato de solicitud debidamente requisitado", 774, 5141, 764],
    ["Comprobante de domicilio no mayor a tres meses", 770, 5141, 763],
];
// Optional extra fields (alignment with the real system) added to the requisitos of some trámites.
const REQUISITO_DETALLES = [
    { descripcion: "Credencial para votar, pasaporte o cédula profesional vigente.", esDocumento: true, original: true, requiereFirma: false, institucionEmite: "Instituto Nacional Electoral" },
    { descripcion: "Formato en dos tantos con firma autógrafa de la persona solicitante.", esDocumento: true, requiereFirma: true, urlFormato: "https://tramites.michoacan.gob.mx/formatos/solicitud.pdf", parteFormato: true },
    { descripcion: "Recibo de luz, agua o teléfono.", esDocumento: true, copiasCertificadas: true, esTramite: true, tramiteVinculadoId: 100, tramiteVinculadoNombre: "Inscripción al padrón de contribuyentes estatales", revisionTercero: true, institucionEmite: "Comisión Federal de Electricidad" },
];
const PASOS = [
    [0, "Reúna los **documentos** requeridos:\n- Identificación oficial\n- Formato de solicitud"],
    [0, "Acuda a la oficina indicada o ingrese al portal en línea."],
    [2, "Entregue la solicitud y obtenga su **acuse de recibo**."],
    [1, "Reciba la resolución en el medio que haya elegido."],
];

const isoDaysAgo = (days, hour = 10) => {
    const d = new Date(Date.UTC(2026, 9, 25, hour + 6, 0, 0));
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString();
};

function buildTramite(row, idx) {
    const [dependenciaId, unidadId, nombre, tipoTramite, estatus] = row;
    const digital = [26, 27, 28, 29][idx % 4];
    const gratuito = idx % 4 === 3;
    return {
        id: 100 + idx,
        dependenciaId,
        unidadId,
        nombre,
        nombreCiudadano: `Cómo realizar: ${nombre.toLowerCase()}`,
        tipoTramite,
        otroTipo: tipoTramite === 1808 ? "Opinión técnica" : "",
        sector: ["Finanzas", "Salud", "Medio ambiente"][dependenciaId - 1],
        nivelGobierno: 5106,
        entidad: "Michoacán",
        municipio: "Morelia",
        ficta: [42, 43, 44][idx % 3],
        casos: "Cuando la persona interesada requiera realizar este trámite ante el Gobierno del Estado.",
        descripcion: INCOMPLETE[idx] === "datos" ? "" : `Permite a la ciudadanía gestionar: ${nombre.toLowerCase()}. Incluye revisión de requisitos y emisión de resolución.`,
        beneficio: "Certeza jurídica para la persona solicitante.",
        notas: idx % 2 ? "Conserve su acuse de recibo." : "",
        tiempoPromedio: `${3 + (idx % 10)} días hábiles`,
        tipoSolicitante: ["fisica", "moral", "ambas"][idx % 3],
        descSolicitante: "Personas que cumplan con los requisitos señalados.",
        digitalizacion: INCOMPLETE[idx] === "datos" ? 29 : digital,
        urlDigital: digital === 29 && INCOMPLETE[idx] !== "datos" ? "https://tramites.michoacan.gob.mx/ejemplo" : "",
        cantidadVigencia: idx % 3 === 0 ? "" : String(1 + (idx % 12)),
        unidadVigencia: idx % 3 === 0 ? 4954 : [4950, 4951, 4952, 4953][idx % 4],
        descVigencia: "",
        periodoPresentacion: idx % 5 === 0,
        periodoDescripcion: idx % 5 === 0 ? "Del 1 de enero al 31 de marzo de cada año." : "",
        plazoRespuesta: String(5 + (idx % 8)),
        plazoPrevencion: String(2 + (idx % 4)),
        volumenAnual: String(500 + idx * 137),
        resolucionesFavorables: String(400 + idx * 101),
        numeroFormatos: String(1 + (idx % 3)),
        descFormatos: "Formato único de solicitud.",
        gratuito,
        suficienteRequisitos: idx % 2 === 0,
        estatus,
        createdBy: "u-romr",
        createdAt: isoDaysAgo(60 - idx),
        updatedAt: isoDaysAgo(idx % 12, 9 + (idx % 8)),
        parcial: idx in PARTIAL,
        pasoActual: PARTIAL[idx] ?? 0,
        ...(idx in PARTIAL ? partialFields(PARTIAL[idx]) : {}),
    };
}

export function buildSeed() {
    const db = {
        seedVersion: SEED_VERSION,
        counters: {},
        dependencias: DEPENDENCIAS,
        unidades: UNIDADES,
        users: USERS,
        oficinasCatalogo: OFICINAS,
        tramites: [],
        modalidades: [], oficinas: [], pasos: [], costos: [], fundamentos: [], requisitos: [],
        turnos: [], auditoria: [],
    };
    const nid = (k) => {
        db.counters[k] = (db.counters[k] ?? 0) + 1;
        return db.counters[k];
    };

    TRAMITES.forEach((row, idx) => {
        const t = buildTramite(row, idx);
        db.tramites.push(t);
        const gap = INCOMPLETE[idx];
        const owner = t.unidadId === 11 && t.dependenciaId === 1
            ? { id: "u-romr", nombre: "Laura Méndez" }
            : { id: null, nombre: "Responsable de la unidad" };

        const nMod = 1 + (idx % 3);
        const modIds = [];
        for (let i = 0; i < nMod; i += 1) {
            const id = nid("modalidades");
            modIds.push(id);
            db.modalidades.push({
                id, tramiteId: t.id, ...buildModalidad(i, idx),
                activo: gap === "modalidades" ? false : !(i === 1 && idx % 5 === 4),
            });
        }
        if (gap !== "oficinas") {
            [(idx % 8) + 1, ((idx + 3) % 8) + 1].slice(0, 1 + (idx % 2)).forEach((oficinaId, i) => {
                db.oficinas.push({
                    id: nid("oficinas"), tramiteId: t.id, oficinaId,
                    horario: "Lunes a viernes de 9:00 a 15:00 h", activo: !(i === 1 && idx % 7 === 6),
                });
            });
        }
        if (gap !== "pasos") {
            PASOS.slice(0, 3 + (idx % 2)).forEach(([linea, texto], i) => {
                db.pasos.push({
                    id: nid("pasos"), tramiteId: t.id, linea, texto, orden: i + 1, activo: true,
                    ...(i === 1 && idx % 3 === 1 ? { url: "https://tramites.michoacan.gob.mx/solicitud" } : {}),
                });
            });
        }
        if (gap !== "fundamentos") {
            [idx % LAWS.length, (idx + 5) % LAWS.length].slice(0, 1 + (idx % 2)).forEach((li) => {
                db.fundamentos.push({
                    id: nid("fundamentos"), tramiteId: t.id, leyId: LAWS[li].id,
                    nombreLey: LAWS[li].nombre, tipo: LAWS[li].tipo, ambito: LAWS[li].ambito, fecha: LAWS[li].fecha, articulo: `Artículo ${10 + li}`, activo: true,
                    ...(idx % 4 === 1 ? { fraccion: "II", inciso: "a", parrafo: "Segundo", aplicaInspeccion: true } : {}),
                    ...(idx % 4 === 2 ? { numero: "4", letra: "B", aplicaFicta: true } : {}),
                });
            });
        }
        db.costos.push({
            id: nid("costos"), tramiteId: t.id, modalidadId: modIds[0],
            concepto: t.gratuito ? "Sin costo" : "Derechos por trámite",
            monto: t.gratuito ? 0 : 150 + idx * 35.5, moneda: 53, momento: 65, gratuito: t.gratuito, activo: true,
        });
        if (idx % 3 === 0 && !t.gratuito) {
            db.costos.push({
                id: nid("costos"), tramiteId: t.id, modalidadId: modIds[0],
                concepto: "Reposición de documento", monto: 2, moneda: 5291, momento: 67, gratuito: false, activo: true,
            });
        }
        REQUISITOS.slice(0, 1 + (idx % 3)).forEach(([nombre, tipoDocumento, naturaleza, tipoInstitucion], ri) => {
            db.requisitos.push({
                id: nid("requisitos"), tramiteId: t.id, modalidadId: modIds[0], nombre,
                tipoDocumento, naturaleza, tipoInstitucion, copias: 1, activo: true,
                ...(idx % 3 === 1 ? REQUISITO_DETALLES[ri] : {}),
            });
        });

        // Turn history consistent with the final status.
        const admin = { id: "u-admin", nombre: "Carlos Ortega" };
        const chain = [];
        const e = t.estatus;
        if (e === ROMR && idx % 2 === 0) {
            chain.push([owner, ROMR, ADMIN, "Se envía para revisión."]);
            chain.push([admin, ADMIN, ROMR, "Falta detallar el fundamento y los pasos del trámite."]);
        }
        if ([ADMIN, PUBLICO, ACTUALIZAR_COSTOS, BAJA].includes(e)) chain.push([owner, ROMR, ADMIN, "Captura concluida."]);
        if ([PUBLICO, ACTUALIZAR_COSTOS, BAJA].includes(e)) chain.push([admin, ADMIN, PUBLICO, "Revisado y publicado."]);
        if (e === ACTUALIZAR_COSTOS) chain.push([admin, PUBLICO, ACTUALIZAR_COSTOS, "Actualización anual de costos."]);
        if (e === BAJA) chain.push([admin, PUBLICO, BAJA, "Trámite derogado por reforma normativa."]);
        chain.forEach(([user, from, to, observacion], i) => {
            db.turnos.push({
                id: nid("turnos"), tramiteId: t.id, userId: user.id, userName: user.nombre,
                from, to, observacion, at: isoDaysAgo(30 - i * 3 - (idx % 5), 11),
            });
        });
        db.auditoria.push({
            id: nid("auditoria"), tramiteId: t.id, userName: owner.nombre, accion: "Creación del trámite",
            at: t.createdAt, cambios: [],
        });
    });
    return db;
}
