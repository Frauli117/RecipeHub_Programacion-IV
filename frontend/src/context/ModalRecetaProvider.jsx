import { useState } from "react";
import { ModalRecetaContext } from "./modalReceta.context";

export function ModalRecetaProvider({ children }) {
    const [estado, setEstado] = useState({
        abierto: false,
        modo: "crear",
        recetaId: null,
        onGuardado: null,
    });

    const abrirCrear = (onGuardado = null) =>
        setEstado({ abierto: true, modo: "crear", recetaId: null, onGuardado });

    const abrirEditar = (recetaId, onGuardado = null) =>
        setEstado({ abierto: true, modo: "editar", recetaId, onGuardado });

    const cerrar = () =>
        setEstado((prev) => ({ ...prev, abierto: false, onGuardado: null }));

    return (
        <ModalRecetaContext.Provider
            value={{ ...estado, abrirCrear, abrirEditar, cerrar }}
        >
            {children}
        </ModalRecetaContext.Provider>
    );
}