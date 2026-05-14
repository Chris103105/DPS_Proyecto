// src/pages/public/Home.jsx
import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { ModalJoya } from './ModalJoya'; 
import './Home.css';

export const Home = () => {
  const [joyas, setJoyas] = useState([]);
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState('Todas');
  const [seleccionada, setSeleccionada] = useState(null); 
  const [nuevoTestimonio, setNuevoTestimonio] = useState({ cliente: '', comentario: '' });
  const [enviandoTestimonio, setEnviandoTestimonio] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1600", title: "ALTA JOYERÍA", subtitle: "Handcrafted Excellence" },
    { url: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=1600", title: "PIEZAS ÚNICAS", subtitle: "Diseño Exclusivo" },
    { url: "https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?q=80&w=1600", title: "COLECCIÓN 2026", subtitle: "El Sabor del Lujo" }
  ];

  const categorias = ['Todas', 'Anillos', 'Cadenas', 'Aretes', 'Relojes', 'Pulseras'];

  useEffect(() => {
    const qJoyas = query(collection(db, "joyas"), where("visible", "==", true));
    const unsubJoyas = onSnapshot(qJoyas, (snapshot) => {
      setJoyas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const qTestimonios = query(collection(db, "testimonios"), where("visible", "==", true));
    const unsubTestimonios = onSnapshot(qTestimonios, (snapshot) => {
      setTestimonios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => { unsubJoyas(); unsubTestimonios(); clearInterval(interval); };
  }, [slides.length]);

  const enviarTestimonio = async (e) => {
    e.preventDefault();
    setEnviandoTestimonio(true);
    try {
      await addDoc(collection(db, "testimonios"), {
        cliente: nuevoTestimonio.cliente,
        comentario: nuevoTestimonio.comentario,
        visible: false, 
        fecha: new Date()
      });
      alert("¡Gracias! Tu reseña ha sido enviada para aprobación.");
      setNuevoTestimonio({ cliente: '', comentario: '' });
    } catch (error) { alert("Error al enviar."); } finally { setEnviandoTestimonio(false); }
  };

  const joyasFiltradas = filtroActivo === 'Todas' ? joyas : joyas.filter(j => j.categoria === filtroActivo);

  return (
    <div className="home-wrapper light-theme">
      <nav className="main-nav">
        <h1 className="nav-logo">PERLA NEGRA</h1>
        
      </nav>

      <header className="hero-carousel">
        {slides.map((slide, index) => (
          <div key={index} className={`slide-item ${index === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `url(${slide.url})` }}>
            <div className="slide-content">
              <span className="hero-subtitle">{slide.subtitle}</span>
              <h2 className="hero-title">{slide.title}</h2>
              <div className="hero-divider"></div>
            </div>
          </div>
        ))}
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button key={index} className={`dot-btn ${index === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(index)}></button>
          ))}
        </div>
      </header>

      <section className="filter-bar">
        {categorias.map(cat => (
          <button key={cat} onClick={() => setFiltroActivo(cat)} className={`filter-link ${filtroActivo === cat ? 'active' : ''}`}>
            {cat}
          </button>
        ))}
      </section>

      <main className="catalog-container">
        {loading ? (
          <div className="loader">REVELANDO COLECCIÓN...</div>
        ) : (
          <div className="catalog-grid">
            {joyasFiltradas.map((joya) => (
              <div key={joya.id} className="jewelry-card" onClick={() => setSeleccionada(joya)}>
                <div className="card-image">
                  <img src={joya.imagesUrls?.[0]} alt={joya.nombre} />
                  <div className="card-overlay"><span>VER DETALLES</span></div>
                </div>
                <div className="card-info">
                  <h3>{joya.nombre}</h3>
                  <p className="material-tag">{joya.material}</p>
                  <p className="price-tag">${parseFloat(joya.precio).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- NUEVA SECCIÓN: MISIÓN Y VISIÓN --- */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-block">
            <span className="about-subtitle">NUESTRO PROPÓSITO</span>
            <h2 className="about-title">Misión</h2>
            <p className="about-text">
              Crear piezas atemporales que capturen la esencia y la elegancia de quienes las portan, combinando la maestría artesanal tradicional con diseños exclusivos que trascienden generaciones.
            </p>
          </div>
          <div className="about-divider"></div>
          <div className="about-block">
            <span className="about-subtitle">HACIA EL FUTURO</span>
            <h2 className="about-title">Visión</h2>
            <p className="about-text">
              Consolidarnos como el taller de alta joyería referente, reconocido por la pureza de nuestros metales, la innovación en los detalles y nuestro compromiso inquebrantable con la excelencia.
            </p>
          </div>
        </div>
      </section>

      {/* --- NUEVA SECCIÓN: COLLAGE ARTESANAL --- */}
      <section className="collage-section">
        <div className="collage-grid">
          <div className="collage-item">
            <img src="https://images.unsplash.com/photo-1589674781759-c21c37956a44?q=80&w=800" alt="Artesanía en joyería" />
          </div>
          <div className="collage-item">
            <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800" alt="Detalles de oro" />
          </div>
          <div className="collage-item">
            <img src="https://limajoya.com.pe/wp-content/uploads/2021/08/Matrimonio-1.webp" alt="Taller joyero" />
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-header">
          <h2>Historias de Brillo</h2>
          <p>EXPERIENCIAS REALES</p>
        </div>
        <div className="testimonials-grid">
          {testimonios.map((t) => (
            <div key={t.id} className="testimonial-item">
              <div className="quote-icon">“</div>
              <p className="quote-text">{t.comentario}</p>
              <p className="quote-author">— {t.cliente}</p>
            </div>
          ))}
        </div>
        <div className="review-form-container">
          <form onSubmit={enviarTestimonio} className="review-form">
            <h3>CUÉNTANOS TU EXPERIENCIA</h3>
            <input type="text" placeholder="TU NOMBRE" required value={nuevoTestimonio.cliente} onChange={(e) => setNuevoTestimonio({...nuevoTestimonio, cliente: e.target.value})} />
            <textarea placeholder="SU COMENTARIO" required rows="3" value={nuevoTestimonio.comentario} onChange={(e) => setNuevoTestimonio({...nuevoTestimonio, comentario: e.target.value})}></textarea>
            <button type="submit" disabled={enviandoTestimonio}>{enviandoTestimonio ? 'ENVIANDO...' : 'PUBLICAR RESEÑA'}</button>
          </form>
        </div>
      </section>
{/* --- VENTANA EMERGENTE (MODAL) --- */}
      <ModalJoya 
        seleccionada={seleccionada} 
        setSeleccionada={setSeleccionada} 
        todasLasJoyas={joyas} 
      />

      <footer className="main-footer">
        <h2>PERLA NEGRA</h2>
        <p>© 2026 • ALTA JOYERÍA ARTESANAL</p>
      </footer>
    </div>
  );
};