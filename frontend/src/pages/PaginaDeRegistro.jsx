import { Link } from "react-router-dom";
import RegisterForm from "../modules/auth/components/RegistroForm";
import "./PaginaDeRegistro.css";

export default function RegisterPage() {
    return (
        <div className="auth-page-wrapper">
            <header className="auth-header">
                <h1 className="auth-logo">RecipeHub</h1>
            </header>

            <main className="auth-card">
                <h2 className="auth-card-title">Crear cuenta</h2>
                <p className="auth-card-subtitle">
                    Regístrate para comenzar a guardar tus recetas.
                </p>

                <RegisterForm />

                <footer className="auth-card-footer">
                    <span>¿Ya tienes cuenta? </span>
                    <Link to="/login" className="auth-link">
                        Iniciar sesión
                    </Link>
                </footer>
            </main>
        </div>
    );
}