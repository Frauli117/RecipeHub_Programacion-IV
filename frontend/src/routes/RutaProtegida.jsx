import { Navigate } from "react-router-dom";
import { useAuth } from "../modules/auth/context/useAuth";
import Navbar from "../components/Navbar";
import { ModalRecetaProvider } from "../context/ModalRecetaProvider";
import FormReceta from "../modules/receta/components/FormReceta";

export default function RutaProtegida({ children }) {
    const { usuario } = useAuth();

    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    return (
        <ModalRecetaProvider>
            <Navbar />
            <div className="main-content-layout">
                {children}
            </div>
            <FormReceta />
        </ModalRecetaProvider>
    );
}