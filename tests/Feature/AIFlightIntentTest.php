<?php

namespace Tests\Feature;

use App\Services\AI\AIService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AIFlightIntentTest extends TestCase
{
    public function test_fallback_recognizes_abbreviated_hanoi_to_ho_chi_minh_search(): void
    {
        Carbon::setTestNow('2026-10-27 12:00:00');
        config(['services.gemini.api_key' => 'test-key']);

        try {
            $service = new AIService();
            $method = new \ReflectionMethod($service, 'parseFlightIntent');
            $intent = $method->invoke($service, [[
                'role' => 'user',
                'content' => 'Tìm vé về HN đi HCM ngày mai',
            ]]);

            $this->assertSame([
                'origin' => 'HAN',
                'destination' => 'SGN',
                'sort_by' => 'price_asc',
                'date' => '2026-10-28',
            ], $intent);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_fallback_recognizes_unaccented_hanoi_to_ho_chi_minh_search(): void
    {
        Carbon::setTestNow('2026-10-27 12:00:00');
        config(['services.gemini.api_key' => 'test-key']);

        try {
            $service = new AIService();
            $method = new \ReflectionMethod($service, 'parseFlightIntent');
            $intent = $method->invoke($service, [[
                'role' => 'user',
                'content' => 'tim ve tu HN di HCM ngay mai buoi sang',
            ]]);

            $this->assertSame([
                'origin' => 'HAN',
                'destination' => 'SGN',
                'sort_by' => 'price_asc',
                'date' => '2026-10-28',
                'time_of_day' => 'morning',
            ], $intent);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_fallback_recognizes_accented_afternoon_search(): void
    {
        Carbon::setTestNow('2026-10-27 12:00:00');
        config(['services.gemini.api_key' => 'test-key']);

        try {
            $service = new AIService();
            $method = new \ReflectionMethod($service, 'parseFlightIntent');
            $intent = $method->invoke($service, [[
                'role' => 'user',
                'content' => 'Tìm vé từ Hà Nội đi TP.HCM ngày mai buổi chiều',
            ]]);

            $this->assertSame([
                'origin' => 'HAN',
                'destination' => 'SGN',
                'sort_by' => 'price_asc',
                'date' => '2026-10-28',
                'time_of_day' => 'afternoon',
            ], $intent);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_fallback_asks_for_route_when_cheapest_flight_query_has_no_route(): void
    {
        config(['services.gemini.api_key' => 'test-key']);

        $service = new AIService();
        $method = new \ReflectionMethod($service, 'generateFallbackResponse');
        $response = $method->invoke($service, [[
            'role' => 'user',
            'content' => 'Chuyến bay nào rẻ nhất?',
        ]], '429 quota exceeded');

        $this->assertStringContainsString('điểm đi, điểm đến và ngày bay', $response);
        $this->assertStringNotContainsString('Xin chào', $response);
    }

    public function test_gemini_complete_uses_a_bounded_number_of_provider_requests(): void
    {
        config(['services.gemini.api_key' => 'test-key-1,test-key-2,test-key-3']);
        $requestCount = 0;
        Http::fake(function () use (&$requestCount) {
            $requestCount++;

            return Http::response([], 503);
        });

        $service = new AIService();
        $service->complete([['role' => 'user', 'content' => 'Xin chào']]);

        $this->assertSame(2, $requestCount);
    }

    public function test_gemini_stream_uses_a_bounded_number_of_provider_requests(): void
    {
        config(['services.gemini.api_key' => 'test-key-1,test-key-2,test-key-3']);
        $requestCount = 0;
        Http::fake(function () use (&$requestCount) {
            $requestCount++;

            return Http::response([], 503);
        });

        $service = new AIService();
        iterator_to_array($service->stream([['role' => 'user', 'content' => 'Xin chào']]));

        $this->assertSame(2, $requestCount);
    }
}
