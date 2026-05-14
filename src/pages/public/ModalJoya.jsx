// src/pages/public/ModalJoya.jsx
import { useState, useEffect } from 'react';
import ReCAPTCHA from "react-google-recaptcha";

export const ModalJoya = ({ seleccionada, setSeleccionada, todasLasJoyas = [] }) => {
  const [paso, setPaso] = useState(1);
  const [captchaValido, setCaptchaValido] = useState(false);
  const [imgIndex, setImgIndex] = useState(0); 

  useEffect(() => {
    if (seleccionada) {
      setImgIndex(0);
      setPaso(1);
      setCaptchaValido(false);
    }
  }, [seleccionada]);

  if (!seleccionada) return null;

  const recomendaciones = todasLasJoyas
    .filter(j => j.categoria === seleccionada.categoria && j.id !== seleccionada.id)
    .slice(0, 3);

  const alCerrar = () => {
    setSeleccionada(null);
  };

  return (
    <div className="modal-overlay" onClick={alCerrar}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={alCerrar}>×</button>
        
        <div className="modal-grid">
          {/* LADO IZQUIERDO: GALERÍA VERTICAL DE FOTOS */}
          <div className="modal-image-side">
            {/* Miniaturas (Solo aparecen si hay más de 1 foto) */}
            {seleccionada.imagesUrls?.length > 1 && (
              <div className="thumbnail-gallery-vertical">
                {seleccionada.imagesUrls.map((url, idx) => (
                  <div 
                    key={idx} 
                    className={`thumbnail-v ${idx === imgIndex ? 'active' : ''}`}
                    onClick={() => setImgIndex(idx)}
                  >
                    <img src={url} alt={`Vista ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
            
            {/* Imagen Principal */}
            <div className="main-image-container">
              <img 
                key={imgIndex} /* El key fuerza la recarga de la animación */
                src={seleccionada.imagesUrls?.[imgIndex]} 
                alt={seleccionada.nombre} 
                className="fade-in-image"
              />
            </div>
          </div>
          
          {/* LADO DERECHO: INFORMACIÓN Y FORMULARIO */}
          <div className="modal-info-side">
            {paso === 1 ? (
              <div className="info-animate">
                <span className="modal-cat">{seleccionada.categoria}</span>
                <h2 className="modal-title">{seleccionada.nombre}</h2>
                <div className="modal-divider"></div>
                <p className="modal-desc">{seleccionada.descripcion}</p>
                <div className="modal-meta">
                  <p className="modal-material">MATERIAL: <span>{seleccionada.material}</span></p>
                  <p className="modal-price">${parseFloat(seleccionada.precio).toFixed(2)}</p>
                </div>
                
                <button className="modal-btn-primary" onClick={() => setPaso(2)}>ME INTERESA ESTA PIEZA</button>
              </div>
            ) : (
              <div className="info-animate">
                <h2 className="modal-title">SOLICITAR PEDIDO</h2>
                <p className="modal-desc">Por seguridad, verifica que eres humano para contactar con el taller.</p>
                
                {!captchaValido ? (
                  <div className="captcha-container">
                    <ReCAPTCHA
                      sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                      onChange={() => setCaptchaValido(true)}
                    />
                    <button type="button" className="modal-btn-back" onClick={() => setPaso(1)}>VOLVER</button>
                  </div>
                ) : (
                  <form className="modal-form" onSubmit={(e) => { e.preventDefault(); alert("Enviado"); alCerrar(); }}>
                    <input type="text" placeholder="NOMBRE COMPLETO" required className="modal-input" />
                    <input type="tel" placeholder="WHATSAPP / TELÉFONO" required className="modal-input" />
                    <textarea placeholder="REQUERIMIENTOS EXTRAS" className="modal-input" rows="3"></textarea>
                    <button type="submit" className="modal-btn-primary">ENVIAR SOLICITUD SEGURA</button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN INFERIOR: RECOMENDACIONES */}
        {recomendaciones.length > 0 && (
          <div className="recommendations-section">
            <h3 className="rec-title">TAMBIÉN TE PODRÍA INTERESAR</h3>
            <div className="rec-grid">
              {recomendaciones.map(rec => (
                <div key={rec.id} className="rec-card" onClick={() => setSeleccionada(rec)}>
                  <div className="rec-img-wrapper">
                    <img src={rec.imagesUrls?.[0]} alt={rec.nombre} />
                  </div>
                  <div className="rec-info">
                    <h4>{rec.nombre}</h4>
                    <p>${parseFloat(rec.precio).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};