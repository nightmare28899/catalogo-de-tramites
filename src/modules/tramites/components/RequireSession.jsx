import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/modules/mock/sessionStore";

const RequireSession = () => {
    const user = useCurrentUser();
    const location = useLocation();
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    return <Outlet />;
};

export default RequireSession;
