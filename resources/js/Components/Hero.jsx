import React from "react";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import hero1 from "../../images/decoration/hero1.png";
import hero2 from "../../images/decoration/hero2.png";
import hero3 from "../../images/decoration/hero3.png";
import hero4 from "../../images/decoration/hero4.png";
import spotify from "../../images/decoration/spotify.png";

const Hero = () => {
    return (
        <section className="hero">
            {/* Primera fila: texto + imagen */}
            <div className="hero-main">
                <div className="hero-text">
                    <span className="tag">Recomendaciones Musicales</span>
                    <h1>Música que refleja como te sentís</h1>
                    <p>
                        Abrí Ánima, tomá una foto y obtené una playlist hecha para tu estado
                        de ánimo en segundos
                    </p>

                    <div className="hero-buttons">
                        <Link href={route("auth.register.show")} className="btnPrimary">
                            Empieza ahora
                        </Link>
                        <Link href={route("Info")} className="btnOutline">
                            Conocer más
                        </Link>
                    </div>

                    <div className="hero-spotify">
                        <p>CONECTA TU CUENTA Y SIENTE LA MÚSICA</p> <br/>
                        <img src={spotify} alt="Spotify" />
                    </div>
                </div>

                <div className="hero-image">
                    <img src={hero1} alt="Persona escuchando música" />
                </div>
            </div>

            {/* Segunda fila */}
            <div className="hero-feature">
                <img src={hero2} alt="Ilustración musical" className="hero-feature-img" />
                <div className="hero-feature-text">
                    <span className="tag">Detección de emociones</span>
                    <h2>Analiza tu estado de ánimo en segundos con solo una foto</h2>
                    <p>
                        Usá inteligencia artificial para identificar tu emoción exacta
                        (alegría, tristeza, calma, etc.) de forma rápida y precisa.
                    </p>
                    <Link href={route("Info")} className="btnOutline">
                        Conocer más
                    </Link>
                </div>
            </div>
            {/* Tercera fila */}
            <div className="hero-main">
                <div className="hero-text">
                    <span className="tag2">Playlists Personalizadas</span>
                    <h1>Recomendaciones musicales que se adaptan a tu estado de ánimo</h1>
                    <p>
                        Generamos listas de reproducción únicas basadas en tu emoción
                        actual usando Spotify, para acompañar o transformar tu estado de ánimo.
                    </p>

                    <div className="hero-buttons">
                        <Link href={route("Info")} className="btnOutline">
                            Conocer más
                        </Link>
                    </div>
                </div>
                <div className="hero-image">
                    <img src={hero3} alt="Persona escuchando música" />
                </div>
            </div>
            {/* Cuarta fila */}
            <div className="hero-feature">
                <img src={hero4} alt="Ilustración musical" className="hero-feature-img" />
                <div className="hero-feature-text">
                    <span className="tag">Historial de estados de ánimo</span>
                    <h2>Guardá y revisá cómo tu música evoluciona con tus emociones</h2>
                    <p>
                        Accedé a un registro privado de tus análisis posteriores y las playlists
                        generadas para reflexionar o revivir esos momentos.
                    </p>
                    <Link href={route("Info")} className="btnOutline">
                        Conocer más
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
