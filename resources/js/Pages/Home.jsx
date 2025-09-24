import { route } from 'ziggy-js';
import Header from '../Components/Header';
import Hero from '../Components/Hero';
import SpotifySecurity from '../Components/SpotifySecurity';

export default function Home({ mensaje }) {
    return (
        <div>
            <Header />
            <Hero />
            <SpotifySecurity />
        </div>
    );
}
