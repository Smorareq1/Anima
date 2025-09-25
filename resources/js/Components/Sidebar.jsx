import { Link } from "@inertiajs/react";
import "../../css/dashboard.css";
import Logo from "../../images/logocenter.png";
import HomeIcon from "../../images/sidebar/home.svg?react";
import ExploreIcon from "../../images/sidebar/explore.svg?react";
import RecommendIcon from "../../images/sidebar/recom.svg?react";
import PlaylistsIcon from "../../images/sidebar/playlist.svg?react";
import RecordIcon from "../../images/sidebar/record.svg?react";
import FavoritesIcon from "../../images/sidebar/favorites.svg?react";
import React from "react";

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
                    href={route("Home")} // cambiar
                    className={`sidebar-item ${route().current("explore") ? "active" : ""}`}
                >
                    <ExploreIcon className="icon3" />
                    Explorar
                </Link>

                <Link
                    href={route("recommend")} // cambiar
                    className={`sidebar-item ${route().current("recommend") ? "active" : ""}`}
                >
                    <RecommendIcon className="icon3" />
                    Recomendar
                </Link>

                <Link
                    href={route("Home")} // cambiar
                    className={`sidebar-item ${route().current("playlists") ? "active" : ""}`}
                >
                    <PlaylistsIcon className="icon3" />
                    Playlists
                </Link>

                <Link
                    href={route("Home")} // cambiar
                    className={`sidebar-item ${route().current("history") ? "active" : ""}`}
                >
                    <RecordIcon className="icon3" />
                    Historial
                </Link>

                <Link
                    href={route("Home")} // cambiar
                    className={`sidebar-item ${route().current("favorites") ? "active" : ""}`}
                >
                    <FavoritesIcon className="icon3" />
                    Favoritas
                </Link>
            </nav>
        </div>
    );
}
