import React from 'react';
import "../../../css/confirmation-modal.css";

const ConfirmationModal = ({ 
    isOpen, 
    onConfirm, 
    onCancel, 
    title = "Confirmar acción", 
    message, 
    confirmText = "Salir", 
    cancelText = "Cancelar",
    type = "warning" 
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="confirmation-modal">
                <div className={`modal-header modal-${type}`}>
                    <span className="modal-icon">
                        {type === 'warning' && '⚠️'}
                        {type === 'danger' && '🚨'}
                        {type === 'info' && 'ℹ️'}
                    </span>
                    <h3>{title}</h3>
                </div>
                
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                
                <div className="modal-actions">
                    <button 
                        className="btn-cancel" 
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button 
                        className={`btn-confirm btn-${type}`} 
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;