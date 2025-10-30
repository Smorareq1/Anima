import React from "react";
import Logo from "../../../public/images/logo.png";
import { FaFacebook, FaInstagram, FaXTwitter } from "react-icons/fa6"; // librería react-icons

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-top">
                <p>© 2025 ÁNIMA. Todos los derechos reservados.</p>
                <div className="footer-socials">
                    <span>Síguenos en</span>
                    {/* editar los links a las redes sociales */}
                    <a href="https://facebook.com" target="_blank" rel="noreferrer">
                        <FaFacebook />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer">
                        <FaInstagram />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer">
                        <FaXTwitter />
                    </a>
                </div>
            </div>

            <div className="footer-divider"></div>

            <div className="footer-bottom">
                <img src={Logo} alt="ÁNIMA" className="footer-logo" />
            </div>
        </footer>
    );
}
