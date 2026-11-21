<?php

namespace Tests\Feature;

use App\Models\Aircraft;
use App\Models\Airport;
use App\Models\Booking;
use App\Models\Flight;
use App\Models\Payment;
use App\Models\Seat;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class FlightBookingJourneyTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_search_select_a_seat_create_a_booking_and_pay_for_it(): void
    {
        Cache::flush();

        $user = User::factory()->create();
        $departureAirport = Airport::create([
            'code' => 'HAN',
            'name' => 'Noi Bai International Airport',
            'city' => 'Hanoi',
        ]);
        $arrivalAirport = Airport::create([
            'code' => 'SGN',
            'name' => 'Tan Son Nhat International Airport',
            'city' => 'Ho Chi Minh City',
        ]);
        $aircraft = Aircraft::create([
            'model' => 'Airbus A320',
            'tail_number' => 'VN-A320',
            'status' => 1,
        ]);
        $seat = Seat::create([
            'aircraft_id' => $aircraft->id,
            'seat_number' => '12A',
            'seat_class' => 'economy',
            'status' => 'available',
        ]);

        $departureDate = now()->addDays(7);
        foreach (['06:00:00', '09:00:00', '12:00:00', '15:00:00', '18:00:00'] as $index => $departureTime) {
            Flight::create([
                'flight_number' => 'VN'.(200 + $index),
                'departure_airport_id' => $departureAirport->id,
                'arrival_airport_id' => $arrivalAirport->id,
                'aircraft_id' => $aircraft->id,
                'departure_time' => $departureDate->copy()->setTimeFromTimeString($departureTime),
                'arrival_time' => $departureDate->copy()->setTimeFromTimeString($departureTime)->addHours(2),
                'base_price' => 1_000_000,
                'available_seats' => 180,
                'status' => 'scheduled',
            ]);
        }

        $searchResponse = $this->getJson('/api/flights?'.http_build_query([
            'from' => 'HAN',
            'to' => 'SGN',
            'date' => $departureDate->toDateString(),
        ]))
            ->assertOk()
            ->assertJsonPath('results', 5);

        $flightId = $searchResponse->json('data.0.id');

        $this->getJson("/api/flights/{$flightId}/seats")
            ->assertOk()
            ->assertJsonPath('data.0.seat_number', '12A')
            ->assertJsonPath('data.0.is_locked', false);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/bookings/lock-seat', [
                'flight_id' => $flightId,
                'outbound_seat_ids' => [$seat->id],
            ])
            ->assertOk();

        $bookingResponse = $this->postJson('/api/bookings', [
            'flight_id' => $flightId,
            'passengers' => [[
                'name' => 'Nguyen Van A',
                'identity_number' => '012345678901',
                'outbound_seat_id' => $seat->id,
            ]],
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.tickets.0.passenger_name', 'Nguyen Van A')
            ->assertJsonPath('data.tickets.0.seat.seat_number', '12A');

        $bookingId = $bookingResponse->json('data.id');
        $pnrCode = $bookingResponse->json('data.pnr_code');

        $this->assertNotEmpty($pnrCode);
        $this->assertDatabaseHas('bookings', [
            'id' => $bookingId,
            'user_id' => $user->id,
            'flight_id' => $flightId,
            'status' => 'pending',
        ]);
        $this->assertDatabaseHas('tickets', [
            'booking_id' => $bookingId,
            'flight_id' => $flightId,
            'seat_id' => $seat->id,
            'passenger_name' => 'Nguyen Van A',
            'identity_number' => '012345678901',
        ]);

        $this->postJson('/api/bookings/pay', [
            'booking_ids' => [$bookingId],
            'payment_method' => 'vnpay',
        ])
            ->assertOk()
            ->assertJsonPath('status', 'success');

        $this->assertSame('paid', Booking::findOrFail($bookingId)->status);
        $this->assertSame(1_800_000, Payment::where('booking_id', $bookingId)->value('amount'));
        $this->assertSame(1, Payment::where('booking_id', $bookingId)->count());
        $this->assertSame(1, Ticket::where('booking_id', $bookingId)->count());

        $this->getJson("/api/bookings/{$bookingId}")
            ->assertOk()
            ->assertJsonPath('data.status', 'paid')
            ->assertJsonPath('data.pnr_code', $pnrCode)
            ->assertJsonPath('data.tickets.0.identity_number', '012345678901');

        $this->getJson("/api/flights/{$flightId}/seats")
            ->assertOk()
            ->assertJsonPath('data.0.is_locked', true);
    }
}
