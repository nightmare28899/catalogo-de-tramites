import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Alert, Button, Collapse, Result, Skeleton, Tabs, Tag } from "antd";
import { ArrowLeftOutlined, ClockCircleOutlined, DollarOutlined, ApartmentOutlined } from "@ant-design/icons";
import "@/modules/tramites/tramites.css";
import StatusTag from "@/modules/tramites/components/StatusTag";
import GuardedButton from "@/modules/tramites/components/GuardedButton";
import CompletenessCard from "@/modules/tramites/components/CompletenessCard";
import CostosSummary from "@/modules/tramites/components/CostosSummary";
import FormProgressTimeline from "@/modules/tramites/components/FormProgressTimeline";
import TurnModal from "@/modules/tramites/components/TurnModal";
import DatosTab from "@/modules/tramites/components/DatosTab";
import ModalidadesTab from "@/modules/tramites/components/ModalidadesTab";
import OficinasTab from "@/modules/tramites/components/OficinasTab";
import PasosTab from "@/modules/tramites/components/PasosTab";
import CostosTab from "@/modules/tramites/components/CostosTab";
import FundamentosTab from "@/modules/tramites/components/FundamentosTab";
import RequisitosTab from "@/modules/tramites/components/RequisitosTab";
import HistorialTab from "@/modules/tramites/components/HistorialTab";
import { costoDesde } from "@/modules/tramites/utils";
import { stepTitle } from "@/modules/tramites/components/tramiteFormSections";
import { explain } from "@/modules/mock/permissions";
import { useCurrentUser } from "@/modules/mock/sessionStore";
import { useTramite } from "@/modules/tramites/hooks/useTramites";

const activeCount = (list) => list.filter((i) => i.activo !== false).length;

// The old eight tabs are grouped into five sections. Each section holds accordion panels;
// `?tab=` accepts a section key or any old tab key (which opens its section and panel).
const SECTIONS = [
    {
        key: "datos", label: "Datos generales",
        panels: [{ key: "datos", label: "Datos generales", render: (t) => <DatosTab tramite={t} /> }],
    },
    {
        key: "modalidades", label: "Modalidades y costos",
        panels: [
            { key: "modalidades", label: "Modalidades", count: (t) => activeCount(t.apartados.modalidades), render: (t) => <ModalidadesTab tramite={t} /> },
            { key: "costos", label: "Costos", count: (t) => activeCount(t.apartados.costos), render: (t) => <CostosTab tramite={t} /> },
        ],
    },
    {
        key: "requisitos", label: "Requisitos y pasos",
        panels: [
            { key: "requisitos", label: "Requisitos", count: (t) => activeCount(t.apartados.requisitos), render: (t) => <RequisitosTab tramite={t} /> },
            { key: "pasos", label: "Pasos", count: (t) => activeCount(t.apartados.pasos), render: (t) => <PasosTab tramite={t} /> },
        ],
    },
    {
        key: "oficinas", label: "Oficinas y fundamentos",
        panels: [
            { key: "oficinas", label: "Oficinas", count: (t) => activeCount(t.apartados.oficinas), render: (t) => <OficinasTab tramite={t} /> },
            { key: "fundamentos", label: "Fundamentos legales", count: (t) => activeCount(t.apartados.fundamentos), render: (t) => <FundamentosTab tramite={t} /> },
        ],
    },
    {
        key: "historial", label: "Historial",
        panels: [{ key: "historial", label: "Historial", render: (t) => <HistorialTab tramite={t} /> }],
    },
];

/** Resolves a `?tab=` value (section key or old tab key) to its section and the panel to open. */
const resolveTab = (value) => {
    const section = SECTIONS.find((s) => s.key === value || s.panels.some((p) => p.key === value)) ?? SECTIONS[0];
    const panel = section.panels.find((p) => p.key === value) ?? section.panels[0];
    return { section, panel };
};

const TramiteDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useCurrentUser();
    const [params, setParams] = useSearchParams();
    const [turning, setTurning] = useState(false);
    const { data: tramite, isLoading, error } = useTramite(id);

    if (isLoading) return <Skeleton active paragraph={{ rows: 8 }} />;
    if (error) {
        return (
            <Result
                status={error.status === 404 ? "404" : "403"} title={error.message}
                extra={<Button type="primary" onClick={() => navigate("/tramites")}>Volver al listado</Button>}
            />
        );
    }

    const { section: activeSection, panel: activePanel } = resolveTab(params.get("tab"));
    const editVerdict = explain(user, "edit", tramite);
    const apartadosVerdict = explain(user, "apartados", tramite);
    const desde = costoDesde(tramite);
    const modalidades = activeCount(tramite.apartados.modalidades);

    const goTo = (tab) => {
        setParams({ tab }, { replace: true });
        document.getElementById("mq-detail-sections")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div>
            <Link to="/tramites" className="mq-back"><ArrowLeftOutlined aria-hidden /> Volver al listado</Link>
            <header className="mq-hero mq-detail-hero">
                <div className="mq-hero-top">
                    <div>
                        <div className="mq-eyebrow">{tramite.dependenciaNombre} · {tramite.unidadNombre}</div>
                        <h1 className="mq-detail-title">#{tramite.id} {tramite.nombre}</h1>
                    </div>
                    <div className="mq-head-actions">
                        {tramite.parcial && <Tag color="warning">Formulario incompleto</Tag>}
                        <StatusTag estatus={tramite.estatus} />
                        <GuardedButton className={`mq-btn ${tramite.parcial ? "mq-btn-p" : "mq-btn-g"}`} verdict={editVerdict} onClick={() => navigate(`/tramites/${tramite.id}/editar`)}>
                            {tramite.parcial ? "Continuar edición" : "Editar datos"}
                        </GuardedButton>
                        <GuardedButton className={`mq-btn ${tramite.parcial ? "mq-btn-g" : "mq-btn-p"}`} verdict={explain(user, "turnar", tramite)} onClick={() => setTurning(true)}>Turnar</GuardedButton>
                    </div>
                </div>
                <div className="mq-chips">
                    {tramite.tiempoPromedio && <span className="mq-chip"><ClockCircleOutlined aria-hidden /> Tiempo promedio: {tramite.tiempoPromedio}</span>}
                    <span className="mq-chip">
                        <DollarOutlined aria-hidden />
                        {desde !== null ? `Costo desde $${desde.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN` : "Sin costo en pesos capturado"}
                    </span>
                    <span className="mq-chip"><ApartmentOutlined aria-hidden /> {modalidades} modalidad(es) activa(s)</span>
                </div>
            </header>

            {tramite.parcial && (
                <Alert
                    type="warning" showIcon style={{ marginBottom: 16 }} title="Captura parcial: formulario incompleto"
                    description={(
                        <>
                            <p style={{ margin: 0 }}>{`El formulario de datos generales se guardó a medias; la captura se quedó en «${stepTitle(tramite.pasoActual)}». No se puede enviar a revisión hasta terminarlo y guardar el trámite completo.`}</p>
                            <FormProgressTimeline
                                current={tramite.pasoActual}
                                onSelect={editVerdict.allowed ? (step) => navigate(`/tramites/${tramite.id}/editar`, { state: { step } }) : undefined}
                            />
                        </>
                    )}
                />
            )}

            <div className="mq-detail-layout">
                <aside className="mq-detail-aside">
                    <CostosSummary tramite={tramite} onOpen={() => goTo("costos")} />
                    <CompletenessCard tramite={tramite} />
                    <Alert
                        type="info" showIcon title="Permisos sobre este trámite"
                        description={apartadosVerdict.allowed
                            ? "Puede modificar los apartados permitidos por su rol en el estatus actual."
                            : apartadosVerdict.reason}
                    />
                </aside>
                <main id="mq-detail-sections" className="mq-detail-main">
                    <Tabs
                        className="mq-detail-tabs" activeKey={activeSection.key}
                        onChange={(k) => setParams({ tab: k }, { replace: true })}
                        items={SECTIONS.map((s) => ({
                            key: s.key, label: s.label,
                            children: s.panels.length === 1 ? s.panels[0].render(tramite) : (
                                // Re-keyed on the requested panel so a ?tab= link opens exactly that panel.
                                <Collapse
                                    key={s.key === activeSection.key ? activePanel.key : s.key}
                                    className="mq-collapse"
                                    defaultActiveKey={[s.key === activeSection.key ? activePanel.key : s.panels[0].key]}
                                    items={s.panels.map((p) => ({
                                        key: p.key,
                                        label: <span className="mq-collapse-title">{p.label} <Tag className="mq-count">{p.count(tramite)}</Tag></span>,
                                        children: p.render(tramite),
                                    }))}
                                />
                            ),
                        }))}
                    />
                </main>
            </div>
            <TurnModal tramiteId={tramite.id} open={turning} onClose={() => setTurning(false)} />
        </div>
    );
};

export default TramiteDetailView;
