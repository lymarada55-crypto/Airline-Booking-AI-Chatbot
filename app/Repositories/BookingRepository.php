<?php

namespace App\Repositories;

use App\Models\Booking;

class BookingRepository implements BookingRepositoryInterface
{
    public function getAll()
    {
        return Booking::with([
            'user',
            'flight.departureAirport',
            'flight.arrivalAirport',
            'tickets.seat',
            'tickets.checkIn',
            'payment'
        ])->latest()->get();
    }

    public function findById(int $id)
    {
        return Booking::with([
            'user',
            'flight.departureAirport',
            'flight.arrivalAirport',
            'tickets.seat',
            'tickets.checkIn',
            'services',
            'payment'
        ])->findOrFail($id);
    }

    public function delete(int $id)
    {
        $booking = Booking::findOrFail($id);

        return $booking->delete();
    }
}