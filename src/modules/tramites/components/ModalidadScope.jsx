import { useState } from "react";
import { Alert, Select } from "antd";
import { MODALIDAD_TIPOS } from "@/modules/mock/catalogs";

/** Costos and requisitos are per modalidad: pick one first, then render children(modalidadId). */
const ModalidadScope = ({ tramite, children }) => {
    // Only active modalidades can receive costos and requisitos.
    const modalidades = tramite.apartados.modalidades.filter((m) => m.activo);
    const [selected, setSelected] = useState(null);
    const current = modalidades.find((m) => m.id === selected) ?? modalidades[0];

    if (!current) {
        return <Alert type="warning" showIcon title="Primero registre o active al menos una modalidad en la pestaña Modalidades." />;
    }
    return (
        <div>
            <div className="mq-scope">
                <label htmlFor="mq-modalidad-select">Modalidad</label>
                <Select
                    id="mq-modalidad-select" value={current.id} onChange={setSelected} style={{ minWidth: 260, maxWidth: "100%" }}
                    options={modalidades.map((m) => ({ value: m.id, label: `${m.nombre} (${MODALIDAD_TIPOS[m.tipo] ?? m.tipo})` }))}
                />
            </div>
            {children(current)}
        </div>
    );
};

export default ModalidadScope;
