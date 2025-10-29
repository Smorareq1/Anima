import React from "react";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import "../../css/Home.css";
import logo from "../../../public/images/logo2.png";

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

                </div>

                <div className="authButtons">
                    <Link href={route("auth.login.show")} className="btnOutline">Inicia sesión</Link>
                    <Link href={route("auth.register.show")} className="btnPrimary">Regístrate</Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
