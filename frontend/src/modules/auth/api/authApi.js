import api from "../../../api/axios";

export async function login(
    email,
    password
) {
    const response = await api.post(
        "/api/auth/login",
        { email, password }
    );

    return response.data;
}

export async function register(
    nombre,
    email,
    password
) {
    const response = await api.post(
        "/api/auth/register",
        { nombre, email, password }
    );

    return response.data;
}

export async function me() {
    const response = await api.get(
        "/api/auth/me"
    );

    return response.data;
}