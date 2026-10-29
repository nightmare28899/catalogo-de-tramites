import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Col, Row, Skeleton, Typography } from "antd";
import "@/modules/tramites/tramites.css";
import { ROLES, ROLE_DESCRIPTIONS } from "@/modules/mock/catalogs";
import { useSessionStore } from "@/modules/mock/sessionStore";
import { useDemoUsers, useOrgs } from "@/modules/tramites/hooks/useTramites";

const LoginView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const login = useSessionStore((s) => s.login);
    const { data: users, isLoading } = useDemoUsers();
    const { data: orgs } = useOrgs();

    const enter = (id) => {
        login(id);
        navigate(location.state?.from ?? "/tramites", { replace: true });
    };

    return (
        <div className="mq-login">
            <Typography.Title level={2}>Catálogo de Trámites</Typography.Title>
            <Alert type="info" showIcon title="MAQUETA: datos ficticios, sin conexión a servidor" description="Elija un usuario de demostración para recorrer el flujo. No se solicitan contraseñas." />
            {isLoading ? <Skeleton active /> : (
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    {users.map((u) => {
                        const unidad = orgs?.unidades.find((x) => x.id === u.unidadId)?.nombre;
                        const dep = orgs?.dependencias.find((x) => x.id === u.dependenciaId)?.nombre;
                        return (
                            <Col xs={24} md={12} key={u.id}>
                                <Card title={ROLES[u.rol]} className="mq-login-card">
                                    <Typography.Text strong>{u.nombre}</Typography.Text>
                                    {dep && <div className="mq-muted">{dep}{unidad ? ` · ${unidad}` : ""}</div>}
                                    <p>{ROLE_DESCRIPTIONS[u.rol]}</p>
                                    <Button type="primary" onClick={() => enter(u.id)}>Entrar como {ROLES[u.rol]}</Button>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </div>
    );
};

export default LoginView;
