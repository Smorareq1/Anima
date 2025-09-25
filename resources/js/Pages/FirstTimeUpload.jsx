import React from "react";
import EmotionUpload from "../Components/EmotionUpload";
import {Link} from "@inertiajs/react";
import Logo from "../../images/logo.png";
import AuthLayout from "../Components/AuthLayout.jsx";
import "../../css/auth.css";

export default function FirstTimeUpload() {
    const leftContent = (
        <div className = "leftContentUpload">
            <div className = "leftContent">
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
                    <h1 className="slogan-title">Empieza a sentir la música</h1>
                    <p className="slogan-sub">Subí una foto o tomate una ahora para que ÁNIMA conozca tu estado de ánimo
                        y te recomiende la playlist perfecta para este momento.</p>
                </div>
            </div>
        </div>
    );

    const rightContent = (
        <EmotionUpload />
    );

    return <AuthLayout leftContent={leftContent} rightContent={rightContent} />;
}
