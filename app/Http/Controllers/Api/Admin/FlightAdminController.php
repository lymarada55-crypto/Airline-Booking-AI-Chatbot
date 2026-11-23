<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aircraft;
use App\Models\Flight;
use Illuminate\Http\Request;

class FlightAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = Flight::with(['departureAirport', 'arrivalAirport', 'aircraft'])
            ->withCount('bookings');

        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {
                $q->where('flight_number', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhereHas('departureAirport', function ($aq) use ($search) {
                        $aq->where('code', 'like', "%{$search}%")
                            ->orWhere('city', 'like', "%{$search}%");
                    })
                    ->orWhereHas('arrivalAirport', function ($aq) use ($search) {
                        $aq->where('code', 'like', "%{$search}%")
                            ->orWhere('city', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereDate('departure_time', $request->date);
        }

        $perPage = max(1, min((int) $request->query('per_page', 8), 50));
        $flights = $query->orderByDesc('departure_time')->orderByDesc('id')->paginate($perPage);

        $summary = [
            'total_flights' => Flight::count(),
            'today_flights' => Flight::whereDate('departure_time', now()->toDateString())->count(),
            'scheduled' => Flight::whereIn('status', ['scheduled', 'check_in', 'boarding', 'in_flight'])->count(),
            'delayed' => Flight::where('status', 'delayed')->count(),
            'cancelled' => Flight::where('status', 'cancelled')->count(),
        ];

        $aircrafts = Aircraft::withCount('seats')
            ->orderBy('id')
            ->get(['id', 'tail_number', 'model', 'status']);

        return response()->json([
            'data' => $flights->items(),
            'meta' => [
                'current_page' => $flights->currentPage(),
                'per_page'     => $flights->perPage(),
                'total'        => $flights->total(),
                'last_page'    => $flights->lastPage(),
            ],
            'summary' => $summary,
            'aircrafts' => $aircrafts,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'flight_number'        => 'required|string|max:20',
            'departure_airport_id' => 'required|exists:airports,id',
            'arrival_airport_id'   => 'required|exists:airports,id|different:departure_airport_id',
            'departure_time'       => 'required|date',
            'arrival_time'         => 'required|date|after:departure_time',
            'aircraft_id'          => 'required|exists:aircrafts,id',
            'base_price'           => 'required|numeric|min:100000',
            'available_seats'      => 'required|integer|min:0|max:500',
            'status'               => 'required|in:scheduled,check_in,boarding,in_flight,arrived,delayed,cancelled',
        ], [
            'arrival_airport_id.different' => 'Sân bay đến không được trùng với sân bay khởi hành.',
            'arrival_time.after' => 'Giờ hạ cánh phải sau giờ khởi hành.',
            'base_price.min' => 'Giá vé cơ bản phải từ 100.000 ₫ trở lên.',
        ]);

        try {
            $data['flight_number'] = strtoupper(trim($data['flight_number']));
            $flight = Flight::create($data);

            return response()->json([
                'message' => 'Đã tạo chuyến bay mới thành công.',
                'data'    => $flight->load(['departureAirport', 'arrivalAirport', 'aircraft']),
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Không thể tạo chuyến bay: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function update(Request $request, $id)
    {
        $flight = Flight::findOrFail($id);

        $data = $request->validate([
            'flight_number'        => 'required|string|max:20',
            'departure_airport_id' => 'required|exists:airports,id',
            'arrival_airport_id'   => 'required|exists:airports,id|different:departure_airport_id',
            'departure_time'       => 'required|date',
            'arrival_time'         => 'required|date|after:departure_time',
            'aircraft_id'          => 'required|exists:aircrafts,id',
            'base_price'           => 'required|numeric|min:100000',
            'available_seats'      => 'required|integer|min:0|max:500',
            'status'               => 'required|in:scheduled,check_in,boarding,in_flight,arrived,delayed,cancelled',
        ], [
            'arrival_airport_id.different' => 'Sân bay đến không được trùng với sân bay khởi hành.',
            'arrival_time.after' => 'Giờ hạ cánh phải sau giờ khởi hành.',
            'base_price.min' => 'Giá vé cơ bản phải từ 100.000 ₫ trở lên.',
        ]);

        try {
            $data['flight_number'] = strtoupper(trim($data['flight_number']));
            $flight->update($data);

            return response()->json([
                'message' => 'Đã cập nhật chuyến bay thành công.',
                'data'    => $flight->fresh(['departureAirport', 'arrivalAirport', 'aircraft']),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Không thể cập nhật chuyến bay: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function destroy($id)
    {
        $flight = Flight::withCount([
            'bookings as paid_bookings_count' => fn ($q) => $q->where('status', 'paid'),
        ])->findOrFail($id);

        if ($flight->paid_bookings_count > 0) {
            return response()->json([
                'message' => 'Không thể xóa chuyến bay đã có hành khách thanh toán. Vui lòng chuyển sang trạng thái Đã hủy.',
            ], 422);
        }

        $flight->delete();

        return response()->json([
            'message' => 'Đã xóa chuyến bay thành công.',
        ]);
    }
}
