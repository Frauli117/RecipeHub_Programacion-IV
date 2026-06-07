import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { crearReceta, actualizarReceta, obtenerReceta } from "../modules/receta/api/recetaApi";
import "../modules/receta/components/FormReceta.css";

const DIFICULTADES = ["Fácil", "Media", "Difícil"];
const CATEGORIAS = ["Desayuno", "Cena", "Postre"];

const FORM_VACIO = {
    titulo: "",
    descripcion: "",
    categoria: "",
    dificultad: "",
    tiempoMin: "",
    porciones: "",
    imagenUrl: "",
    tags: "",
    ingredientes: [{ nombre: "", cantidad: "", unidad: "" }],
    pasos: [""],
};

function campoValido(v) {
    return v !== "" && v !== null && v !== undefined;
}

function FilaIngrediente({ ing, index, onChange, onEliminar, esUnico }) {
    return (
        <div className="fr-ingrediente">
            <input
                className="fr-input fr-input--grow"
                placeholder="Nombre"
                value={ing.nombre}
                onChange={(e) => onChange(index, "nombre", e.target.value)}
            />
            <input
                className="fr-input fr-input--sm"
                placeholder="Cantidad"
                type="number"
                min="0"
                step="any"
                value={ing.cantidad}
                onChange={(e) => onChange(index, "cantidad", e.target.value)}
            />
            <input
                className="fr-input fr-input--sm"
                placeholder="Unidad"
                value={ing.unidad}
                onChange={(e) => onChange(index, "unidad", e.target.value)}
            />
            <button
                type="button"
                className="fr-btn-icon fr-btn-icon--remove"
                onClick={() => onEliminar(index)}
                disabled={esUnico}
                aria-label="Quitar ingrediente"
            >
                ✕
            </button>
        </div>
    );
}

function FilaPaso({ paso, index, onChange, onEliminar, esUnico }) {
    return (
        <div className="fr-paso">
            <span className="fr-paso__num">{index + 1}</span>
            <textarea
                className="fr-textarea"
                placeholder={`Paso ${index + 1}…`}
                rows={2}
                value={paso}
                onChange={(e) => onChange(index, e.target.value)}
            />
            <button
                type="button"
                className="fr-btn-icon fr-btn-icon--remove"
                onClick={() => onEliminar(index)}
                disabled={esUnico}
                aria-label="Quitar paso"
            >
                ✕
            </button>
        </div>
    );
}

