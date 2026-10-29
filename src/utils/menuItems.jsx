import {
    DatabaseOutlined,
    HomeOutlined,
    InfoCircleOutlined,
    FileTextOutlined,
    QuestionCircleOutlined,
} from "@ant-design/icons";

export const getMenuItems = () => [
    {   
        key: "/inicio", 
        label: "Inicio", 
        icon: <HomeOutlined /> 
    },
    {
        key: "/tramites",
        label: "Trámites",
        icon: <FileTextOutlined />,
    },
    {
        key: "/ayuda-maqueta",
        label: "Ayuda de la maqueta",
        icon: <QuestionCircleOutlined />,
    },
    {
        key: "/informacion",
        label: "Información Trámites",
        icon: <InfoCircleOutlined />,
    },
    {
        key: "/ejemplo-crud",
        label: "Ejemplo CRUD",
        icon: <DatabaseOutlined />,
    },
];
