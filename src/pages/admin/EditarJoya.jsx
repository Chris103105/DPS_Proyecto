// src/pages/admin/EditarJoya.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const EditarJoya = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [joya, setJoya] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'Anillos',
    material: '',
    precio: '',
    visible: true,
    imagesUrls: []
  });

  // 1. Cargar los datos actuales de la pieza al entrar
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const docRef = doc(db, "joyas", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setJoya({ ...docSnap.data() });
        } else {
          alert("La pieza no existe en la base de datos.");
          navigate('/admin/dashboard');
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setFetching(false);
      }
    };
    obtenerDatos();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJoya({ ...joya, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const joyaRef = doc(db, "joyas", id);
      
      // Actualizamos solo los campos de texto y metadatos
      await updateDoc(joyaRef, {
        ...joya,
        precio: parseFloat(joya.precio),
        ultimaEdicion: new Date()
      });
      
      alert("¡Cambios guardados con éxito!");
      navigate('/admin/dashboard');
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("No se pudieron guardar los cambios.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 animate-pulse">Cargando información de la pieza...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto border border-gray-100 p-10 shadow-sm">
        <h2 className="text-2xl font-light text-gray-800 mb-10 border-b pb-6 tracking-widest uppercase">
          Editar Detalles de la Pieza
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Nombre */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-3">Nombre del diseño</label>
            <input 
              type="text" name="nombre" value={joya.nombre} required
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gray-800 transition-colors bg-transparent"
              onChange={handleChange}
            />
          </div>

          {/* Vista previa de imágenes actuales */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-4">Galería en vitrina</label>
            <div className="flex gap-3 overflow-x-auto pb-4">
              {joya.imagesUrls && joya.imagesUrls.map((url, i) => (
                <div key={i} className="relative group min-w-[100px]">
                  <img 
                    src={url} 
                    alt={`Ángulo ${i+1}`} 
                    className="w-24 h-24 object-cover border border-gray-100 grayscale hover:grayscale-0 transition-all" 
                  />
                  <span className="absolute bottom-1 right-1 bg-white/80 text-[8px] px-1 uppercase tracking-tighter">Vista {i+1}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-300 mt-2 italic uppercase">Para cambiar las fotos, es recomendable crear una nueva publicación.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Categoría */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-3">Colección</label>
              <select 
                name="categoria" value={joya.categoria}
                className="w-full border-b border-gray-200 py-2 bg-transparent focus:outline-none"
                onChange={handleChange}
              >
                <option value="Anillos">Anillos</option>
                <option value="Cadenas">Cadenas</option>
                <option value="Aretes">Aretes</option>
                <option value="Relojes">Relojes</option>
                <option value="Pulseras">Pulseras</option>
              </select>
            </div>
            {/* Precio */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-3">Precio de Referencia ($)</label>
              <input 
                type="number" name="precio" value={joya.precio} step="0.01" required
                className="w-full border-b border-gray-200 py-2 focus:outline-none"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Material */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-3">Materiales utilizados</label>
            <input 
              type="text" name="material" value={joya.material} required
              className="w-full border-b border-gray-200 py-2 focus:outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-3">Descripción para el cliente</label>
            <textarea 
              name="descripcion" value={joya.descripcion} rows="4" required
              className="w-full border border-gray-100 p-4 focus:outline-none focus:border-gray-200 text-sm leading-relaxed"
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="flex justify-between items-center pt-10">
            <button 
              type="button" 
              onClick={() => navigate('/admin/dashboard')}
              className="text-gray-400 text-[10px] uppercase tracking-widest hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-gray-900 text-white px-12 py-4 text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:bg-gray-200 shadow-sm"
            >
              {loading ? 'Sincronizando...' : 'Actualizar Pieza'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};