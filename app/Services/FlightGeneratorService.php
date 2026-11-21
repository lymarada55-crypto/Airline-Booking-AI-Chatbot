<?php

namespace App\Services;

use App\Models\Aircraft;
use App\Models\Airport;
use App\Models\Flight;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * FlightGeneratorService (Factory / Generator — Creational)
 *
 * Vấn đề giải quyết (Problem-First):
 * ─────────────────────────────────
 * Yêu cầu business: Mỗi lần tìm kiếm cho 1 tuyến + ngày phải trả về
 * ĐÚNG 15 chuyến bay: 3 hãng × 5 khung giờ, mã số cố định, nhất quán.
 *
 * Giải pháp: Deterministic Generation
 * ─────────────────────────────────────
 * Thay vì random prefix + random number, ta dùng bảng cố định AIRLINE_SCHEDULES
 * chứa đầy đủ thông tin từng hãng: tên, prefix, 5 số hiệu chuyến bay, 5 khung giờ.
 * → Cùng tuyến + ngày luôn cho ra 15 chuyến bay giống nhau (idempotent).
 *
 * SOLID Compliance:
 * - SRP : Chỉ lo việc tạo flight data.
 * - OCP : Thêm hãng mới → thêm entry vào AIRLINE_SCHEDULES, không sửa logic.
 */
class FlightGeneratorService
{
    /**
     * Bảng lịch bay cố định theo hãng.
     * Mỗi hãng có:
     *  - name      : Tên hiển thị đầy đủ
     *  - prefix    : Prefix mã hiệu chuyến bay (để FlightCard nhận diện màu sắc)
     *  - baseNumbers : 5 số hiệu gốc (sẽ được gắn suffix ngày để tránh unique constraint)
     *  - slots     : 5 khung giờ tương ứng theo thứ tự [HH:MM]
     *  - duration  : Thời gian bay (phút) — cố định theo hãng
     *  - prices    : Giá gốc tương ứng (VND, làm tròn 100K)
     *
     * Lý do dùng baseNumbers + suffix ngày:
     *   flight_number là UNIQUE trong toàn bảng flights.
     *   Cùng hãng, cùng số hiệu nhưng khác ngày/tuyến → cần key khác nhau.
     *   VD: VN201-0720 (20/07) ≠ VN201-0715 (15/07)
     */
    private const AIRLINE_SCHEDULES = [
        [
            'name'        => 'Vietnam Airlines',
            'prefix'      => 'VN',
            'baseNumbers' => ['201', '202', '203', '204', '205'],
            'slots'       => ['06:00', '09:00', '12:30', '15:45', '19:00'],
            'duration'    => 115, // 1h55
            'prices'      => [1200000, 1500000, 1300000, 1400000, 1100000],
            'aircraft'    => ['model' => 'Boeing 787', 'tail' => 'VN-B787']
        ],
        [
            'name'        => 'VietJet Air',
            'prefix'      => 'VJ',
            'baseNumbers' => ['301', '302', '303', '304', '305'],
            'slots'       => ['07:00', '10:30', '13:00', '16:00', '20:00'],
            'duration'    => 120, // 2h00
            'prices'      => [900000, 1100000, 950000, 1000000, 800000],
            'aircraft'    => ['model' => 'Airbus A320neo', 'tail' => 'VJ-A320']
        ],
        [
            'name'        => 'FlightBus',
            'prefix'      => 'FB',
            'baseNumbers' => ['401', '402', '403', '404', '405'],
            'slots'       => ['05:30', '08:30', '11:30', '14:00', '17:30'],
            'duration'    => 125, // 2h05
            'prices'      => [700000, 850000, 750000, 800000, 650000],
            'aircraft'    => ['model' => 'Embraer 190', 'tail' => 'FB-E190']
        ],
    ];

