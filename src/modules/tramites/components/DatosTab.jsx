import { Collapse, Descriptions } from "antd";
import { FIELD_DEFS, formatFieldValue } from "@/modules/mock/fieldDefs";
import { FORM_SECTIONS } from "@/modules/tramites/components/tramiteFormSections";

const WIDE_FIELDS = ["descripcion", "casos"];

/** Datos generales grouped by the same steps as the capture form; the first step starts open. */
const DatosTab = ({ tramite }) => {
    const lookup = {
        dependenciaId: () => tramite.dependenciaNombre,
        unidadId: () => tramite.unidadNombre,
    };
    const grouped = new Set(FORM_SECTIONS.flatMap((s) => s.names));
    // Fields not owned by any step still show up, so nothing captured is hidden.
    const leftovers = Object.keys(FIELD_DEFS).filter((k) => !grouped.has(k));
    const groups = [
        ...FORM_SECTIONS.map((s) => ({ key: s.key, title: s.title, names: s.names })),
        ...(leftovers.length ? [{ key: "extras", title: "Otros datos", names: leftovers }] : []),
    ];
    return (
        <Collapse
            className="mq-collapse" defaultActiveKey={[groups[0].key]}
            items={groups.map((g) => ({
                key: g.key,
                label: <span className="mq-collapse-title">{g.title}</span>,
                children: (
                    <Descriptions
                        size="small" column={{ xs: 1, md: 2 }}
                        items={g.names.filter((k) => FIELD_DEFS[k]).map((k) => ({
                            key: k, label: FIELD_DEFS[k].label,
                            children: formatFieldValue(k, tramite[k], lookup),
                            span: WIDE_FIELDS.includes(k) ? 2 : 1,
                        }))}
                    />
                ),
            }))}
        />
    );
};

export default DatosTab;
