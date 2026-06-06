import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../modules/auth/context/useAuth";
import { useModalReceta } from "../context/useModalReceta";
import { toast } from "sonner";
import "./Navbar.css";

export default function Navbar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { abrirCrear } = useModalReceta();

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
                        RecipeHub
                    </Link>
                </div>

                <ul className="navbar-links">
                    <li>
                        <Link to="/" className="nav-link">
                            Inicio
                        </Link>
                    </li>

                    {/* Menú Desplegable: Recetas */}
                    <li className="nav-dropdown">
                        <span className="dropdown-trigger">
                            Recetas <span className="arrow">▾</span>
                        </span>
                        <ul className="dropdown-menu">
                            <li>
                                <button
                                    type="button"
                                    className="dropdown-link dropdown-link--btn"
                                    onClick={abrirCrear}
                                >
                                    Crear nueva receta
                                </button>
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
                </ul>
            </div>
        </nav>
    );
}