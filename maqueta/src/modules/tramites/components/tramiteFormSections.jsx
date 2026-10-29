import { Form, Input, Radio, Select, Switch } from "antd";
import {
    tipoTramiteOptions, OTRO_TIPO_TRAMITE, sectorOptions, nivelGobiernoOptions, fictaOptions,
    solicitanteOptions, digitalizacionOptions, DIGITALIZACION_TOTAL, vigenciaOptions,
} from "@/modules/mock/catalogs";

const text = (message) => [{ required: true, whitespace: true, message }];
const pick = (message) => [{ required: true, message }];
const integer = (label) => ({ pattern: /^\d{1,9}$/, message: `${label}: capture solo números enteros (máximo 9 dígitos).` });
const area = (max, rows = 3, placeholder) => <Input.TextArea rows={rows} maxLength={max} showCount placeholder={placeholder} />;

export const FORM_SECTIONS = [
    {
        key: "identificacion", title: "Identificación",
        names: ["dependenciaId", "unidadId", "nombre", "nombreCiudadano", "tipoTramite", "otroTipo", "sector"],
        Fields: ({ form, orgs, locked }) => {
            const dependenciaId = Form.useWatch("dependenciaId", form);
            const tipo = Form.useWatch("tipoTramite", form);
            const unidades = (orgs?.unidades ?? []).filter((u) => u.dependenciaId === dependenciaId);
            return (
                <>
                    <Form.Item name="dependenciaId" label="Dependencia" rules={pick("Seleccione la dependencia.")}>
                        <Select
                            disabled={Boolean(locked)} placeholder="Seleccione la dependencia"
                            options={(orgs?.dependencias ?? []).map((d) => ({ value: d.id, label: d.nombre }))}
                            onChange={() => form.setFieldValue("unidadId", undefined)}
                        />
                    </Form.Item>
                    <Form.Item name="unidadId" label="Unidad" rules={pick("Seleccione la unidad responsable.")}
                        extra={locked ? "Su usuario solo puede capturar trámites de esta unidad." : undefined}>
                        <Select
                            disabled={Boolean(locked) || !dependenciaId} placeholder={dependenciaId ? "Seleccione" : "Seleccione primero la dependencia"}
                            options={unidades.map((u) => ({ value: u.id, label: u.nombre }))}
                        />
                    </Form.Item>
                    <Form.Item name="nombre" label="Nombre del trámite" rules={text("Capture el nombre del trámite.")}>
                        <Input maxLength={500} showCount placeholder="Ej. Pago de derechos de control vehicular" />
                    </Form.Item>
                    <Form.Item name="nombreCiudadano" label="Nombre ciudadano" rules={text("Capture el nombre con el que la ciudadanía conoce el trámite.")}>
                        <Input maxLength={500} showCount placeholder="Ej. Pago de la tenencia vehicular" />
                    </Form.Item>
                    <Form.Item name="tipoTramite" label="Tipo de trámite" rules={pick("Seleccione el tipo de trámite.")}>
                        <Select options={tipoTramiteOptions} placeholder="Seleccione el tipo de trámite" />
                    </Form.Item>
                    {tipo === OTRO_TIPO_TRAMITE && (
                        <Form.Item name="otroTipo" label="Otro tipo de trámite" rules={text("Especifique el tipo de trámite.")}>
                            <Input maxLength={200} showCount placeholder="Especifique el tipo de trámite" />
                        </Form.Item>
                    )}
                    <Form.Item name="sector" label="Sector">
                        <Select options={sectorOptions} allowClear placeholder="Seleccione el sector" />
                    </Form.Item>
                </>
            );
        },
    },
    {
        key: "clasificacion", title: "Clasificación", names: ["nivelGobierno", "entidad", "municipio", "ficta"],
        Fields: () => (
            <>
                <Form.Item name="nivelGobierno" label="Nivel de gobierno" rules={pick("Seleccione el nivel de gobierno.")}>
                    <Select options={nivelGobiernoOptions} placeholder="Seleccione el nivel de gobierno" />
                </Form.Item>
                <Form.Item name="entidad" label="Entidad federativa" rules={text("Capture la entidad federativa.")}>
                    <Input maxLength={100} placeholder="Ej. Michoacán" />
                </Form.Item>
                <Form.Item name="municipio" label="Municipio" rules={text("Capture el municipio.")}>
                    <Input maxLength={100} placeholder="Ej. Morelia" />
                </Form.Item>
                <Form.Item name="ficta" label="Respuesta ficta" rules={pick("Seleccione el tipo de respuesta ficta.")}>
                    <Select options={fictaOptions} placeholder="Seleccione el tipo de respuesta ficta" />
                </Form.Item>
            </>
        ),
    },
    {
        key: "descripcion", title: "Descripción", names: ["casos", "descripcion", "beneficio", "notas", "tiempoPromedio"],
        Fields: () => (
            <>
                <Form.Item name="casos" label="Casos en que se presenta">{area(1000, 3, "Describa en qué casos se presenta el trámite")}</Form.Item>
                <Form.Item name="descripcion" label="Descripción ciudadana" rules={text("Capture la descripción ciudadana; es obligatoria.")}>{area(10000, 6, "Describa el trámite en lenguaje claro para la ciudadanía")}</Form.Item>
                <Form.Item name="beneficio" label="Beneficio para el solicitante">{area(254, 2, "Describa el beneficio que obtiene el solicitante")}</Form.Item>
                <Form.Item name="notas" label="Notas">{area(254, 2, "Escriba notas adicionales sobre el trámite")}</Form.Item>
                <Form.Item name="tiempoPromedio" label="Tiempo promedio de resolución">{area(1000, 2, "Ej. 10 días hábiles a partir de la recepción completa")}</Form.Item>
            </>
        ),
    },
    {
        key: "solicitante", title: "Solicitante", names: ["tipoSolicitante", "descSolicitante"],
        Fields: () => (
            <>
                <Form.Item name="tipoSolicitante" label="Tipo de solicitante" rules={pick("Seleccione el tipo de solicitante.")}>
                    <Select options={solicitanteOptions} placeholder="Seleccione el tipo de solicitante" />
                </Form.Item>
                <Form.Item name="descSolicitante" label="Descripción del solicitante">{area(500, 3, "Describa quién puede solicitar el trámite")}</Form.Item>
            </>
        ),
    },
    {
        key: "digitalizacion", title: "Digitalización", names: ["digitalizacion", "urlDigital"],
        Fields: ({ form }) => {
            const nivel = Form.useWatch("digitalizacion", form);
            return (
                <>
                    <Form.Item name="digitalizacion" label="Nivel de digitalización" rules={pick("Seleccione el nivel de digitalización.")}>
                        <Select options={digitalizacionOptions} placeholder="Seleccione el nivel de digitalización" />
                    </Form.Item>
                    {nivel === DIGITALIZACION_TOTAL && (
                        <Form.Item
                            name="urlDigital" label="URL del trámite en línea"
                            rules={[...text("El nivel 4 requiere la URL donde se realiza el trámite."), { type: "url", message: "Capture una URL válida que inicie con http:// o https://." }]}
                        >
                            <Input maxLength={500} showCount placeholder="https://" />
                        </Form.Item>
                    )}
                </>
            );
        },
    },
    {
        key: "plazos", title: "Plazos",
        names: ["cantidadVigencia", "unidadVigencia", "descVigencia", "periodoPresentacion", "periodoDescripcion", "plazoRespuesta", "plazoPrevencion"],
        Fields: ({ form }) => {
            const unidad = Form.useWatch("unidadVigencia", form);
            const periodo = Form.useWatch("periodoPresentacion", form);
            return (
                <>
                    <Form.Item name="unidadVigencia" label="Unidad de vigencia" rules={pick("Seleccione la unidad de vigencia.")}>
                        <Select options={vigenciaOptions} placeholder="Seleccione la unidad de vigencia" />
                    </Form.Item>
                    {unidad !== 4954 && (
                        <Form.Item name="cantidadVigencia" label="Cantidad de vigencia"
                            rules={[...text("Capture la cantidad de vigencia."), integer("Cantidad de vigencia")]}>
                            <Input inputMode="numeric" maxLength={9} placeholder="Ej. 2" />
                        </Form.Item>
                    )}
                    <Form.Item name="descVigencia" label="Descripción de la vigencia">{area(500, 2, "Describa las condiciones de la vigencia")}</Form.Item>
                    <Form.Item name="periodoPresentacion" label="¿Tiene periodo de presentación?">
                        <Radio.Group options={[{ value: true, label: "Sí" }, { value: false, label: "No" }]} />
                    </Form.Item>
                    {periodo && (
                        <Form.Item name="periodoDescripcion" label="Descripción del periodo" rules={text("Describa el periodo de presentación.")}>
                            {area(500, 2, "Ej. Del 1 de enero al 31 de marzo de cada año")}
                        </Form.Item>
                    )}
                    <Form.Item name="plazoRespuesta" label="Plazo de respuesta en días hábiles" rules={[integer("Plazo de respuesta")]}>
                        <Input inputMode="numeric" maxLength={9} placeholder="Ej. 30" />
                    </Form.Item>
                    <Form.Item name="plazoPrevencion" label="Plazo de prevención en días hábiles" rules={[integer("Plazo de prevención")]}>
                        <Input inputMode="numeric" maxLength={9} placeholder="Ej. 5" />
                    </Form.Item>
                </>
            );
        },
    },
    {
        key: "cifras", title: "Cifras", names: ["volumenAnual", "resolucionesFavorables", "numeroFormatos", "descFormatos"],
        Fields: ({ form }) => (
            <>
                <Form.Item name="volumenAnual" label="Volumen anual de solicitudes" rules={[integer("Volumen anual")]}>
                    <Input inputMode="numeric" maxLength={9} placeholder="Ej. 12000" />
                </Form.Item>
                <Form.Item
                    name="resolucionesFavorables" label="Resoluciones favorables al año"
                    dependencies={["volumenAnual"]}
                    rules={[integer("Resoluciones favorables"), {
                        validator: (_, v) => {
                            const vol = Number(form.getFieldValue("volumenAnual"));
                            return v && vol && Number(v) > vol
                                ? Promise.reject(new Error("Las resoluciones favorables no pueden superar el volumen anual."))
                                : Promise.resolve();
                        },
                    }]}
                >
                    <Input inputMode="numeric" maxLength={9} placeholder="Ej. 11500" />
                </Form.Item>
                <Form.Item name="numeroFormatos" label="Número de formatos" rules={[integer("Número de formatos")]}>
                    <Input inputMode="numeric" maxLength={3} placeholder="Ej. 2" />
                </Form.Item>
                <Form.Item name="descFormatos" label="Descripción de formatos">{area(500, 2, "Describa los formatos que se utilizan")}</Form.Item>
            </>
        ),
    },
    {
        key: "otros", title: "Otros", names: ["gratuito", "suficienteRequisitos"],
        Fields: () => (
            <>
                <Form.Item name="gratuito" label="¿El trámite es gratuito?" valuePropName="checked">
                    <Switch checkedChildren="Sí" unCheckedChildren="No" />
                </Form.Item>
                <Form.Item name="suficienteRequisitos" label="¿Basta con cumplir los requisitos para obtener la resolución?" valuePropName="checked">
                    <Switch checkedChildren="Sí" unCheckedChildren="No" />
                </Form.Item>
            </>
        ),
    },
];

/** Title of the form step where a partial save stopped (clamped to the existing steps). */
export const stepTitle = (index) => FORM_SECTIONS[Math.min(Math.max(Number(index) || 0, 0), FORM_SECTIONS.length - 1)].title;

export const DEFAULT_VALUES = {
    nivelGobierno: 5106, entidad: "Michoacán", municipio: "Morelia", unidadVigencia: 4954,
    periodoPresentacion: false, gratuito: false, suficienteRequisitos: false,
};
