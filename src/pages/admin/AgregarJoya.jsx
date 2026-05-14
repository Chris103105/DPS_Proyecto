import { useState } from 'react';
import { db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const AgregarJoya = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagenes, setImagenes] = useState([]); // Ahora es un array
  
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
      // Convertimos el FileList en un Array real
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

      // Esperamos a que todas las fotos se suban
      const urlsObtenidas = await Promise.all(uploadPromises);

      // 2. GUARDAR EN FIRESTORE (Guardamos el array de imágenes)
      await addDoc(collection(db, "joyas"), {
        ...joya,
        precio: parseFloat(joya.precio),
        imagesUrls: urlsObtenidas, // Guardamos la lista completa
        fechaCreacion: new Date()
      });
      
      alert(`¡Éxito! Se han subido ${urlsObtenidas.length} imágenes.`);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto border border-gray-100 p-8 shadow-sm">
        <h2 className="text-2xl font-light text-gray-800 mb-8 border-b pb-4 tracking-widest uppercase">Nueva Pieza</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Nombre</label>
            <input type="text" name="nombre" required onChange={handleChange}
              className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Fotografías (Puedes elegir varias)</label>
            <input 
              type="file" 
              accept="image/*"
              multiple // <--- ESTO PERMITE ELEGIR VARIAS
              required
              onChange={handleImageChange}
              className="w-full border-b border-gray-200 py-2 text-sm file:bg-gray-800 file:text-white file:border-0 file:px-4 file:py-1 file:mr-4 cursor-pointer"
            />
            <p className="text-[10px] text-gray-400 mt-1 italic">
              {imagenes.length > 0 ? `${imagenes.length} seleccionadas` : "Selecciona una o más fotos de diferentes ángulos"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Categoría</label>
              <select name="categoria" onChange={handleChange} className="w-full border-b border-gray-200 py-2 bg-transparent">
                <option value="Anillos">Anillos</option>
                <option value="Cadenas">Cadenas</option>
                <option value="Aretes">Aretes</option>
                <option value="Relojes">Relojes</option>
                <option value="Pulseras">Pulseras</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Precio ($)</label>
              <input type="number" name="precio" step="0.01" required onChange={handleChange}
                className="w-full border-b border-gray-200 py-2 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Material</label>
            <input type="text" name="material" required onChange={handleChange}
              className="w-full border-b border-gray-200 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Descripción</label>
            <textarea name="descripcion" rows="3" required onChange={handleChange}
              className="w-full border border-gray-100 p-3 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-between items-center pt-6">
            <button type="button" onClick={() => navigate('/admin/dashboard')} className="text-gray-400">Cancelar</button>
            <button type="submit" disabled={loading}
              className="bg-gray-800 text-white px-10 py-3 hover:bg-black transition-colors disabled:bg-gray-300"
            >
              {loading ? 'Subiendo contenido...' : 'Publicar Pieza'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};