import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { obtenerReceta, eliminarReceta } from "../modules/receta/api/recetaApi";
import { listarComentarios, crearComentario, eliminarComentario } from "../modules/receta/api/comentarioApi";
import { useAuth } from "../modules/auth/context/useAuth";
import "./DetalleReceta.css";

const DIFICULTAD_CLASS = {
    Fácil: "badge badge--facil",
    Media: "badge badge--media",
    Difícil: "badge badge--dificil",
};

/* ── Estrellas de calificación ── */
function Estrellas({ valor, interactivo = false, onChange }) {
    const [hover, setHover] = useState(0);
    const activo = hover || valor;

    return (
        <div className={`estrellas ${interactivo ? "estrellas--interactivas" : ""}`} aria-label={`${valor} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <button
                    key={n}
                    type="button"
                    disabled={!interactivo}
                    className={`estrella ${n <= activo ? "estrella--activa" : ""}`}
                    onClick={() => interactivo && onChange?.(n)}
                    onMouseEnter={() => interactivo && setHover(n)}
                    onMouseLeave={() => interactivo && setHover(0)}
                    aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

/* ── Tarjeta de comentario ── */
function TarjetaComentario({ comentario, usuarioActualId, onEliminar }) {
    const esAutor = usuarioActualId && comentario.usuarioId?._id === usuarioActualId;

    return (
        <article className="comentario">
            <div className="comentario__header">
                <div className="comentario__autor">
                    <div className="comentario__avatar" aria-hidden="true">
                        {comentario.usuarioId?.nombre?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                        <span className="comentario__nombre">{comentario.usuarioId?.nombre ?? "Usuario"}</span>
                        <span className="comentario__fecha">
                            {new Date(comentario.createdAt).toLocaleDateString("es-CR", {
                                day: "numeric", month: "long", year: "numeric",
                            })}
                        </span>
                    </div>
                </div>
                <div className="comentario__acciones">
                    <Estrellas valor={comentario.calificacion} />
                    {esAutor && (
                        <button
                            type="button"
                            className="btn-eliminar-comentario"
                            onClick={() => onEliminar(comentario._id)}
                            aria-label="Eliminar comentario"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4h6v2" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            <p className="comentario__texto">{comentario.texto}</p>
        </article>
    );
}

/* ── Formulario nuevo comentario ── */
function FormComentario({ recetaId, onNuevoComentario }) {
    const [texto, setTexto] = useState("");
    const [calificacion, setCalificacion] = useState(0);
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async () => {
        if (!calificacion) {
            toast.warning("Seleccioná una calificación antes de enviar.");
            return;
        }
        if (!texto.trim()) {
            toast.warning("Escribí un comentario antes de enviar.");
            return;
        }
        setEnviando(true);
        try {
            const nuevo = await crearComentario(recetaId, { texto: texto.trim(), calificacion });
            onNuevoComentario(nuevo);
            setTexto("");
            setCalificacion(0);
            toast.success("Comentario publicado.");
        } catch (error) {
            toast.error("No se pudo publicar el comentario.");
            console.error(error);
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="form-comentario">
            <h3 className="form-comentario__titulo">Dejá tu opinión</h3>
            <div className="form-comentario__calificacion">
                <span className="form-label">Tu calificación</span>
                <Estrellas valor={calificacion} interactivo onChange={setCalificacion} />
            </div>
            <textarea
                className="form-comentario__textarea"
                placeholder="¿Qué te pareció esta receta?"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={3}
                maxLength={500}
            />
            <div className="form-comentario__footer">
                <span className="form-comentario__contador">{texto.length}/500</span>
                <button
                    type="button"
                    className="btn-publicar"
                    onClick={handleSubmit}
                    disabled={enviando}
                >
                    {enviando ? "Publicando…" : "Publicar comentario"}
                </button>
            </div>
        </div>
    );
}

/* ── Página principal ── */
export default function DetalleReceta() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();

    const [receta, setReceta] = useState(null);
    const [comentarios, setComentarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [eliminando, setEliminando] = useState(false);

    const [tiqueRefresco, setTiqueRefresco] = useState(0);
    const recargar = useCallback(() => setTiqueRefresco((prev) => prev + 1), []);

    const [estadoPrevio, setEstadoPrevio] = useState({ id, tiqueRefresco });
    if (id !== estadoPrevio.id || tiqueRefresco !== estadoPrevio.tiqueRefresco) {
        setEstadoPrevio({ id, tiqueRefresco });
        setCargando(true);
    }

    useEffect(() => {
        let activo = true;

        const obtenerDatos = async () => {
            try {
                const [dataReceta, dataComentarios] = await Promise.all([
                    obtenerReceta(id),
                    listarComentarios(id),
                ]);
                if (activo) {
                    setReceta(dataReceta);
                    setComentarios(dataComentarios);
                    setCargando(false);
                }
            } catch (error) {
                if (activo) {
                    toast.error("No se pudo cargar la receta.");
                    console.error(error);
                    navigate("/");
                    setCargando(false);
                }
            }
        };

        obtenerDatos();
        return () => { activo = false; };
    }, [id, tiqueRefresco, navigate]);

    const handleEliminarReceta = async () => {
        const confirmar = window.confirm(
            "¿Seguro que querés eliminar esta receta? Esta acción no se puede deshacer."
        );
        if (!confirmar) return;

        setEliminando(true);
        try {
            await eliminarReceta(id);
            toast.success("Receta eliminada.");
            navigate("/");
        } catch (error) {
            toast.error("No se pudo eliminar la receta.");
            console.error(error);
            setEliminando(false);
        }
    };

    const handleNuevoComentario = (nuevo) => {
        setComentarios((prev) => [nuevo, ...prev]);
    };

    const handleEliminarComentario = async (comentarioId) => {
        try {
            await eliminarComentario(comentarioId);
            setComentarios((prev) => prev.filter((c) => c._id !== comentarioId));
            toast.success("Comentario eliminado.");
        } catch (error) {
            toast.error("No se pudo eliminar el comentario.");
            console.error(error);
        }
    };

    if (cargando) {
        return (
            <div className="detalle-receta detalle-receta--cargando">
                <div className="detalle-skeleton__imagen" />
                <div className="detalle-skeleton__contenido">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="detalle-skeleton__linea" style={{ width: `${85 - i * 12}%` }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!receta) return null;

    const calPromedio = receta.calificacionPromedio;
    const esAutor = usuario?._id === receta.autorId?._id;

    return (
        <article className="detalle-receta">

            {/* ── Hero ── */}
            <div className="detalle-hero">
                {receta.imagenUrl ? (
                    <img
                        className="detalle-hero__imagen"
                        src={receta.imagenUrl}
                        alt={receta.titulo}
                    />
                ) : (
                    <div className="detalle-hero__placeholder" aria-hidden="true">
                        🍽️
                    </div>
                )}
                <div className="detalle-hero__overlay">
                    <div className="detalle-hero__badges">
                        <span className="badge-categoria">{receta.categoria}</span>
                        <span className={DIFICULTAD_CLASS[receta.dificultad] ?? "badge"}>
                            {receta.dificultad}
                        </span>

                    </div>

                    <h1 className="detalle-hero__titulo">{receta.titulo}</h1>
                    <div className="detalle-hero__meta">
                        <span className="hero-meta-item">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            {receta.tiempoMin} min
                        </span>
                        <span className="hero-meta-item">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            {receta.porciones} {receta.porciones === 1 ? "porción" : "porciones"}
                        </span>
                        {typeof calPromedio === "number" && (
                            <span className="hero-meta-item hero-meta-item--rating">
                                ★ {calPromedio.toFixed(1)}
                                <span className="rating-count">({comentarios.length})</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="detalle-cuerpo">
                {/* ── Columna principal ── */}
                <div className="detalle-principal">
                    <section className="detalle-seccion">
                        <p className="detalle-descripcion">{receta.descripcion}</p>
                    </section>

                    <section className="detalle-seccion">
                        <h2 className="detalle-seccion__titulo">
                            <span className="seccion-icon" aria-hidden="true">🧂</span>
                            Ingredientes
                        </h2>
                        <ul className="lista-ingredientes">
                            {receta.ingredientes.map((ing, i) => (
                                <li key={i} className="ingrediente">
                                    <span className="ingrediente__nombre">{ing.nombre}</span>
                                    <span className="ingrediente__cantidad">
                                        {ing.cantidad} {ing.unidad}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="detalle-seccion">
                        <h2 className="detalle-seccion__titulo">
                            <span className="seccion-icon" aria-hidden="true">👨‍🍳</span>
                            Preparación
                        </h2>
                        <ol className="lista-pasos">
                            {receta.pasos.map((paso, i) => (
                                <li key={i} className="paso">
                                    <span className="paso__numero">{i + 1}</span>
                                    <p className="paso__texto">{paso}</p>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {receta.tags?.length > 0 && (
                        <div className="detalle-tags">
                            {receta.tags.map((tag) => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Sidebar ── */}
                <aside className="detalle-sidebar">
                    <div className="sidebar-card autor-card">
                        <h3 className="sidebar-card__titulo">Autor</h3>
                        <div className="autor-info">
                            <div className="autor-avatar" aria-hidden="true">
                                {receta.autorId?.nombre?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                                <p className="autor-nombre">{receta.autorId?.nombre ?? "Desconocido"}</p>
                                {receta.autorId?.bio && (
                                    <p className="autor-bio">{receta.autorId.bio}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {esAutor && (
                        <div className="sidebar-card acciones-card">
                            <h3 className="sidebar-card__titulo">Acciones</h3>
                            <div className="acciones-lista">
                                <button
                                    type="button"
                                    className="btn-accion btn-accion--editar"
                                    onClick={() => navigate(`/editar/${receta._id}`)}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Editar receta
                                </button>
                                <button
                                    type="button"
                                    className="btn-accion btn-accion--eliminar"
                                    onClick={handleEliminarReceta}
                                    disabled={eliminando}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6l-1 14H6L5 6" />
                                        <path d="M10 11v6M14 11v6" />
                                        <path d="M9 6V4h6v2" />
                                    </svg>
                                    {eliminando ? "Eliminando…" : "Eliminar receta"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="sidebar-card resumen-card">
                        <h3 className="sidebar-card__titulo">Resumen</h3>
                        <dl className="resumen-lista">
                            <div className="resumen-item">
                                <dt>Tiempo</dt>
                                <dd>{receta.tiempoMin} min</dd>
                            </div>
                            <div className="resumen-item">
                                <dt>Porciones</dt>
                                <dd>{receta.porciones}</dd>
                            </div>
                            <div className="resumen-item">
                                <dt>Dificultad</dt>
                                <dd>{receta.dificultad}</dd>
                            </div>
                            <div className="resumen-item">
                                <dt>Categoría</dt>
                                <dd>{receta.categoria}</dd>
                            </div>
                            <div className="resumen-item">
                                <dt>Ingredientes</dt>
                                <dd>{receta.ingredientes.length}</dd>
                            </div>
                            <div className="resumen-item">
                                <dt>Pasos</dt>
                                <dd>{receta.pasos.length}</dd>
                            </div>
                        </dl>
                    </div>
                </aside>
            </div>

            {/* ── Comentarios ── */}
            <section className="detalle-comentarios">
                <h2 className="detalle-seccion__titulo">
                    <span className="seccion-icon" aria-hidden="true">💬</span>
                    Comentarios
                    {comentarios.length > 0 && (
                        <span className="comentarios-count">{comentarios.length}</span>
                    )}
                </h2>

                {usuario ? (
                    <FormComentario recetaId={id} onNuevoComentario={handleNuevoComentario} />
                ) : (
                    <p className="comentarios-login-aviso">
                        <Link to="/login">Iniciá sesión</Link> para dejar un comentario.
                    </p>
                )}

                {comentarios.length === 0 ? (
                    <p className="comentarios-vacio">Todavía no hay comentarios. ¡Sé el primero!</p>
                ) : (
                    <div className="comentarios-lista">
                        {comentarios.map((c) => (
                            <TarjetaComentario
                                key={c._id}
                                comentario={c}
                                usuarioActualId={usuario?._id}
                                onEliminar={handleEliminarComentario}
                            />
                        ))}
                    </div>
                )}
            </section>
        </article>
    );
}