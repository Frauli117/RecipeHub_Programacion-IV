import { useEffect, useState } from "react";
import { useAuth } from "../modules/auth/context/useAuth";
import { listarRecetas } from "../modules/receta/api/recetaApi";
import { toast } from "sonner";
import "./PaginaPerfil.css";

const DIFICULTAD_CLASS = {
    Fácil: "pp-badge pp-badge--facil",
    Media: "pp-badge pp-badge--media",
    Difícil: "pp-badge pp-badge--dificil",
};

function TarjetaRecetaPerfil({ receta }) {
    return (
        <a href={`/recetas/${receta._id}`} className="pp-receta-card">
            {receta.imagenUrl ? (
                <div className="pp-receta-card__img">
                    <img src={receta.imagenUrl} alt={receta.titulo} loading="lazy" />
                </div>
            ) : (
                <div className="pp-receta-card__img pp-receta-card__img--placeholder">
                    🍽️
                </div>
            )}

            <div className="pp-receta-card__body">
                <div className="pp-receta-card__meta-top">
                    <span className="pp-categoria">{receta.categoria}</span>
                    <span className={DIFICULTAD_CLASS[receta.dificultad] ?? "pp-badge"}>
                        {receta.dificultad}
                    </span>
                </div>

                <h3 className="pp-receta-card__titulo">{receta.titulo}</h3>
                <p className="pp-receta-card__desc">{receta.descripcion}</p>

                <div className="pp-receta-card__footer">
                    <span className="pp-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        {receta.tiempoMin} min
                    </span>
                    <span className="pp-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {receta.porciones} {receta.porciones === 1 ? "porción" : "porciones"}
                    </span>
                    {typeof receta.calificacionPromedio === "number" && (
                        <span className="pp-meta-item pp-meta-item--rating">
                            ★ {receta.calificacionPromedio.toFixed(1)}
                        </span>
                    )}
                    <span className="pp-ver-mas">
                        Ver receta
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                    </span>
                </div>
            </div>
        </a>
    );
}

export default function PaginaPerfil() {
    const { usuario } = useAuth();
    const [recetas, setRecetas] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (!usuario?._id) return;

        const cargar = async () => {
            setCargando(true);
            try {
                const data = await listarRecetas({ autorId: usuario._id });
                setRecetas(data);
            } catch {
                toast.error("No se pudieron cargar tus recetas.");
            } finally {
                setCargando(false);
            }
        };

        cargar();
    }, [usuario?._id]);

    const inicial = usuario?.nombre?.[0]?.toUpperCase() ?? "?";

    return (
        <div className="pp-page">

            {/* ── Card de perfil ── */}
            <section className="pp-perfil-card">
                <div className="pp-perfil-card__deco" aria-hidden="true" />

                <div className="pp-perfil-card__contenido">
                    <div className="pp-avatar">{inicial}</div>

                    <div className="pp-perfil-info">
                        <h1 className="pp-nombre">{usuario?.nombre}</h1>
                        <p className="pp-bio">¡Amo cocinar!</p>
                        <div className="pp-datos">
                            <span className="pp-dato">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                {usuario?.email}
                            </span>
                            {!cargando && (
                                <span className="pp-dato">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                    {recetas.length} {recetas.length === 1 ? "receta publicada" : "recetas publicadas"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Recetas ── */}
            <section className="pp-recetas-seccion">
                <h2 className="pp-seccion-titulo">
                    Mis recetas
                    {!cargando && recetas.length > 0 && (
                        <span className="pp-seccion-count">{recetas.length}</span>
                    )}
                </h2>

                {cargando ? (
                    <div className="pp-skeleton-grid">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="pp-skeleton-card" />
                        ))}
                    </div>
                ) : recetas.length === 0 ? (
                    <div className="pp-vacio">
                        <span className="pp-vacio__icon" aria-hidden="true">🍳</span>
                        <p>Todavía no publicaste ninguna receta.</p>
                    </div>
                ) : (
                    <div className="pp-recetas-grid">
                        {recetas.map((r) => (
                            <TarjetaRecetaPerfil key={r._id} receta={r} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}