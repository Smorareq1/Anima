import React from "react";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import '../../css/info.css';
import SpotifyLogo from "../../images/spotify-logo.svg";
import Check from "../../images/check.svg";
import Face from "../../images/face.svg";
import Security from "../../images/security.svg"
import Playlist from "../../images/playlist.svg"

const FeaturesHero = () => {
    return (
        <section className="hero">
            <div className="features-container">
                <div className="main-feature">
                    <div className="feature-header">
                        <img src={SpotifyLogo} alt="Spotify-Logo" />
                        <h2>Integración con Spotify</h2>
                    </div>

                    <div className="feature-content">
                        <div className="bullet">
                            <img src={Check} alt="" />
                            <p>
                                Acceso a millones de canciones, artistas y géneros de la plataforma
                            </p>
                        </div>

                        <div className="bullet">
                            <img src={Check} alt="" />
                            <p>
                                Generación automática de listas de reproducción basadas en tu emoción detectada
                            </p>
                        </div>

                        <div className="bullet">
                            <img src={Check} alt="" />
                            <p>
                                Tus playlists generadas están disponibles inmediatamente en tu cuenta de Spotify
                            </p>
                        </div>
                    </div>
                </div>

                <div className="features">
                    <div className="feature">
                        <div className="feature-header">
                            <img src={Face} alt="Spotify-Logo" />
                            <h2>Historial de Emociones</h2>
                        </div>

                        <div className="bullets">
                            <div className="bullet">
                                <img src={Check} alt="" />
                                <p>
                                   Registro cronológico de todos tus estados de ánimo detectados
                                </p>
                            </div>

                            <div className="bullet">
                                <img src={Check} alt="" />
                                <p>
                                    Comparativa entre emociones y géneros musicales preferidos
                                </p>
                            </div>

                            <div className="bullet">
                                <img src={Check} alt="" />
                                <p>
                                    Insights sobre tu bienestar emocional a través del tiempo
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="feature">
                        <div className="feature-header">
                            <img src={Security} alt="Spotify-Logo" />
                            <h2>Privacidad y Seguridad</h2>
                        </div>

                        <div className="bullets">
                            <div className="bullet">
                                <img src={Check} alt="" />
                                <p>
                                   Cumplimiento de normas de protección de datos
                                </p>
                            </div>

                            <div className="bullet">
                                <img src={Check} alt="" />
                                <p>
                                    Opción de eliminar historial completo en un clic
                                </p>
                            </div>

                            <div className="bullet">
                                <img src={Check} alt="" />
                                <p>
                                    Sin compartir información personal con terceros
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="main-feature">
                    <div className="feature-header">
                        <img src={Playlist} alt="Spotify-Logo" />
                        <h2>Control Total de Playlists</h2>
                    </div>

                    <div className="feature-content">
                        <div className="bullet">
                            <img src={Check} alt="" />
                            <p>
                                 Agrega o elimina canciones de tus playlists generadas automáticamente
                            </p>
                        </div>

                        <div className="bullet">
                            <img src={Check} alt="" />
                            <p>
                                Marca playlists completas como favoritas para acceso rápido futuro
                            </p>
                        </div>

                        <div className="bullet">
                            <img src={Check} alt="" />
                            <p>
                                Envía tus playlists emocionales a amigos via enlaces directos
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesHero;
