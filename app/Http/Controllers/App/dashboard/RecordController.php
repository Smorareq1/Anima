<?php

namespace App\Http\Controllers\App\dashboard;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecordController extends Controller
{
    public function index()
    {
        //mock data
        $playlists = collect([
                ['name' => 'Workout Energy', 'songs' => 50, 'duration' => '1h 45m', 'date' => '2025-09-20', 'emotion' => 'HAPPY', 'image' => '/images/mock/workout.jpg'],
                ['name' => 'Chill Vibes', 'songs' => 20, 'duration' => '1h 00m', 'date' => '2025-09-21', 'emotion' => 'SAD', 'image' => '/images/mock/chill.jpg'],
                ['name' => 'Focus Beats', 'songs' => 30, 'duration' => '1h 30m', 'date' => '2025-09-22', 'emotion' => 'CALM', 'image' => '/images/mock/focus.jpg'],
                ['name' => 'Party Hits', 'songs' => 40, 'duration' => '2h 00m', 'date' => '2025-09-23', 'emotion' => 'SURPRISED', 'image' => '/images/mock/party.jpg'],
                ['name' => 'Relaxing Sounds', 'songs' => 25, 'duration' => '1h 15m', 'date' => '2025-09-24', 'emotion' => 'CONFUSED', 'image' => '/images/mock/relax.jpg'],
                ['name' => 'Morning Motivation', 'songs' => 35, 'duration' => '1h 20m', 'date' => '2025-09-25', 'emotion' => 'HAPPY', 'image' => '/images/mock/morning.jpg'],
                ['name' => 'Evening Chillout', 'songs' => 28, 'duration' => '1h 10m', 'date' => '2025-09-26', 'emotion' => 'SAD', 'image' => '/images/mock/evening.jpg'],
                ['name' => 'Epic Soundtracks', 'songs' => 45, 'duration' => '2h 15m', 'date' => '2025-09-27', 'emotion' => 'ANGRY', 'image' => '/images/mock/epic.jpg'],
                ['name' => 'Jazz Classics', 'songs' => 22, 'duration' => '1h 05m', 'date' => '2025-09-28', 'emotion' => 'CALM', 'image' => '/images/mock/jazz.jpg'],
                ['name' => 'Rock Anthems', 'songs' => 38, 'duration' => '1h 50m', 'date' => '2025-09-29', 'emotion' => 'DISGUSTED', 'image' => '/images/mock/rock.jpg'],
                ['name' => "Children's Songs", 'songs' => 18, 'duration' => "0h 55m", 'date' => '2025-09-30', 'emotion' => 'HAPPY', 'image' => '/images/mock/children.jpg'],
                ['name' => 'Classical Essentials', 'songs' => 27, 'duration' => '1h 15m', 'date' => '2025-10-01', 'emotion' => 'CALM', 'image' => '/images/mock/classical.jpg'],
                ['name' => 'Hip Hop Beats', 'songs' => 33, 'duration' => '1h 25m', 'date' => '2025-10-02', 'emotion' => 'ANGRY', 'image' => '/images/mock/hiphop.jpg'],
            ])->forPage(request('page', 1), 6); // 6 por página

            // Simular paginator básico
            $pagination = [
                'current_page' => (int) request('page', 1),
                'per_page'     => 6,
                'total'        =>  13 // total (traer la cantidad total desde la base de datos)
            ];


        $summary = [
                    ['emotion' => 'HAPPY', 'playlists' => 15, 'songs' => 100],
                    ['emotion' => 'SAD', 'playlists' => 5, 'songs' => 50],
                    ['emotion' => 'ANGRY', 'playlists' => 3, 'songs' => 25],
                    ['emotion' => 'CONFUSED', 'playlists' => 7, 'songs' => 70],
                    ['emotion' => 'DISGUSTED', 'playlists' => 10, 'songs' => 80],
                    ['emotion' => 'SURPRISED', 'playlists' => 2, 'songs' => 15],
                    ['emotion' => 'CALM', 'playlists' => 8, 'songs' => 60],
                    ['emotion' => 'FEAR', 'playlists' => 4, 'songs' => 30],
                    ['emotion' => 'UNKNOWN', 'playlists' => 4, 'songs' => 30],
                ];

        // Página de historial del dashboard
        return Inertia::render('Dashboard/Record', [
                    'playlists' => $playlists->values(),
                    'summaryData' => $summary,
                    'pagination'  => $pagination,

                ]);

    }
}
