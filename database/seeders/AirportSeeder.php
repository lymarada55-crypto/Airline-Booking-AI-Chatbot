<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Airport;

class AirportSeeder extends Seeder
{
    public function run(): void
    {
        $airports = [
            // 10 Sân bay Nội địa Việt Nam trọng điểm
            ['code' => 'HAN', 'name' => 'Sân bay Quốc tế Nội Bài', 'city' => 'Hà Nội'],
            ['code' => 'SGN', 'name' => 'Sân bay Quốc tế Tân Sơn Nhất', 'city' => 'Hồ Chí Minh'],
            ['code' => 'DAD', 'name' => 'Sân bay Quốc tế Đà Nẵng', 'city' => 'Đà Nẵng'],
            ['code' => 'PQC', 'name' => 'Sân bay Quốc tế Phú Quốc', 'city' => 'Phú Quốc'],
            ['code' => 'CXR', 'name' => 'Sân bay Quốc tế Cam Ranh', 'city' => 'Nha Trang'],
            ['code' => 'DLI', 'name' => 'Sân bay Liên Khương', 'city' => 'Đà Lạt'],
            ['code' => 'HUI', 'name' => 'Sân bay Quốc tế Phú Bài', 'city' => 'Huế'],
            ['code' => 'HPH', 'name' => 'Sân bay Quốc tế Cát Bi', 'city' => 'Hải Phòng'],
            ['code' => 'VCA', 'name' => 'Sân bay Quốc tế Cần Thơ', 'city' => 'Cần Thơ'],
            ['code' => 'UIH', 'name' => 'Sân bay Phù Cát', 'city' => 'Quy Nhơn'],

            // 5 Sân bay Quốc tế Đông Nam Á & Đông Bắc Á
            ['code' => 'SIN', 'name' => 'Sân bay Quốc tế Changi', 'city' => 'Singapore'],
            ['code' => 'PNH', 'name' => 'Sân bay Quốc tế Phnom Penh', 'city' => 'Phnom Penh (Campuchia)'],
            ['code' => 'KUL', 'name' => 'Sân bay Quốc tế Kuala Lumpur', 'city' => 'Kuala Lumpur (Malaysia)'],
            ['code' => 'ICN', 'name' => 'Sân bay Quốc tế Incheon', 'city' => 'Seoul (Hàn Quốc)'],
            ['code' => 'NRT', 'name' => 'Sân bay Quốc tế Narita', 'city' => 'Tokyo (Nhật Bản)'],

            // 4 Sân bay Quốc tế Trung Quốc phổ biến
            ['code' => 'PEK', 'name' => 'Sân bay Quốc tế Thủ đô Bắc Kinh', 'city' => 'Bắc Kinh (Trung Quốc)'],
            ['code' => 'PVG', 'name' => 'Sân bay Quốc tế Phố Đông Thượng Hải', 'city' => 'Thượng Hải (Trung Quốc)'],
            ['code' => 'CAN', 'name' => 'Sân bay Quốc tế Bạch Vân Quảng Châu', 'city' => 'Quảng Châu (Trung Quốc)'],
            ['code' => 'SZX', 'name' => 'Sân bay Quốc tế Bảo An Thâm Quyến', 'city' => 'Thâm Quyến (Trung Quốc)'],
        ];

        foreach ($airports as $airport) {
            Airport::updateOrCreate(
                ['code' => $airport['code']],
                ['name' => $airport['name'], 'city' => $airport['city']]
            );
        }
    }
}
