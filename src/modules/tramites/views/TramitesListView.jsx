import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, AutoComplete, Button, Empty, Input, Pagination, Popconfirm, Dropdown, Select, Space, Spin, Tag, Typography, App } from "antd";
import { DollarOutlined, EllipsisOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, UndoOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "@/modules/tramites/tramites.css";
import StatusTag from "@/modules/tramites/components/StatusTag";
import GuardedButton from "@/modules/tramites/components/GuardedButton";
import { FORM_SECTIONS, stepTitle } from "@/modules/tramites/components/tramiteFormSections";
import FormProgressTimeline from "@/modules/tramites/components/FormProgressTimeline";
import TurnModal from "@/modules/tramites/components/TurnModal";
import { estatusOptions, labelOf, MODALIDAD_TIPOS, monedaOptions } from "@/modules/mock/catalogs";
import { explain, orgScope } from "@/modules/mock/permissions";
import { useCurrentUser } from "@/modules/mock/sessionStore";
import { useOrgs, useResetData, useTramiteSuggestions, useTramitesList } from "@/modules/tramites/hooks/useTramites";
import { MIN_SUGGEST_CHARS, normalizeName } from "@/modules/tramites/api/suggestions";

/** Dropdown item label; shows the permission reason when the action is unavailable. */
const MenuLabel = ({ text, verdict }) => (
    <span>{text}{!verdict.allowed && <span className="mq-menu-reason"> — {verdict.reason}</span>}</span>
);

const ALL_KEY = "§all";
const STATE_KEY = "§state";
const SUGGEST_PREFIX = "§id:";

/** Bolds the fragment of `text` matching `q`, ignoring accents and case. */
function highlight(text, q) {
    const needle = normalizeName(q);
    const stripped = [...text].map((c) => c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase());
    const at = stripped.join("").indexOf(needle);
    if (!needle || at < 0) return text;
    // Map normalized offsets back to original characters.
    const starts = [];
    stripped.forEach((c, i) => { for (let k = 0; k < c.length; k += 1) starts.push(i); });
    const from = starts[at];
    const to = starts[at + needle.length - 1] + 1;
    return <>{text.slice(0, from)}<b className="mq-ac-hit">{text.slice(from, to)}</b>{text.slice(to)}</>;
}

const money = (n) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

/** Cost of one modalidad: "Gratuito", the per-currency total, or null when nothing is captured. */
function modalidadCost(m, costos) {
    const rows = costos.filter((c) => c.modalidadId === m.id);
    if (m.gratuita || (rows.length > 0 && rows.every((c) => c.gratuito))) return "Gratuito";
    const totals = new Map();
    rows.filter((c) => !c.gratuito).forEach((c) => totals.set(c.moneda, (totals.get(c.moneda) ?? 0) + Number(c.monto)));
    if (totals.size === 0) return null;
    return [...totals].map(([moneda, sum]) => `${money(sum)} ${labelOf(monedaOptions, moneda)}`).join(" + ");
}

/** Costs per active modalidad, visible without opening the trámite. */
const CardCosts = ({ modalidades, costos }) => {
    const active = modalidades.filter((m) => m.activo);
    if (active.length === 0) return null;
    return (
        <div className="mq-tcard-costs" aria-label="Costo del trámite">
            <DollarOutlined aria-hidden />
            <span className="mq-tcard-costs-label">Costo</span>
            {active.map((m) => {
                const cost = modalidadCost(m, costos);
                return (
                    <span key={m.id} className="mq-tcard-cost">
                        {active.length > 1 && <span className="mq-muted">{m.nombre}: </span>}
                        {cost === "Gratuito" ? <Tag color="green">Gratuito</Tag> : cost ? <b>{cost}</b> : <span className="mq-muted">Sin capturar</span>}
                    </span>
                );
            })}
        </div>
    );
};

const stateOption = (text) => ({
    value: STATE_KEY, disabled: true,
    label: <span className="mq-ac-state" role="status">{text}</span>,
});

const TramitesListView = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const user = useCurrentUser();
    const [params, setParams] = useSearchParams();
    const { data: orgs } = useOrgs();
    const reset = useResetData();
    const [turning, setTurning] = useState(null);

    const q = params.get("q") ?? "";
    const dep = params.get("dep") ? Number(params.get("dep")) : undefined;
    const uni = params.get("uni") ? Number(params.get("uni")) : undefined;
    const est = params.get("est") ? Number(params.get("est")) : undefined;
    const page = Number(params.get("page") ?? 1);
    const size = Number(params.get("size") ?? 10);

    const [qInput, setQInput] = useState(q);
    useEffect(() => setQInput(q), [q]);

    const patch = (changes) => {
        const next = new URLSearchParams(params);
        Object.entries(changes).forEach(([k, v]) => (v === undefined || v === "" || v === null ? next.delete(k) : next.set(k, v)));
        if (!("page" in changes)) next.delete("page");
        setParams(next, { replace: true });
    };

    // Debounced search by name.
    useEffect(() => {
        if (qInput === q) return undefined;
        const t = setTimeout(() => patch({ q: qInput.trim() }), 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qInput]);

    // Autocomplete: its own query and debounce, independent from the list (never toggles its isFetching).
    const [acOpen, setAcOpen] = useState(false);
    const suggestions = useTramiteSuggestions(qInput);
    const canSuggest = normalizeName(qInput).length >= MIN_SUGGEST_CHARS;
    const acOptions = !canSuggest ? [] : [
        ...(suggestions.pending ? [stateOption("Buscando…")] : []),
        ...(suggestions.items.length === 0 && !suggestions.pending ? [stateOption("Sin sugerencias")] : []),
        ...suggestions.items.map((t) => ({
            value: `${SUGGEST_PREFIX}${t.id}`,
            label: (
                <div className="mq-ac-opt">
                    <div className="mq-ac-main"><strong>#{highlight(String(t.id), qInput)}</strong> {highlight(t.nombre, qInput)}</div>
                    <div className="mq-ac-sub"><span>{t.dependenciaNombre}</span><StatusTag estatus={t.estatus} /></div>
                </div>
            ),
        })),
        { value: ALL_KEY, label: <span className="mq-ac-all"><SearchOutlined /> Ver todos los resultados para «{qInput.trim()}»</span> },
    ];

    const onAcSelect = (value) => {
        setAcOpen(false);
        if (value === ALL_KEY) patch({ q: qInput.trim() });
        else if (value.startsWith(SUGGEST_PREFIX)) navigate(`/tramites/${value.slice(SUGGEST_PREFIX.length)}`);
    };

    // Selecting an option makes the combobox emit its value as text; ignore those internal keys.
    const onAcChange = (value) => { if (!String(value ?? "").startsWith("§")) setQInput(value ?? ""); };

    const { data, isLoading, isFetching, error, refetch } = useTramitesList({
        q, dependenciaId: dep, unidadId: uni, estatus: est, page, pageSize: size,
    });

    const scope = orgScope(user);
    const depOptions = (orgs?.dependencias ?? [])
        .filter((d) => !scope.dependenciaId || d.id === scope.dependenciaId)
        .map((d) => ({ value: d.id, label: d.nombre }));
    const uniOptions = (orgs?.unidades ?? [])
        .filter((u) => (!dep || u.dependenciaId === dep) && (!scope.dependenciaId || u.dependenciaId === scope.dependenciaId) && (!scope.unidadId || u.id === scope.unidadId))
        .map((u) => ({ value: u.id, label: u.nombre }));

    const onReset = async () => {
        await reset.mutateAsync();
        message.success("Datos de ejemplo restablecidos.");
    };

    const activeFilters = [dep && "dep", uni && "uni", q && "q"].filter(Boolean);
    const total = data?.total ?? 0;
    const rows = data?.data ?? [];

    const clearFilters = () => {
        setQInput("");
        patch({ q: undefined, dep: undefined, uni: undefined, est: undefined });
    };

    return (
        <div className="mq-catalog">
            <div className="mq-hero">
                <div className="mq-hero-top">
                    <div>
                        <div className="mq-eyebrow">Catálogo Estatal de Trámites y Servicios</div>
                        <Typography.Title level={1} className="mq-hero-title">Trámites</Typography.Title>
                    </div>
                    <Space wrap>
                        <Popconfirm title="¿Restablecer los datos de ejemplo?" description="Se perderán los cambios hechos en esta maqueta." okText="Restablecer" cancelText="Cancelar" onConfirm={onReset}>
                            <Button icon={<UndoOutlined />} loading={reset.isPending}>Restablecer datos de ejemplo</Button>
                        </Popconfirm>
                        <GuardedButton type="primary" icon={<PlusOutlined />} verdict={explain(user, "create", null)} onClick={() => navigate("/tramites/nuevo")}>
                            Nuevo trámite
                        </GuardedButton>
                    </Space>
                </div>
                <form className="mq-bigsearch" role="search" onSubmit={(e) => { e.preventDefault(); setAcOpen(false); patch({ q: qInput.trim() }); }}>
                    <label htmlFor="f-q" className="mq-sr-state">Buscar por nombre</label>
                    <AutoComplete
                        value={qInput} options={acOptions} open={acOpen && canSuggest}
                        onChange={onAcChange} onSelect={onAcSelect} onOpenChange={setAcOpen}
                        defaultActiveFirstOption={false} popupMatchSelectWidth
                        classNames={{ popup: { root: "mq-ac-popup" } }}
                    >
                        <Input id="f-q" variant="borderless" allowClear prefix={<SearchOutlined />} placeholder="Nombre o número" />
                    </AutoComplete>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={isFetching}>Buscar</Button>
                </form>
            </div>

            <div className="mq-filter-card">
                <div className="mq-filter-head">
                    <strong>Filtros</strong>
                    <Button type="link" size="small" onClick={clearFilters} disabled={!activeFilters.length && !est}>Limpiar</Button>
                </div>
                <div className="mq-filters mq-filters-flat">
                    <div>
                        <label htmlFor="f-dep">Dependencia</label>
                        <Select id="f-dep" allowClear placeholder="Todas" value={dep} options={depOptions} onChange={(v) => patch({ dep: v, uni: undefined })} />
                    </div>
                    <div>
                        <label htmlFor="f-uni">Unidad</label>
                        <Select id="f-uni" allowClear placeholder="Todas" value={uni} options={uniOptions} onChange={(v) => patch({ uni: v })} />
                    </div>
                    <div>
                        <label htmlFor="f-est">Estatus</label>
                        <Select id="f-est" allowClear placeholder="Todos" value={est} options={estatusOptions} onChange={(v) => patch({ est: v })} />
                    </div>
                </div>
            </div>

            <div className="mq-estatus-tabs" role="group" aria-label="Filtrar por estatus">
                <button type="button" className={`mq-ftab${est ? "" : " on"}`} aria-pressed={!est} onClick={() => patch({ est: undefined })}>Todos</button>
                {estatusOptions.map((o) => (
                    <button key={o.value} type="button" className={`mq-ftab${est === o.value ? " on" : ""}`} aria-pressed={est === o.value} onClick={() => patch({ est: o.value })}>
                        {o.label}
                    </button>
                ))}
            </div>

            {error ? (
                <Alert
                    type="error" showIcon title="No se pudo cargar el listado" description={error.message}
                    action={<Button icon={<ReloadOutlined />} onClick={() => refetch()}>Reintentar</Button>}
                />
            ) : (
                <Spin spinning={isLoading}>
                    <div className={isFetching && !isLoading ? "mq-results mq-refetching" : "mq-results"} aria-busy={isFetching}>
                    <div className="mq-rhead">
                        <h2>{total} {total === 1 ? "trámite" : "trámites"}</h2>
                    </div>
                    {rows.length === 0 && !isLoading ? (
                        <Empty description="No se encontraron trámites con los filtros seleccionados." />
                    ) : (
                        <ul className="mq-tcards">
                            {rows.map((r) => {
                                const apartados = explain(user, "apartados", r);
                                const turnar = explain(user, "turnar", r);
                                const edit = explain(user, "edit", r);
                                return (
                                    <li key={r.id} className="mq-tcard">
                                        <div className="mq-tcard-head">
                                            <div>
                                                <div className="mq-tcard-dep">{r.dependenciaNombre}</div>
                                                <h3><Link to={`/tramites/${r.id}`} className="mq-tcard-link"><strong>#{r.id}</strong> {r.nombre}</Link></h3>
                                                <div className="mq-muted">{r.unidadNombre}</div>
                                            </div>
                                            <Space size={4} wrap className="mq-tcard-tags">
                                                {r.parcial && <Tag color="warning">Captura parcial · se quedó en «{stepTitle(r.pasoActual)}»</Tag>}
                                                <StatusTag estatus={r.estatus} />
                                            </Space>
                                        </div>
                                        <div className="mq-tcard-mods">
                                            {r.modalidades.length === 0 ? <span className="mq-muted">Sin modalidades</span> : r.modalidades.map((m) => (
                                                <Tag key={m.id} className={m.activo ? "" : "mq-struck"}>
                                                    {m.nombre} · {MODALIDAD_TIPOS[m.tipo] ?? m.tipo}{m.activo ? "" : <span className="mq-sr-state"> (inactiva)</span>}
                                                </Tag>
                                            ))}
                                        </div>
                                        <CardCosts modalidades={r.modalidades} costos={r.costos} />
                                        {r.parcial && <FormProgressTimeline current={r.pasoActual} />}
                                        <div className="mq-tcard-foot">
                                            <div className="mq-tcard-info">
                                                {r.parcial && <>Avance: paso {Math.min(r.pasoActual + 1, FORM_SECTIONS.length)} de {FORM_SECTIONS.length} · <b>{stepTitle(r.pasoActual)}</b> · </>}
                                                Modificado <b>{dayjs(r.updatedAt).format("DD/MM/YYYY HH:mm")}</b>
                                            </div>
                                            <div className="mq-tcard-acts">
                                                <Dropdown
                                                    trigger={["click"]}
                                                    menu={{
                                                        items: [
                                                            { key: "apartados", label: <MenuLabel text="Apartados" verdict={apartados} />, disabled: !apartados.allowed, onClick: () => navigate(`/tramites/${r.id}`) },
                                                            { key: "turnar", label: <MenuLabel text="Turnar" verdict={turnar} />, disabled: !turnar.allowed, onClick: () => setTurning(r.id) },
                                                        ],
                                                    }}
                                                >
                                                    <Button className="mq-btn mq-btn-g" icon={<EllipsisOutlined />} aria-label={`Más acciones del trámite ${r.id}`}>Más acciones</Button>
                                                </Dropdown>
                                                {r.parcial ? (
                                                    <>
                                                        <Button className="mq-btn mq-btn-g" onClick={() => navigate(`/tramites/${r.id}`)}>Ver detalle</Button>
                                                        <GuardedButton className="mq-btn mq-btn-p" verdict={edit} onClick={() => navigate(`/tramites/${r.id}/editar`)}>Continuar edición</GuardedButton>
                                                    </>
                                                ) : (
                                                    <>
                                                        <GuardedButton className="mq-btn mq-btn-g" verdict={edit} onClick={() => navigate(`/tramites/${r.id}/editar`)}>Editar</GuardedButton>
                                                        <Button className="mq-btn mq-btn-p" onClick={() => navigate(`/tramites/${r.id}`)}>Ver detalle</Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    <Pagination
                        className="mq-pager" align="center"
                        current={page} pageSize={size} total={total} showSizeChanger
                        pageSizeOptions={[5, 10, 20]} showTotal={(t) => `${t} trámites`}
                        onChange={(p, s) => patch({ page: p, size: s })}
                    />
                    </div>
                </Spin>
            )}
            <TurnModal tramiteId={turning} open={turning !== null} onClose={() => setTurning(null)} />
        </div>
    );
};

export default TramitesListView;
