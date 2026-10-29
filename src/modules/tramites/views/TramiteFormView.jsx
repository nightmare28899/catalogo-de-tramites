import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Alert, App, Button, Form, Result, Skeleton, Space, Steps, Typography } from "antd";
import "@/modules/tramites/tramites.css";
import { FORM_SECTIONS, DEFAULT_VALUES, stepTitle } from "@/modules/tramites/components/tramiteFormSections";
import { explain, fixedOrg, orgScope } from "@/modules/mock/permissions";
import { useCurrentUser } from "@/modules/mock/sessionStore";
import {
    useCreateTramite, useOrgs, useTramite, useUpdateTramite,
} from "@/modules/tramites/hooks/useTramites";

const cleanValues = (v) => ({
    ...v,
    otroTipo: v.tipoTramite === 1808 ? v.otroTipo : "",
    urlDigital: v.digitalizacion === 29 ? v.urlDigital : "",
    cantidadVigencia: v.unidadVigencia === 4954 ? "" : v.cantidadVigencia,
    periodoDescripcion: v.periodoPresentacion ? v.periodoDescripcion : "",
});

// Minimum fields to persist a record on a partial save; everything else may stay empty.
const PARTIAL_REQUIRED = ["nombre", "dependenciaId"];

const FormBody = ({ initialValues, editingId, initialStep = 0 }) => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const user = useCurrentUser();
    const { data: orgs } = useOrgs();
    const [form] = Form.useForm();
    const [step, setStep] = useState(initialStep);
    const [duplicate, setDuplicate] = useState(null);
    const create = useCreateTramite();
    const update = useUpdateTramite();
    const locked = fixedOrg(user);
    const scope = orgScope(user);
    const scopedOrgs = orgs && {
        ...orgs, dependencias: orgs.dependencias.filter((d) => !scope.dependenciaId || d.id === scope.dependenciaId),
    };
    const saving = create.isPending || update.isPending;

    const goNext = async () => {
        try {
            await form.validateFields(FORM_SECTIONS[step].names);
            setStep(step + 1);
        } catch { /* field messages are shown inline */ }
    };

    // partial = true saves without full validation and remembers the step; a full save clears the flag.
    const persist = async (partial) => {
        setDuplicate(null);
        const values = cleanValues(form.getFieldsValue(true));
        const capture = { parcial: partial, pasoActual: step };
        try {
            const saved = editingId
                ? await update.mutateAsync({ id: editingId, values, ...capture })
                : await create.mutateAsync({ values, ...capture });
            if (partial) message.success(`Avance guardado. Podrá continuar la captura desde «${stepTitle(step)}».`);
            else message.success(editingId ? "Datos del trámite actualizados." : "Trámite creado. Complete ahora los apartados.");
            navigate(`/tramites/${saved.id}`);
        } catch (e) {
            if (e.status === 409) setDuplicate({ id: e.existingId, name: e.existingName });
            else message.error(e.message);
        }
    };

    const onFinish = () => persist(false);

    const onSavePartial = async () => {
        try {
            await form.validateFields(PARTIAL_REQUIRED);
        } catch {
            setStep(0);
            message.error("Capture al menos el nombre y la dependencia para guardar el avance.");
            return;
        }
        persist(true);
    };

    const onFinishFailed = ({ errorFields }) => {
        const first = errorFields[0]?.name?.[0];
        const idx = FORM_SECTIONS.findIndex((s) => s.names.includes(first));
        if (idx >= 0) setStep(idx);
        message.error("Revise los campos marcados antes de guardar.");
    };

    const last = step === FORM_SECTIONS.length - 1;

    return (
        <Form
            form={form} layout="vertical" requiredMark="optional" initialValues={initialValues}
            onFinish={onFinish} onFinishFailed={onFinishFailed} scrollToFirstError
        >
            <Steps
                current={step} onChange={setStep} size="small" className="mq-steps"
                items={FORM_SECTIONS.map((s) => ({ title: s.title }))}
            />
            <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
                Los campos sin la leyenda (opcional) son obligatorios para guardar el trámite. Con «Guardar y continuar después» solo se exige el nombre y la dependencia.
            </Typography.Paragraph>
            {duplicate && (
                <Alert
                    type="error" showIcon style={{ marginBottom: 16 }} title="Trámite duplicado (error 409)"
                    description={<>Ya existe un trámite con el mismo nombre en esta dependencia y unidad: <Link to={`/tramites/${duplicate.id}`}>{duplicate.name}</Link>.</>}
                />
            )}
            {FORM_SECTIONS.map((s, i) => (
                <section key={s.key} hidden={i !== step} aria-label={s.title} className="mq-form-section">
                    <Typography.Title level={4}>{s.title}</Typography.Title>
                    <s.Fields form={form} orgs={scopedOrgs} locked={locked} />
                </section>
            ))}
            <Space wrap className="mq-form-actions">
                <Button onClick={() => navigate(editingId ? `/tramites/${editingId}` : "/tramites")}>Cancelar</Button>
                <Button disabled={step === 0} onClick={() => setStep(step - 1)}>Anterior</Button>
                {!last && <Button onClick={goNext}>Siguiente</Button>}
                <Button onClick={onSavePartial} loading={saving}>Guardar y continuar después</Button>
                <Button type="primary" htmlType="submit" loading={saving}>Guardar trámite</Button>
            </Space>
        </Form>
    );
};

const TramiteFormView = () => {
    const { id } = useParams();
    const location = useLocation();
    const user = useCurrentUser();
    const { data: tramite, isLoading, error } = useTramite(id);
    const { data: orgs } = useOrgs();

    const verdict = id ? (tramite ? explain(user, "edit", tramite) : null) : explain(user, "create", null);

    if (id && isLoading) return <Skeleton active />;
    if (id && error) return <Result status={error.status === 404 ? "404" : "403"} title={error.message} extra={<Link to="/tramites">Volver al listado</Link>} />;
    if (verdict && !verdict.allowed) {
        return (
            <Result
                status="warning" title="No puede editar este trámite" subTitle={verdict.reason}
                extra={<Link to={id ? `/tramites/${id}` : "/tramites"}>Volver</Link>}
            />
        );
    }

    const org = fixedOrg(user);
    // Resume where a partial save stopped (clamped in case the form has fewer steps).
    const requestedStep = Number.isInteger(location.state?.step) ? location.state.step : null;
    const resumeStep = requestedStep !== null && id
        ? Math.min(Math.max(requestedStep, 0), FORM_SECTIONS.length - 1)
        : id && tramite?.parcial ? Math.min(tramite.pasoActual ?? 0, FORM_SECTIONS.length - 1) : 0;
    const initialValues = id ? tramite : { ...DEFAULT_VALUES, ...(org ?? {}) };
    return (
        <div>
            <Typography.Title level={3}>{id ? "Editar trámite" : "Nuevo trámite"}</Typography.Title>
            {orgs ? <FormBody key={`-`} initialValues={initialValues} editingId={id ? Number(id) : null} initialStep={resumeStep} /> : <Skeleton active />}
        </div>
    );
};

export default TramiteFormView;
