import { Form, Input, Select } from "antd";
import ApartadoPanel from "./ApartadoPanel";
import { tipoOficinaOptions, labelOf } from "@/modules/mock/catalogs";
import { useOrgs } from "@/modules/tramites/hooks/useTramites";

const columns = [
    { title: "Oficina", key: "of", render: (_, r) => <span className={r.activo ? "" : "mq-struck"}>{r.oficina?.nombre ?? "-"}</span> },
    { title: "Tipo", key: "tipo", render: (_, r) => labelOf(tipoOficinaOptions, r.oficina?.tipo), responsive: ["md"] },
    { title: "Dirección", key: "dir", render: (_, r) => (r.oficina ? `${r.oficina.direccion}, ${r.oficina.municipio}` : "-"), responsive: ["lg"] },
    { title: "Horario", dataIndex: "horario" },
];

const OficinasTab = ({ tramite }) => {
    const { data: orgs } = useOrgs();
    const options = (orgs?.oficinas ?? []).map((o) => ({
        value: o.id, label: `${o.nombre} (${labelOf(tipoOficinaOptions, o.tipo)})`,
    }));
    return (
        <ApartadoPanel
            section="oficinas" singular="oficina" tramite={tramite} columns={columns}
            renderFields={() => (
                <>
                    <Form.Item name="oficinaId" label="Oficina del catálogo" rules={[{ required: true, message: "Seleccione la oficina que se vinculará." }]}>
                        <Select showSearch optionFilterProp="label" options={options} placeholder="Busque una oficina" />
                    </Form.Item>
                    <Form.Item name="horario" label="Horario de atención" rules={[{ required: true, whitespace: true, message: "Capture el horario de atención." }]}>
                        <Input maxLength={200} showCount placeholder="Lunes a viernes de 9:00 a 15:00 h" />
                    </Form.Item>
                </>
            )}
        />
    );
};

export default OficinasTab;
