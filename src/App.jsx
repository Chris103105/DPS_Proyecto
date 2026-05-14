import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/admin/Login';
// IMPORTANTE: Asegúrate de importar los nuevos componentes
import { Dashboard } from './pages/admin/Dashboard'; 
import { AgregarJoya } from './pages/admin/AgregarJoya'; 
import { Home } from './pages/public/Home';
import { EditarJoya } from './pages/admin/EditarJoya';
import { Notificaciones } from './pages/admin/Notificaciones';

// --- COMPONENTES TEMPORALES PARA PRUEBAS ---
// Simula la pantalla de inicio (Catálogo público)
const HomeTemporal = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center">
    <h1 className="text-3xl font-light text-gray-800 mb-4">Joyería Perla Negra</h1>
    <p className="text-gray-500 mb-8">Catálogo en construcción...</p>
    <a href="/admin/login" className="text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors">
      Ir al panel de Don Ruano
    </a>
  </div>
);

// --- GUARDIA DIGITAL ---
// Este componente envuelve las rutas privadas. Si no hay usuario, lo patea al login.
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Verificando credenciales...</div>;
  if (!user) return <Navigate to="/admin/login" />;
  
  return children;
};

// --- APP PRINCIPAL ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        {/* Rutas Públicas */}
<Route path="/" element={<Home />} />
          
          {/* Rutas del Administrador */}
          <Route path="/admin/login" element={<Login />} />
          
          {/* Cada ruta privada se envuelve individualmente con el ProtectedRoute */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/notificaciones" element={<Notificaciones />} />
          <Route path="/admin/editar/:id" element={<EditarJoya />} />
          <Route 
            path="/admin/agregar" 
            element={
              <ProtectedRoute>
                <AgregarJoya />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;