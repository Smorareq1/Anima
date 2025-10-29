import React, {useEffect} from 'react';
import '../../../css/notification.css';

const Notification = ({message, type='info', onClose, duration = 5000}) =>{
    useEffect(()=>{
        if(duration > 0){
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div className={`notification notification-${type}`}>
            <span className='notification-icon'>
                {type === 'success' && '✅'}
                {type === 'error' && '❌'}
                {type === 'warning' && '⚠️'}
                {type === 'info' && 'ℹ️'}
            </span>
            <span className='notification--message'>{message}</span>
            <button className='notification-close' onClick={onClose}>
                ×
            </button>
        </div>
    );
};

export default Notification;