    /**
     * Sinh đúng 15 chuyến bay cho tuyến đường + ngày được chỉ định.
     *
     * Idempotent: Gọi nhiều lần với cùng params → cùng kết quả.
     * Double-check: Kiểm tra bên trong transaction để tránh race condition.
     *
     * @param  Airport  $departure  Sân bay khởi hành.
     * @param  Airport  $arrival    Sân bay đến.
     * @param  string   $date       Ngày khởi hành (YYYY-MM-DD).
     * @return Collection<Flight>   15 Flight đã tạo kèm relationships.
     */
    public function generate(Airport $departure, Airport $arrival, string $date): Collection
    {
        return DB::transaction(function () use ($departure, $arrival, $date) {

            // Double-check trong transaction — tránh race condition
            $existing = Flight::where('departure_airport_id', $departure->id)
                ->where('arrival_airport_id', $arrival->id)
                ->whereDate('departure_time', $date)
                ->with(['departureAirport', 'arrivalAirport', 'aircraft'])
                ->get();

            if ($existing->count() >= 5) {
                return $existing;
            }

            // Lấy hoặc tạo Aircraft riêng cho mỗi hãng
            $aircrafts = [];
            foreach (self::AIRLINE_SCHEDULES as $airline) {
                $aircrafts[$airline['prefix']] = Aircraft::firstOrCreate(
                    ['tail_number' => $airline['aircraft']['tail']],
                    ['model' => $airline['aircraft']['model'], 'status' => 1]
                );
            }

            // Suffix ngày: MMDD — đảm bảo flight_number global unique
            // VD: VN201-0715 (ngày 15/07), VN201-0720 (ngày 20/07)
            $dateSuffix = Carbon::parse($date)->format('md');

            $flightIds = [];

            // Tạo mã số hiệu chuyến bay theo chặng bay cụ thể (VD: VN721, VJ722, FB723)
            $routeCodeNumber = (abs(crc32($departure->code . $arrival->code)) % 800) + 100;
            $routeProfile = $this->getRouteProfile($departure->code, $arrival->code);

            // Sinh 3 hãng × 5 chuyến = 15 flights
            foreach (self::AIRLINE_SCHEDULES as $airlineIdx => $airline) {
                foreach ($airline['baseNumbers'] as $idx => $baseNum) {
                    // Mã chuyến bay theo chặng: PREFIX + RouteCode + STT (VD: VN721, VJ722)
                    $flightNumber  = sprintf('%s%d%d', $airline['prefix'], $routeCodeNumber, $idx + 1);
                    $timeSlot      = $airline['slots'][$idx];
                    $departureTime = Carbon::parse("{$date} {$timeSlot}");
                    // Thời gian bay thực tế theo chặng (chênh lệch nhỏ 0–10 phút giữa các hãng)
                    $durationMins  = $routeProfile['duration'] + ($airlineIdx * 5);
                    $arrivalTime   = $departureTime->copy()->addMinutes($durationMins);

                    // Kiểm tra đúng chuyến bay cho tuyến này + ngày này + giờ này
                    $existing = Flight::where('departure_airport_id', $departure->id)
                        ->where('arrival_airport_id', $arrival->id)
                        ->where('flight_number', $flightNumber)
                        ->where('departure_time', $departureTime)
                        ->first();

                    if ($existing) {
                        $flightIds[] = $existing->id;
                        continue;
                    }

                    // Nếu mã chuyến bay bị trùng ở chuyến bay khác cùng giờ, thêm hậu tố
                    $numberConflict = Flight::where('flight_number', $flightNumber)
                        ->where('departure_time', $departureTime)
                        ->exists();

                    if ($numberConflict) {
                        $flightNumber = sprintf('%s%s%s%d', $airline['prefix'], $departure->code, $arrival->code, $idx + 1);
                    }

                    // Giá vé thực tế theo tuyến & phân khúc hãng (VN cao hơn VJ/FB)
                    $tierFactor = match ($airline['prefix']) {
                        'VN' => 1.18,
                        'VJ' => 0.96,
                        default => 0.85,
                    };
                    $minSteps = max(35, (int) round(($routeProfile['min_price'] * $tierFactor) / 10000));
                    $maxSteps = max($minSteps + 10, (int) round(($routeProfile['max_price'] * $tierFactor) / 10000));

                    $flight = Flight::create([
                        'flight_number'        => $flightNumber,
                        'departure_airport_id' => $departure->id,
                        'arrival_airport_id'   => $arrival->id,
                        'departure_time'       => $departureTime,
                        'arrival_time'         => $arrivalTime,
                        'aircraft_id'          => $aircrafts[$airline['prefix']]->id,
                        'base_price'           => rand($minSteps, $maxSteps) * 10000,
                        'available_seats'      => 180,
                        'status'               => 'scheduled',
                    ]);

                    $flightIds[] = $flight->id;
                }
            }

            // Re-query với Eager Loading đầy đủ
            return Flight::whereIn('id', $flightIds)
                ->where('departure_airport_id', $departure->id)
                ->where('arrival_airport_id', $arrival->id)
                ->with(['departureAirport', 'arrivalAirport', 'aircraft'])
                ->orderBy('departure_time')
                ->get();
        });
    }

