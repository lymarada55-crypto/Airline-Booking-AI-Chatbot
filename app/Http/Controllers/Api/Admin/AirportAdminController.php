<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Airport;
use App\Services\AirportService;
use Illuminate\Http\Request;

class AirportAdminController extends Controller
{
    protected $airportService;

    private const VIETNAM_IATA_CODES = [
        'HAN', 'SGN', 'DAD', 'PQC', 'CXR', 'DLI', 'HUI', 'HPH', 'VCA', 'UIH',
        'VII', 'VDH', 'VCL', 'THD', 'VDO', 'DIN', 'PXU', 'BMV', 'TBB', 'VKG', 'CAH', 'VCS',
    ];

    public function __construct(AirportService $airportService)
    {
        $this->airportService = $airportService;
    }

    public function index()
    {
        $airports = Airport::withCount(['departingFlights', 'arrivingFlights'])
            ->orderBy('id')
            ->get()
            ->map(function (Airport $airport) {
                $code = strtoupper((string) $airport->code);
                $isDomestic = in_array($code, self::VIETNAM_IATA_CODES, true);
                $airport->setAttribute('is_domestic', $isDomestic);
                return $airport;
            });

        $total = $airports->count();
        $domestic = $airports->where('is_domestic', true)->count();
        $international = $total - $domestic;
        $activeHubs = $airports->filter(
            fn ($a) => ((int) $a->departing_flights_count + (int) $a->arriving_flights_count) > 0
        )->count();

        return response()->json([
            'data' => $airports->values(),
            'summary' => [
                'total_airports' => $total,
                'domestic_count' => $domestic,
                'international_count' => $international,
                'active_hubs' => $activeHubs,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->merge([
            'code' => strtoupper(trim((string) $request->input('code'))),
            'name' => trim((string) $request->input('name')),
            'city' => trim((string) $request->input('city')),
        ]);

        $validated = $request->validate([
            'code' => ['required', 'string', 'size:3', 'regex:/^[A-Z]{3}$/', 'unique:airports,code'],
            'name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:150'],
        ], [
            'code.size' => 'Mã sân bay IATA phải gồm đúng 3 chữ cái in hoa (VD: HAN, SGN, SIN).',
            'code.regex' => 'Mã sân bay IATA chỉ được gồm 3 chữ cái in hoa A–Z.',
            'code.unique' => 'Mã sân bay IATA này đã tồn tại trong hệ thống.',
        ]);

        $airport = $this->airportService->createAirport($validated);

        return response()->json([
            'message' => 'Đã thêm sân bay mới thành công.',
            'data' => $airport,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->merge([
            'code' => strtoupper(trim((string) $request->input('code'))),
            'name' => trim((string) $request->input('name')),
            'city' => trim((string) $request->input('city')),
        ]);

        $validated = $request->validate([
            'code' => ['required', 'string', 'size:3', 'regex:/^[A-Z]{3}$/', 'unique:airports,code,' . $id],
            'name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:150'],
        ], [
            'code.size' => 'Mã sân bay IATA phải gồm đúng 3 chữ cái in hoa (VD: HAN, SGN, SIN).',
            'code.regex' => 'Mã sân bay IATA chỉ được gồm 3 chữ cái in hoa A–Z.',
            'code.unique' => 'Mã sân bay IATA này đã tồn tại trong hệ thống.',
        ]);

        $airport = $this->airportService->updateAirport($id, $validated);

        return response()->json([
            'message' => 'Đã cập nhật thông tin sân bay thành công.',
            'data' => $airport,
        ]);
    }

    public function destroy($id)
    {
        $airport = Airport::withCount(['departingFlights', 'arrivingFlights'])->findOrFail($id);

        if (($airport->departing_flights_count + $airport->arriving_flights_count) > 0) {
            return response()->json([
                'message' => 'Không thể xóa sân bay này vì đang có chuyến bay khai thác tại đây.',
            ], 422);
        }

        try {
            $this->airportService->deleteAirport($id);

            return response()->json([
                'message' => 'Đã xóa sân bay khỏi danh mục.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Không thể xóa sân bay này vì đang được sử dụng trong hệ thống.',
            ], 422);
        }
    }
}
