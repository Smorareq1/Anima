import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import PlaylistCard from "../../Components/history/PlaylistCard.jsx";
import EmotionSummary from "../../Components/history/EmotionSummary.jsx";
import "../../../css/history.css"
import workoutImg from "../../../images/mock/workout.jpg";
import chillImg from "../../../images/mock/chill.png";

export default function Record() {
    //para las imagenes, al ser mock data, se usan imagenes locales, pero en un caso real serian urls
    const mockData = [
        {
            name: "Workout Energy",
            songs: 50,
            date: "2025-09-20",
            emotion: "HAPPY",
            image: workoutImg
        },
        {
            name: "Chill Vibes",
            songs: 20,
            date: "2025-09-21",
            emotion: "SAD",
            image: chillImg
        },
        {
            name: "Workout Energy",
            songs: 50,
            date: "2025-09-20",
            emotion: "HAPPY",
            image: workoutImg
        },
        {
            name: "Chill Vibes",
            songs: 20,
            date: "2025-09-21",
            emotion: "SAD",
            image: chillImg
        },
        {
            name: "Workout Energy",
            songs: 50,
            date: "2025-09-20",
            emotion: "HAPPY",
            image: workoutImg
        },
        {
            name: "Chill Vibes",
            songs: 20,
            date: "2025-09-21",
            emotion: "SAD",
            image: chillImg
        },
        {
            name: "Workout Energy",
            songs: 50,
            date: "2025-09-20",
            emotion: "HAPPY",
            image: workoutImg
        },
        {
            name: "Chill Vibes",
            songs: 20,
            date: "2025-09-21",
            emotion: "SAD",
            image: chillImg
        },
        {
            name: "Workout Energy",
            songs: 50,
            date: "2025-09-20",
            emotion: "HAPPY",
            image: workoutImg
        },
        {
            name: "Chill Vibes",
            songs: 20,
            date: "2025-09-21",
            emotion: "SAD",
            image: chillImg
        },
        {
            name: "Workout Energy",
            songs: 50,
            date: "2025-09-20",
            emotion: "HAPPY",
            image: workoutImg
        },
        {
            name: "Chill Vibes",
            songs: 20,
            date: "2025-09-21",
            emotion: "SAD",
            image: chillImg
        },
        {
            name: "Workout Energy",
            songs: 50,
            date: "2025-09-20",
            emotion: "HAPPY",
            image: workoutImg
        },
        {
            name: "Chill Vibes",
            songs: 20,
            date: "2025-09-21",
            emotion: "SAD",
            image: chillImg
        },
        {
            name: "Workout Energy",
            songs: 50,
            date: "2025-09-20",
            emotion: "HAPPY",
            image: workoutImg
        },
        {
            name: "Chill Vibes",
            songs: 20,
            date: "2025-09-21",
            emotion: "SAD",
            image: chillImg
        }
    ];
    //mock
    const summary = [
        { emotion: "HAPPY", playlists: 15, songs: 100 },
        { emotion: "SAD", playlists: 5, songs: 50 },
        { emotion: "ANGRY", playlists: 3, songs: 25 },
        { emotion: "CALM", playlists: 7, songs: 70 },
        { emotion: "SURPRISED", playlists: 2, songs: 15 },
        { emotion: "CONFUSED", playlists: 1, songs: 10 },
        { emotion: "DISGUSTED", playlists: 0, songs: 0 },
        { emotion: "FEAR", playlists: 0, songs: 0 },
        { emotion: "UNKNOWN", playlists: 4, songs: 30 },
    ];
    return (
        <DashboardLayout>
            <div className="history-body">
                <div className="history-playlists">
                    {mockData.map((pl, idx) => (
                        <PlaylistCard key={idx} {...pl} />
                    ))}
                </div>

                <div className="history-summary">
                    <EmotionSummary summaryData={summary} />
                </div>
            </div>
        </DashboardLayout>
    );
}
