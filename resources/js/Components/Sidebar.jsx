import { Link } from "@inertiajs/react";
import "../../css/dashboard.css";
import Logo from "../../../public/images/logocenter.png";
import HomeIcon from "../../../public/images/sidebar/home.svg?react";
import ExploreIcon from "../../../public/images/sidebar/explore.svg?react";
import RecommendIcon from "../../../public/images/sidebar/recom.svg?react";
import PlaylistsIcon from "../../../public/images/sidebar/playlist.svg?react";
import RecordIcon from "../../../public/images/sidebar/record.svg?react";
import FavoritesIcon from "../../../public/images/sidebar/favorites.svg?react";
import AdminIcon from "../../../public/images/sidebar/admin.svg?react";
import React from "react";
import {route} from "ziggy-js";

export default function Sidebar() {
    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <img src={Logo} alt="Logo" />
            </div>

            <nav className="sidebar-menu">
                <Link
                    href={route("Dashboard")}
                    className={`sidebar-item ${route().current("Dashboard") ? "active" : ""}`}
                >
                    <HomeIcon className="icon3" />
                    Inicio
                </Link>

                <Link
                    href={route("explore")} // cambiar
                    className={`sidebar-item ${route().current("explore") ? "active" : ""}`}
                >
                    <ExploreIcon className="icon3" />
                    Explorar
                </Link>

                <Link
                    href={route("recommend")}
                    className={`sidebar-item ${route().current("recommend") ? "active" : ""}`}
                >
                    <RecommendIcon className="icon3" />
                    Recomendar
                </Link>


                <Link
                    href={route("Record")}
                    className={`sidebar-item ${route().current("Record") ? "active" : ""}`}
                >
                    <RecordIcon className="icon3" />
                    Historial
                </Link>

                <Link
                    href={route("favorites")} // cambiar
                    className={`sidebar-item ${route().current("favorites") ? "active" : ""}`}
                >
                    <FavoritesIcon className="icon3" />
                    Favoritas
                </Link>
                <Link
                    href={route("administrator")}
                    className={`sidebar-item ${route().current("administrator") ? "active" : ""}`}
                >
                    <AdminIcon className="icon3" />
                    Admin
                </Link>
            </nav>
        </div>
    );
}
