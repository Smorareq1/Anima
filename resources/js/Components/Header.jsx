import React from "react";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import "../../css/Home.css";
import logo from "../../images/logo2.png";

const Header = () => {
    return (
        <header>
            <div className="topBar">
                <p>Una experiencia musical innovadora totalmente gratis.</p>
            </div>

            <div className="mainBar">
                <div className="logoNav">
                    <div className="logoSection">
                        <img src={logo} alt="Ánima logo" className="logo2" />
                    </div>

                    <nav className="nav">
                        <ul>
                            <li><Link href={route("Home")}>Explorar</Link></li>
                            <li><Link href={route("Home")}>Géneros</Link></li>
                            <li><Link href={route("Home")}>Playlists</Link></li>
                        </ul>
                    </nav>
                </div>

                <div className="authButtons">
                    <Link href={route("Login")} className="btnOutline">Inicia sesión</Link>
                    <Link href={route("Register")} className="btnPrimary">Regístrate</Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
