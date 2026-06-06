import api from "../../../api/axios";

export async function listarComentarios(
    recetaId
) {
    const response = await api.get(
        `/api/recetas/${recetaId}/comentarios`
    );

    return response.data;
}

export async function crearComentario(
    recetaId,
    comentario
) {
    const response = await api.post(
        `/api/recetas/${recetaId}/comentarios`,
        comentario
    );

    return response.data;
}

export async function eliminarComentario(
    comentarioId
) {
    const response = await api.delete(
        `/api/comentarios/${comentarioId}`
    );

    return response.data;
}