export default function PaginaFormReceta() {
    const { id } = useParams();
    const modo = id ? "editar" : "crear";
    const navigate = useNavigate();

    const [form, setForm] = useState(FORM_VACIO);
    const [cargando, setCargando] = useState(false);
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        let activo = true;

        if (modo === "editar" && id) {
            setCargando(true);
            obtenerReceta(id)
                .then((receta) => {
                    if (!activo) return;
                    setForm({
                        titulo: receta.titulo ?? "",
                        descripcion: receta.descripcion ?? "",
                        categoria: receta.categoria ?? "",
                        dificultad: receta.dificultad ?? "",
                        tiempoMin: receta.tiempoMin ?? "",
                        porciones: receta.porciones ?? "",
                        imagenUrl: receta.imagenUrl ?? "",
                        tags: (receta.tags ?? []).join(", "),
                        ingredientes: receta.ingredientes?.length
                            ? receta.ingredientes.map((i) => ({
                                nombre: i.nombre ?? "",
                                cantidad: i.cantidad ?? "",
                                unidad: i.unidad ?? "",
                            }))
                            : [{ nombre: "", cantidad: "", unidad: "" }],
                        pasos: receta.pasos?.length ? receta.pasos : [""],
                    });
                })
                .catch(() => {
                    if (!activo) return;
                    toast.error("No se pudieron cargar los datos de la receta.");
                    navigate("/");
                })
                .finally(() => {
                    if (activo) setCargando(false);
                });
        } else {
            setForm(FORM_VACIO);
        }

        return () => {
            activo = false;
        };
    }, [id, modo, navigate]);

    const setField = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const agregarIngrediente = () =>
        setForm((prev) => ({
            ...prev,
            ingredientes: [...prev.ingredientes, { nombre: "", cantidad: "", unidad: "" }],
        }));

    const editarIngrediente = (i, campo, valor) =>
        setForm((prev) => {
            const copia = [...prev.ingredientes];
            copia[i] = { ...copia[i], [campo]: valor };
            return { ...prev, ingredientes: copia };
        });

    const quitarIngrediente = (i) =>
        setForm((prev) => ({
            ...prev,
            ingredientes: prev.ingredientes.filter((_, idx) => idx !== i),
        }));

    const agregarPaso = () =>
        setForm((prev) => ({ ...prev, pasos: [...prev.pasos, ""] }));

    const editarPaso = (i, valor) =>
        setForm((prev) => {
            const copia = [...prev.pasos];
            copia[i] = valor;
            return { ...prev, pasos: copia };
        });

    const quitarPaso = (i) =>
        setForm((prev) => ({
            ...prev,
            pasos: prev.pasos.filter((_, idx) => idx !== i),
        }));

    const handleGuardar = async () => {
        const requeridos = ["titulo", "descripcion", "categoria", "dificultad", "tiempoMin", "porciones"];
        for (const campo of requeridos) {
            if (!campoValido(form[campo])) {
                toast.warning(`El campo "${campo}" es obligatorio.`);
                return;
            }
        }

        const ingCompletos = form.ingredientes.every(
            (i) => i.nombre.trim() && campoValido(i.cantidad) && i.unidad.trim()
        );
        if (!ingCompletos) {
            toast.warning("Completá todos los campos de los ingredientes.");
            return;
        }

        const pasosCompletos = form.pasos.every((p) => p.trim());
        if (!pasosCompletos) {
            toast.warning("Completá todos los pasos o eliminá los vacíos.");
            return;
        }

        const payload = {
            titulo: form.titulo.trim(),
            descripcion: form.descripcion.trim(),
            categoria: form.categoria,
            dificultad: form.dificultad,
            tiempoMin: Number(form.tiempoMin),
            porciones: Number(form.porciones),
            imagenUrl: form.imagenUrl.trim() || undefined,
            tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
            ingredientes: form.ingredientes.map((i) => ({
                nombre: i.nombre.trim(),
                cantidad: Number(i.cantidad),
                unidad: i.unidad.trim(),
            })),
            pasos: form.pasos.map((p) => p.trim()),
        };

        setEnviando(true);
        try {
            let resultado;
            if (modo === "editar") {
                resultado = await actualizarReceta(id, payload);
                toast.success("Receta actualizada.");
            } else {
                resultado = await crearReceta(payload);
                toast.success("Receta publicada.");
            }
            navigate(`/recetas/${resultado._id}`);
        } catch (error) {
            toast.error("No se pudo guardar la receta. Revisá los datos.");
            console.error(error);
        } finally {
            setEnviando(false);
        }
    };

    if (cargando) {
        return (
            <div className="fr-cargando" style={{ maxWidth: 760, margin: "2rem auto" }}>
                <div className="fr-spinner" />
                <p>Cargando datos…</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "1.5rem 1rem" }}>
            <div className="fr-header">
                <h2 className="fr-titulo">
                    {modo === "editar" ? "Editar receta" : "Nueva receta"}
                </h2>
            </div>

            <div className="fr-cuerpo">
                <section className="fr-seccion">
                    <h3 className="fr-seccion__titulo">Información básica</h3>

                    <div className="fr-campo">
                        <label className="fr-label">Título <span className="fr-req">*</span></label>
                        <input
                            className="fr-input"
                            placeholder="Ej: Gallo pinto tradicional"
                            value={form.titulo}
                            onChange={(e) => setField("titulo", e.target.value)}
                        />
                    </div>

                    <div className="fr-campo">
                        <label className="fr-label">Descripción <span className="fr-req">*</span></label>
                        <textarea
                            className="fr-textarea"
                            placeholder="Contá brevemente de qué se trata la receta…"
                            rows={3}
                            value={form.descripcion}
                            onChange={(e) => setField("descripcion", e.target.value)}
                        />
                    </div>

                    <div className="fr-fila-2">
                        <div className="fr-campo">
                            <label className="fr-label">Categoría <span className="fr-req">*</span></label>
                            <select
                                className="fr-select"
                                value={form.categoria}
                                onChange={(e) => setField("categoria", e.target.value)}
                            >
                                <option value="">Seleccioná…</option>
                                {CATEGORIAS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="fr-campo">
                            <label className="fr-label">Dificultad <span className="fr-req">*</span></label>
                            <select
                                className="fr-select"
                                value={form.dificultad}
                                onChange={(e) => setField("dificultad", e.target.value)}
                            >
                                <option value="">Seleccioná…</option>
                                {DIFICULTADES.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="fr-fila-2">
                        <div className="fr-campo">
                            <label className="fr-label">Tiempo (minutos) <span className="fr-req">*</span></label>
                            <input
                                className="fr-input"
                                type="number"
                                min="1"
                                placeholder="Ej: 30"
                                value={form.tiempoMin}
                                onChange={(e) => setField("tiempoMin", e.target.value)}
                            />
                        </div>

                        <div className="fr-campo">
                            <label className="fr-label">Porciones <span className="fr-req">*</span></label>
                            <input
                                className="fr-input"
                                type="number"
                                min="1"
                                placeholder="Ej: 4"
                                value={form.porciones}
                                onChange={(e) => setField("porciones", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="fr-campo">
                        <label className="fr-label">URL de imagen <span className="fr-opcional">(opcional)</span></label>
                        <input
                            className="fr-input"
                            type="url"
                            placeholder="https://…"
                            value={form.imagenUrl}
                            onChange={(e) => setField("imagenUrl", e.target.value)}
                        />
                    </div>

                    <div className="fr-campo">
                        <label className="fr-label">Tags <span className="fr-opcional">(separados por coma)</span></label>
                        <input
                            className="fr-input"
                            placeholder="Ej: vegetariano, rápido, sin gluten"
                            value={form.tags}
                            onChange={(e) => setField("tags", e.target.value)}
                        />
                    </div>
                </section>

                <section className="fr-seccion">
                    <h3 className="fr-seccion__titulo">Ingredientes</h3>
                    <div className="fr-lista-dinamica">
                        {form.ingredientes.map((ing, i) => (
                            <FilaIngrediente
                                key={i}
                                ing={ing}
                                index={i}
                                onChange={editarIngrediente}
                                onEliminar={quitarIngrediente}
                                esUnico={form.ingredientes.length === 1}
                            />
                        ))}
                    </div>
                    <button type="button" className="fr-btn-agregar" onClick={agregarIngrediente}>
                        + Agregar ingrediente
                    </button>
                </section>

                <section className="fr-seccion">
                    <h3 className="fr-seccion__titulo">Preparación</h3>
                    <div className="fr-lista-dinamica">
                        {form.pasos.map((paso, i) => (
                            <FilaPaso
                                key={i}
                                paso={paso}
                                index={i}
                                onChange={editarPaso}
                                onEliminar={quitarPaso}
                                esUnico={form.pasos.length === 1}
                            />
                        ))}
                    </div>
                    <button type="button" className="fr-btn-agregar" onClick={agregarPaso}>
                        + Agregar paso
                    </button>
                </section>
            </div>

            <div className="fr-footer">
                <button
                    type="button"
                    className="fr-btn fr-btn--secundario"
                    onClick={() => navigate(-1)}
                    disabled={enviando}
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    className="fr-btn fr-btn--primario"
                    onClick={handleGuardar}
                    disabled={enviando}
                >
                    {enviando
                        ? (modo === "editar" ? "Guardando…" : "Publicando…")
                        : (modo === "editar" ? "Guardar cambios" : "Publicar receta")}
                </button>
            </div>
        </div>
    );
}
