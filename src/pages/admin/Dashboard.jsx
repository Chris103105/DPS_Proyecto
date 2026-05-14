// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [joyas, setJoyas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escucha en tiempo real de la colección "joyas"
    const unsubscribe = onSnapshot(collection(db, "joyas"), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Ordenar por fecha de creación (más recientes primero)
      docs.sort((a, b) => {
        const fechaA = a.fechaCreacion?.seconds || 0;
        const fechaB = b.fechaCreacion?.seconds || 0;
        return fechaB - fechaA;
      });

      setJoyas(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Función para activar/desactivar visibilidad en la vitrina
  const toggleVisibilidad = async (id, estadoActual) => {
    try {
      const joyaRef = doc(db, "joyas", id);
      await updateDoc(joyaRef, {
        visible: !estadoActual
      });
    } catch (error) {
      console.error("Error al cambiar visibilidad:", error);
      alert("No se pudo actualizar el estado de la pieza.");
    }
  };

  // Función para borrar permanentemente
  const eliminarJoya = async (id, nombre) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar "${nombre}"? Esta acción no se puede deshacer.`);
    if (confirmar) {
      try {
        await deleteDoc(doc(db, "joyas", id));
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Hubo un error al intentar borrar la pieza.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera del Panel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-gray-100 pb-8">
          <div>
            <h2 className="text-2xl font-light tracking-[0.2em] text-gray-800 uppercase">Panel de Inventario</h2>
            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">Administración Perla Negra</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-200 text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors"
            >
              Ver Tienda
            </button>
            <button 
              onClick={() => navigate('/admin/agregar')}
              className="bg-gray-900 text-white px-8 py-3 text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-sm"
            >
              + Nueva Pieza
            </button>
          </div>
        </div>


// En tu Dashboard.jsx (o un Layout de Admin)
<div className="flex gap-8 mb-8 border-b border-gray-50 pb-2">
  <button 
    onClick={() => navigate('/admin/dashboard')}
    className="text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 border-black pb-2"
  >
    Inventario
  </button>
  <button 
    onClick={() => navigate('/admin/notificaciones')}
    className="text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-black pb-2 transition-all"
  >
    Mensajes de Clientes
  </button>
</div>
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 animate-pulse">Sincronizando catálogo...</p>
          </div>
        ) : joyas.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-gray-100 rounded-lg">
            <p className="text-gray-400 text-xs uppercase tracking-widest">No hay piezas registradas en el sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Pieza</th>
                  <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Categoría</th>
                  <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium">Precio</th>
                  <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium text-center">Vitrina</th>
                  <th className="pb-4 text-[10px] uppercase tracking-widest text-gray-400 font-medium text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {joyas.map((joya) => (
                  <tr key={joya.id} className="group hover:bg-gray-50/50 transition-colors">
                    {/* Visualización y Nombre */}
                    <td className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-50 overflow-hidden border border-gray-100 shadow-sm">
                          {joya.imagesUrls && joya.imagesUrls[0] ? (
                            <img src={joya.imagesUrls[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 uppercase">Sin foto</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 tracking-tight">{joya.nombre}</p>
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">{joya.material}</p>
                        </div>
                      </div>
                    </td>




                    {/* Categoría */}
                    <td className="py-6">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        {joya.categoria}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="py-6 text-sm font-light text-gray-900">
                      ${parseFloat(joya.precio).toFixed(2)}
                    </td>

                    {/* Interruptor de Visibilidad */}
                    <td className="py-6 text-center">
                      <button 
                        onClick={() => toggleVisibilidad(joya.id, joya.visible)}
                        className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-semibold transition-all border ${
                          joya.visible 
                            ? 'bg-green-50 text-green-700 border-green-100' 
                            : 'bg-gray-100 text-gray-400 border-gray-200'
                        }`}
                      >
                        {joya.visible ? 'Activo' : 'Oculto'}
                      </button>
                    </td>

                    {/* Botones de acción */}
                    <td className="py-6 text-right">
                      <div className="flex justify-end gap-6">
                        <button 
                          onClick={() => navigate(`/admin/editar/${joya.id}`)}
                          className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => eliminarJoya(joya.id, joya.nombre)}
                          className="text-[10px] uppercase tracking-widest text-red-200 hover:text-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer del Dashboard */}
        <div className="mt-20 pt-8 border-t border-gray-50 flex justify-between items-center text-[9px] text-gray-300 uppercase tracking-[0.2em]">
          <p>© 2026 Perla Negra • Sistema de Inventario</p>
          <div className="flex gap-8">
            <span>Servidor Cloudinary Activo</span>
            <span>Firestore Protegido</span>
          </div>
        </div>
      </div>
    </div>
  );
};