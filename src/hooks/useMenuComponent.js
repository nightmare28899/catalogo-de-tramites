import { useLocation, useNavigate } from "react-router-dom";
import { useMenuStore } from "@/store";
import { useSessionStore } from "@/modules/mock/sessionStore";
import { getMenuItems } from "@/utils/menuItems";

export const useMenuComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { collapsed, setCollapsed } = useMenuStore();

    const menuItems = getMenuItems();
    const currentKey = menuItems.find((i) => location.pathname === i.key || location.pathname.startsWith(`${i.key}/`))?.key;

    const handleMenuClick = async (e) => {
        if (e.key === '/logout') {
            // Only the demo session is cleared; the mock database must survive.
            useSessionStore.getState().logout();
            navigate('/login');
        } else {
            navigate(e.key);
        }
    };

    return {
        handleMenuClick,
        menuItems,
        collapsed,
        setCollapsed,
        currentPath: currentKey ?? location.pathname,
    };
};

export default useMenuComponent;
