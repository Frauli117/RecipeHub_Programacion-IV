import LoginForm from "../modules/auth/components/LoginForm";
import { Link } from "react-router-dom";
import "./PaginaDeLogin.css";

export default function LoginPage() {
    return (
        <div className="login-page-wrapper">
            <header className="login-header">
                <h1 className="login-logo">RecipeHub</h1>
            </header>

            <main className="login-card">
                <h2 className="login-card-title">Inicio de sesión</h2>
                <p className="login-card-subtitle">
                    Para continuar, debes iniciar sesión
                </p>
                <LoginForm />

                <p>
                    ¿No tienes cuenta?{" "}
                    <Link to="/register">
                        Crear cuenta
                    </Link>
                </p>

            </main>
        </div>
    );
}