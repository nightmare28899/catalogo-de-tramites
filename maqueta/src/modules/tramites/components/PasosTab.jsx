import { Form, Input, Select, Tag } from "antd";
import ApartadoPanel from "./ApartadoPanel";
import RichTextInput from "./RichTextInput";
import SafeRichText from "./SafeRichText";
import { numberPasos } from "@/modules/tramites/utils";
import { lineaPasoOptions, labelOf, URL_PATTERN } from "@/modules/mock/catalogs";

const PasosTab = ({ tramite }) => {
    const { sorted, labels } = numberPasos(tramite.apartados.pasos);
    const columns = [
        { title: "N.º", key: "n", width: 70, render: (_, r) => <strong>{labels[r.id]}</strong> },
        { title: "Lista", dataIndex: "linea", width: 110, render: (v) => <Tag>{labelOf(lineaPasoOptions, v)}</Tag> },
        { title: "Descripción", dataIndex: "texto", render: (v, r) => <div className={r.activo ? "" : "mq-struck"}><SafeRichText text={v} /></div> },
        {
            title: "URL", dataIndex: "url", responsive: ["md"],
            render: (v) => (v ? <a href={v} target="_blank" rel="noopener noreferrer">Abrir enlace</a> : "-"),
        },
    ];
    return (
        <ApartadoPanel
            section="pasos" singular="paso" tramite={tramite} columns={columns} rows={sorted}
            intro={<p className="mq-hint">La numeración es automática y solo considera pasos activos. Formato permitido: negritas y listas.</p>}
            renderFields={() => (
                <>
                    <Form.Item name="linea" label="Tipo de lista" initialValue={0} rules={[{ required: true, message: "Seleccione el tipo de lista." }]}>
                        <Select options={lineaPasoOptions} placeholder="Seleccione el tipo de lista" />
                    </Form.Item>
                    <Form.Item name="texto" label="Descripción del paso" rules={[{ required: true, whitespace: true, message: "Describa el paso." }]}>
                        <RichTextInput placeholder="Describa el paso que debe realizar el solicitante" />
                    </Form.Item>
                    <Form.Item name="url" label="URL del paso" rules={[{ pattern: URL_PATTERN, message: "Capture una URL válida (por ejemplo https://sitio.gob.mx)." }]}>
                        <Input placeholder="Ej. https://tramites.michoacan.gob.mx/solicitud" />
                    </Form.Item>
                </>
            )}
        />
    );
};

export default PasosTab;
