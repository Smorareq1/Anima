import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import { usePage } from '@inertiajs/react';

export default function HomeDashboard() {
    const props = usePage().props; // aquí llegan las props globales
    console.log(props.auth.user);

    return (
        <DashboardLayout>
            <h1>Bienvenido al Dashboard</h1>
            <p>Este es el contenido inicial.</p>
        </DashboardLayout>
    );
}
