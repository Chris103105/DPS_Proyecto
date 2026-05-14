import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 
import { db } from '../../config/firebase'; // Importamos la base de datos
import { doc, getDoc } from 'firebase/firestore'; 

export const Login = () => {
  const [error, setError] = useState('');
  const { loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const result = await loginWithGoogle();
      const email = result.user.email;

      // Validamos que el correo esté registrado como admin 
      // Buscamos el documento con el ID del correo en la colección 'admins'
      const adminRef = doc(db, "admins", email);
      const adminSnap = await getDoc(adminRef);

      if (adminSnap.exists() && adminSnap.data().activo === true) {
        // Si existe y está activo, bienvenido al panel
        navigate('/admin/dashboard');
      } else {
        // Si no está en la base de datos, lo sacamos
        await logout(); 
        setError('Tu cuenta no está autorizada para acceder al panel.');
      }
      
    } catch (error) {
      setError('Error en la autenticación.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-lg shadow-sm text-center border border-gray-100 max-w-sm w-full">
        <h2 className="text-2xl font-light mb-6 text-gray-800">Administración</h2>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-gray-900 text-white px-6 py-3 rounded hover:bg-black transition-all font-medium flex items-center justify-center gap-2"
        >
          Acceder con Google
        </button>
      </div>
    </div>
  );
};