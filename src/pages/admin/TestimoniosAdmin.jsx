import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const TestimoniosAdmin = () => {
  const navigate = useNavigate();
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar TODOS los testimonios (visibles y ocultos)
  useEffect(() => {
    const q = query(collection(db, "testimonios"), orderBy("fecha", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTestimonios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Ocultar/Mostrar en la web
  const toggleVisibilidad = async (id, estadoActual) => {
    await updateDoc(doc(db, "testimonios", id), { visible: !estadoActual });
  };

  // Eliminar comentario troll/spam
  const eliminar = async (id) => {
    if (window.confirm("¿Eliminar este testimonio permanentemente?")) {
      await deleteDoc(doc(db, "testimonios", id));
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navegación del Panel */}
        <div className="flex gap-8 mb-8 border-b border-gray-50 pb-2">
          <button onClick={() => navigate('/admin/dashboard')} className="text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all pb-2">Inventario</button>
          <button onClick={() => navigate('/admin/notificaciones')} className="text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all pb-2">Mensajes</button>
          <button className="text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 border-black pb-2 text-black">Testimonios</button>
        </div>

        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-2xl font-light tracking-[0.2em] text-gray-800 uppercase">Moderación de Reseñas</h2>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-2">Aprueba los comentarios antes de que aparezcan en la web</p>
          </div>
        </div>

        {/* Lista de testimonios */}
        {loading ? (
          <p className="text-center text-[10px] uppercase tracking-widest text-gray-400 py-20">Sincronizando opiniones...</p>
        ) : testimonios.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200">
            <p className="text-xs text-gray-400 uppercase tracking-widest">No hay testimonios de clientes aún.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {testimonios.map((testimonio) => (
              <div 
                key={testimonio.id} 
                className={`p-8 border transition-all ${!testimonio.visible ? 'border-yellow-400 bg-yellow-50/30' : 'border-gray-100 bg-white'}`}
              >
                {!testimonio.visible && (
                  <span className="inline-block bg-yellow-400 text-black text-[8px] px-2 py-1 uppercase tracking-widest mb-4 font-bold">Pendiente de Aprobación</span>
                )}

                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <p className="font-medium text-lg text-gray-900">{testimonio.cliente}</p>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-4">
                      Enviado el {testimonio.fecha?.toDate().toLocaleDateString()}
                    </p>
                    <p className="text-sm font-light text-gray-600 italic leading-relaxed border-l-2 border-gray-200 pl-4">
                      "{testimonio.comentario}"
                    </p>
                  </div>

                  <div className="flex flex-col justify-center gap-3 md:border-l border-gray-100 md:pl-8 min-w-[200px]">
                    <button 
                      onClick={() => toggleVisibilidad(testimonio.id, testimonio.visible)}
                      className={`w-full py-3 text-[10px] uppercase tracking-widest transition-all border ${
                        testimonio.visible 
                          ? 'border-gray-200 text-gray-500 hover:bg-gray-50' 
                          : 'bg-green-600 text-white border-green-600 hover:bg-green-700 shadow-md'
                      }`}
                    >
                      {testimonio.visible ? 'Ocultar de la web' : 'Aprobar y Publicar'}
                    </button>
                    
                    <button 
                      onClick={() => eliminar(testimonio.id)} 
                      className="w-full py-2 text-[10px] uppercase tracking-widest text-red-400 hover:text-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};