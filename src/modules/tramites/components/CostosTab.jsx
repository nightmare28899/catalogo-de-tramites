import { Form, Input, InputNumber, Select, Switch, Tag } from "antd";
import ApartadoPanel from "./ApartadoPanel";
import ModalidadScope from "./ModalidadScope";
import { monedaOptions, momentoPagoOptions, labelOf } from "@/modules/mock/catalogs";

const columns = [
    { title: "Concepto", dataIndex: "concepto", render: (v, r) => <span className={r.activo ? "" : "mq-struck"}>{v}</span> },
    {
        title: "Monto", key: "monto",
        render: (_, r) => (r.gratuito ? <Tag color="green">Gratuito</Tag> : `${Number(r.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} ${labelOf(monedaOptions, r.moneda)}`),
    },
    { title: "Momento de pago", dataIndex: "momento", render: (v, r) => (r.gratuito ? "-" : labelOf(momentoPagoOptions, v)), responsive: ["md"] },
];

const CostoFields = ({ form }) => {
    const gratuito = Form.useWatch("gratuito", form);
    return (
        <>
            <Form.Item name="concepto" label="Concepto" rules={[{ required: true, whitespace: true, message: "Capture el concepto del costo." }]}>
                <Input maxLength={200} showCount placeholder="Ej. Pago de derechos de control vehicular" />
            </Form.Item>
            <Form.Item name="gratuito" label="Gratuito" valuePropName="checked" initialValue={false}>
                <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>
            {!gratuito && (
                <>
                    <Form.Item
                        name="monto" label="Monto"
                        rules={[
                            { required: true, message: "Capture el monto." },
                            { type: "number", min: 0.01, message: "El monto debe ser mayor a cero; si no tiene costo, marque Gratuito." },
                        ]}
                    >
                        <InputNumber style={{ width: "100%" }} min={0} step={0.01} precision={2} decimalSeparator="." placeholder="Ej. 450.00" />
                    </Form.Item>
                    <Form.Item name="moneda" label="Moneda" initialValue={53} rules={[{ required: true, message: "Seleccione la moneda." }]}>
                        <Select options={monedaOptions} placeholder="Seleccione la moneda" />
                    </Form.Item>
                    <Form.Item name="momento" label="Momento de pago" rules={[{ required: true, message: "Seleccione el momento de pago." }]}>
                        <Select options={momentoPagoOptions} placeholder="Seleccione el momento de pago" />
                    </Form.Item>
                </>
            )}
        </>
    );
};

const CostosTab = ({ tramite }) => (
    <ModalidadScope tramite={tramite}>
        {(modalidad) => (
            <ApartadoPanel
                key={modalidad.id} section="costos" singular="costo" tramite={tramite} columns={columns}
                rows={tramite.apartados.costos.filter((c) => c.modalidadId === modalidad.id)}
                fixedValues={{ modalidadId: modalidad.id }}
                toPayload={(v) => (v.gratuito ? { ...v, monto: 0, momento: null } : v)}
                renderFields={(form) => <CostoFields form={form} />}
            />
        )}
    </ModalidadScope>
);

export default CostosTab;
