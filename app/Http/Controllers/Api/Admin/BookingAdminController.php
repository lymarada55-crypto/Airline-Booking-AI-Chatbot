<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class BookingAdminController extends Controller
{
    protected BookingService $bookingService;

    public function __construct(
        BookingService $bookingService
    ) {
        $this->bookingService = $bookingService;
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->bookingService->getAllBookings(),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->bookingService->getBookingById($id),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:paid,pending,cancelled'],
        ]);

        $booking = Booking::with(['tickets', 'payment'])->findOrFail($id);
        $nextStatus = $validated['status'];

        DB::transaction(function () use ($booking, $nextStatus) {
            $booking->status = $nextStatus;
            $booking->save();

            if ($nextStatus === 'paid') {
                $existingPayment = $booking->payment;
                Payment::updateOrCreate(
                    ['booking_id' => $booking->id],
                    [
                        'transaction_id' => $existingPayment?->transaction_id ?: ('ADM-' . $booking->pnr_code . '-' . time()),
                        'amount' => (int) round((float) $booking->total_amount),
                        'payment_method' => $existingPayment?->payment_method ?: 'admin_manual',
                        'status' => 'success',
                        'paid_at' => $existingPayment?->paid_at ?: now(),
                    ]
                );
            } elseif ($nextStatus === 'cancelled') {
                // Giải phóng lock ghế trong cache để hành khách khác có thể đặt lại
                foreach ($booking->tickets as $ticket) {
                    if ($ticket->seat_id && $booking->flight_id) {
                        Cache::forget("lock_flight_{$booking->flight_id}_seat_{$ticket->seat_id}");
                    }
                }
                if ($booking->payment) {
                    $booking->payment->update(['status' => 'failed']);
                }
            } elseif ($nextStatus === 'pending' && $booking->payment) {
                $booking->payment->update(['status' => 'pending', 'paid_at' => null]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => $nextStatus === 'cancelled'
                ? 'Đã hủy đơn đặt chỗ và giải phóng ghế thành công.'
                : 'Đã cập nhật trạng thái đặt chỗ thành công.',
            'data' => $booking->fresh([
                'user',
                'flight.departureAirport',
                'flight.arrivalAirport',
                'tickets.seat',
                'tickets.checkIn',
                'payment',
            ]),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $booking = Booking::with('tickets')->findOrFail($id);

        if ($booking->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa đơn đã thanh toán (bảo toàn chứng từ đối soát). Vui lòng chuyển sang trạng thái Đã hủy trước.',
            ], 422);
        }

        foreach ($booking->tickets as $ticket) {
            if ($ticket->seat_id && $booking->flight_id) {
                Cache::forget("lock_flight_{$booking->flight_id}_seat_{$ticket->seat_id}");
            }
        }

        $this->bookingService->deleteBooking($id);

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa đơn đặt chỗ thành công.',
        ]);
    }
}
