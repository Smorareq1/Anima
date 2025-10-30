import React, { useState, useEffect } from 'react';
import '../../css/loadingscreen.css';

const LoadingScreen = ({ isLoading, phrases = [] }) => {
    const [currentPhrase, setCurrentPhrase] = useState(0);

    useEffect(() => {
        if (!isLoading || phrases.length === 0) return;

        const interval = setInterval(() => {
            setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        }, 3000); 

        return () => clearInterval(interval);
    }, [isLoading, phrases.length]);

    if (!isLoading) return null;

    return (
        <div className="loading-screen">
            <div className="loading-content">
                {/* Animación de ÁNIMA saltando */}
                <div className="logo-animation">
                    {'ÁNIMA'.split('').map((letter, index) => (
                        <span
                            key={index}
                            className="jumping-letter"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {letter}
                        </span>
                    ))}
                </div>

                {/* Notas musicales que aparecen al "tocar suelo" */}
                <div className="music-notes">
                    {[...Array(8)].map((_, index) => (
                        <div
                            key={index}
                            className="music-note"
                            style={{
                                animationDelay: `${0.5 + (index * 0.2)}s`,
                                left: `${20 + (index * 10)}%`
                            }}
                        >
                            ♫
                        </div>
                    ))}
                </div>

                {/* Frases rotativas */}
                {phrases.length > 0 && (
                    <div className="loading-phrases">
                        <p>{phrases[currentPhrase]}</p>
                    </div>
                )}

                {/* Spinner opcional */}
                <div className="loading-spinner"></div>
            </div>
        </div>
    );
};

export default LoadingScreen;