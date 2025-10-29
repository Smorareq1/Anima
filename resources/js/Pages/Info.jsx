import { route } from 'ziggy-js';
import Header from '../Components/Header';
import FeaturesHeader from '../Components/FeaturesHeader';
import FeaturesHero from '../Components/FeaturesHero';
import Footer from '../Components/Footer';

export default function Info() {
    return (
        <div>
            <Header />
            <FeaturesHeader />
            <FeaturesHero />
            <Footer />
        </div>
    );
}
