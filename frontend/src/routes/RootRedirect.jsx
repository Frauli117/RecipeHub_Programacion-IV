import { Navigate } from "react-router-dom";
import { useAuth } from "../modules/auth/context/useAuth";

export default function RootRedirect() {
    const { usuario } = useAuth();

    if (usuario) {
        return <Navigate to="/home" replace />;
    }

    return <Navigate to="/login" replace />;
}