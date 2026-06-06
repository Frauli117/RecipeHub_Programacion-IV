import './App.css'
import { Toaster } from "sonner"
import { useAuth } from "./modules/auth/context/useAuth"
import AppRoutes from './routes/RutasDeLaApp';
function App() {

  const { cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
        <p>Cargando sesión...</p>
      </div>
    );
  }

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        duration={3000}
        theme="dark"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-cream)',
            border: '1px solid var(--border-color)',
          },
        }}
      />
    </>
  );
}

export default App;