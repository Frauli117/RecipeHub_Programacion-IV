import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { toast } from "sonner";
import "./LoginForm.css";

export default function LoginForm() {
    const [correo, setCorreo] = useState("");
    const [contra, setContra] = useState("");
    const [mostrarContra, setMostrarContra] = useState(false);
    const [cargando, setCargando] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!correo.trim()) {
            toast.error("Ingresa tu correo electrónico.");
            return;
        }

        if (!contra.trim()) {
            toast.error("Ingresa tu contraseña.");
            return;
        }

        try {
            setCargando(true);
            await login(correo, contra);
            toast.success("Inicio de sesión exitoso.");
        } catch (error) {
            console.error(error);
            toast.error("Correo o contraseña incorrectos.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                    id="correo"
                    type="correo"
                    className="form-input"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="correo@ejemplo.com"
                />
            </div>

            <div className="form-group">
                <label htmlFor="contra">Contraseña</label>
                <div className="contra-input-wrapper">
                    <input
                        id="contra"
                        type={mostrarContra ? "text" : "contra"}
                        className="form-input"
                        value={contra}
                        onChange={(e) => setContra(e.target.value)}
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        className="btn-toggle-contra"
                        onClick={() => setMostrarContra((prev) => !prev)}
                    >
                        {mostrarContra ? "Ocultar" : "Mostrar"}
                    </button>
                </div>
            </div>

            <button type="submit" className="btn-submit" disabled={cargando}>
                {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
        </form>
    );
}