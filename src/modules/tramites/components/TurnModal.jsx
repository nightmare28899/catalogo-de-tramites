import { useEffect, useState } from "react";
import { Alert, App, Input, Modal, Radio, Skeleton, Space, Typography } from "antd";
import StatusTag from "./StatusTag";
import { allowedTransitions, completeness } from "@/modules/mock/permissions";
import { useCurrentUser } from "@/modules/mock/sessionStore";
import { useTramite, useTurnar } from "@/modules/tramites/hooks/useTramites";

const TurnModal = ({ tramiteId, open, onClose }) => {
    const { message } = App.useApp();
    const user = useCurrentUser();
    const { data: tramite, isLoading, error } = useTramite(open ? tramiteId : null);
    const turnar = useTurnar();
    const [to, setTo] = useState(null);
    const [observacion, setObservacion] = useState("");
    const [touched, setTouched] = useState(false);
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        if (open) { setTo(null); setObservacion(""); setTouched(false); setApiError(null); }
    }, [open, tramiteId]);

    const transitions = tramite ? allowedTransitions(user, tramite) : [];
    const selected = transitions.find((t) => t.to === (to ?? (transitions.length === 1 ? transitions[0].to : null)));
    const check = tramite ? completeness(tramite) : null;
    const blockedByComplete = Boolean(selected?.requiresComplete && check && !check.complete);
    const obsMissing = Boolean(selected?.requiresObservation && !observacion.trim());

    const submit = async () => {
        setTouched(true);
        if (!selected || blockedByComplete || obsMissing) return;
        try {
            await turnar.mutateAsync({ id: tramite.id, to: selected.to, observacion });
            message.success("El trámite se turnó correctamente.");
            onClose();
        } catch (e) {
            setApiError(e.message);
        }
    };

    return (
        <Modal
            open={open} onCancel={onClose} title="Turnar trámite" className="mq-turn-modal" okText="Turnar" cancelText="Cancelar"
            onOk={submit} confirmLoading={turnar.isPending}
            okButtonProps={{ disabled: !selected || blockedByComplete }} destroyOnHidden
        >
            {isLoading && <Skeleton active />}
            {error && <Alert type="error" showIcon title={error.message} />}
            {tramite && (
                <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                    <div>
                        <Typography.Text strong>{tramite.nombre}</Typography.Text>
                        <div style={{ marginTop: 6 }}>Estatus actual: <StatusTag estatus={tramite.estatus} /></div>
                    </div>
                    {transitions.length === 0 ? (
                        <Alert type="info" showIcon title="No hay turnos disponibles para su rol en este estatus." />
                    ) : (
                        <>
                            <fieldset className="mq-fieldset">
                                <legend>Turnar a</legend>
                                <Radio.Group
                                    value={selected?.to ?? null} onChange={(e) => setTo(e.target.value)}
                                    options={transitions.map((t) => ({ value: t.to, label: t.label }))}
                                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                                />
                            </fieldset>
                            {blockedByComplete && (
                                <Alert
                                    type="error" showIcon title="El trámite está incompleto; complete lo siguiente antes de turnarlo:"
                                    description={<ul className="mq-missing">{check.missing.map((m) => <li key={m.key}>{m.label}</li>)}</ul>}
                                />
                            )}
                            <div className="mq-turn-obs">
                                <label htmlFor="turn-observacion">
                                    Observación {selected?.requiresObservation ? <span className="mq-required">(obligatoria)</span> : "(opcional)"}
                                </label>
                                <Input.TextArea
                                    id="turn-observacion" rows={3} maxLength={1000} showCount value={observacion} placeholder="Escriba la observación del cambio de estatus"
                                    status={touched && obsMissing ? "error" : undefined}
                                    onChange={(e) => setObservacion(e.target.value)}
                                />
                                {touched && obsMissing && (
                                    <div role="alert" className="mq-field-error">Capture la observación: es obligatoria para este cambio de estatus.</div>
                                )}
                            </div>
                            {apiError && <Alert type="error" showIcon title={apiError} />}
                        </>
                    )}
                </Space>
            )}
        </Modal>
    );
};

export default TurnModal;
