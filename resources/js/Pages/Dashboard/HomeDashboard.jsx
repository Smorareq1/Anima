import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import { usePage } from '@inertiajs/react';

export default function HomeDashboard() {
    const props = usePage().props; // aquí llegan las props globales
    console.log(props.auth.user);

    return (
        <DashboardLayout>
            <div>
                <h1>Bienvenido, {props.auth.user.username}</h1>
            </div>
        </DashboardLayout>
    );
}
