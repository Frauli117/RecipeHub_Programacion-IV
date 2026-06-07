import { Navigate } from "react-router-dom";
import { useAuth } from "../modules/auth/context/useAuth";

export default function PublicRoute({ children }) {
    const { usuario, cargando } = useAuth();

    if (cargando) {
        return null;
    }

    // Si ya hay sesión, no tiene sentido mostrar login/register.
    if (usuario) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
