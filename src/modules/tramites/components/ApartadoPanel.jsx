import { useState } from "react";
import { App, Alert, Button, Form, Modal, Space, Table, Tag, Tooltip } from "antd";
import { EditOutlined, PlusOutlined, PoweroffOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { explain } from "@/modules/mock/permissions";
import { useCurrentUser } from "@/modules/mock/sessionStore";
import { useSaveItem, useToggleItem } from "@/modules/tramites/hooks/useTramites";
import { ESTATUS_META } from "@/modules/mock/catalogs";

/**
 * Generic add/edit/activate-deactivate panel shared by every apartado tab.
 * Props: section, tramite, columns, renderFields(form), toForm(item), toPayload(values),
 * rows (optional pre-filtered list), fixedValues, singular, deactivateWarning(item) -> string | null.
 */
const ApartadoPanel = ({
    section, tramite, columns, renderFields, toForm = (i) => i, toPayload = (v) => v,
    rows, fixedValues = {}, singular, addDisabled = false, addHint, intro, deactivateWarning,
}) => {
    const { message, notification, modal } = App.useApp();
    const user = useCurrentUser();
    const [form] = Form.useForm();
    const [editing, setEditing] = useState(null);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(null);
    const save = useSaveItem();
    const toggle = useToggleItem();

    const permit = explain(user, "apartados", tramite);
    const data = rows ?? tramite.apartados[section];

    const openModal = (item) => {
        setEditing(item);
        setError(null);
        form.resetFields();
        if (item) form.setFieldsValue(toForm(item));
        setOpen(true);
    };

    const onFinish = async (values) => {
        try {
            const res = await save.mutateAsync({
                tramiteId: tramite.id, section, itemId: editing?.id,
                values: { ...toPayload(values), ...fixedValues },
            });
            setOpen(false);
            message.success(editing ? `${singular} actualizado.` : `${singular} agregado.`);
            if (res.promoted) {
                notification.info({
                    title: "Trámite promovido automáticamente",
                    description: `Al guardar el costo, el trámite pasó al estatus "${ESTATUS_META[res.estatus].label}" para su revisión.`,
                    duration: 8,
                });
            }
        } catch (e) {
            setError(e.message);
        }
    };

    const runToggle = async (item) => {
        try {
            await toggle.mutateAsync({ tramiteId: tramite.id, section, itemId: item.id });
            message.success(item.activo ? `${singular} desactivado.` : `${singular} activado.`);
        } catch (e) {
            message.error(e.message);
        }
    };

    const onToggle = (item) => {
        const warning = item.activo ? deactivateWarning?.(item) : null;
        if (!warning) return runToggle(item);
        return modal.confirm({
            title: `¿Desactivar ${singular}?`, content: warning, okText: "Desactivar", cancelText: "Cancelar",
            okButtonProps: { danger: true }, onOk: () => runToggle(item),
        });
    };

    const actionCol = {
        title: "Acciones", key: "acciones", width: 200,
        render: (_, item) => (
            <Space size="small" wrap>
                <Tooltip title={permit.allowed ? "" : permit.reason}>
                    <span><Button size="small" icon={<EditOutlined />} disabled={!permit.allowed} onClick={() => openModal(item)}>Editar</Button></span>
                </Tooltip>
                <Tooltip title={permit.allowed ? "" : permit.reason}>
                    <span>
                        <Button
                            size="small" disabled={!permit.allowed} loading={toggle.isPending && toggle.variables?.itemId === item.id}
                            icon={item.activo ? <PoweroffOutlined /> : <CheckCircleOutlined />} onClick={() => onToggle(item)}
                        >
                            {item.activo ? "Desactivar" : "Activar"}
                        </Button>
                    </span>
                </Tooltip>
            </Space>
        ),
    };
    const stateCol = {
        title: "Estado", key: "activo", width: 110,
        render: (_, item) => (item.activo ? <Tag color="green">Activo</Tag> : <Tag>Inactivo</Tag>),
    };

    return (
        <div>
            {intro}
            {!permit.allowed && <Alert type="info" showIcon style={{ marginBottom: 12 }} title="Solo lectura" description={permit.reason} />}
            <div className="mq-toolbar">
                <Tooltip title={!permit.allowed ? permit.reason : addDisabled ? addHint : ""}>
                    <span>
                        <Button type="primary" icon={<PlusOutlined />} disabled={!permit.allowed || addDisabled} onClick={() => openModal(null)}>
                            Agregar {singular}
                        </Button>
                    </span>
                </Tooltip>
            </div>
            <div className="mq-table-wrap">
                <Table
                    size="small" rowKey="id" dataSource={data} pagination={false}
                    columns={[...columns, stateCol, actionCol]}
                    rowClassName={(r) => (r.activo ? "" : "mq-row-inactive")}
                    locale={{ emptyText: `Aún no hay registros de ${section}.` }}
                />
            </div>
            <Modal
                open={open} title={`${editing ? "Editar" : "Agregar"} ${singular}`} onCancel={() => setOpen(false)}
                okText="Guardar" cancelText="Cancelar" onOk={() => form.submit()} confirmLoading={save.isPending} forceRender width={620}
            >
                {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 12 }} />}
                <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional">
                    {renderFields(form)}
                </Form>
            </Modal>
        </div>
    );
};

export default ApartadoPanel;
