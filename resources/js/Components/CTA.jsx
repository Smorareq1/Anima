import React from "react";
import img1 from "../../images/decoration/cta.png";
import {route} from "ziggy-js";
import {Link} from "@inertiajs/react"; // o .svg según exportes

export default function CTASection() {
    return (
        <section className="cta-wrapper">
            <div className="cta-section">
                <div className="cta-text">
                    <h2>Empieza a usar ÁNIMA hoy</h2>
                    <p>
                        No dejes que tu playlist decida por vos. Conectá tu emoción con la música perfecta en segundos.
                        Dejá que ÁNIMA transforme tu estado de ánimo en canciones.
                    </p>
                    <div className="cta-buttons">
                        <Link href={route("Register")} className="btnPrimary2">
                            Empieza ahora
                        </Link>
                    </div>
                </div>
                <div className="cta-image">
                    <img src={img1} alt="Escuchando música con Ánima" />
                </div>
            </div>
        </section>

    );
}
