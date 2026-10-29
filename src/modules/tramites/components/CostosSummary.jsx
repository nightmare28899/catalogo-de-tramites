import { Tag } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { MODALIDAD_TIPOS, monedaOptions, labelOf } from "@/modules/mock/catalogs";

const formatMonto = (c) => `$${Number(c.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} ${labelOf(monedaOptions, c.moneda)}`;

/** At-a-glance costs per active modalidad; the full editor lives in the Costos section. */
const CostosSummary = ({ tramite, onOpen }) => {
    const modalidades = tramite.apartados.modalidades.filter((m) => m.activo);
    const costos = tramite.apartados.costos.filter((c) => c.activo);
    return (
        <section className="mq-card mq-costs" aria-label="Costos">
            <h2 className="mq-card-title"><DollarOutlined aria-hidden /> Costos</h2>
            {modalidades.length === 0 && <p className="mq-muted">Aún no hay modalidades activas, por lo que no se pueden capturar costos.</p>}
            {modalidades.map((m) => {
                const rows = costos.filter((c) => c.modalidadId === m.id);
                return (
                    <div key={m.id} className="mq-cost-group">
                        <div className="mq-cost-mod">
                            <strong>{m.nombre}</strong>
                            <Tag>{MODALIDAD_TIPOS[m.tipo] ?? m.tipo}</Tag>
                            {m.gratuita && <Tag color="green">Gratuita</Tag>}
                        </div>
                        {rows.length === 0 ? (
                            <p className="mq-muted mq-cost-empty">Sin costos capturados.</p>
                        ) : rows.map((c) => (
                            <div key={c.id} className="mq-cost-row">
                                <span>{c.concepto}</span>
                                {c.gratuito ? <Tag color="green">Gratuito</Tag> : <b>{formatMonto(c)}</b>}
                            </div>
                        ))}
                    </div>
                );
            })}
            <button type="button" className="mq-btn-link" onClick={onOpen}>Ver y editar costos →</button>
        </section>
    );
};

export default CostosSummary;
