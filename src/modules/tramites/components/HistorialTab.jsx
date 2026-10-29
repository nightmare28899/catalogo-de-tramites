import { Collapse, Empty, Table, Timeline, Typography } from "antd";
import { formatDate } from "@/modules/tramites/utils";
import StatusTag from "./StatusTag";

const HistorialTab = ({ tramite }) => {
    const { turnos, auditoria } = tramite;
    return (
        <div>
            <Typography.Title level={5}>Turnos de estatus</Typography.Title>
            {turnos.length === 0 ? <Empty description="Este trámite aún no ha sido turnado." /> : (
                <Timeline
                    items={turnos.map((t) => ({
                        key: t.id,
                        content: (
                            <div>
                                <div><StatusTag estatus={t.from} /> → <StatusTag estatus={t.to} /></div>
                                <div className="mq-muted">{t.userName} · {formatDate(t.at)}</div>
                                {t.observacion && <div>Observación: {t.observacion}</div>}
                            </div>
                        ),
                    }))}
                />
            )}
            <Typography.Title level={5} style={{ marginTop: 24 }}>Bitácora de cambios</Typography.Title>
            <Collapse
                items={auditoria.map((a) => ({
                    key: a.id,
                    label: `${formatDate(a.at)} · ${a.userName} · ${a.accion}`,
                    collapsible: a.cambios.length ? undefined : "disabled",
                    children: (
                        <div className="mq-table-wrap">
                            <Table
                                size="small" rowKey="campo" pagination={false} dataSource={a.cambios}
                                columns={[
                                    { title: "Campo", dataIndex: "campo" },
                                    { title: "Antes", dataIndex: "antes" },
                                    { title: "Después", dataIndex: "despues" },
                                ]}
                            />
                        </div>
                    ),
                }))}
            />
        </div>
    );
};

export default HistorialTab;
