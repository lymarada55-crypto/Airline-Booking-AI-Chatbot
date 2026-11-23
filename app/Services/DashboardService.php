<?php

namespace App\Services;

use App\Repositories\DashboardRepository;

class DashboardService
{
    public function __construct(
        protected DashboardRepository $repo
    ) {}

    public function getDashboardData(): array
    {
        $growth = $this->repo->getGrowthMetrics();

        return [
            'stats' => [
                'totalFlights' => $this->repo->getTotalFlights(),
                'totalBookings' => $this->repo->getTotalBookings(),
                'totalUsers' => $this->repo->getTotalUsers(),
                'revenue' => $this->repo->getRevenue(),
                'usersGrowth' => $growth['usersGrowth'],
                'bookingsGrowth' => $growth['bookingsGrowth'],
                'flightsGrowth' => $growth['flightsGrowth'],
                'revenueGrowth' => $growth['revenueGrowth'],
                'pendingBookings' => $growth['pendingBookings'],
                'totalAirports' => $growth['totalAirports'],
                'totalTravelReservations' => $growth['totalTravelReservations'],
            ],
            'analytics' => $this->repo->getMonthlyBookings(),
            'recentBookings' => $this->repo->getRecentBookings(),
            'serviceDistribution' => $this->repo->getServiceDistribution(),
            'recentFlights' => $this->repo->getRecentFlights(),
        ];
    }
}
