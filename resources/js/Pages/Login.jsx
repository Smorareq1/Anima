import AuthLayout from "../Components/AuthLayout.jsx";
import "../../css/auth.css";
import TestimonialCard from "../Components/TestimonialCard.jsx";
import Logo from "../../images/logo.png";
import SpotifyButton from "../Components/SpotifyRegButton.jsx";
import LoginForm from "../Components/LoginForm.jsx";
import {Head, Link} from "@inertiajs/react"

export default function Login() {
    const leftContent = (
        <div className = "leftContent">
            <Head title={"Iniciar sesión | Anima"} />
            <div className="logo-container">
                <Link href={route("Home")}>
                    <img
                        src={Logo}
                        alt="Logo"
                        style={{ cursor: "pointer" }}
                    />
                </Link>
            </div>
            <div className="slogan-container">
                <h1 className="slogan-title">Música que refleja <br /> como te sentís</h1>
                <p className="slogan-sub">Sentís la música, nosotros la entendemos.</p>
            </div>
            <div className="testimonial-section">
                <TestimonialCard />
            </div>
        </div>
    );

    const rightContent = (
        <div className="register-container">
            <h2 className="form-title">Inicia sesión</h2>
            <SpotifyButton />
            <div className="divider">
                <span className="dot"></span>
            </div>
            <LoginForm />
        </div>
    );

    return <AuthLayout leftContent={leftContent} rightContent={rightContent} />;
}
