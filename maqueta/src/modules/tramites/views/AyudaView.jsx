import { App, Button, Card, Popconfirm, Steps, Table, Typography } from "antd";
import { UndoOutlined } from "@ant-design/icons";
import "@/modules/tramites/tramites.css";
import StatusTag from "@/modules/tramites/components/StatusTag";
import { ESTATUS, ROLES, ROLE_DESCRIPTIONS } from "@/modules/mock/catalogs";
import { ROLE_KEYS, matrixFor, roleGroupLabel } from "@/modules/mock/permissions";
import { useResetData } from "@/modules/tramites/hooks/useTramites";

const STATUS_IDS = [ESTATUS.ROMR, ESTATUS.ADMIN, ESTATUS.PUBLICO, ESTATUS.ACTUALIZAR_COSTOS, ESTATUS.BAJA];

const STATUS_ROWS = [
    { key: 785, significado: "Se está capturando. Todo trámite nace aquí." },
    { key: 1668, significado: "Lo revisa el administrador, que puede publicarlo o devolverlo." },
    { key: 787, significado: "Publicado: lo ve la ciudadanía." },
    { key: 783, significado: "Publicado reabierto solo para corregir montos. Al cambiar un monto pasa solo a En revisión (1668)." },
    { key: 789, significado: "Dado de baja: ya no está en el catálogo." },
].map((r) => ({ ...r, estatus: <StatusTag estatus={r.key} /> }));

const ROLES_ROWS = ROLE_KEYS.map((rol) => ({
    key: rol, rol: ROLES[rol], grupo: roleGroupLabel(rol), hace: ROLE_DESCRIPTIONS[rol],
}));

const ACTIONS = [["edit", "Editar"], ["apartados", "Apartados"], ["turnar", "Turnar"]];

// Built from the same permission functions the app uses, so it cannot drift from the real rules.
const MATRIX_ROWS = ROLE_KEYS.map((rol) => ({
    key: rol, rol: ROLES[rol],
    ...Object.fromEntries(STATUS_IDS.map((est) => {
        const verdict = matrixFor(rol, est);
        return [`e${est}`, ACTIONS.filter(([k]) => verdict[k]).map(([, label]) => label)];
    })),
}));

const matrixColumns = [
    { title: "Rol", dataIndex: "rol", width: 140, fixed: "left" },
    ...STATUS_IDS.map((est) => ({
        title: <StatusTag estatus={est} />, dataIndex: `e${est}`,
        render: (list) => (list.length
            ? <span className="mq-matrix-yes">{list.join(", ")}</span>
            : <span className="mq-matrix-no" aria-label="Sin acciones">-</span>),
    })),
];

const TRANSICIONES = [
    { key: 1, de: "ROMR (785)", a: "Administrador (1668)", quien: "ROMR, Auxiliar de ROMR, RUA, Auxiliar de RUA, Root", nota: "Requiere trámite completo; observación opcional" },
    { key: 2, de: "ROMR (785)", a: "Dado de baja (789)", quien: "ROMR, Auxiliar de ROMR, RUA, Auxiliar de RUA, Root", nota: "Observación obligatoria" },
    { key: 3, de: "Actualizar costos (783)", a: "Administrador (1668)", quien: "Todos los roles de captura (requiere trámite completo), Administrador, Root", nota: "También ocurre solo al cambiar un monto" },
    { key: 4, de: "Administrador (1668)", a: "Público (787)", quien: "Administrador, Root", nota: "Publicar" },
    { key: 5, de: "Administrador (1668)", a: "ROMR (785)", quien: "Administrador, Root", nota: "Devolver; observación obligatoria" },
    { key: 6, de: "Público (787)", a: "Actualizar costos (783)", quien: "Administrador, Root", nota: "Observación obligatoria" },
    { key: 7, de: "Público (787)", a: "Dado de baja (789)", quien: "Administrador, Root", nota: "Observación obligatoria" },
];

