// src/pages/admin/AgregarJoya.jsx
import { useState } from 'react';
import { db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AgreJoya.css'; // Asegúrate de apuntar a tu archivo CSS principal

export const AgregarJoya = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagenes, setImagenes] = useState([]); 
  
  const [joya, setJoya] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'Anillos',
    material: '',
    precio: '',
    visible: true
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJoya({ ...joya, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImagenes(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (imagenes.length === 0) {
      alert("Por favor, selecciona al menos una fotografía.");
      return;
    }

    setLoading(true);

    try {
      // 1. SUBIDA MULTIPLE A CLOUDINARY
      const uploadPromises = imagenes.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "perla_negra");
        
        const res = await fetch("https://api.cloudinary.com/v1_1/dqftry6xz/image/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        return data.secure_url;
      });

      const urlsObtenidas = await Promise.all(uploadPromises);

      // 2. GUARDAR EN FIRESTORE
      await addDoc(collection(db, "joyas"), {
        ...joya,
        precio: parseFloat(joya.precio),
        imagesUrls: urlsObtenidas, 
        fechaCreacion: new Date()
      });
      
      alert(`¡Éxito! Se han subido ${urlsObtenidas.length} imágenes y la pieza se agregó al catálogo.`);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      
      {/* NAVBAR ADMIN (Para mantener la consistencia) */}
      <nav className="admin-nav">
        <div className="admin-brand">
          <h1 className="admin-logo">Perla Negra</h1>
          <p className="admin-subtitle">Nueva Incorporación</p>
        </div>
        <div className="admin-actions">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-store">Volver a Bóveda</button>
        </div>
      </nav>

      <main className="admin-main">
        <div className="admin-form-container fade-in-image">
          <h2 className="admin-form-title">Registrar Nueva Pieza</h2>
          
          <form onSubmit={handleSubmit} className="admin-form">
            
            <div className="form-group">
              <label className="form-label">Nombre de la Pieza</label>
              <input 
                type="text" name="nombre" required onChange={handleChange}
                className="form-input" placeholder="Ej. Anillo Solitario Diamante"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fotografías de Estudio (Selección Múltiple)</label>
              <input 
                type="file" accept="image/*" multiple required onChange={handleImageChange}
                className="form-file"
              />
              <p className="form-hint">
                {imagenes.length > 0 
                  ? `Has seleccionado ${imagenes.length} archivo(s)` 
                  : "Selecciona una o más fotos para la galería."}
              </p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select name="categoria" onChange={handleChange} className="form-select">
                  <option value="Anillos">Anillos</option>
                  <option value="Cadenas">Cadenas</option>
                  <option value="Aretes">Aretes</option>
                  <option value="Relojes">Relojes</option>
                  <option value="Pulseras">Pulseras</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Valor / Precio ($)</label>
                <input 
                  type="number" name="precio" step="0.01" required onChange={handleChange}
                  className="form-input" placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Materiales y Gemas</label>
              <input 
                type="text" name="material" required onChange={handleChange}
                className="form-input" placeholder="Ej. Oro Blanco 18k, Zafiro"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción Detallada</label>
              <textarea 
                name="descripcion" rows="4" required onChange={handleChange}
                className="form-textarea" placeholder="Describe la inspiración, el peso, el corte..."
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn-cancel">Cancelar</button>
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? 'Procesando Archivos...' : 'Ingresar a Catálogo'}
              </button>
            </div>
            
          </form>
        </div>
      </main>
    </div>
  );
};