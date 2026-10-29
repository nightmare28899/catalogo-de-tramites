import React from "react";
import { Layout, Row, Col, Typography, Button, Grid, Space, Dropdown, Avatar, Tooltip, Select } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { useHeader } from "@/hooks";
import LogoMich from '@/assets/images/Recurso 2@300x.png';
import { ROLES, ROLE_DESCRIPTIONS } from "@/modules/mock/catalogs";
import "@/assets/styles/components.css";

const { useBreakpoint } = Grid;
const { Header: AntHeader } = Layout;

const Header = () => {
    const screens = useBreakpoint();
    
    const {
        user,
        token,
        title,
        getInitials,
        items,
        navItemStyle,
        showMenu,
        navigate,
        demoUsers,
        switchUser,
    } = useHeader();

    return (
        <>
            <AntHeader className="header-root">
                <Row align="middle" justify="space-between" wrap={false} className="header-row">
                    
                    <Col flex="none" className="header-logo-col">
                        <img 
                            src={LogoMich} 
                            alt="Logo Institucional" 
                            className="header-logo-icon"
                            onClick={() => navigate('/')}
                        />
                        <Col>
                            <Typography.Text className="header-title-main">
                                {title}
                            </Typography.Text>
                            <Typography.Text className="header-title-sub">
                                Gobierno del Estado de Michoacán
                            </Typography.Text>
                        </Col>
                    </Col>

                    <Col flex="auto" className="header-actions-col">
                        <Space size={15} align="center">
                            {!screens.md && token && (
                                <Button
                                    type="default"
                                    shape="circle"
                                    icon={<MenuOutlined />}
                                    className="header-mobile-menu-button"
                                    onClick={showMenu}
                                />
                            )}

                            {screens.lg && (
                                <>
                                    <a onClick={() => navigate(user ? '/tramites' : '/')} style={navItemStyle}>
                                        Trámites
                                    </a>
                                    <a onClick={() => window.open("https://michoacan.gob.mx/", "_blank")} style={navItemStyle}>
                                        Gobierno
                                    </a>
                                </>
                            )}

                            {screens.md && user && (
                                <Select
                                    aria-label="Cambiar usuario de demostración"
                                    value={user.id}
                                    onChange={switchUser}
                                    style={{ width: 280 }}
                                    popupMatchSelectWidth={false}
                                    options={demoUsers.map((u) => ({ value: u.id, label: `${ROLES[u.rol]} - ${u.nombre}`, desc: ROLE_DESCRIPTIONS[u.rol] }))}
                                    optionRender={(o) => (
                                        <div style={{ maxWidth: 380, whiteSpace: "normal" }}>
                                            <strong>{o.data.label}</strong>
                                            <div style={{ fontSize: 12, color: "#595959" }}>{o.data.desc}</div>
                                        </div>
                                    )}
                                />
                            )}

                            { token && user ? 
                                <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight" arrow>
                                    <Avatar
                                        size="large"
                                        role="button"
                                        tabIndex={0}
                                        aria-label="Menú de usuario"
                                    >
                                        {getInitials(user.nombre)}
                                    </Avatar>
                                </Dropdown>
                            :  screens.xs ? 
                                <Tooltip title="Iniciar Sesión">
                                    <Button 
                                        icon={<UserOutlined />} 
                                        onClick={() => navigate("/login")}
                                        type="default"
                                        className="header-login-button"
                                        shape="circle"
                                    />  
                                </Tooltip>
                                : 
                                    <Button 
                                        icon={<UserOutlined />} 
                                        onClick={() => navigate("/login")}
                                        type="default"
                                        className="header-login-button"
                                    >
                                        Iniciar Sesión
                                    </Button>
                            }
                        </Space>
                    </Col>
                </Row>
            </AntHeader>
        </>
    );
};

export default Header;
