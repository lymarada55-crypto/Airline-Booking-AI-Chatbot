<?php

namespace App\Repositories;

use App\Models\Airport;
use App\Models\Booking;
use App\Models\Flight;
use App\Models\TravelServiceReservation;
use App\Models\User;
use Carbon\Carbon;

class DashboardRepository
{
    public function getTotalFlights(): int
    {
        return Flight::count();
    }

    public function getTotalBookings(): int
    {
        return Booking::count();
    }

    public function getTotalUsers(): int
    {
        return User::count();
    }

    public function getRevenue(): float
    {
        $flightRevenue = (float) Booking::whereIn('status', ['paid', 'PAID', 'success', 'completed'])
            ->sum('total_amount');

        $travelRevenue = (float) TravelServiceReservation::whereIn('status', ['paid', 'confirmed', 'completed'])
            ->sum('total_price');

        return $flightRevenue + $travelRevenue;
    }

    public function getGrowthMetrics(): array
    {
        $now = Carbon::now();
        $thisMonthStart = $now->copy()->startOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        $calcPct = function (float $current, float $previous): float {
            if ($previous <= 0) {
                return $current > 0 ? 100.0 : 0.0;
            }
            return round((($current - $previous) / $previous) * 100, 1);
        };

        $usersCurr = User::where('created_at', '>=', $thisMonthStart)->count();
        $usersPrev = User::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        $bookingsCurr = Booking::where('created_at', '>=', $thisMonthStart)->count();
        $bookingsPrev = Booking::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        $flightsCurr = Flight::where('departure_time', '>=', $thisMonthStart)->count();
        $flightsPrev = Flight::whereBetween('departure_time', [$lastMonthStart, $lastMonthEnd])->count();

        $revCurr = (float) Booking::whereIn('status', ['paid', 'PAID', 'success', 'completed'])
            ->where('created_at', '>=', $thisMonthStart)
            ->sum('total_amount');
        $revPrev = (float) Booking::whereIn('status', ['paid', 'PAID', 'success', 'completed'])
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('total_amount');

        return [
            'usersGrowth' => $calcPct($usersCurr, $usersPrev),
            'bookingsGrowth' => $calcPct($bookingsCurr, $bookingsPrev),
            'flightsGrowth' => $calcPct($flightsCurr, $flightsPrev),
            'revenueGrowth' => $calcPct($revCurr, $revPrev),
            'pendingBookings' => Booking::where('status', 'pending')->count(),
            'totalAirports' => Airport::count(),
            'totalTravelReservations' => TravelServiceReservation::count(),
        ];
    }

    public function getMonthlyBookings(): array
    {
        $currentYear = Carbon::now()->year;
        $previousYear = $currentYear - 1;

        $labels = [];
        $currentYearData = [];
        $previousYearData = [];

        for ($month = 1; $month <= 12; $month++) {
            $labels[] = "T{$month}";

            $currentYearData[] = Booking::whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $month)
                ->count();

            $previousYearData[] = Booking::whereYear('created_at', $previousYear)
                ->whereMonth('created_at', $month)
                ->count();
        }

        return [
            'months' => $labels,
            'currentYearLabel' => "Năm {$currentYear}",
            'previousYearLabel' => "Năm {$previousYear}",
            'bookings' => $currentYearData,
            'previousBookings' => $previousYearData,
        ];
    }

    public function getRecentBookings()
    {
        return Booking::with([
            'user:id,name,email',
            'flight:id,flight_number,departure_airport_id,arrival_airport_id',
            'flight.departureAirport:id,code,city',
            'flight.arrivalAirport:id,code,city',
            'tickets:id,booking_id,passenger_name',
        ])
            ->latest()
            ->take(5)
            ->get();
    }

    public function getServiceDistribution(): array
    {
        $flightCount = Booking::count();

        $travelByType = TravelServiceReservation::query()
            ->join('travel_products', 'travel_service_reservations.travel_product_id', '=', 'travel_products.id')
            ->selectRaw('travel_products.type, COUNT(*) as total')
            ->groupBy('travel_products.type')
            ->pluck('total', 'type');

        $hotelCount = (int) ($travelByType['hotel'] ?? 0);
        $carCount = (int) ($travelByType['car'] ?? 0);
        $experienceCount = (int) ($travelByType['experience'] ?? 0);

        $grandTotal = max(1, $flightCount + $hotelCount + $carCount + $experienceCount);

        return [
            'total' => $flightCount + $hotelCount + $carCount + $experienceCount,
            'items' => [
                [
                    'key' => 'flight',
                    'label' => 'Vé máy bay',
                    'count' => $flightCount,
                    'percentage' => round(($flightCount / $grandTotal) * 100),
                    'color' => '#1d75f2',
                ],
                [
                    'key' => 'hotel',
                    'label' => 'Khách sạn',
                    'count' => $hotelCount,
                    'percentage' => round(($hotelCount / $grandTotal) * 100),
                    'color' => '#f59e0b',
                ],
                [
                    'key' => 'car',
                    'label' => 'Thuê xe',
                    'count' => $carCount,
                    'percentage' => round(($carCount / $grandTotal) * 100),
                    'color' => '#10b981',
                ],
                [
                    'key' => 'experience',
                    'label' => 'Trải nghiệm',
                    'count' => $experienceCount,
                    'percentage' => round(($experienceCount / $grandTotal) * 100),
                    'color' => '#ec4899',
                ],
            ],
        ];
    }

    public function getRecentFlights()
    {
        return Flight::with([
            'departureAirport:id,city,name,code',
            'arrivalAirport:id,city,name,code',
        ])
            ->latest()
            ->take(5)
            ->get();
    }
}
