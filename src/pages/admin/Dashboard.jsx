// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // <-- 1. IMPORTAMOS EL CONTEXTO
import './Home.css'; 

export const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // <-- 2. EXTRAEMOS LA FUNCIÓN DE SALIR
  
  const [joyas, setJoyas] = useState([]);
  const [loadingJoyas, setLoadingJoyas] = useState(true);
  
  const [testimonios, setTestimonios] = useState([]);
  const [loadingTestimonios, setLoadingTestimonios] = useState(true);

  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(true);

  const [activeTab, setActiveTab] = useState('inventario');

  useEffect(() => {
    // Cargar Joyas
    const unsubJoyas = onSnapshot(collection(db, "joyas"), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a, b) => (b.fechaCreacion?.seconds || 0) - (a.fechaCreacion?.seconds || 0));
      setJoyas(docs);
      setLoadingJoyas(false);
    });

    // Cargar Testimonios
    const unsubTestimonios = onSnapshot(collection(db, "testimonios"), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0));
      setTestimonios(docs);
      setLoadingTestimonios(false);
    });

    // Cargar Solicitudes
    const unsubSolicitudes = onSnapshot(collection(db, "solicitudes"), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      docs.sort((a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0));
      setSolicitudes(docs);
      setLoadingSolicitudes(false);
    });

    return () => { unsubJoyas(); unsubTestimonios(); unsubSolicitudes(); };
  }, []);

  // --- FUNCIÓN PARA CERRAR SESIÓN ---
  const handleLogout = async () => {
    try {
      await logout(); // Cierra la sesión en Firebase
      navigate('/admin/login'); // Te expulsa a la pantalla de login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Resto de tus funciones (visibilidad, eliminar, etc.)
  const toggleVisibilidadJoya = async (id, estadoActual) => {
    try { await updateDoc(doc(db, "joyas", id), { visible: !estadoActual }); } catch (error) { alert("Error al actualizar."); }
  };
  const eliminarJoya = async (id, nombre) => {
    if (window.confirm(`¿Eliminar la pieza "${nombre}" permanentemente?`)) {
      try { await deleteDoc(doc(db, "joyas", id)); } catch (error) { alert("Error al borrar."); }
    }
  };
  const toggleVisibilidadTestimonio = async (id, estadoActual) => {
    try { await updateDoc(doc(db, "testimonios", id), { visible: !estadoActual }); } catch (error) { alert("Error al actualizar."); }
  };
  const eliminarTestimonio = async (id, cliente) => {
    if (window.confirm(`¿Eliminar la reseña de "${cliente}"?`)) {
      try { await deleteDoc(doc(db, "testimonios", id)); } catch (error) { alert("Error al borrar."); }
    }
  };
  const toggleSolicitudLeida = async (id, estadoActual) => {
    try { await updateDoc(doc(db, "solicitudes", id), { leida: !estadoActual }); } catch (error) { alert("Error al actualizar."); }
  };
  const eliminarSolicitud = async (id, cliente) => {
    if (window.confirm(`¿Eliminar la solicitud de pedido de "${cliente}"?`)) {
      try { await deleteDoc(doc(db, "solicitudes", id)); } catch (error) { alert("Error al borrar."); }
    }
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* NAVBAR ADMIN */}
      <nav className="admin-nav">
        <div className="admin-brand">
          <h1 className="admin-logo">Perla Negra</h1>
          <p className="admin-subtitle">Bóveda Administrativa</p>
        </div>
        <div className="admin-actions">
          <button onClick={() => navigate('/')} className="btn-store">Ver Tienda</button>
          <button onClick={() => navigate('/admin/agregar')} className="btn-new">+ Nueva Pieza</button>
          
          {/* --- BOTÓN DE CERRAR SESIÓN --- */}
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="admin-main">
        {/* PESTAÑAS (TABS) */}
        <div className="admin-tabs">
          <button onClick={() => setActiveTab('inventario')} className={`tab-btn ${activeTab === 'inventario' ? 'active' : ''}`}>
            Inventario ({joyas.length})
          </button>
          <button onClick={() => setActiveTab('solicitudes')} className={`tab-btn ${activeTab === 'solicitudes' ? 'active' : ''}`}>
            Pedidos {solicitudes.filter(s => !s.leida).length > 0 && <span className="badge-new">{solicitudes.filter(s => !s.leida).length} Nuevos</span>}
          </button>
          <button onClick={() => setActiveTab('testimonios')} className={`tab-btn ${activeTab === 'testimonios' ? 'active' : ''}`}>
            Testimonios {testimonios.filter(t => !t.visible).length > 0 && <span className="badge-new">{testimonios.filter(t => !t.visible).length} Nuevos</span>}
          </button>
        </div>

        {/* CONTENIDO: INVENTARIO */}
        {activeTab === 'inventario' && (
          <div className="tab-content fade-in-image">
            {loadingJoyas ? <div className="admin-loader">Sincronizando inventario...</div> : joyas.length === 0 ? <div className="admin-empty">La bóveda está vacía.</div> : (
              <div className="table-responsive">
                <table className="inventory-table">
                  <thead>
                    <tr><th>Pieza</th><th>Categoría</th><th>Precio</th><th className="text-center">Vitrina</th><th className="text-right">Gestión</th></tr>
                  </thead>
                  <tbody>
                    {joyas.map((joya) => (
                      <tr key={joya.id}>
                        <td>
                          <div className="td-piece">
                            <div className="td-img">{joya.imagesUrls && joya.imagesUrls[0] ? <img src={joya.imagesUrls[0]} alt="" /> : <span>Sin foto</span>}</div>
                            <div className="td-info"><p className="td-name">{joya.nombre}</p><p className="td-material">{joya.material}</p></div>
                          </div>
                        </td>
                        <td><span className="badge-cat">{joya.categoria}</span></td>
                        <td className="td-price">${parseFloat(joya.precio).toFixed(2)}</td>
                        <td className="text-center">
                          <button onClick={() => toggleVisibilidadJoya(joya.id, joya.visible)} className={`btn-visibility ${joya.visible ? 'active' : 'hidden'}`}>{joya.visible ? 'Público' : 'Oculto'}</button>
                        </td>
                        <td className="text-right">
                          <div className="td-actions">
                            <button onClick={() => navigate(`/admin/editar/${joya.id}`)} className="btn-edit">Editar</button>
                            <button onClick={() => eliminarJoya(joya.id, joya.nombre)} className="btn-delete">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO: SOLICITUDES DE PEDIDOS */}
        {activeTab === 'solicitudes' && (
          <div className="tab-content fade-in-image">
            {loadingSolicitudes ? <div className="admin-loader">Cargando solicitudes...</div> : solicitudes.length === 0 ? <div className="admin-empty">No hay solicitudes de pedido.</div> : (
              <div className="admin-testim-grid">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="admin-testim-card">
                    {!solicitud.leida && <span className="badge-pending">¡Nuevo Pedido!</span>}
                    <div className="admin-testim-body">
                      <p className="admin-testim-date">{solicitud.fecha?.toDate().toLocaleString() || "Reciente"}</p>
                      <h3 className="req-piece-name">{solicitud.joyaNombre}</h3>
                      <p className="req-price">Ref: ${parseFloat(solicitud.precioReferencia).toFixed(2)}</p>
                      <div className="req-client-info"><p><strong>Cliente:</strong> {solicitud.cliente}</p><p><strong>Tel/WhatsApp:</strong> {solicitud.telefono}</p></div>
                      {solicitud.mensaje && <div className="req-message"><p>"{solicitud.mensaje}"</p></div>}
                    </div>
                    <div className="admin-testim-actions">
                      <button onClick={() => toggleSolicitudLeida(solicitud.id, solicitud.leida)} className={`btn-approve ${solicitud.leida ? 'approved' : ''}`}>{solicitud.leida ? 'Marcar Pendiente' : 'Marcar Contactado'}</button>
                      <button onClick={() => eliminarSolicitud(solicitud.id, solicitud.cliente)} className="btn-delete">Borrar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO: TESTIMONIOS */}
        {activeTab === 'testimonios' && (
          <div className="tab-content fade-in-image">
            {loadingTestimonios ? <div className="admin-loader">Cargando reseñas...</div> : testimonios.length === 0 ? <div className="admin-empty">No hay testimonios registrados.</div> : (
              <div className="admin-testim-grid">
                {testimonios.map((testimonio) => (
                  <div key={testimonio.id} className="admin-testim-card">
                    {!testimonio.visible && <span className="badge-pending">Pendiente Revisión</span>}
                    <div className="admin-testim-body">
                      <div className="admin-quote-icon">"</div>
                      <p className="admin-testim-text">{testimonio.comentario}</p>
                      <p className="admin-testim-author">{testimonio.cliente}</p>
                      <p className="admin-testim-date">{testimonio.fecha?.toDate().toLocaleDateString() || "Reciente"}</p>
                    </div>
                    <div className="admin-testim-actions">
                      <button onClick={() => toggleVisibilidadTestimonio(testimonio.id, testimonio.visible)} className={`btn-approve ${testimonio.visible ? 'approved' : ''}`}>{testimonio.visible ? 'Ocultar' : 'Aprobar Reseña'}</button>
                      <button onClick={() => eliminarTestimonio(testimonio.id, testimonio.cliente)} className="btn-delete">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <footer className="admin-footer">
          <p>© 2026 Perla Negra • Panel de Control</p>
          <div className="admin-security-tags"><span>Bóveda Digital</span><span>Acceso Encriptado</span></div>
        </footer>
      </main>
    </div>
  );
};