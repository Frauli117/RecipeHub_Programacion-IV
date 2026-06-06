import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './modules/auth/context/AuthProvider.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)
