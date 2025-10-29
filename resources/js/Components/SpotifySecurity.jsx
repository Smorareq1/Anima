import React, { useState } from "react";
import spotify from "../../images/decoration/spotify.png";
import acceso from "../../images/decoration/acceso.png";
import politicas from "../../images/decoration/politicas.png";
import encriptacion from "../../images/decoration/encriptacion.png";
import control from "../../images/decoration/control.png";
import {route} from "ziggy-js";
import {Link} from "@inertiajs/react";
import TutorialModal from "../Components/modal/TutorialModal";

const SpotifySecurity = () => {

    const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);

    const openTutorialModal = () => setIsTutorialModalOpen(true);
    const closeTutorialModal = () => setIsTutorialModalOpen(false);


    return (
        <section className="spotify-security">
            {/* Lado izquierdo */}
            <div className="spotify-left">
                <img src={spotify} alt="Spotify" className="spotify-logo" />
                <p>
                    Conecta tu cuenta de Spotify para recibir recomendaciones de forma
                    segura y rápida
                </p>
                <button onClick={openTutorialModal} className="btnPrimary2">
                    <span className="play-icon">▶</span>
                    Ver tutorial
                </button>
            </div>

            {/* Lado derecho (grid con 4 items) */}
            <div className="spotify-right">
                <div className="security-item">
                    <img src={acceso} alt="Acceso" className="icon-circle" />
                    <h3>Acceso</h3>
                    <p>
                        Solicitamos acceso solo de lectura para crear playlists en tu nombre;
                        no modificamos tu música ni tu información personal sin tu permiso.
                    </p>
                </div>

                <div className="security-item">
                    <img src={politicas} alt="Políticas" className="icon-circle" />
                    <h3>Políticas</h3>
                    <p>
                        Usamos la API oficial de Spotify bajo sus estrictas normas de
                        seguridad y privacidad, garantizando que tu data nunca se comparte
                        con terceros.
                    </p>
                </div>

                <div className="security-item">
                    <img src={encriptacion} alt="Encriptación" className="icon-circle" />
                    <h3>Encriptación</h3>
                    <p>
                        Tu token de acceso de Spotify se encripta y almacena de forma segura
                        en nuestra base de datos, siguiendo prácticas industry-standard.
                    </p>
                </div>

                <div className="security-item">
                    <img src={control} alt="Control" className="icon-circle" />
                    <h3>Control</h3>
                    <p>
                        Puedes revocar el acceso de ÁNIMA a tu cuenta de Spotify en cualquier
                        momento desde la configuración de tu perfil en Spotify.com.
                    </p>
                </div>
            </div>

            <TutorialModal 
                isOpen={isTutorialModalOpen}
                onClose={closeTutorialModal}
            />
        </section>
    );
};

export default SpotifySecurity;
