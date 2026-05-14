// src/components/ModalJoya.jsx
import { useState } from 'react';
import { db } from '../../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import ReCAPTCHA from "react-google-recaptcha";

export const ModalJoya = ({ seleccionada, setSeleccionada }) => {
  const [paso, setPaso] = useState(1);
  const [contacto, setContacto] = useState({ nombre: '', telefono: '', mensaje: '' });
  const [captchaValido, setCaptchaValido] = useState(false);

  // Si no hay ninguna joya seleccionada, no renderizamos nada
  if (!seleccionada) return null;

  const enviarSolicitud = async (e) => {
    e.preventDefault();

    if (!captchaValido) {
      alert("Por favor, verifica que eres humano marcando la casilla de reCAPTCHA.");
      return;
    }

    try {
      await addDoc(collection(db, "solicitudes"), {
        cliente: contacto.nombre,
        telefono: contacto.telefono,
        mensaje: contacto.mensaje,
        joyaId: seleccionada.id,
        joyaNombre: seleccionada.nombre,
        precioReferencia: seleccionada.precio,
        fecha: new Date(),
        leida: false
      });
      alert("¡Solicitud enviada! Nos pondremos en contacto contigo pronto.");
      
      // Limpiar y cerrar
      setSeleccionada(null);
      setPaso(1);
      setContacto({ nombre: '', telefono: '', mensaje: '' });
      setCaptchaValido(false);
    } catch (error) {
      alert("Error al enviar la solicitud. Intenta de nuevo.");
    }
  };

  const cerrarModal = () => {
    setSeleccionada(null);
    setPaso(1);
    setCaptchaValido(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-sm flex flex-col md:flex-row relative shadow-2xl">
        
        <button 
          onClick={cerrarModal}
          className="absolute top-6 right-6 text-gray-400 hover:text-black z-20 transition-transform hover:rotate-90"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* --- LADO IZQUIERDO: IMÁGENES --- */}
        <div className="md:w-1/2 bg-gray-50 border-r border-gray-50">
          <div className="flex flex-col">
            {seleccionada.imagesUrls?.map((url, index) => (
              <img key={index} src={url} alt="" className="w-full object-cover border-b border-white" />
            ))}
          </div>
        </div>

        {/* --- LADO DERECHO: INFO O FORMULARIO --- */}
        <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          {paso === 1 ? (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 block mb-4">{seleccionada.categoria}</span>
                <h2 className="text-4xl font-light text-gray-900 uppercase tracking-tight">{seleccionada.nombre}</h2>
              </div>
              
              <p className="text-gray-500 text-sm leading-relaxed font-light">{seleccionada.descripcion}</p>

              <div className="grid grid-cols-2 gap-4 border-y border-gray-50 py-6">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Material Base</p>
                  <p className="text-xs text-gray-800 font-medium">{seleccionada.material}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Disponibilidad</p>
                  <p className="text-xs text-green-600 font-medium italic">Bajo Pedido</p>
                </div>
              </div>

              <div className="flex items-baseline gap-4">
                <p className="text-3xl font-medium text-gray-900">${parseFloat(seleccionada.precio).toFixed(2)}</p>
                <span className="text-[10px] text-gray-300 uppercase tracking-tighter">*Sujeto a cambios</span>
              </div>

              <button 
                onClick={() => setPaso(2)}
                className="w-full bg-gray-900 text-white py-5 text-xs uppercase tracking-[0.3em] hover:bg-black transition-all shadow-lg active:scale-95"
              >
                Me interesa esta pieza
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-light uppercase tracking-widest">Solicitar Pedido</h2>
                <p className="text-xs text-gray-400 mt-2">Pieza: {seleccionada.nombre}</p>
              </div>

              {!captchaValido ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 bg-gray-50/30 border border-gray-100 rounded-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-widest text-center mb-8">
                    Por seguridad, verifica que eres humano para acceder al formulario.
                  </p>
                  
                  <ReCAPTCHA
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                    onChange={() => setCaptchaValido(true)}
                    onExpired={() => setCaptchaValido(false)}
                  />
                  
                  <button 
                    type="button"
                    onClick={() => setPaso(1)}
                    className="mt-8 text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                  >
                    Volver a los detalles
                  </button>
                </div>
              ) : (
                <form onSubmit={enviarSolicitud} className="space-y-6 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-400">Nombre Completo</label>
                    <input 
                      type="text" required autoFocus
                      className="w-full border-b border-gray-100 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                      onChange={(e) => setContacto({...contacto, nombre: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-400">WhatsApp / Teléfono</label>
                    <input 
                      type="tel" required 
                      className="w-full border-b border-gray-100 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                      onChange={(e) => setContacto({...contacto, telefono: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-400">Requerimientos extras</label>
                    <textarea 
                      rows="3"
                      className="w-full border border-gray-50 p-4 text-sm focus:outline-none focus:border-gray-200 bg-gray-50/30"
                      onChange={(e) => setContacto({...contacto, mensaje: e.target.value})}
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-gray-900 text-white py-5 text-xs uppercase tracking-[0.3em] hover:bg-black transition-all shadow-md"
                  >
                    Enviar Solicitud Segura
                  </button>
                  
                  <button 
                    type="button"
                    onClick={cerrarModal}
                    className="w-full text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors pt-2"
                  >
                    Cancelar y volver
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};