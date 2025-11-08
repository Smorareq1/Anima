// components/HttpError.jsx
import React from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import Logo from '../../../public/images/logo2.png'
import errorHero from '../../../public/images/errorHero.png'
import '../../css/httpError.css';

const HttpError = ({ 
  errorCode = 404, 
  title, 
  message, 
  showHomeButton = true,
}) => {
  
  const errorMessages = {
    400: {
      title: 'Solicitud Incorrecta',
      message: 'La solicitud no pudo ser procesada.'
    },
    401: {
      title: 'No Autorizado',
      message: 'Necesitas iniciar sesión para acceder a esta página.'
    },
    403: {
      title: 'Acceso Denegado',
      message: 'No tienes permisos para acceder a este recurso.'
    },
    404: {
      title: 'Página No Encontrada',
      message: 'La página que buscas no existe o ha sido movida.'
    },
    500: {
      title: 'Error del Servidor',
      message: 'Algo salió mal en nuestro servidor. Por favor, intenta más tarde.'
    },
    503: {
      title: 'Servicio No Disponible',
      message: 'El servicio está temporalmente no disponible.'
    }
  };

  const errorInfo = {
    title: title || errorMessages[errorCode]?.title || 'Error Desconocido',
    message: message || errorMessages[errorCode]?.message || 'Ha ocurrido un error inesperado.'
  };

  const handleGoHome = () =>{
    router.visit(route('Home'));
  };

  const handleGoBack = () =>{
    window.history.back();
  }

  return (
    <div className="http-error">

      <div className="error-container">
        
        <div className="error-header">
          <img src={Logo} alt="" className='logo-error'/>
        </div>

        <div className="error-content">
          <div className="left-content">
            <h1>{errorCode}</h1>
            <div className="info-error">
              <h4>¡Algo ha salido mal!</h4>
              <h4>{errorInfo.title}</h4>
              <p>{errorInfo.message}</p>
            </div>
            
            <div className="error-actions">
              {showHomeButton &&(
                <button className='btn-error btn-primary-error' onClick={handleGoHome}>
                  Volver al Inicio
                </button>
              )}

              <button className='btn-error btn-secondary-error' onClick={handleGoBack}>
                Volver Atrás
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HttpError;