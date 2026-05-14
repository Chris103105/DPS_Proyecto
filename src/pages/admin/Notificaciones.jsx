import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const Notificaciones = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Consultamos la colección "solicitudes" por fecha (más recientes primero)
    const q = query(collection(db, "solicitudes"), orderBy("fecha", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSolicitudes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Función para marcar como leído/pendiente
  const toggleLeida = async (id, estadoActual) => {
    try {
      await updateDoc(doc(db, "solicitudes", id), { leida: !estadoActual });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Función para eliminar el registro
  const eliminarMensaje = async (id) => {
    if (window.confirm("¿Deseas eliminar este mensaje permanentemente?")) {
      await deleteDoc(doc(db, "solicitudes", id));
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-12 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl font-light tracking-[0.2em] text-gray-800 uppercase">Bandeja de Solicitudes</h2>
            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">Clientes interesados en Perla Negra</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-black text-white px-3 py-1 rounded-full uppercase tracking-tighter font-bold">
              {solicitudes.filter(s => !s.leida).length} Pendientes
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[10px] uppercase tracking-widest text-gray-300">Sincronizando mensajes...</div>
        ) : solicitudes.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-100">
            <p className="text-gray-400 text-xs uppercase tracking-widest">No hay mensajes de clientes aún.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {solicitudes.map((sol) => (
              <div 
                key={sol.id} 
                className={`group relative border transition-all duration-500 p-8 ${
                  sol.leida ? 'border-gray-50 bg-gray-50/20' : 'border-gray-900 shadow-xl'
                }`}
              >
                {/* Indicador visual de mensaje nuevo */}
                {!sol.leida && (
                  <div className="absolute -top-2 -left-2 bg-black text-white text-[8px] px-2 py-1 uppercase tracking-tighter">Nuevo</div>
                )}

                <div className="flex flex-col md:flex-row justify-between gap-8">
                  
                  {/* Info del Cliente e Interés */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{sol.cliente}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Solicitado el {sol.fecha?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-white/50 border border-gray-50 p-4 rounded-sm">
                      <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-2">Pieza de interés:</p>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-800">{sol.joyaNombre}</span>
                        <span className="text-xs text-gray-400 border-l pl-3">${parseFloat(sol.precioReferencia).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] uppercase tracking-widest text-gray-400">Mensaje del cliente:</p>
                      <p className="text-sm text-gray-600 italic font-light">"{sol.mensaje || "Sin mensaje adicional."}"</p>
                    </div>
                  </div>

                  {/* Acciones de contacto */}
                  <div className="md:w-64 flex flex-col justify-between border-l border-gray-100 md:pl-8">
                    <div className="space-y-3">
                      <p className="text-[9px] uppercase tracking-widest text-gray-400">Contacto Directo</p>
                      <a 
                        href={`https://wa.me/${sol.telefono}?text=Hola ${sol.cliente}, te contacto de Perla Negra Joyería por tu interés en la pieza ${sol.joyaNombre}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all rounded-sm"
                      >
                        WhatsApp
                      </a>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <button 
                        onClick={() => toggleLeida(sol.id, sol.leida)}
                        className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                      >
                        {sol.leida ? 'Marcar Pendiente' : 'Leído'}
                      </button>
                      <button 
                        onClick={() => eliminarMensaje(sol.id)}
                        className="text-[9px] uppercase tracking-widest text-red-300 hover:text-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
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