<?php

namespace Tests\Feature;

use App\Jobs\ProcessAiChatJob;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AIChatTest extends TestCase
{
    public function test_ai_chat_endpoint_queues_message_for_processing(): void
    {
        Queue::fake();

        $response = $this->postJson('/api/ai/chat', [
            'message' => 'Xin chào',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'status' => 'processing',
            ]);

        Queue::assertPushed(ProcessAiChatJob::class);
    }
}