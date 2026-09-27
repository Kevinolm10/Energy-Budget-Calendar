import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./authContext";    

export function ProtectedLayout() {
    const { user, loading } = useAuth() ?? { user: null, loading: false };
    const location = useLocation();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}