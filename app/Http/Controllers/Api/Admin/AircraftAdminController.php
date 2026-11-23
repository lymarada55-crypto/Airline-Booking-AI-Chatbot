<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aircraft;
use App\Models\Seat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AircraftAdminController extends Controller
{
    private function isBusinessSeat(Seat $seat): bool
    {
        $cls = strtolower(trim((string) $seat->seat_class));
        if (in_array($cls, ['business', 'vip', 'first'], true)) {
            return true;
        }
        if ($cls === 'economy' || $cls === 'standard') {
            return false;
        }
        // Fallback matching BookingController rule: rows 1–5 are Business/Premium
        if (preg_match('/^(\d+)/', (string) $seat->seat_number, $m)) {
            return ((int) $m[1]) <= 5;
        }
        return false;
    }

    public function index(): JsonResponse
    {
        $aircrafts = Aircraft::withCount(['seats', 'flights'])
            ->with(['seats:id,aircraft_id,seat_number,seat_class'])
            ->orderBy('id')
            ->get()
            ->map(function (Aircraft $aircraft) {
                $bizCount = $aircraft->seats->filter(fn (Seat $s) => $this->isBusinessSeat($s))->count();
                $ecoCount = max(0, $aircraft->seats->count() - $bizCount);
                $aircraft->setAttribute('business_seats_count', $bizCount);
                $aircraft->setAttribute('economy_seats_count', $ecoCount);
                $aircraft->unsetRelation('seats');
                return $aircraft;
            });

        $summary = [
            'total_aircrafts' => $aircrafts->count(),
            'active_count' => $aircrafts->where('status', 1)->count(),
            'maintenance_count' => $aircrafts->where('status', 2)->count(),
            'grounded_count' => $aircrafts->where('status', 0)->count(),
            'total_seats' => (int) $aircrafts->sum('seats_count'),
            'total_business_seats' => (int) $aircrafts->sum('business_seats_count'),
            'total_economy_seats' => (int) $aircrafts->sum('economy_seats_count'),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $aircrafts->values(),
            'summary' => $summary,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $aircraft = Aircraft::withCount(['seats', 'flights'])
            ->with(['seats' => fn ($q) => $q->orderBy('id')])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $aircraft,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->merge([
            'tail_number' => strtoupper(trim((string) $request->input('tail_number'))),
            'model' => trim((string) $request->input('model')),
        ]);

        $validated = $request->validate([
            'tail_number' => ['required', 'string', 'max:30', 'unique:aircrafts,tail_number'],
            'model' => ['required', 'string', 'max:150'],
            'status' => ['required', 'integer', 'in:0,1,2'],
            'business_rows' => ['nullable', 'integer', 'min:0', 'max:12'],
            'economy_rows' => ['nullable', 'integer', 'min:1', 'max:45'],
        ], [
            'tail_number.required' => 'Vui lòng nhập số đăng bạ tàu bay (VD: VN-A868).',
            'tail_number.unique' => 'Số đăng bạ tàu bay này đã tồn tại trong đội bay.',
            'model.required' => 'Vui lòng nhập dòng tàu bay (VD: Boeing 787-9 Dreamliner).',
        ]);

        $bizRows = (int) ($validated['business_rows'] ?? 4);
        $ecoRows = (int) ($validated['economy_rows'] ?? 20);

        $aircraft = DB::transaction(function () use ($validated, $bizRows, $ecoRows) {
            $created = Aircraft::create([
                'tail_number' => $validated['tail_number'],
                'model' => $validated['model'],
                'status' => $validated['status'],
            ]);

            $now = now();
            $seatRows = [];

            // Business class: 4 seats per row (A, C, D, F)
            for ($r = 1; $r <= $bizRows; $r++) {
                foreach (['A', 'C', 'D', 'F'] as $col) {
                    $seatRows[] = [
                        'aircraft_id' => $created->id,
                        'seat_number' => "{$r}{$col}",
                        'seat_class' => 'business',
                        'status' => 'available',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            // Economy class: 6 seats per row (A, B, C, D, E, F)
            for ($r = $bizRows + 1; $r <= $bizRows + $ecoRows; $r++) {
                foreach (['A', 'B', 'C', 'D', 'E', 'F'] as $col) {
                    $seatRows[] = [
                        'aircraft_id' => $created->id,
                        'seat_number' => "{$r}{$col}",
                        'seat_class' => 'economy',
                        'status' => 'available',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            if (! empty($seatRows)) {
                Seat::insert($seatRows);
            }

            return $created;
        });

        return response()->json([
            'status' => 'success',
            'message' => "Đã thêm tàu bay {$aircraft->tail_number} và khởi tạo sơ đồ ghế thành công.",
            'data' => $aircraft->fresh()->loadCount([
                'seats',
                'seats as business_seats_count' => fn ($q) => $q->where('seat_class', 'business'),
                'seats as economy_seats_count' => fn ($q) => $q->where('seat_class', 'economy'),
                'flights',
            ]),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $aircraft = Aircraft::findOrFail($id);

        $request->merge([
            'tail_number' => strtoupper(trim((string) $request->input('tail_number'))),
            'model' => trim((string) $request->input('model')),
        ]);

        $validated = $request->validate([
            'tail_number' => ['required', 'string', 'max:30', 'unique:aircrafts,tail_number,' . $id],
            'model' => ['required', 'string', 'max:150'],
            'status' => ['required', 'integer', 'in:0,1,2'],
        ], [
            'tail_number.unique' => 'Số đăng bạ tàu bay này đã tồn tại trong đội bay.',
        ]);

        $aircraft->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => "Đã cập nhật tàu bay {$aircraft->tail_number} thành công.",
            'data' => $aircraft->fresh()->loadCount([
                'seats',
                'seats as business_seats_count' => fn ($q) => $q->where('seat_class', 'business'),
                'seats as economy_seats_count' => fn ($q) => $q->where('seat_class', 'economy'),
                'flights',
            ]),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $aircraft = Aircraft::withCount('flights')->findOrFail($id);

        if ($aircraft->flights_count > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể xóa tàu bay đang có chuyến bay khai thác. Vui lòng chuyển sang trạng thái Đang bảo dưỡng hoặc Ngừng bay.',
            ], 422);
        }

        $aircraft->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Đã xóa tàu bay khỏi đội bay.',
        ]);
    }
}
