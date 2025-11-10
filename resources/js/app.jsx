import './bootstrap';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { LoadingProvider, useLoading } from './Context/LoadingContext';
import LoadingScreen from './Components/LoadingScreen';
import React from 'react';

// Componente intermedio para acceder al contexto
const AppWrapper = ({ App, props }) => {
    const { isLoading, loadingPhrases } = useLoading();

    return (
        <>
            <App {...props} />
            <LoadingScreen isLoading={isLoading} phrases={loadingPhrases} />
        </>
    );
};

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <LoadingProvider>
                <AppWrapper App={App} props={props} />
            </LoadingProvider>
        );
    },
});
