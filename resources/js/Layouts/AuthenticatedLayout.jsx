import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import LoadingScreen from '@/Components/LoadingScreen'; // Asegúrate que el alias '@' apunte a 'resources/js'

// Frases que puedes mostrar durante la navegación
const frasesNavegacion = [
    "Cambiando de ambiente...",
    "Preparando tu próxima experiencia...",
    "Viajando a la velocidad del sonido...",
    "Sintonizando nuevas vibras..."
];

export default function AuthenticatedLayout({ user, header, children }) {
    // 2. Estado de Navegación: Crea un estado isNavigating para controlar la visibilidad.
    const [isNavigating, setIsNavigating] = useState(false);

    // 3. Usa useEffect para los Eventos
    useEffect(() => {
        const handleStart = () => setIsNavigating(true);
        const handleFinish = () => setIsNavigating(false);

        // Se dispara cuando una visita de Inertia comienza.
        router.on('start', handleStart);
        // Se dispara cuando la visita termina.
        router.on('finish', handleFinish);

        // Función de Limpieza: Elimina los listeners para prevenir fugas de memoria.
        return () => {
            router.off('start', handleStart);
            router.off('finish', handleFinish);
        };
    }, []); // El array vacío asegura que esto se ejecute solo una vez.

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* 4. Integra LoadingScreen: Se mostrará u ocultará automáticamente */}
            <LoadingScreen isLoading={isNavigating} phrases={frasesNavegacion} />

            {/* Aquí iría el resto de tu layout, como la barra de navegación */}
            {/* <nav> ... Tu Navbar ... </nav> */}

            {header && (
                <header className="bg-white dark:bg-gray-800 shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}