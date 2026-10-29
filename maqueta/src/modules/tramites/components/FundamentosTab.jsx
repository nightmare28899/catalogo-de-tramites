import { useState } from "react";
import { Checkbox, Col, Form, Input, Row, Switch, Tag, Typography } from "antd";
import ApartadoPanel from "./ApartadoPanel";
import LeyPicker from "./LeyPicker";
import { isCelemDown, setCelemDown } from "@/modules/mock/celem";
import { ambitoOptions, labelOf } from "@/modules/mock/catalogs";

const DETAIL_FIELDS = [
    ["fraccion", "Fracción"], ["inciso", "Inciso"], ["parrafo", "Párrafo"], ["numero", "Número"], ["letra", "Letra"],
];
const DETAIL_PLACEHOLDERS = { fraccion: "Ej. II", inciso: "Ej. a", parrafo: "Ej. Tercero", numero: "Ej. 4", letra: "Ej. B" };

const columns = [
    { title: "Ordenamiento", dataIndex: "nombreLey", render: (v, r) => <span className={r.activo ? "" : "mq-struck"}>{v || "-"}</span> },
    {
        title: "Artículo", dataIndex: "articulo", width: 200,
        render: (v, r) => {
            const detail = DETAIL_FIELDS.filter(([k]) => r[k]).map(([k, label]) => `${label} ${r[k]}`);
            return (
                <div>
                    {v}
                    {detail.length > 0 && <div className="mq-hint-small">{detail.join(" · ")}</div>}
                    <div className="mq-tags-line">
                        {r.aplicaInspeccion && <Tag>Aplica a inspección</Tag>}
                        {r.aplicaFicta && <Tag>Aplica a respuesta ficta</Tag>}
                    </div>
                </div>
            );
        },
    },
    {
        title: "Vinculación", key: "vinculo", width: 150,
        render: (_, r) => (r.leyId ? <Tag color="green">Vinculado a CELEM</Tag> : <Tag color="gold">Sin vincular</Tag>),
    },
    { title: "Tipo", dataIndex: "tipo", responsive: ["md"], render: (v) => v ?? "-" },
    { title: "Ámbito", dataIndex: "ambito", responsive: ["md"], render: (v) => (v ? labelOf(ambitoOptions, v) : "-") },
    { title: "ID CELEM", dataIndex: "leyId", responsive: ["lg"] },
];

const FundamentosTab = ({ tramite }) => {
    const [down, setDown] = useState(isCelemDown());
    return (
        <ApartadoPanel
            section="fundamentos" singular="fundamento" tramite={tramite} columns={columns}
            intro={
                <div className="mq-hint">
                    <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
                        La búsqueda de leyes depende de CELEM; si no está disponible se muestran solo los fundamentos guardados.
                    </Typography.Paragraph>
                    <label className="mq-inline-switch">
                        <Switch size="small" checked={down} onChange={(v) => { setCelemDown(v); setDown(v); }} />
                        <span>Demo: simular CELEM no disponible</span>
                    </label>
                </div>
            }
            toForm={(i) => ({ ...i, ley: { leyId: i.leyId, nombreLey: i.nombreLey, tipo: i.tipo, ambito: i.ambito, fecha: i.fecha } })}
            toPayload={({ ley, ...rest }) => ({ ...rest, ...ley })}
            renderFields={() => (
                <>
                    <Form.Item
                        name="ley" label="Ordenamiento (CELEM)"
                        rules={[{
                            // Saving without ley is allowed only while the CELEM-down simulation is on (flagged "Sin vincular").
                            validator: (_, v) => (v?.leyId || isCelemDown() ? Promise.resolve() : Promise.reject(new Error("Busque y seleccione un ordenamiento."))),
                        }]}
                    >
                        <LeyPicker />
                    </Form.Item>
                    <Form.Item name="articulo" label="Artículo o fracción" rules={[{ required: true, whitespace: true, message: "Capture el artículo o fracción aplicable." }]}>
                        <Input maxLength={200} showCount placeholder="Ej. Artículo 15, fracción II" />
                    </Form.Item>
                    <Row gutter={8}>
                        {DETAIL_FIELDS.map(([name, label]) => (
                            <Col key={name} xs={12} sm={8} md={{ flex: "1 1 0" }}>
                                <Form.Item name={name} label={label} rules={[{ max: 50, message: "Máximo 50 caracteres." }]}>
                                    <Input maxLength={50} placeholder={DETAIL_PLACEHOLDERS[name]} />
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                    <Form.Item name="aplicaInspeccion" valuePropName="checked" style={{ marginBottom: 4 }}>
                        <Checkbox>Aplica a inspección</Checkbox>
                    </Form.Item>
                    <Form.Item name="aplicaFicta" valuePropName="checked">
                        <Checkbox>Aplica a respuesta ficta</Checkbox>
                    </Form.Item>
                </>
            )}
        />
    );
};

export default FundamentosTab;
