import { ExperimentOutlined } from "@ant-design/icons";

const MockBanner = () => (
    <div className="mq-banner" role="note">
        <ExperimentOutlined aria-hidden="true" />
        <span>MAQUETA: datos ficticios, sin conexión a servidor</span>
    </div>
);

export default MockBanner;