    /**
     * Trả về thời gian bay (phút) và khung giá cơ bản (VND) sát thực tế theo tuyến bay.
     */
    private function getRouteProfile(string $depCode, string $arrCode): array
    {
        $pair = [strtoupper($depCode), strtoupper($arrCode)];
        sort($pair);
        $routeKey = implode('-', $pair);

        // Chặng Trung Quốc (Bắc Kinh, Thượng Hải, Quảng Châu, Thâm Quyến)
        $chinaAirports = ['PEK', 'PVG', 'CAN', 'SZX'];
        if (array_intersect($pair, $chinaAirports)) {
            $isFromNorth = in_array('HAN', $pair, true) || in_array('HPH', $pair, true);
            if (in_array('PEK', $pair, true)) {
                return [
                    'duration'  => $isFromNorth ? 225 : 280, // ~3h45 (từ Bắc) / ~4h40 (từ Nam)
                    'min_price' => 4500000,
                    'max_price' => 8500000,
                ];
            }
            if (in_array('PVG', $pair, true)) {
                return [
                    'duration'  => $isFromNorth ? 195 : 245, // ~3h15 / ~4h05
                    'min_price' => 4200000,
                    'max_price' => 7800000,
                ];
            }
            // Quảng Châu (CAN) & Thâm Quyến (SZX) - Hoa Nam
            return [
                'duration'  => $isFromNorth ? 115 : 165, // ~1h55 / ~2h45
                'min_price' => 2800000,
                'max_price' => 5400000,
            ];
        }

        // Chặng Đông Bắc Á (Hàn Quốc / Nhật Bản)
        $northeastAsia = ['ICN', 'NRT'];
        if (array_intersect($pair, $northeastAsia)) {
            if (in_array('NRT', $pair, true)) {
                return ['duration' => 330, 'min_price' => 6200000, 'max_price' => 10500000]; // ~5h30
            }
            return ['duration' => 275, 'min_price' => 5200000, 'max_price' => 8800000]; // ~4h35
        }

        // Chặng Đông Nam Á (Singapore / Malaysia / Campuchia)
        $southeastAsia = ['SIN', 'KUL', 'PNH'];
        if (array_intersect($pair, $southeastAsia)) {
            if (in_array('PNH', $pair, true)) {
                $isFromSouth = in_array('SGN', $pair, true) || in_array('PQC', $pair, true) || in_array('VCA', $pair, true);
                return $isFromSouth
                    ? ['duration' => 55, 'min_price' => 1900000, 'max_price' => 3400000]
                    : ['duration' => 115, 'min_price' => 2400000, 'max_price' => 4200000];
            }
            return ['duration' => 145, 'min_price' => 2300000, 'max_price' => 4500000]; // ~2h25
        }

        // Chặng Nội địa ngắn (cùng miền)
        $shortDomestic = [
            'DLI-SGN' => 55,
            'PQC-SGN' => 65,
            'CXR-SGN' => 70,
            'SGN-VCA' => 50,
            'DAD-HUI' => 45,
            'DAD-UIH' => 55,
            'HAN-HUI' => 75,
            'DAD-HAN' => 80,
            'DAD-HPH' => 80,
        ];
        if (isset($shortDomestic[$routeKey])) {
            return ['duration' => $shortDomestic[$routeKey], 'min_price' => 550000, 'max_price' => 1250000];
        }

        // Chặng Nội địa trục Bắc - Nam (HAN/HPH <-> SGN/PQC/VCA/DLI/CXR)
        return ['duration' => 120, 'min_price' => 850000, 'max_price' => 1650000];
    }
}
