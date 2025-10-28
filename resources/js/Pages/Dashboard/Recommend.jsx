import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import EmotionUpload from "../../Components/EmotionUpload.jsx";
import "../../../css/dashboard.css"

export default function Recommend() {
    return (
        <DashboardLayout title={"Recomendar | Anima"}>
            <div className={"recommend-header"}>
                <h1>Subí tu foto</h1>
                <p>Dejanos traducir tus emociones en una playlist perfecta. Tu estado de ánimo elige la música,
                nosotros solo conectamos los puntos.</p>
            </div>
            <EmotionUpload uploadUrl={route('emotion.upload')} />
        </DashboardLayout>
    );
}
