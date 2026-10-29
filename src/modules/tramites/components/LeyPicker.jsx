import { useState } from "react";
import { Alert, Input, List, Tag } from "antd";
import { tramitesApi } from "@/modules/tramites/api/tramitesApi";
import { ambitoOptions, labelOf } from "@/modules/mock/catalogs";

// Search box simulating CELEM. Value shape: { leyId, nombreLey, tipo, ambito, fecha }.
const LeyPicker = ({ value, onChange, id }) => {
    const [results, setResults] = useState([]);
    const [state, setState] = useState({ loading: false, error: null, searched: false });

    const search = async (q) => {
        if (q.trim().length < 3) {
            setState({ loading: false, error: "Escriba al menos 3 caracteres para buscar.", searched: false });
            return;
        }
        setState({ loading: true, error: null, searched: false });
        try {
            setResults(await tramitesApi.searchLeyes(q));
            setState({ loading: false, error: null, searched: true });
        } catch (e) {
            setResults([]);
            setState({ loading: false, error: e.status === 503 ? "celem" : e.message, searched: false });
        }
    };

    const pick = (l) => onChange?.({ leyId: l.id, nombreLey: l.nombre, tipo: l.tipo, ambito: l.ambito, fecha: l.fecha });

    return (
        <div>
            <Input.Search
                id={id} placeholder="Buscar ley, reglamento o decreto en CELEM" enterButton="Buscar"
                loading={state.loading} onSearch={search} allowClear
            />
            {state.error === "celem" && (
                <Alert type="warning" showIcon style={{ marginTop: 8 }} title="CELEM no está disponible"
                    description="Solo se muestran los fundamentos guardados. Intente de nuevo más tarde." />
            )}
            {state.error && state.error !== "celem" && <div role="alert" className="mq-field-error">{state.error}</div>}
            {state.searched && (
                <List
                    size="small" bordered style={{ marginTop: 8, maxHeight: 220, overflow: "auto" }} dataSource={results}
                    locale={{ emptyText: "Sin resultados en CELEM." }}
                    renderItem={(l) => (
                        <List.Item
                            actions={[<a key="s" onClick={() => pick(l)} role="button" tabIndex={0}
                                onKeyDown={(e) => { if (e.key === "Enter") pick(l); }}>Seleccionar</a>]}
                        >
                            <List.Item.Meta
                                title={l.nombre}
                                description={<><Tag>{l.tipo}</Tag><Tag>{labelOf(ambitoOptions, l.ambito)}</Tag>Publicación: {l.fecha}</>}
                            />
                        </List.Item>
                    )}
                />
            )}
            {value?.leyId && (
                <Alert type="success" showIcon style={{ marginTop: 8 }} title="Ley seleccionada" description={`${value.nombreLey} (id CELEM ${value.leyId})`} />
            )}
        </div>
    );
};

export default LeyPicker;
