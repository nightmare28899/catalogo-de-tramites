import { useNavigate } from "react-router-dom";
import { useMenuStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useSessionStore } from "@/modules/mock/sessionStore";
import { getDb } from "@/modules/mock/db";
import { ROLES, ROLE_DESCRIPTIONS } from "@/modules/mock/catalogs";

export const useHeader = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showMenu } = useMenuStore();
    const { login, logout } = useSessionStore();
    const user = useCurrentUser();
    const demoUsers = getDb().users;

    const getInitials = (name) => {
        if (!name) return "";
        return name.split(" ").map((p) => p[0]).join("").toUpperCase().substring(0, 2);
    };

    const switchUser = (id) => {
        login(id);
        queryClient.invalidateQueries({ queryKey: ["tramites"] });
    };

    const items = [
        { type: "group", label: "Cambiar usuario de demostración" },
        ...demoUsers.map((u) => ({
            key: u.id,
            label: `${ROLES[u.rol]} - ${u.nombre}${u.id === user?.id ? " (actual)" : ""}`,
            title: ROLE_DESCRIPTIONS[u.rol],
            onClick: () => switchUser(u.id),
        })),
        { type: "divider" },
        {
            key: "logout",
            label: "Cerrar sesión",
            onClick: () => {
                logout();
                navigate("/login");
            },
        },
    ];

    const navItemStyle = {
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "15px",
        textDecoration: "none",
        whiteSpace: "nowrap",
        opacity: 0.9,
        cursor: "pointer",
    };

    return {
        user,
        demoUsers,
        switchUser,
        token: user ? "demo-token" : null,
        title: "Ventanilla Digital de Michoacán",
        getInitials,
        items,
        navItemStyle,
        showMenu,
        navigate,
    };
};
