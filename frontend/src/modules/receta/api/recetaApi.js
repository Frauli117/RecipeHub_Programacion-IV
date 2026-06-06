import api from "../../../api/axios";

export async function listarRecetas(filtros = {}) {
    const response = await api.get(
        "/api/recetas",
        {
            params: filtros,
        }
    );

    return response.data;
}

export async function obtenerReceta(id) {
    const response = await api.get(
        `/api/recetas/${id}`
    );

    return response.data;
}

export async function crearReceta(receta) {
    const response = await api.post(
        "/api/recetas",
        receta
    );

    return response.data;
}

export async function actualizarReceta(
    id,
    receta
) {
    const response = await api.put(
        `/api/recetas/${id}`,
        receta
    );

    return response.data;
}

export async function eliminarReceta(id) {
    const response = await api.delete(
        `/api/recetas/${id}`
    );

    return response.data;
}