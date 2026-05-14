// src/pages/admin/Login.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 
import { db } from '../../config/firebase'; 
import { doc, getDoc } from 'firebase/firestore'; 
import './admin.css'; // Tu CSS maestro

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Regresamos el estado de error
  const { loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(''); // Limpiamos errores previos

    try {
      const result = await loginWithGoogle();
      const email = result.user.email;

      // Validamos que el correo esté registrado como admin 
      const adminRef = doc(db, "admins", email);
      const adminSnap = await getDoc(adminRef);

      if (adminSnap.exists() && adminSnap.data().activo === true) {
        // Acceso concedido
        navigate('/admin/dashboard');
      } else {
        // Si no está en la base de datos, lo sacamos
        await logout(); 
        setError('Acceso denegado: Credenciales no autorizadas.');
      }
      
    } catch (err) {
      setError('Autenticación cancelada o fallida.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box fade-in-image">
        
        {/* Cabecera del Login */}
        <h1 className="login-logo">Perla Negra</h1>
        <h2 className="login-title">Control de Acceso</h2>
        <p className="login-subtitle">
          Área restringida. La autenticación está limitada exclusivamente al personal del taller y administración.
        </p>

        {/* Mensaje de Error Elegante */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* Botón de Autenticación */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn-google-login"
        >
          {loading ? 'Verificando Identidad...' : 'Autenticar con Google'}
        </button>

        {/* Enlace de regreso */}
        <div className="login-footer">
          <a href="/" className="login-back-link">← Volver a la vitrina pública</a>
        </div>

      </div>
    </div>
  );
};