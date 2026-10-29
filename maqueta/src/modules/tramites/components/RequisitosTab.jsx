import { Collapse, Form, Input, InputNumber, Radio, Select, Tag } from "antd";
import ApartadoPanel from "./ApartadoPanel";
import ModalidadScope from "./ModalidadScope";
import TramiteLinkSelect from "./TramiteLinkSelect";
import { tipoDocumentoOptions, naturalezaOptions, tipoInstitucionOptions, labelOf, URL_PATTERN, yesNoOptions } from "@/modules/mock/catalogs";

const DETAIL_TAGS = [
    ["original", "Original"], ["copiasCertificadas", "Copias certificadas"], ["requiereFirma", "Requiere firma"],
    ["revisionTercero", "Revisión de un tercero"], ["parteFormato", "Parte de un formato"],
];

const yesNoItem = (name, label) => (
    <Form.Item name={name} label={label} initialValue={false}>
        <Radio.Group options={yesNoOptions} optionType="button" />
    </Form.Item>
);

const columns = [
    {
        title: "Requisito", dataIndex: "nombre",
        render: (v, r) => (
            <div>
                <span className={r.activo ? "" : "mq-struck"}>{v}</span>
                <div className="mq-tags-line">
                    {DETAIL_TAGS.filter(([k]) => r[k]).map(([k, label]) => <Tag key={k}>{label}</Tag>)}
                    {r.esTramite && r.tramiteVinculadoId && <Tag color="blue">Trámite vinculado #{r.tramiteVinculadoId}</Tag>}
                    {r.urlFormato && <a href={r.urlFormato} target="_blank" rel="noopener noreferrer">Descargar formato</a>}
                </div>
            </div>
        ),
    },
    { title: "Tipo de documento", dataIndex: "tipoDocumento", render: (v) => labelOf(tipoDocumentoOptions, v), responsive: ["md"] },
    { title: "Naturaleza", dataIndex: "naturaleza", render: (v) => labelOf(naturalezaOptions, v), responsive: ["md"] },
    { title: "Expide", dataIndex: "tipoInstitucion", render: (v) => labelOf(tipoInstitucionOptions, v), responsive: ["lg"] },
    { title: "Copias", dataIndex: "copias", width: 80 },
];

const required = (message) => [{ required: true, message }];

const RequisitosTab = ({ tramite }) => (
    <ModalidadScope tramite={tramite}>
        {(modalidad) => (
            <ApartadoPanel
                key={modalidad.id} section="requisitos" singular="requisito" tramite={tramite} columns={columns}
                rows={tramite.apartados.requisitos.filter((r) => r.modalidadId === modalidad.id)}
                fixedValues={{ modalidadId: modalidad.id }}
                toForm={(i) => ({
                    ...i,
                    tramiteVinculado: i.tramiteVinculadoId
                        ? { value: i.tramiteVinculadoId, label: `#${i.tramiteVinculadoId} ${i.tramiteVinculadoNombre ?? ""}`.trim() }
                        : undefined,
                })}
                toPayload={({ tramiteVinculado, ...v }) => ({
                    ...v,
                    tramiteVinculadoId: v.esTramite ? tramiteVinculado?.value : undefined,
                    tramiteVinculadoNombre: v.esTramite ? tramiteVinculado?.label?.replace(/^#\d+\s*/, "") : undefined,
                })}
                renderFields={() => (
                    <>
                        <Form.Item name="nombre" label="Nombre del requisito" rules={[{ required: true, whitespace: true, message: "Capture el nombre del requisito." }]}>
                            <Input maxLength={300} showCount placeholder="Ej. Identificación oficial vigente" />
                        </Form.Item>
                        <Form.Item name="tipoDocumento" label="Tipo de documento" rules={required("Seleccione el tipo de documento.")}>
                            <Select options={tipoDocumentoOptions} placeholder="Seleccione el tipo de documento" />
                        </Form.Item>
                        <Form.Item name="naturaleza" label="Naturaleza" rules={required("Seleccione la naturaleza del requisito.")}>
                            <Select options={naturalezaOptions} placeholder="Seleccione la naturaleza" />
                        </Form.Item>
                        <Form.Item name="tipoInstitucion" label="Tipo de institución que lo expide" rules={required("Seleccione quién expide el documento.")}>
                            <Select options={tipoInstitucionOptions} placeholder="Seleccione el tipo de institución" />
                        </Form.Item>
                        <Form.Item name="copias" label="Número de copias" initialValue={1} rules={[{ required: true, message: "Capture el número de copias." }]}>
                            <InputNumber min={0} max={20} precision={0} style={{ width: 120 }} placeholder="Ej. 1" />
                        </Form.Item>
                        <Collapse
                            ghost size="small"
                            items={[{
                                key: "mas", label: "Más detalles del requisito", forceRender: true,
                                children: (
                                    <>
                                        <Form.Item name="descripcion" label="Descripción detallada" rules={[{ max: 1000, message: "Máximo 1000 caracteres." }]}>
                                            <Input.TextArea rows={3} maxLength={1000} showCount placeholder="Ej. Copia legible por ambos lados, sin tachaduras ni enmendaduras" />
                                        </Form.Item>
                                        {yesNoItem("esDocumento", "¿Es un documento?")}
                                        {yesNoItem("original", "¿Se presenta en original?")}
                                        {yesNoItem("copiasCertificadas", "¿Requiere copias certificadas?")}
                                        {yesNoItem("requiereFirma", "¿Requiere firma?")}
                                        <Form.Item
                                            name="urlFormato" label="URL de descarga del formato"
                                            rules={[{ pattern: URL_PATTERN, message: "Capture una URL válida (por ejemplo https://sitio.gob.mx)." }]}
                                        >
                                            <Input placeholder="Ej. https://tramites.michoacan.gob.mx/formatos/solicitud.pdf" />
                                        </Form.Item>
                                        {yesNoItem("esTramite", "¿Es un trámite?")}
                                        <Form.Item noStyle dependencies={["esTramite"]}>
                                            {({ getFieldValue }) => getFieldValue("esTramite") && (
                                                <Form.Item name="tramiteVinculado" label="Trámite vinculado">
                                                    <TramiteLinkSelect />
                                                </Form.Item>
                                            )}
                                        </Form.Item>
                                        <Form.Item name="institucionEmite" label="Institución que emite" rules={[{ max: 255, message: "Máximo 255 caracteres." }]}>
                                            <Input maxLength={255} showCount placeholder="Ej. Registro Civil del Estado de Michoacán" />
                                        </Form.Item>
                                        {yesNoItem("revisionTercero", "¿Requiere revisión por un tercero?")}
                                        {yesNoItem("parteFormato", "¿Es parte de un formato?")}
                                    </>
                                ),
                            }]}
                        />
                    </>
                )}
            />
        )}
    </ModalidadScope>
);

export default RequisitosTab;
