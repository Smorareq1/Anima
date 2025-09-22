import AuthLayout from "@/Components/AuthLayout.jsx";
import "../../css/auth.css";
import TestimonialCard from "@/Components/TestimonialCard.jsx";
import Logo from "../../images/logo.png";
import SpotifyButton from "@/Components/SpotifyRegButton.jsx";
import RegisterForm from "@/Components/RegisterForm.jsx";

export default function Register() {
    const leftContent = (
        <div className = "leftContent">
            <div className="logo-container">
                <img src={Logo} alt="ÁNIMA Logo" className="logo" />
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
            <RegisterForm />
            <div className="divider">
                <span className="dot"></span>
            </div>
            <SpotifyButton />
        </div>
    );

    return <AuthLayout leftContent={leftContent} rightContent={rightContent} />;
}
