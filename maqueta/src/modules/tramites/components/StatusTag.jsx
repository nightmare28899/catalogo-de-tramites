import { Tag } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, EditOutlined, StopOutlined, DollarOutlined } from "@ant-design/icons";
import { ESTATUS_META } from "@/modules/mock/catalogs";

const ICONS = {
    785: <EditOutlined />,
    1668: <ClockCircleOutlined />,
    787: <CheckCircleOutlined />,
    783: <DollarOutlined />,
    789: <StopOutlined />,
};

// Status is conveyed by text and icon as well as color.
const StatusTag = ({ estatus }) => {
    const meta = ESTATUS_META[estatus];
    if (!meta) return <Tag>Desconocido</Tag>;
    return (
        <Tag color={meta.color} icon={ICONS[estatus]} title={meta.description}>
            {meta.label}
        </Tag>
    );
};

export default StatusTag;
