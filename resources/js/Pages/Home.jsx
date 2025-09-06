import { route } from 'ziggy-js';

export default function Home({ mensaje }) {
    return (
        <div>
            <h1>{mensaje}</h1>
            <a href={route('home')}>Ir al inicio</a>
        </div>
    );
}
