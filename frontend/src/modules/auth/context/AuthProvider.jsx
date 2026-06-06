import { useEffect, useState } from "react";
import { AuthContext } from "./auth.context";
import { tokenStorage } from "../../../api/tokenStorage";
import * as authApi from "../api/authApi";

export function AuthProvider({ children }) {
    const [usuario, setUser] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = tokenStorage.get();

            if (!token) {
                setCargando(false);
                return;
            }

            try {
                const me = await authApi.me();
                setUser(me);
            } catch (error) {
                console.error("Error restaurando sesión:", error);

                tokenStorage.remove();
                setUser(null);
            } finally {
                setCargando(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        const result = await authApi.login(
            email,
            password
        );

        tokenStorage.set(result.token);

        setUser(result.usuario);
    };

    const register = async (
        nombre,
        email,
        password
    ) => {
        await authApi.register(
            nombre,
            email,
            password
        );
    };

    const logout = () => {
        tokenStorage.remove();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                login,
                register,
                logout,
                isAuthenticated: !!usuario,
                cargando,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}