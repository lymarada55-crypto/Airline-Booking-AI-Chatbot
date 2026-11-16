<?php

namespace Tests\Feature;

use App\Models\AIConversation;
use App\Models\AIMessage;
use App\Services\AI\AIChatService;
use App\Services\AI\AIService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Illuminate\Support\Str;
use Tests\TestCase;

class AIChatStreamingTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_chat_streams_without_waiting_for_tool_selection(): void
    {
        $aiService = Mockery::mock(AIService::class);
        $aiService->shouldReceive('systemPrompt')->once()->andReturn('Test system prompt');
        $aiService->shouldNotReceive('complete');
        $aiService->shouldReceive('stream')
            ->once()
            ->andReturn((static function () {
                yield ['content' => 'Xin chào'];
                yield ['content' => ' bạn'];
                yield ['content' => '', 'done' => true];
            })());

        $this->app->instance(AIService::class, $aiService);

        $events = iterator_to_array(
            app(AIChatService::class)->streamChat('Xin chào')
        );

        $this->assertSame(
            ['Xin chào', ' bạn'],
            array_column(
                array_filter($events, fn (array $event) => $event['type'] === 'chunk'),
                'content'
            )
        );

        $this->assertDatabaseHas('ai_messages', [
            'role' => 'assistant',
            'content' => 'Xin chào bạn',
        ]);
    }

    public function test_streaming_displays_fallback_string_chunks(): void
    {
        $aiService = Mockery::mock(AIService::class);
        $aiService->shouldReceive('systemPrompt')->once()->andReturn('Test system prompt');
        $aiService->shouldNotReceive('complete');
        $aiService->shouldReceive('stream')
            ->once()
            ->andReturn((static function () {
                yield 'SkyAI ';
                yield 'đang hoạt động dự phòng.';
            })());

        $this->app->instance(AIService::class, $aiService);

        $events = iterator_to_array(
            app(AIChatService::class)->streamChat('Xin chào')
        );

        $this->assertSame(
            ['SkyAI ', 'đang hoạt động dự phòng.'],
            array_column(
                array_filter($events, fn (array $event) => $event['type'] === 'chunk'),
                'content'
            )
        );

        $this->assertDatabaseHas('ai_messages', [
            'role' => 'assistant',
            'content' => 'SkyAI đang hoạt động dự phòng.',
        ]);
    }

    public function test_cheapest_flight_follow_up_uses_previous_search_results_without_calling_ai(): void
    {
        $conversation = AIConversation::create([
            'uuid' => (string) Str::uuid(),
            'title' => 'Tìm chuyến HAN đến DAD',
        ]);
        $conversation->messages()->create([
            'role' => 'user',
            'content' => 'Tìm chuyến bay từ Hà Nội đến Đà Nẵng ngày mai',
        ]);
        $conversation->messages()->create([
            'role' => 'tool',
            'tool_name' => 'search_flight',
            'tool_result' => [
                'flights' => [
                    [
                        'id' => 101,
                        'flight_number' => 'VN101',
                        'origin' => 'HAN',
                        'destination' => 'DAD',
                        'departure_time' => '2026-10-28 08:00:00',
                        'base_price' => 1500000,
                    ],
                    [
                        'id' => 102,
                        'flight_number' => 'QH102',
                        'origin' => 'HAN',
                        'destination' => 'DAD',
                        'departure_time' => '2026-10-28 10:00:00',
                        'base_price' => 900000,
                    ],
                ],
            ],
        ]);

        $aiService = Mockery::mock(AIService::class);
        $aiService->shouldReceive('systemPrompt')->once()->andReturn('Test system prompt');
        $aiService->shouldNotReceive('complete');
        $aiService->shouldNotReceive('stream');
        $this->app->instance(AIService::class, $aiService);

        $events = iterator_to_array(
            app(AIChatService::class)->streamChat(
                'chuyen nao re nhat',
                null,
                $conversation->uuid
            )
        );

        $doneEvent = collect($events)->firstWhere('type', 'done');

        $this->assertStringContainsString('QH102', $doneEvent['message']);
        $this->assertStringContainsString('900.000 VND', $doneEvent['message']);
        $this->assertSame(['QH102'], array_column($doneEvent['flights'], 'flight_number'));
        $this->assertDatabaseHas('ai_messages', [
            'ai_conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $doneEvent['message'],
        ]);
    }

    public function test_cheapest_flight_question_without_search_context_asks_for_route(): void
    {
        $aiService = Mockery::mock(AIService::class);
        $aiService->shouldReceive('systemPrompt')->once()->andReturn('Test system prompt');
        $aiService->shouldNotReceive('complete');
        $aiService->shouldNotReceive('stream');
        $this->app->instance(AIService::class, $aiService);

        $events = iterator_to_array(
            app(AIChatService::class)->streamChat('chuyen nao re nhat')
        );

        $doneEvent = collect($events)->firstWhere('type', 'done');

        $this->assertStringContainsString('điểm đi, điểm đến và ngày bay', $doneEvent['message']);
        $this->assertSame([], $doneEvent['flights']);
    }

    public function test_unaccented_flight_search_message_selects_tools(): void
    {
        $service = app(AIChatService::class);
        $method = new \ReflectionMethod($service, 'shouldUseTools');

        $this->assertTrue($method->invoke($service, 'tim ve tu HN di HCM ngay mai'));
    }
}
