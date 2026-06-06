import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listarRecetas } from "../api/recetaApi";
import "./ListaRecetas.css";

const DIFICULTADES = ["Fácil", "Media", "Difícil"];
const CATEGORIAS = ["Desayuno", "Cena", "Postre"];

const DIFICULTAD_CLASS = {
    Fácil: "badge badge--facil",
    Media: "badge badge--media",
    Difícil: "badge badge--dificil",
};

const CATEGORIA_ICONS = {
    Desayuno: "🌅",
    Cena: "🌙",
    Postre: "🍮",
};

function RecetaCard({ receta }) {
    return (
        <article className="receta-card">
            {receta.imagenUrl && (
                <div className="receta-card__imagen">
                    <img src={receta.imagenUrl} alt={receta.titulo} cargando="lazy" />
                </div>
            )}

            <div className="receta-card__body">
                <div className="receta-card__header">
                    <span className="receta-card__categoria">
                        {CATEGORIA_ICONS[receta.categoria] ?? "🍽️"}{" "}
                        {receta.categoria}
                    </span>
                    <span className={DIFICULTAD_CLASS[receta.dificultad] ?? "badge"}>
                        {receta.dificultad}
                    </span>
                </div>

                <h3 className="receta-card__titulo">{receta.titulo}</h3>

                <p className="receta-card__descripcion">{receta.descripcion}</p>

                <div className="receta-card__meta">
                    <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {receta.tiempoMin} min
                    </span>

                    <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {receta.porciones} {receta.porciones === 1 ? "porción" : "porciones"}
                    </span>

                    {receta.autorId?.nombre && (
                        <span className="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            {receta.autorId.nombre}
                        </span>
                    )}

                    {typeof receta.calificacionPromedio === "number" && (
                        <span className="meta-item meta-item--rating">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            {receta.calificacionPromedio.toFixed(1)}
                        </span>
                    )}
                </div>

                {receta.tags?.length > 0 && (
                    <div className="receta-card__tags">
                        {receta.tags.map((tag) => (
                            <span key={tag} className="tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <a href={`/recetas/${receta._id}`} className="receta-card__cta">
                    Ver receta
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </a>
            </div>
        </article>
    );
}

function FiltroChip({ label, activo, onClick }) {
    return (
        <button
            type="button"
            className={`filtro-chip ${activo ? "filtro-chip--activo" : ""}`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}

export default function ListaRecetas() {
    const [recetas, setRecetas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtros, setFiltros] = useState({
        categoria: "",
        dificultad: "",
    });

    useEffect(() => {
        const cargarRecetas = async () => {
            setCargando(true);
            try {
                const params = {};
                if (filtros.categoria) params.categoria = filtros.categoria;
                if (filtros.dificultad) params.dificultad = filtros.dificultad;

                const data = await listarRecetas(params);
                setRecetas(data);
            } catch (error) {
                toast.error("No se pudieron cargar las recetas. Intenta de nuevo.");
                console.error(error);
            } finally {
                setCargando(false);
            }
        };

        cargarRecetas();
    }, [filtros]);

    const toggleFiltro = (tipo, valor) => {
        setFiltros((prev) => ({
            ...prev,
            [tipo]: prev[tipo] === valor ? "" : valor,
        }));
    };

    const limpiarFiltros = () => {
        setFiltros({ categoria: "", dificultad: "" });
    };

    const hayFiltrosActivos = filtros.categoria || filtros.dificultad;

    return (
        <section className="lista-recetas" aria-label="Listado de recetas">
            <div className="lista-recetas__filtros">
                <div className="filtros-grupo">
                    <span className="filtros-label">Categoría</span>
                    <div className="filtros-chips">
                        {CATEGORIAS.map((cat) => (
                            <FiltroChip
                                key={cat}
                                label={`${CATEGORIA_ICONS[cat]} ${cat}`}
                                activo={filtros.categoria === cat}
                                onClick={() => toggleFiltro("categoria", cat)}
                            />
                        ))}
                    </div>
                </div>

                <div className="filtros-grupo">
                    <span className="filtros-label">Dificultad</span>
                    <div className="filtros-chips">
                        {DIFICULTADES.map((dif) => (
                            <FiltroChip
                                key={dif}
                                label={dif}
                                activo={filtros.dificultad === dif}
                                onClick={() => toggleFiltro("dificultad", dif)}
                            />
                        ))}
                    </div>
                </div>

                {hayFiltrosActivos && (
                    <button
                        type="button"
                        className="btn-limpiar"
                        onClick={limpiarFiltros}
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>

            {cargando ? (
                <div className="lista-recetas__estado" aria-live="polite" aria-busy="true">
                    <div className="skeleton-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="skeleton-card" />
                        ))}
                    </div>
                </div>
            ) : recetas.length === 0 ? (
                <div className="lista-recetas__estado lista-recetas__vacio" aria-live="polite">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M3 2h18l-2 7H5L3 2z" />
                        <path d="M5 9c0 7 2 11 7 11s7-4 7-11" />
                        <line x1="12" y1="13" x2="12" y2="17" />
                    </svg>
                    <p>No hay recetas para los filtros seleccionados.</p>
                    {hayFiltrosActivos && (
                        <button
                            type="button"
                            className="btn-limpiar"
                            onClick={limpiarFiltros}
                        >
                            Ver todas las recetas
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <p className="lista-recetas__conteo" aria-live="polite">
                        {recetas.length} {recetas.length === 1 ? "receta encontrada" : "recetas encontradas"}
                    </p>
                    <div className="recetas-grid">
                        {recetas.map((receta) => (
                            <RecetaCard key={receta._id} receta={receta} />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}