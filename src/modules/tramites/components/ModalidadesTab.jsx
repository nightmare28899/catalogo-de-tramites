import { Form, Input, Select, Switch, Tag } from "antd";
import ApartadoPanel from "./ApartadoPanel";
import { MODALIDAD_TIPOS, modalidadTipoOptions, modalidadNeedsUrl } from "@/modules/mock/catalogs";

const URL_PATTERN = /^https?:\/\/[^\s/$.?#][^\s]*$/i;

const columns = [
    { title: "Nombre", dataIndex: "nombre", render: (v, r) => <span className={r.activo ? "" : "mq-struck"}>{v}</span> },
    { title: "Tipo", dataIndex: "tipo", render: (v) => <Tag>{MODALIDAD_TIPOS[v] ?? v}</Tag> },
    {
        title: "URL", dataIndex: "url", responsive: ["md"],
        render: (v) => (v ? <a href={v} target="_blank" rel="noreferrer">{v}</a> : "-"),
    },
    { title: "Nota", dataIndex: "nota", responsive: ["lg"], render: (v) => v || "-" },
    { title: "Gratuita", dataIndex: "gratuita", width: 100, render: (v) => (v ? <Tag color="green">Sí</Tag> : "No") },
];

const ModalidadFields = ({ form }) => {
    const tipo = Form.useWatch("tipo", form);
    return (
        <>
            <Form.Item name="tipo" label="Tipo de modalidad" rules={[{ required: true, message: "Seleccione el tipo de modalidad." }]}>
                <Select options={modalidadTipoOptions} placeholder="Seleccione el tipo de modalidad" />
            </Form.Item>
            <Form.Item name="nombre" label="Nombre de la modalidad" rules={[{ required: true, whitespace: true, message: "Capture el nombre de la modalidad." }]}>
                <Input maxLength={255} showCount placeholder="Por ejemplo: Ventanilla de Ingresos" />
            </Form.Item>
            {modalidadNeedsUrl(tipo) && (
                <Form.Item
                    name="url" label="URL"
                    rules={[
                        { required: true, whitespace: true, message: "Capture la URL de la modalidad." },
                        { pattern: URL_PATTERN, message: "Capture una URL válida, por ejemplo https://sitio.gob.mx." },
                    ]}
                >
                    <Input placeholder="https://" maxLength={500} />
                </Form.Item>
            )}
            <Form.Item name="nota" label="Nota (opcional)">
                <Input.TextArea rows={3} maxLength={500} showCount placeholder="Escriba una nota sobre la modalidad" />
            </Form.Item>
            <Form.Item name="gratuita" label="Gratuita" valuePropName="checked" initialValue={false}>
                <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>
        </>
    );
};

const toPayload = (v) => ({ ...v, url: modalidadNeedsUrl(v.tipo) ? v.url : "", nota: v.nota ?? "" });

const ModalidadesTab = ({ tramite }) => {
    const { modalidades, costos, requisitos } = tramite.apartados;

    // Warn before deactivating the last active modalidad or one that still carries costos/requisitos.
    const deactivateWarning = (item) => {
        const notes = [];
        if (modalidades.filter((m) => m.activo).length === 1) {
            notes.push("Es la última modalidad activa: el trámite quedará incompleto y no podrá enviarse a revisión.");
        }
        const nCostos = costos.filter((c) => c.modalidadId === item.id && c.activo).length;
        const nReq = requisitos.filter((r) => r.modalidadId === item.id && r.activo).length;
        if (nCostos || nReq) {
            notes.push(`Tiene ${nCostos} costo(s) y ${nReq} requisito(s) activos asociados que dejarán de ofrecerse al ciudadano.`);
        }
        return notes.length ? notes.join(" ") : null;
    };

    return (
        <ApartadoPanel
            section="modalidades" singular="modalidad" tramite={tramite} columns={columns}
            toPayload={toPayload} deactivateWarning={deactivateWarning}
            renderFields={(form) => <ModalidadFields form={form} />}
        />
    );
};

export default ModalidadesTab;
