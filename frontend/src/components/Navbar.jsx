import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/context/useAuth";
import { toast } from "sonner";
import "./Navbar.css";

export default function Navbar() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Sesión cerrada correctamente.");
            navigate("/login");
        } catch (error) {
            console.error(error);
            toast.error("No se pudo cerrar la sesión.");
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/" className="navbar-logo">
                        RecipeHub $$
                    </Link>
                </div>

                <ul className="navbar-links">
                    <li>
                        <Link to="/" className="nav-link">
                            Inicio
                        </Link>
                    </li>

                    {usuario ? (
                        <>
                            {/* Menú Desplegable: Recetas */}
                            <li className="nav-dropdown">
                                <span className="dropdown-trigger">
                                    Recetas <span className="arrow">▾</span>
                                </span>
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link to="/nueva" className="dropdown-link">
                                            Crear nueva receta
                                        </Link>
                                    </li>
                                </ul>
                            </li>

                            {/* Menú Desplegable: Perfil */}
                            <li className="nav-dropdown">
                                <span className="dropdown-trigger">
                                    Perfil <span className="arrow">▾</span>
                                </span>
                                <ul className="dropdown-menu dropdown-menu-right">
                                    <li>
                                        <Link to="/perfil" className="dropdown-link">
                                            Mi perfil
                                        </Link>
                                    </li>
                                    <li className="dropdown-divider"></li>
                                    <li>
                                        <button onClick={handleLogout} className="dropdown-btn-logout">
                                            Cerrar sesión
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/login" className="nav-link">
                                    Iniciar sesión
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="nav-link">
                                    Registrarse
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}