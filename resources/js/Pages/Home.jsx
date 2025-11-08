import { route } from 'ziggy-js';
import React from 'react';
import Header from '../Components/Header';
import Hero from '../Components/Hero';
import SpotifySecurity from '../Components/SpotifySecurity';
import CTA from '../Components/CTA';
import Footer from '../Components/Footer';
import {Head} from "@inertiajs/react";

export default function Home({}) {
    return (
        <div>
            <Head title={"Anima"} />
            <Header />
            <Hero />
            <SpotifySecurity />
            <CTA />
            <Footer />
        </div>
    );
}
