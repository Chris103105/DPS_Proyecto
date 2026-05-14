// src/pages/public/Home.jsx
import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { ModalJoya } from './ModalJoya'; // <-- Ruta actualizada para buscar en la misma carpeta

export const Home = () => {
  const [joyas, setJoyas] = useState([]);
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState('Todas');
  const [seleccionada, setSeleccionada] = useState(null); 
  // Estados para el nuevo testimonio del cliente
  const [nuevoTestimonio, setNuevoTestimonio] = useState({ cliente: '', comentario: '' });
  const [enviandoTestimonio, setEnviandoTestimonio] = useState(false);

  const categorias = ['Todas', 'Anillos', 'Cadenas', 'Aretes', 'Relojes', 'Pulseras'];


  const enviarTestimonio = async (e) => {
    e.preventDefault();
    setEnviandoTestimonio(true);
    try {
      await addDoc(collection(db, "testimonios"), {
        cliente: nuevoTestimonio.cliente,
        comentario: nuevoTestimonio.comentario,
        visible: false, // 🔒 Entra oculto por seguridad
        fecha: new Date()
      });
      alert("¡Gracias por compartir tu experiencia! Tu comentario ha sido enviado al taller.");
      setNuevoTestimonio({ cliente: '', comentario: '' });
    } catch (error) {
      alert("Hubo un error al enviar tu comentario.");
    } finally {
      setEnviandoTestimonio(false);
    }
  };
  
  useEffect(() => {
    // 1. Cargar Joyas Visibles
    const qJoyas = query(collection(db, "joyas"), where("visible", "==", true));
    const unsubJoyas = onSnapshot(qJoyas, (snapshot) => {
      setJoyas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // 2. Cargar Testimonios Visibles
    const qTestimonios = query(collection(db, "testimonios"), where("visible", "==", true));
    const unsubTestimonios = onSnapshot(qTestimonios, (snapshot) => {
      setTestimonios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubJoyas();
      unsubTestimonios();
    };
  }, []);

  const joyasFiltradas = filtroActivo === 'Todas' 
    ? joyas 
    : joyas.filter(j => j.categoria === filtroActivo);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* --- NAVBAR --- */}
      <nav className="border-b border-gray-100 py-8 px-10 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <h1 className="text-2xl font-light tracking-[0.4em] uppercase">Perla Negra</h1>
        <div className="flex gap-8 items-center">
          <a href="/admin/login" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Acceso Privado</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* --- FILTROS --- */}
        <div className="flex flex-wrap gap-4 mb-20 justify-center">
          {categorias.map(cat => (
            <button 
              key={cat} 
              onClick={() => setFiltroActivo(cat)}
              className={`px-8 py-2 text-[10px] uppercase tracking-[0.2em] rounded-full transition-all duration-500 border ${
                filtroActivo === cat ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-transparent text-gray-400 border-gray-100 hover:border-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- CATÁLOGO --- */}
        {loading ? (
          <div className="text-center py-40 uppercase tracking-[0.4em] text-xs text-gray-300 animate-pulse">Revelando colecciones...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
            {joyasFiltradas.map((joya) => (
              <div 
                key={joya.id} 
                className="group cursor-pointer"
                onClick={() => setSeleccionada(joya)}
              >
                <div className="aspect-[3/4] bg-gray-50 mb-6 overflow-hidden relative border border-gray-50 group-hover:shadow-2xl transition-all duration-700">
                  <img 
                    src={joya.imagesUrls?.[0]} 
                    alt={joya.nombre}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-3 text-[10px] uppercase tracking-widest">Ver Detalles</span>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-sm font-light tracking-wide text-gray-800 uppercase">{joya.nombre}</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{joya.material}</p>
                  <p className="text-sm font-medium text-gray-900">${parseFloat(joya.precio).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
{/* --- SECCIÓN DE TESTIMONIOS Y FORMULARIO --- */}
      <section className="bg-gray-50/50 py-24 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-light tracking-[0.2em] text-gray-900 uppercase">La Experiencia Perla Negra</h2>
            <div className="w-12 h-px bg-black mx-auto mt-6"></div>
          </div>
          
          {/* Lista de testimonios aprobados */}
          {testimonios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
              {testimonios.map((testimonio) => (
                <div key={testimonio.id} className="text-center px-4">
                  <div className="flex justify-center mb-4">
                    <svg width="32" height="32" className="text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                  </div>
                  <p className="text-sm font-light text-gray-600 italic leading-relaxed mb-6">"{testimonio.comentario}"</p>
                  <p className="text-[10px] uppercase tracking-widest text-gray-900 font-medium">— {testimonio.cliente}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-20">Aún no hay reseñas públicas. ¡Sé el primero!</p>
          )}

          {/* Formulario para que el cliente opine */}
          <div className="max-w-2xl mx-auto bg-white p-10 border border-gray-100 shadow-sm">
            <h3 className="text-center text-[10px] uppercase tracking-widest text-gray-400 mb-8">Cuéntanos tu experiencia con el taller</h3>
            <form onSubmit={enviarTestimonio} className="space-y-6">
              <input 
                type="text" placeholder="Tu Nombre" required
                value={nuevoTestimonio.cliente} onChange={(e) => setNuevoTestimonio({...nuevoTestimonio, cliente: e.target.value})}
                className="w-full border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              />
              <textarea 
                placeholder="¿Qué te pareció tu joya o la atención de Don Ruano?" required rows="3"
                value={nuevoTestimonio.comentario} onChange={(e) => setNuevoTestimonio({...nuevoTestimonio, comentario: e.target.value})}
                className="w-full border border-gray-100 p-4 text-sm focus:outline-none focus:border-gray-200 bg-gray-50/30"
              ></textarea>
              <button 
                type="submit" disabled={enviandoTestimonio}
                className="w-full bg-gray-900 text-white py-4 text-xs uppercase tracking-[0.3em] hover:bg-black transition-all disabled:bg-gray-200"
              >
                {enviandoTestimonio ? 'Enviando...' : 'Enviar mi opinión'}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* --- MODAL (Importado) --- */}
      <ModalJoya 
        seleccionada={seleccionada} 
        setSeleccionada={setSeleccionada} 
      />

      <footer className="border-t border-gray-50 py-20 px-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] text-gray-300">© 2026 Perla Negra • Alta Joyería Artesanal</p>
      </footer>
    </div>
  );
};