import { useState } from "react";
import { Select } from "antd";
import { useTramiteSuggestions } from "@/modules/tramites/hooks/useTramites";

/** Search over existing trámites. Value shape: { value: id, label: "#id nombre" } (labelInValue). */
const TramiteLinkSelect = ({ value, onChange, id }) => {
    const [q, setQ] = useState("");
    const { items, pending, enabled } = useTramiteSuggestions(q);
    const options = items.map((t) => ({ value: t.id, label: `#${t.id} ${t.nombre}` }));
    return (
        <Select
            id={id} showSearch labelInValue allowClear filterOption={false}
            value={value} onChange={onChange} onSearch={setQ} options={options}
            placeholder="Busque el trámite por nombre o número"
            notFoundContent={!enabled ? "Escriba al menos 2 caracteres." : pending ? "Buscando…" : "Sin resultados."}
        />
    );
};

export default TramiteLinkSelect;
