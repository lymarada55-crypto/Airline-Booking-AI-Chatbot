<?php

namespace Tests\Feature;

use App\Models\TravelProduct;
use App\Models\TravelServicePayment;
use App\Models\TravelServiceReservation;
use App\Models\Airport;
use App\Models\Aircraft;
use App\Models\Booking;
use App\Models\Flight;
use App\Models\User;
use Database\Seeders\TravelProductSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TravelServiceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_travel_service_search_filters_by_type_and_query(): void
    {
        TravelProduct::create([
            'type' => 'hotel',
            'name' => 'Khách sạn Đà Nẵng',
            'slug' => 'khach-san-da-nang',
            'city' => 'Đà Nẵng',
            'description' => 'Gần biển',
            'price' => 1000000,
            'price_unit' => 'đêm',
            'rating' => 4.5,
            'max_guests' => 4,
        ]);
        TravelProduct::create([
            'type' => 'car',
            'name' => 'Xe Đà Nẵng',
            'slug' => 'xe-da-nang',
            'city' => 'Đà Nẵng',
            'description' => 'Xe thuê',
            'price' => 500000,
            'price_unit' => 'ngày',
            'rating' => 4.2,
            'max_guests' => 4,
        ]);

        $this->getJson('/api/travel-services/hotel?q=Đà%20Nẵng&guests=2')
            ->assertOk()
            ->assertJsonPath('type', 'hotel')
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.name', 'Khách sạn Đà Nẵng');
    }

    public function test_authenticated_user_can_book_a_hotel(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $hotel = TravelProduct::create([
            'type' => 'hotel',
            'name' => 'Khách sạn kiểm thử',
            'slug' => 'khach-san-kiem-thu',
            'city' => 'Đà Nẵng',
            'description' => 'Phòng nghỉ',
            'price' => 1000000,
            'price_unit' => 'đêm',
            'max_guests' => 4,
        ]);

        $response = $this->postJson("/api/travel-services/hotel/{$hotel->id}/reservations", [
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'guest_count' => 2,
            'guest_name' => 'Nguyễn An',
            'guest_email' => 'an@example.com',
            'guest_phone' => '+84 90 123 4567',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'pending_payment')
            ->assertJsonPath('data.payment_status', 'unpaid')
            ->assertJsonPath('data.guest_name', 'Nguyễn An')
            ->assertJsonPath('data.guest_email', 'an@example.com')
            ->assertJsonPath('data.total_price', '2000000.00');

        $this->assertDatabaseHas('travel_service_reservations', [
            'travel_product_id' => $hotel->id,
            'user_id' => $user->id,
            'total_price' => 2000000,
            'status' => 'pending_payment',
            'guest_name' => 'Nguyễn An',
            'guest_email' => 'an@example.com',
            'guest_phone' => '+84 90 123 4567',
        ]);
    }

    public function test_user_can_link_service_reservation_to_their_paid_flight_booking(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $booking = $this->createPaidBookingFor($user);
        $hotel = TravelProduct::create([
            'type' => 'hotel',
            'name' => 'Khách sạn gắn với vé',
            'slug' => 'khach-san-gan-voi-ve',
            'city' => 'Đà Nẵng',
            'description' => 'Phòng nghỉ',
            'price' => 1000000,
            'price_unit' => 'đêm',
            'max_guests' => 4,
        ]);

        $response = $this->postJson("/api/travel-services/hotel/{$hotel->id}/reservations", [
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addDays(4)->toDateString(),
            'guest_count' => 2,
            'guest_name' => 'Trần Bình',
            'guest_email' => 'binh@example.com',
            'guest_phone' => '0901234567',
            'booking_id' => $booking->id,
        ])
            ->assertCreated()
            ->assertJsonPath('data.booking.pnr_code', $booking->pnr_code);

        $this->assertDatabaseHas('travel_service_reservations', [
            'travel_product_id' => $hotel->id,
            'user_id' => $user->id,
            'booking_id' => $booking->id,
        ]);

        $this->patchJson("/api/travel-service-reservations/{$response->json('data.id')}/cancel")
            ->assertOk();

        $this->assertSame('paid', $booking->fresh()->status);
    }

    public function test_user_cannot_link_service_reservation_to_another_users_booking(): void
    {
        $user = User::factory()->create();
        $bookingOwner = User::factory()->create();
        Sanctum::actingAs($user);

        $booking = $this->createPaidBookingFor($bookingOwner);
        $hotel = TravelProduct::create([
            'type' => 'hotel',
            'name' => 'Khách sạn không được gắn',
            'slug' => 'khach-san-khong-duoc-gan',
            'city' => 'Đà Nẵng',
            'description' => 'Phòng nghỉ',
            'price' => 1000000,
            'price_unit' => 'đêm',
            'max_guests' => 4,
        ]);

        $this->postJson("/api/travel-services/hotel/{$hotel->id}/reservations", [
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addDays(4)->toDateString(),
            'guest_count' => 2,
            'guest_name' => 'Lê Chi',
            'guest_email' => 'chi@example.com',
            'guest_phone' => '0901234567',
            'booking_id' => $booking->id,
        ])->assertNotFound();

        $this->assertSame(0, TravelServiceReservation::count());
    }

    public function test_user_can_pay_for_their_hotel_separately_without_changing_flight_payment(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $booking = $this->createPaidBookingFor($user);
        $reservation = $this->createHotelReservationFor($user);

        $this->postJson("/api/travel-service-reservations/{$reservation->id}/pay", [
            'payment_method' => 'vnpay',
        ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.status', 'pending_confirmation')
            ->assertJsonPath('data.payments.0.payment_method', 'vnpay')
            ->assertJsonPath('demo_payment', true);

        $this->assertDatabaseHas('travel_service_payments', [
            'travel_service_reservation_id' => $reservation->id,
            'amount' => 2350000,
            'payment_method' => 'vnpay',
            'status' => 'success',
        ]);
        $this->assertSame('paid', $booking->fresh()->status);

        $this->postJson("/api/travel-service-reservations/{$reservation->id}/pay", [
            'payment_method' => 'momo',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('payment_status');
        $this->assertSame(1, TravelServicePayment::count());

        $this->patchJson("/api/travel-service-reservations/{$reservation->id}/cancel")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('payment_status');
        $this->assertSame('pending_confirmation', $reservation->fresh()->status);
    }

    public function test_user_cannot_pay_for_another_users_hotel_reservation(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        Sanctum::actingAs($otherUser);
        $reservation = $this->createHotelReservationFor($owner);

        $this->postJson("/api/travel-service-reservations/{$reservation->id}/pay", [
            'payment_method' => 'momo',
        ])->assertNotFound();

        $this->assertSame(0, TravelServicePayment::count());
    }

    public function test_user_can_pay_for_experience_separately_and_amount_matches_guest_count(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $reservation = $this->createExperienceReservationFor($user);

        $this->postJson("/api/travel-service-reservations/{$reservation->id}/pay", [
            'payment_method' => 'vnpay',
        ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.status', 'pending_confirmation')
            ->assertJsonPath('data.payments.0.amount', 900000)
            ->assertJsonPath('message', 'Thanh toán trải nghiệm thành công.');

        $this->assertDatabaseHas('travel_service_payments', [
            'travel_service_reservation_id' => $reservation->id,
            'amount' => 900000,
            'payment_method' => 'vnpay',
            'status' => 'success',
        ]);
    }

    public function test_user_can_pay_for_car_rental_separately_and_amount_matches_rental_days(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $booking = $this->createPaidBookingFor($user);
        $reservation = $this->createCarReservationFor($user);

        $this->postJson("/api/travel-service-reservations/{$reservation->id}/pay", [
            'payment_method' => 'momo',
        ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'paid')
            ->assertJsonPath('data.status', 'pending_confirmation')
            ->assertJsonPath('data.payments.0.amount', 1000000)
            ->assertJsonPath('message', 'Thanh toán thuê xe thành công.');

        $this->assertDatabaseHas('travel_service_payments', [
            'travel_service_reservation_id' => $reservation->id,
            'amount' => 1000000,
            'payment_method' => 'momo',
            'status' => 'success',
        ]);
        $this->assertSame('paid', $booking->fresh()->status);
    }

    public function test_user_can_book_car_with_primary_renter_contact_details(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $car = TravelProduct::create([
            'type' => 'car',
            'name' => 'Xe thuê có thông tin khách',
            'slug' => 'xe-thue-thong-tin-khach',
            'city' => 'Đà Nẵng',
            'description' => 'Xe tự lái',
            'price' => 250000,
            'price_unit' => 'ngày',
            'max_guests' => 4,
        ]);

        $this->postJson("/api/travel-services/car/{$car->id}/reservations", [
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'guest_count' => 2,
            'quantity' => 1,
            'guest_name' => 'Nguyễn Người Thuê',
            'guest_email' => 'renter@example.com',
            'guest_phone' => '+84 90 123 4567',
        ])
            ->assertCreated()
            ->assertJsonPath('data.guest_name', 'Nguyễn Người Thuê')
            ->assertJsonPath('data.guest_email', 'renter@example.com')
            ->assertJsonPath('data.total_price', '500000.00');
    }

    public function test_car_reservation_requires_valid_primary_renter_contact_details(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $car = TravelProduct::create([
            'type' => 'car',
            'name' => 'Xe thuê yêu cầu thông tin khách',
            'slug' => 'xe-thue-yeu-cau-thong-tin-khach',
            'city' => 'Đà Nẵng',
            'description' => 'Xe tự lái',
            'price' => 250000,
            'price_unit' => 'ngày',
            'max_guests' => 4,
        ]);
        $bookingData = [
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'guest_count' => 2,
        ];

        $this->postJson("/api/travel-services/car/{$car->id}/reservations", $bookingData)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['guest_name', 'guest_email', 'guest_phone']);

        $this->postJson("/api/travel-services/car/{$car->id}/reservations", array_merge($bookingData, [
            'guest_name' => 'Nguyễn Người Thuê',
            'guest_email' => 'not-an-email',
            'guest_phone' => 'invalid',
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['guest_email', 'guest_phone']);

        $this->assertSame(0, TravelServiceReservation::count());
    }

    private function createCarReservationFor(User $user): TravelServiceReservation
    {
        $car = TravelProduct::create([
            'type' => 'car',
            'name' => 'Xe chờ thanh toán',
            'slug' => 'xe-cho-thanh-toan-' . $user->id,
            'city' => 'Đà Nẵng',
            'description' => 'Thuê xe tự lái',
            'price' => 250000,
            'price_unit' => 'ngày',
            'max_guests' => 4,
        ]);

        return TravelServiceReservation::create([
            'travel_product_id' => $car->id,
            'user_id' => $user->id,
            'reference_code' => 'CARPAY' . str_pad((string) $user->id, 4, '0', STR_PAD_LEFT),
            'start_date' => now()->addDays(2)->toDateString(),
            'end_date' => now()->addDays(4)->toDateString(),
            'quantity' => 2,
            'guest_count' => 2,
            'unit_price' => 250000,
            'total_price' => 1000000,
            'status' => 'pending_payment',
        ]);
    }

    private function createExperienceReservationFor(User $user): TravelServiceReservation
    {
        $experience = TravelProduct::create([
            'type' => 'experience',
            'name' => 'Trải nghiệm chờ thanh toán',
            'slug' => 'trai-nghiem-cho-thanh-toan-' . $user->id,
            'city' => 'Đà Nẵng',
            'description' => 'Trải nghiệm trong ngày',
            'price' => 300000,
            'price_unit' => 'người',
            'max_guests' => 4,
        ]);

        return TravelServiceReservation::create([
            'travel_product_id' => $experience->id,
            'user_id' => $user->id,
            'reference_code' => 'EXPPAY' . str_pad((string) $user->id, 4, '0', STR_PAD_LEFT),
            'start_date' => now()->addDays(2)->toDateString(),
            'quantity' => 1,
            'guest_count' => 3,
            'unit_price' => 300000,
            'total_price' => 900000,
            'status' => 'pending_payment',
        ]);
    }

    private function createHotelReservationFor(User $user): TravelServiceReservation
    {
        $hotel = TravelProduct::create([
            'type' => 'hotel',
            'name' => 'Khách sạn chờ thanh toán',
            'slug' => 'khach-san-cho-thanh-toan-' . $user->id,
            'city' => 'Đà Nẵng',
            'description' => 'Phòng nghỉ',
            'price' => 2350000,
            'price_unit' => 'đêm',
            'max_guests' => 4,
        ]);

        return TravelServiceReservation::create([
            'travel_product_id' => $hotel->id,
            'user_id' => $user->id,
            'reference_code' => 'HOTELPAY' . str_pad((string) $user->id, 4, '0', STR_PAD_LEFT),
            'start_date' => now()->addDays(2)->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
            'quantity' => 1,
            'guest_count' => 1,
            'unit_price' => 2350000,
            'total_price' => 2350000,
            'status' => 'booked',
        ]);
    }

    public function test_user_cannot_link_service_reservation_to_an_unpaid_booking(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $booking = $this->createPaidBookingFor($user, 'pending');
        $hotel = TravelProduct::create([
            'type' => 'hotel',
            'name' => 'Khách sạn chưa thanh toán',
            'slug' => 'khach-san-chua-thanh-toan',
            'city' => 'Đà Nẵng',
            'description' => 'Phòng nghỉ',
            'price' => 1000000,
            'price_unit' => 'đêm',
            'max_guests' => 4,
        ]);

        $this->postJson("/api/travel-services/hotel/{$hotel->id}/reservations", [
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addDays(4)->toDateString(),
            'guest_count' => 2,
            'guest_name' => 'Khách thử',
            'guest_email' => 'guest@example.com',
            'guest_phone' => '0901234567',
            'booking_id' => $booking->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('booking_id');

        $this->assertSame(0, TravelServiceReservation::count());
    }

    public function test_hotel_reservation_requires_valid_primary_guest_contact_details(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $hotel = TravelProduct::create([
            'type' => 'hotel',
            'name' => 'Khách sạn cần thông tin khách',
            'slug' => 'khach-san-thong-tin-khach',
            'city' => 'Đà Nẵng',
            'description' => 'Phòng nghỉ',
            'price' => 1000000,
            'price_unit' => 'đêm',
            'max_guests' => 2,
        ]);
        $bookingData = [
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addDays(4)->toDateString(),
            'guest_count' => 1,
        ];

        $this->postJson("/api/travel-services/hotel/{$hotel->id}/reservations", $bookingData)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['guest_name', 'guest_email', 'guest_phone']);

        $this->postJson("/api/travel-services/hotel/{$hotel->id}/reservations", array_merge($bookingData, [
            'guest_name' => 'Khách thử',
            'guest_email' => 'invalid-email',
            'guest_phone' => 'abc',
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['guest_email', 'guest_phone']);

        $this->assertSame(0, TravelServiceReservation::count());
    }

    private function createPaidBookingFor(User $user, string $status = 'paid'): Booking
    {
        $departureAirport = Airport::create([
            'code' => 'HAN',
            'name' => 'Sân bay Nội Bài',
            'city' => 'Hà Nội',
        ]);
        $arrivalAirport = Airport::create([
            'code' => 'DAD',
            'name' => 'Sân bay Đà Nẵng',
            'city' => 'Đà Nẵng',
        ]);
        $aircraft = Aircraft::create([
            'tail_number' => 'VN-A123',
            'model' => 'Airbus A320',
        ]);
        $flight = Flight::create([
            'flight_number' => 'VN123',
            'departure_airport_id' => $departureAirport->id,
            'arrival_airport_id' => $arrivalAirport->id,
            'departure_time' => now()->addDays(3),
            'arrival_time' => now()->addDays(3)->addHours(2),
            'aircraft_id' => $aircraft->id,
            'base_price' => 1000000,
            'available_seats' => 100,
            'status' => 'scheduled',
        ]);

        return Booking::create([
            'user_id' => $user->id,
            'flight_id' => $flight->id,
            'pnr_code' => strtoupper(\Illuminate\Support\Str::random(6)),
            'total_amount' => 1000000,
            'status' => $status,
        ]);
    }

    public function test_experience_reservation_price_is_calculated_per_guest(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $experience = TravelProduct::create([
            'type' => 'experience',
            'name' => 'Tour thử nghiệm',
            'slug' => 'tour-thu-nghiem',
            'city' => 'Hội An',
            'description' => 'Tour trong ngày',
            'price' => 300000,
            'price_unit' => 'người',
            'max_guests' => 8,
        ]);

        $this->postJson("/api/travel-services/experience/{$experience->id}/reservations", [
            'start_date' => now()->addDays(2)->toDateString(),
            'guest_count' => 3,
            'guest_name' => 'Nguyễn Trải Nghiệm',
            'guest_email' => 'experience@example.com',
            'guest_phone' => '+84 90 123 4567',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending_payment')
            ->assertJsonPath('data.payment_status', 'unpaid')
            ->assertJsonPath('data.guest_name', 'Nguyễn Trải Nghiệm')
            ->assertJsonPath('data.guest_email', 'experience@example.com')
            ->assertJsonPath('data.total_price', '900000.00');
    }

    public function test_experience_reservation_requires_valid_primary_contact_details(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $experience = TravelProduct::create([
            'type' => 'experience',
            'name' => 'Tour cần thông tin liên hệ',
            'slug' => 'tour-thong-tin-lien-he',
            'city' => 'Hội An',
            'description' => 'Tour trong ngày',
            'price' => 300000,
            'price_unit' => 'người',
            'max_guests' => 8,
        ]);
        $bookingData = [
            'start_date' => now()->addDays(2)->toDateString(),
            'guest_count' => 2,
        ];

        $this->postJson("/api/travel-services/experience/{$experience->id}/reservations", $bookingData)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['guest_name', 'guest_email', 'guest_phone']);

        $this->postJson("/api/travel-services/experience/{$experience->id}/reservations", array_merge($bookingData, [
            'guest_name' => 'Khách trải nghiệm',
            'guest_email' => 'not-an-email',
            'guest_phone' => 'invalid',
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['guest_email', 'guest_phone']);

        $this->assertSame(0, TravelServiceReservation::count());
    }

    public function test_hotel_reservation_requires_a_valid_checkout_date(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $hotel = TravelProduct::create([
            'type' => 'hotel',
            'name' => 'Khách sạn kiểm thử',
            'slug' => 'khach-san-ngay-thieu',
            'city' => 'Hà Nội',
            'description' => 'Phòng nghỉ',
            'price' => 1000000,
            'price_unit' => 'đêm',
            'max_guests' => 2,
        ]);

        $this->postJson("/api/travel-services/hotel/{$hotel->id}/reservations", [
            'start_date' => now()->addDays(3)->toDateString(),
            'guest_count' => 1,
            'guest_name' => 'Khách thử',
            'guest_email' => 'guest@example.com',
            'guest_phone' => '0901234567',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('end_date');

        $this->assertSame(0, TravelServiceReservation::count());
    }

    public function test_admin_can_confirm_a_pending_service_reservation(): void
    {
        $admin = User::factory()->create();
        $adminRoleId = DB::table('roles')->insertGetId([
            'name' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $admin->roles()->attach($adminRoleId);
        Sanctum::actingAs($admin);

        $product = TravelProduct::create([
            'type' => 'car',
            'name' => 'Xe quản trị',
            'slug' => 'xe-quan-tri',
            'city' => 'Hà Nội',
            'description' => 'Xe thuê',
            'price' => 500000,
            'price_unit' => 'ngày',
            'max_guests' => 4,
        ]);
        $reservation = TravelServiceReservation::create([
            'travel_product_id' => $product->id,
            'user_id' => $admin->id,
            'reference_code' => 'TESTADMIN01',
            'start_date' => now()->addDays(2)->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
            'quantity' => 1,
            'guest_count' => 2,
            'unit_price' => 500000,
            'total_price' => 500000,
            'status' => 'pending_confirmation',
            'payment_status' => 'paid',
        ]);

        $this->patchJson("/api/admin/travel-service-reservations/{$reservation->id}", [
            'status' => 'confirmed',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('travel_service_reservations', [
            'id' => $reservation->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_admin_reservation_list_includes_payment_booking_and_search_filters(): void
    {
        $admin = User::factory()->create();
        $adminRoleId = DB::table('roles')->insertGetId([
            'name' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $admin->roles()->attach($adminRoleId);
        $customer = User::factory()->create(['name' => 'Khách hàng quản lý dịch vụ']);
        Sanctum::actingAs($admin);

        $reservation = $this->createHotelReservationFor($customer);
        $booking = $this->createPaidBookingFor($customer);
        $reservation->update([
            'booking_id' => $booking->id,
            'payment_status' => 'paid',
            'guest_name' => 'Nguyễn Khách',
            'guest_email' => 'guest@example.com',
            'guest_phone' => '+84 90 123 4567',
        ]);
        TravelServicePayment::create([
            'travel_service_reservation_id' => $reservation->id,
            'transaction_id' => 'ADMIN-TRAVEL-PAYMENT-1',
            'amount' => 2350000,
            'payment_method' => 'vnpay',
            'status' => 'success',
            'paid_at' => now(),
        ]);

        $this->getJson('/api/admin/travel-service-reservations?search=ADMIN-TRAVEL-PAYMENT-1&payment_status=paid')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.reference_code', $reservation->reference_code)
            ->assertJsonPath('data.data.0.user.email', $customer->email)
            ->assertJsonPath('data.data.0.guest_name', 'Nguyễn Khách')
            ->assertJsonPath('data.data.0.guest_phone', '+84 90 123 4567')
            ->assertJsonPath('data.data.0.booking.pnr_code', $booking->pnr_code)
            ->assertJsonPath('data.data.0.payments.0.transaction_id', 'ADMIN-TRAVEL-PAYMENT-1');
    }

    public function test_admin_cannot_cancel_paid_travel_reservation_without_refund_flow(): void
    {
        $admin = User::factory()->create();
        $adminRoleId = DB::table('roles')->insertGetId([
            'name' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $admin->roles()->attach($adminRoleId);
        $reservation = $this->createHotelReservationFor(User::factory()->create());
        $reservation->update(['payment_status' => 'paid']);
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/travel-service-reservations/{$reservation->id}", [
            'status' => 'cancelled',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $this->assertSame('booked', $reservation->fresh()->status);
    }

    public function test_admin_cannot_confirm_hotel_before_its_payment_succeeds(): void
    {
        $admin = User::factory()->create();
        $adminRoleId = DB::table('roles')->insertGetId([
            'name' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $admin->roles()->attach($adminRoleId);
        $reservation = $this->createHotelReservationFor(User::factory()->create());
        $reservation->update(['status' => 'pending_payment']);
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/travel-service-reservations/{$reservation->id}", [
            'status' => 'confirmed',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $this->assertSame('pending_payment', $reservation->fresh()->status);
    }

    public function test_admin_cannot_confirm_experience_before_its_payment_succeeds(): void
    {
        $admin = User::factory()->create();
        $adminRoleId = DB::table('roles')->insertGetId([
            'name' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $admin->roles()->attach($adminRoleId);
        $reservation = $this->createExperienceReservationFor(User::factory()->create());
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/travel-service-reservations/{$reservation->id}", [
            'status' => 'confirmed',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $this->assertSame('pending_payment', $reservation->fresh()->status);
    }

    public function test_admin_cannot_confirm_car_before_its_payment_succeeds(): void
    {
        $admin = User::factory()->create();
        $adminRoleId = DB::table('roles')->insertGetId([
            'name' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $admin->roles()->attach($adminRoleId);
        $reservation = $this->createCarReservationFor($admin);
        Sanctum::actingAs($admin);

        $this->patchJson("/api/admin/travel-service-reservations/{$reservation->id}", [
            'status' => 'confirmed',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('status');

        $this->assertSame('pending_payment', $reservation->fresh()->status);
    }

    public function test_demo_catalog_seeder_populates_all_service_types(): void
    {
        $this->seed(TravelProductSeeder::class);

        $this->assertDatabaseCount('travel_products', 330);
        $this->assertDatabaseHas('travel_products', ['type' => 'hotel', 'is_demo' => true]);
        $this->assertDatabaseHas('travel_products', ['type' => 'experience', 'is_demo' => true]);
        $this->assertDatabaseHas('travel_products', ['type' => 'car', 'is_demo' => true]);
        $this->assertSame(105, TravelProduct::where('type', 'hotel')->count());
    }

    public function test_demo_catalog_has_fifteen_hotels_with_unique_images_in_each_city(): void
    {
        $this->seed(TravelProductSeeder::class);

        $hotelsByCity = TravelProduct::query()
            ->where('type', 'hotel')
            ->get()
            ->groupBy('city');

        $this->assertCount(7, $hotelsByCity);
        foreach ($hotelsByCity as $hotels) {
            $this->assertCount(15, $hotels);
            $this->assertSame(15, $hotels->pluck('image_url')->filter()->unique()->count());
        }
    }

    public function test_demo_catalog_has_fifteen_rental_cars_in_each_hotel_city(): void
    {
        $this->seed(TravelProductSeeder::class);

        $this->getJson('/api/travel-services/car?per_page=200')
            ->assertOk()
            ->assertJsonPath('data.total', 105)
            ->assertJsonCount(105, 'data.data');

        foreach (['Hà Nội', 'Đà Nẵng', 'TP. Hồ Chí Minh', 'Nha Trang', 'Phú Quốc', 'Đà Lạt', 'Huế'] as $city) {
            $this->getJson('/api/travel-services/car?'.http_build_query(['q' => $city, 'per_page' => 200]))
                ->assertOk()
                ->assertJsonPath('data.total', 15)
                ->assertJsonCount(15, 'data.data')
                ->assertJsonPath('data.data.0.city', $city);
        }
    }

    public function test_demo_catalog_has_fifteen_experiences_in_each_destination_city(): void
    {
        $this->seed(TravelProductSeeder::class);

        $this->getJson('/api/travel-services/experience?per_page=200')
            ->assertOk()
            ->assertJsonPath('data.total', 120)
            ->assertJsonCount(120, 'data.data');

        foreach (['Hà Nội', 'Đà Nẵng', 'TP. Hồ Chí Minh', 'Nha Trang', 'Phú Quốc', 'Đà Lạt', 'Huế', 'Hội An'] as $city) {
            $this->getJson('/api/travel-services/experience?'.http_build_query(['q' => $city, 'per_page' => 200]))
                ->assertOk()
                ->assertJsonPath('data.total', 15)
                ->assertJsonCount(15, 'data.data')
                ->assertJsonPath('data.data.0.city', $city);
        }
    }

    public function test_hotel_search_without_city_returns_all_hotel_choices(): void
    {
        $this->seed(TravelProductSeeder::class);

        $this->getJson('/api/travel-services/hotel')
            ->assertOk()
            ->assertJsonPath('data.total', 105);

        $this->getJson('/api/travel-services/hotel?q=Nha%20Trang')
            ->assertOk()
            ->assertJsonPath('data.total', 15)
            ->assertJsonPath('data.data.0.city', 'Nha Trang');

        $this->getJson('/api/travel-services/hotel?q=Đà%20Lạt')
            ->assertOk()
            ->assertJsonPath('data.total', 15)
            ->assertJsonPath('data.data.0.city', 'Đà Lạt');

        $this->getJson('/api/travel-services/hotel?q=Huế')
            ->assertOk()
            ->assertJsonPath('data.total', 15)
            ->assertJsonPath('data.data.0.city', 'Huế');
    }

    public function test_booking_consumes_inventory_for_overlapping_hotel_dates(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $hotel = TravelProduct::create([
            'type' => 'hotel',
            'name' => 'Khách sạn chỉ còn một phòng',
            'slug' => 'khach-san-mot-phong',
            'city' => 'Hà Nội',
            'description' => 'Kiểm tra tồn kho',
            'price' => 1000000,
            'price_unit' => 'đêm',
            'max_guests' => 2,
            'inventory_count' => 1,
        ]);
        $dates = [
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'guest_count' => 2,
            'quantity' => 1,
            'guest_name' => 'Khách thử',
            'guest_email' => 'guest@example.com',
            'guest_phone' => '0901234567',
            'guest_name' => 'Khách thử',
            'guest_email' => 'guest@example.com',
            'guest_phone' => '0901234567',
        ];

        $this->postJson("/api/travel-services/hotel/{$hotel->id}/reservations", $dates)
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending_payment');

        $this->postJson("/api/travel-services/hotel/{$hotel->id}/reservations", $dates)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('quantity');

        $this->getJson('/api/travel-services/hotel?start_date='.$dates['start_date'].'&end_date='.$dates['end_date'])
            ->assertOk()
            ->assertJsonPath('data.data.0.available_units', 0);
    }

    public function test_cancelling_a_booking_releases_inventory(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $hotel = TravelProduct::create([
            'type' => 'hotel',
            'name' => 'Khách sạn hủy phòng',
            'slug' => 'khach-san-huy-phong',
            'city' => 'Hà Nội',
            'description' => 'Kiểm tra trả tồn kho',
            'price' => 800000,
            'price_unit' => 'đêm',
            'max_guests' => 2,
            'inventory_count' => 1,
        ]);

        $response = $this->postJson("/api/travel-services/hotel/{$hotel->id}/reservations", [
            'start_date' => now()->addDays(3)->toDateString(),
            'end_date' => now()->addDays(4)->toDateString(),
            'guest_count' => 1,
            'guest_name' => 'Khách thử',
            'guest_email' => 'guest@example.com',
            'guest_phone' => '0901234567',
        ])->assertCreated();

        $reservationId = $response->json('data.id');
        $this->patchJson("/api/travel-service-reservations/{$reservationId}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->getJson('/api/travel-services/hotel?start_date='.now()->addDays(3)->toDateString().'&end_date='.now()->addDays(4)->toDateString())
            ->assertOk()
            ->assertJsonPath('data.data.0.available_units', 1);
    }
}
