import { CheckOutlined } from "@ant-design/icons";
import { FORM_SECTIONS } from "@/modules/tramites/components/tramiteFormSections";

/**
 * Horizontal step timeline showing where a partial capture stopped.
 * index < current = done, index === current = current, index > current = pending.
 * Decorative unless `onSelect(index)` is given; then each step is a button.
 */
const FormProgressTimeline = ({ current = 0, onSelect }) => {
    const last = FORM_SECTIONS.length - 1;
    const at = Math.min(Math.max(Number(current) || 0, 0), last);
    const summary = `Paso ${at + 1} de ${FORM_SECTIONS.length}: ${FORM_SECTIONS[at].title}`;
    const interactive = typeof onSelect === "function";

    return (
        <div className="mq-ptl-wrap" role={interactive ? "group" : undefined} aria-label={interactive ? `Pasos del formulario. ${summary}` : undefined}>
            {!interactive && <span className="mq-sr-state">{summary}</span>}
            <ol className="mq-ptl" aria-hidden={interactive ? undefined : true}>
                {FORM_SECTIONS.map((s, i) => {
                    const state = i < at ? "done" : i === at ? "on" : "";
                    const body = (
                        <>
                            <span className="mq-ptl-dot" aria-hidden>{state === "done" ? <CheckOutlined /> : i + 1}</span>
                            <span className="mq-ptl-lb">{s.title}</span>
                        </>
                    );
                    return (
                        <li key={s.title} className={`mq-ptl-step${state ? ` ${state}` : ""}`} aria-current={state === "on" ? "step" : undefined}>
                            {interactive ? (
                                <button type="button" className="mq-ptl-btn" aria-label={`Ir al paso ${i + 1}: ${s.title}`} onClick={() => onSelect(i)}>{body}</button>
                            ) : (
                                <span className="mq-ptl-btn">{body}</span>
                            )}
                            {i < last && <span className="mq-ptl-ln" aria-hidden />}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default FormProgressTimeline;
