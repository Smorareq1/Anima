import { route } from 'ziggy-js';
import Header from '../Components/Header';
import Hero from '../Components/Hero';
import SpotifySecurity from '../Components/SpotifySecurity';
import CTA from '../Components/CTA';
import Footer from '../Components/Footer';

export default function Home({ mensaje }) {
    return (
        <div>
            <Header />
            <Hero />
            <SpotifySecurity />
            <CTA />
            <Footer />
        </div>
    );
}
