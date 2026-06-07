import { Routes, Route } from 'react-router-dom'
import RutaPublica from "./RutaPublica"
import RutaProtegida from "./RutaProtegida"
import Layout from "./Layout"
import PaginaDeLogin from "../pages/PaginaDeLogin"
import PaginaDeRegistro from '../pages/PaginaDeRegistro'
import ListaRecetas from '../modules/receta/components/ListaRecetas'
import DetalleReceta from '../pages/DetalleReceta'
import PaginaPerfil from '../pages/PaginaPerfil'
import PaginaFormReceta from '../pages/PaginaFormReceta'

export default function AppRoutes() {
    return (
        <Routes>
            {/* Autenticación: solo accesibles si NO hay sesión (sin navbar) */}
            <Route path="/login" element={<RutaPublica><PaginaDeLogin /></RutaPublica>} />
            <Route path="/register" element={<RutaPublica><PaginaDeRegistro /></RutaPublica>} />

            {/* Públicas: cualquiera puede verlas (con o sin sesión) */}
            <Route path="/" element={<Layout><ListaRecetas /></Layout>} />
            <Route path="/recetas/:id" element={<Layout><DetalleReceta /></Layout>} />

            {/* Protegidas: requieren login */}
            <Route path="/nueva" element={<RutaProtegida><Layout><PaginaFormReceta /></Layout></RutaProtegida>} />
            <Route path="/editar/:id" element={<RutaProtegida><Layout><PaginaFormReceta /></Layout></RutaProtegida>} />
            <Route path="/perfil" element={<RutaProtegida><Layout><PaginaPerfil /></Layout></RutaProtegida>} />
        </Routes>
    );
}
