// Labels and catalog bindings of the 33 tramite fields (used by audit trail and forms).
import {
    tipoTramiteOptions, nivelGobiernoOptions, fictaOptions, digitalizacionOptions,
    vigenciaOptions, solicitanteOptions,
} from "./catalogs";

export const FIELD_DEFS = {
    dependenciaId: { label: "Dependencia" },
    unidadId: { label: "Unidad" },
    nombre: { label: "Nombre del trámite" },
    nombreCiudadano: { label: "Nombre ciudadano" },
    tipoTramite: { label: "Tipo de trámite", options: tipoTramiteOptions },
    otroTipo: { label: "Otro tipo de trámite" },
    sector: { label: "Sector" },
    nivelGobierno: { label: "Nivel de gobierno", options: nivelGobiernoOptions },
    entidad: { label: "Entidad" },
    municipio: { label: "Municipio" },
    ficta: { label: "Respuesta ficta", options: fictaOptions },
    casos: { label: "Casos en que se presenta" },
    descripcion: { label: "Descripción ciudadana" },
    beneficio: { label: "Beneficio para el solicitante" },
    notas: { label: "Notas" },
    tiempoPromedio: { label: "Tiempo promedio de resolución" },
    tipoSolicitante: { label: "Tipo de solicitante", options: solicitanteOptions },
    descSolicitante: { label: "Descripción del solicitante" },
    digitalizacion: { label: "Nivel de digitalización", options: digitalizacionOptions },
    urlDigital: { label: "URL del trámite en línea" },
    cantidadVigencia: { label: "Cantidad de vigencia" },
    unidadVigencia: { label: "Unidad de vigencia", options: vigenciaOptions },
    descVigencia: { label: "Descripción de la vigencia" },
    periodoPresentacion: { label: "Periodo de presentación" },
    periodoDescripcion: { label: "Descripción del periodo" },
    plazoRespuesta: { label: "Plazo de respuesta (días)" },
    plazoPrevencion: { label: "Plazo de prevención (días)" },
    volumenAnual: { label: "Volumen anual" },
    resolucionesFavorables: { label: "Resoluciones favorables" },
    numeroFormatos: { label: "Número de formatos" },
    descFormatos: { label: "Descripción de formatos" },
    gratuito: { label: "Gratuito" },
    suficienteRequisitos: { label: "Basta cumplir requisitos" },
};

export const FIELD_KEYS = Object.keys(FIELD_DEFS);

export function formatFieldValue(key, value, extraLookup) {
    if (typeof value === "boolean") return value ? "Sí" : "No";
    if (value === "" || value === null || value === undefined) return "(vacío)";
    const def = FIELD_DEFS[key];
    if (def?.options) return def.options.find((o) => o.value === value)?.label ?? String(value);
    if (extraLookup?.[key]) return extraLookup[key](value) ?? String(value);
    return String(value);
}
