// src/pages/admin/EditarJoya.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './editJoya.css'; // Asegúrate de enlazar el CSS correcto

export const EditarJoya = () => {
  const { id } = useParams();
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

  // Pantalla de Carga
  if (fetching) {
    return (
      <div className="dashboard-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="admin-loader">Leyendo archivos de la bóveda...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      
      {/* NAVBAR ADMIN */}
      <nav className="admin-nav">
        <div className="admin-brand">
          <h1 className="admin-logo">Perla Negra</h1>
          <p className="admin-subtitle">Edición de Catálogo</p>
        </div>
        <div className="admin-actions">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-store">Volver a Bóveda</button>
        </div>
      </nav>

      <main className="admin-main">
        <div className="admin-form-container fade-in-image">
          <h2 className="admin-form-title">Modificar Detalles de Pieza</h2>
          
          <form onSubmit={handleSubmit} className="admin-form">
            
            {/* Nombre */}
            <div className="form-group">
              <label className="form-label">Nombre del Diseño</label>
              <input 
                type="text" name="nombre" value={joya.nombre} required onChange={handleChange}
                className="form-input" 
              />
            </div>

            {/* Vista Previa de Imágenes */}
            <div className="form-group">
              <label className="form-label">Galería en Vitrina (Solo Lectura)</label>
              <div className="edit-gallery-preview">
                {joya.imagesUrls && joya.imagesUrls.map((url, i) => (
                  <div key={i} className="edit-img-wrapper">
                    <img src={url} alt={`Ángulo ${i+1}`} />
                    <span className="edit-img-badge">VISTA {i+1}</span>
                  </div>
                ))}
              </div>
              <p className="form-hint" style={{ marginTop: '15px' }}>
                Para actualizar las fotografías, es necesario crear un nuevo registro de la pieza.
              </p>
            </div>

            {/* Categoría y Precio (Grid) */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Colección / Categoría</label>
                <select name="categoria" value={joya.categoria} onChange={handleChange} className="form-select">
                  <option value="Anillos">Anillos</option>
                  <option value="Cadenas">Cadenas</option>
                  <option value="Aretes">Aretes</option>
                  <option value="Relojes">Relojes</option>
                  <option value="Pulseras">Pulseras</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Precio de Referencia ($)</label>
                <input 
                  type="number" name="precio" value={joya.precio} step="0.01" required onChange={handleChange}
                  className="form-input" 
                />
              </div>
            </div>

            {/* Material */}
            <div className="form-group">
              <label className="form-label">Materiales y Gemas</label>
              <input 
                type="text" name="material" value={joya.material} required onChange={handleChange}
                className="form-input" 
              />
            </div>

            {/* Descripción */}
            <div className="form-group">
              <label className="form-label">Descripción para el Cliente</label>
              <textarea 
                name="descripcion" value={joya.descripcion} rows="5" required onChange={handleChange}
                className="form-textarea" 
              ></textarea>
            </div>

            {/* Botones de Acción */}
            <div className="form-actions">
              <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn-cancel">Cancelar Edición</button>
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? 'Sincronizando...' : 'Actualizar Pieza'}
              </button>
            </div>
            
          </form>
        </div>
      </main>
    </div>
  );
};