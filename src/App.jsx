import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard'; 
import { AgregarJoya } from './pages/admin/AgregarJoya'; 
import { Home } from './pages/public/Home';
import { EditarJoya } from './pages/admin/EditarJoya';
import { Notificaciones } from './pages/admin/Notificaciones';
import { TestimoniosAdmin } from './pages/admin/TestimoniosAdmin';

// ==========================================
// EL GUARDIA DE SEGURIDAD (PROTECTED ROUTE)
// ==========================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Pantalla de carga oscura para no romper el diseño de lujo
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0b0c10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', animation: 'pulse 2s infinite' }}>
          Verificando credenciales...
        </p>
      </div>
    );
  }

  // Si no hay usuario autorizado, lo regresa a la pantalla de Login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// ==========================================
// RUTAS DE LA APLICACIÓN
// ==========================================
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<Login />} />
          
          {/* --- RUTAS PRIVADAS --- */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/testimonios" 
            element={
              <ProtectedRoute>
                <TestimoniosAdmin />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/notificaciones" 
            element={
              <ProtectedRoute>
                <Notificaciones />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/editar/:id" 
            element={
              <ProtectedRoute>
                <EditarJoya />
              </ProtectedRoute>
            } 
          />
          
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