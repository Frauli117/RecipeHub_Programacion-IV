import { Routes, Route } from 'react-router-dom'
import RootRedirect from "./RootRedirect"
import RutaPublica from "./RutaPublica"
import RutaProtegida from "./RutaProtegida"
import PaginaDeLogin from "../pages/PaginaDeLogin"
import PaginaDeRegistro from '../pages/PaginaDeRegistro'
import ListaRecetas from '../modules/receta/components/ListaRecetas'
import DetalleReceta from '../pages/DetalleReceta'
import PaginaPerfil from '../pages/PaginaPerfil'

export default function AppRoutes() {

    return (
        <div>
            <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route
                    path="/login"
                    element={
                        <RutaPublica>
                            <PaginaDeLogin />
                        </RutaPublica>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <RutaPublica>
                            <PaginaDeRegistro />
                        </RutaPublica>
                    }
                />
                <Route
                    path="/home"
                    element={
                        <RutaProtegida>
                            <ListaRecetas />
                        </RutaProtegida>
                    }
                />
                <Route
                    path="/recetas/:id"
                    element={
                        <RutaProtegida>
                            <DetalleReceta />
                        </RutaProtegida>
                    }
                />
                <Route
                    path="/perfil"
                    element={
                        <RutaProtegida>
                            <PaginaPerfil />
                        </RutaProtegida>
                    }
                />
            </Routes>
        </div>
    );
}