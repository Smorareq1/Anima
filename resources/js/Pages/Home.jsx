import { route } from 'ziggy-js';

export default function Home({ mensaje }) {
    return (
        <div>
            <h1>{mensaje}</h1>
            <a href={route('Home')}>Ir al inicio</a> <br />
            <a href={route('Register')}>registro</a> <br />
            <a href={route('Login')}>login</a>
        </div>
    );
}
