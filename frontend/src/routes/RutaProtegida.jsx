import { Navigate } from "react-router-dom";
import { useAuth } from "../modules/auth/context/useAuth";

export default function RutaProtegida({ children }) {
    const { usuario, cargando } = useAuth();

    // Mientras se restaura la sesión no decidimos nada (evita botar al login al refrescar).
    if (cargando) {
        return null;
    }

    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
