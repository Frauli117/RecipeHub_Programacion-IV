import { useContext } from "react";
import { ModalRecetaContext } from "./modalReceta.context";

export function useModalReceta() {
    const context = useContext(ModalRecetaContext);

    if (!context) {
        throw new Error(
            "useModalReceta debe usarse dentro de ModalRecetaProvider"
        );
    }

    return context;
}