import { useState } from "react";
import "../../css/testimonial.css";

import MartinPhoto from "../../images/testimonials/martin.jpg";
import LuciaPhoto from "../../images/testimonials/lucia.jpg";
import CarlosPhoto from "../../images/testimonials/carlos.jpg";
import StarIcon from "@/Components/StarIcon.jsx";

export default function TestimonialCard() {
    const testimonios = [
        {
            title: "Increíble experiencia",
            name: "Martin S.",
            text: "Subí una foto después de un día agotador, y ÁNIMA no solo detectó mi cansancio, sino que me armó una playlist tan relajante que me transportó a otro mundo. ¡Acertó con cada canción! La uso todos los días para elegir la música según cómo me siento.",
            rating: 5,
            photo: MartinPhoto,
        },
        {
            title: "Justo lo que necesitaba",
            name: "Lucía P.",
            text: "Me encanta cómo ÁNIMA siempre encuentra la música perfecta según mi estado de ánimo. Es como si me conociera mejor que yo misma.",
            rating: 4,
            photo: LuciaPhoto,
        },
        {
            title: "Sorprendente y útil",
            name: "Carlos G.",
            text: "Nunca pensé que un algoritmo pudiera elegir tan bien música para mí. Ahora no puedo vivir sin usarlo todos los días.",
            rating: 5,
            photo: CarlosPhoto,
        },
    ];

    const [index, setIndex] = useState(0);

    return (
        <div className="testimonial-card">
            <h3 className="testimonial-title">{testimonios[index].title}</h3>
            <p className="testimonial-text">“{testimonios[index].text}”</p>
            <div className="testimonial-footer">
                <div className="testimonial-user">
                    <img
                        src={testimonios[index].photo}
                        alt={testimonios[index].name}
                        className="testimonial-photo"
                    />
                    <span className="testimonial-name">{testimonios[index].name}</span>
                </div>
                <div className="testimonial-rating">
                    {Array.from({ length: testimonios[index].rating }).map((_, i) => (
                        <StarIcon key={i} size={20} className="star" />
                    ))}
                </div>
            </div>

            <div className="testimonial-dots">
                {testimonios.map((_, i) => (
                    <button
                        key={i}
                        className={`dot ${i === index ? "active" : ""}`}
                        onClick={() => setIndex(i)}
                    />
                ))}
            </div>
        </div>
    );
}