const AyudaView = () => {
    const { message } = App.useApp();
    const reset = useResetData();
    return (
        <div className="mq-help">
            <Typography.Title level={3}>Ayuda de la maqueta</Typography.Title>
            <Typography.Paragraph>
                Esta maqueta muestra cómo funcionaría el Catálogo de Trámites. Todo es ficticio y se guarda solo en este navegador.
            </Typography.Paragraph>

            <Card title="Qué significa cada estatus" size="small">
                <div className="mq-table-wrap">
                    <Table
                        size="small" pagination={false} dataSource={STATUS_ROWS}
                        columns={[
                            { title: "Estatus", dataIndex: "estatus", width: 190 },
                            { title: "Número", dataIndex: "key", width: 90 },
                            { title: "Significado", dataIndex: "significado" },
                        ]}
                    />
                </div>
            </Card>

            <Card title="Flujo de estatus" size="small" style={{ marginTop: 16 }}>
                <Steps
                    size="small" className="mq-steps"
                    items={[{ title: "ROMR", description: "Captura" }, { title: "Administrador", description: "Revisión" }, { title: "Público", description: "Publicado" }]}
                />
                <div className="mq-table-wrap" style={{ marginTop: 16 }}>
                    <Table
                        size="small" pagination={false} dataSource={TRANSICIONES}
                        columns={[
                            { title: "De", dataIndex: "de" },
                            { title: "A", dataIndex: "a" },
                            { title: "Quién", dataIndex: "quien" },
                            { title: "Nota", dataIndex: "nota" },
                        ]}
                    />
                </div>
            </Card>

            <Card title="Roles" size="small" style={{ marginTop: 16 }}>
                <div className="mq-table-wrap">
                    <Table
                        size="small" pagination={false} dataSource={ROLES_ROWS}
                        columns={[
                            { title: "Rol", dataIndex: "rol", width: 150 },
                            { title: "Grupo de permisos", dataIndex: "grupo", width: 170 },
                            { title: "Qué puede hacer", dataIndex: "hace" },
                        ]}
                    />
                </div>
            </Card>

            <Card title="Qué puede hacer cada rol según el estatus" size="small" style={{ marginTop: 16 }}>
                <Typography.Paragraph>
                    <strong>Cómo leer los permisos.</strong> Por ejemplo, &quot;Edita en 785&quot; significa que el rol ve el botón Editar solo cuando
                    el trámite está en estatus 785. <strong>Editar</strong> = datos generales; <strong>Apartados</strong> = modalidades, oficinas, pasos,
                    costos, fundamentos y requisitos. Un guion (-) significa que el rol solo consulta. Esta tabla se genera con las mismas reglas que usa la
                    maqueta. Los roles de captura solo ven su unidad (ROMR, Auxiliar de RUA) o su dependencia (Auxiliar de ROMR, RUA).
                </Typography.Paragraph>
                <div className="mq-table-wrap">
                    <Table size="small" pagination={false} dataSource={MATRIX_ROWS} columns={matrixColumns} scroll={{ x: 900 }} />
                </div>
            </Card>

            <Card title="Qué es simulado" size="small" style={{ marginTop: 16 }}>
                <ul>
                    <li>Datos, usuarios y catálogos viven en el almacenamiento local del navegador.</li>
                    <li>La API es un adaptador con latencia simulada; no hay servidor.</li>
                    <li>CELEM (búsqueda de leyes) es una lista ficticia; puede simularse su caída en la pestaña Fundamentos.</li>
                    <li>No hay contraseñas: se elige un usuario de demostración.</li>
                </ul>
                <Popconfirm title="¿Restablecer los datos de ejemplo?" okText="Restablecer" cancelText="Cancelar"
                    onConfirm={async () => { await reset.mutateAsync(); message.success("Datos de ejemplo restablecidos."); }}>
                    <Button icon={<UndoOutlined />} loading={reset.isPending}>Restablecer datos de ejemplo</Button>
                </Popconfirm>
            </Card>
        </div>
    );
};

export default AyudaView;
