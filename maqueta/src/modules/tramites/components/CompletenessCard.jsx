import { Collapse, Progress } from "antd";
import { CheckCircleFilled, CloseCircleFilled, MinusCircleOutlined } from "@ant-design/icons";
import { completeness } from "@/modules/mock/permissions";

/** Compact capture-progress card: bar and verdict up front, the full checklist collapsed. */
const CompletenessCard = ({ tramite }) => {
    const { items, complete } = completeness(tramite);
    const required = items.filter((i) => i.required);
    const done = required.filter((i) => i.ok).length;
    return (
        <section className="mq-card mq-completeness" aria-label="Avance de captura">
            <h2 className="mq-card-title">Avance de captura</h2>
            <Progress
                percent={Math.round((done / required.length) * 100)} size="small"
                status={complete ? "success" : "active"} aria-label="Avance de captura"
            />
            <strong className="mq-completeness-verdict">
                {complete ? "Listo para enviar a revisión." : `Faltan ${required.length - done} elemento(s) requerido(s).`}
            </strong>
            <Collapse
                ghost size="small" className="mq-collapse-plain"
                items={[{
                    key: "detalle", label: "Ver detalle",
                    children: (
                        <ul className="mq-checklist">
                            {items.map((i) => (
                                <li key={i.key} className={i.ok ? "ok" : i.required ? "bad" : "opt"}>
                                    {i.ok ? <CheckCircleFilled aria-hidden /> : i.required ? <CloseCircleFilled aria-hidden /> : <MinusCircleOutlined aria-hidden />}
                                    <span>{i.label}</span>
                                    <span className="mq-sr-state">{i.ok ? "Cumple" : i.required ? "Falta" : "Pendiente (opcional)"}</span>
                                </li>
                            ))}
                        </ul>
                    ),
                }]}
            />
        </section>
    );
};

export default CompletenessCard;
