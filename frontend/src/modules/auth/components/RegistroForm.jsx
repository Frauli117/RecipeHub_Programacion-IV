import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import "./RegistroForm.css"; // Importamos su CSS dedicado

export default function RegisterForm() {
    const [nombre, setNombre] = useState("");
    const [correo, setCorreo] = useState("");
    const [contra, setContra] = useState("");
    const [confirmarContra, setConfirmarContra] = useState("");
    const [mostrarContra, setMostrarContra] = useState(false);
    const [cargando, setCargando] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre.trim()) {
            toast.error("Ingresa tu nombre.");
            return;
        }
        if (!correo.trim()) {
            toast.error("Ingresa tu correo electrónico.");
            return;
        }
        if (!contra.trim()) {
            toast.error("Ingresa una contraseña.");
            return;
        }
        if (contra.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (contra !== confirmarContra) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }

        try {
            setCargando(true);
            await register(nombre, correo, contra);
            toast.success("Cuenta creada. Ahora inicia sesión.");

            setNombre("");
            setCorreo("");
            setContra("");
            setConfirmarContra("");
            navigate("/login");
        } catch (error) {
            console.error(error);
            toast.error("No fue posible registrar el usuario.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                    id="nombre"
                    type="text"
                    className="form-input"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                />
            </div>

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
                <input
                    id="contra"
                    type={mostrarContra ? "text" : "contra"}
                    className="form-input"
                    value={contra}
                    onChange={(e) => setContra(e.target.value)}
                    placeholder="••••••••"
                />
            </div>

            <div className="form-group">
                <label htmlFor="confirmarContra">Confirmar contraseña</label>
                <input
                    id="confirmarContra"
                    type={mostrarContra ? "text" : "contra"}
                    className="form-input"
                    value={confirmarContra}
                    onChange={(e) => setConfirmarContra(e.target.value)}
                    placeholder="••••••••"
                />
            </div>

            <div className="form-utility-row">
                <button
                    type="button"
                    className="btn-text-toggle"
                    onClick={() => setMostrarContra((prev) => !prev)}
                >
                    {mostrarContra ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                </button>
            </div>

            <button type="submit" className="btn-submit" disabled={cargando}>
                {cargando ? "Registrando..." : "Registrarse"}
            </button>
        </form>
    );
}