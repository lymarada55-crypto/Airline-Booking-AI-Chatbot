<?php

namespace App\Jobs;

use App\Events\AiChatAnswered;
use App\Services\AI\AIChatService;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAiChatJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120; // seconds

    protected string $message;
    protected ?User $user;
    protected ?string $conversationId;
    protected array $images;

    /**
     * Create a new job instance.
     */
    public function __construct(
        string $message = '',
        ?User $user = null,
        ?string $conversationId = null,
        array $images = []
    ) {
        $this->message = $message;
        $this->user = $user;
        $this->conversationId = $conversationId;
        $this->images = $images;
    }

    /**
     * Execute the job.
     */
    public function handle(AIChatService $aiChatService)
    {
        try {
            $result = $aiChatService->chat(
                message: $this->message,
                user: $this->user,
                conversationId: $this->conversationId,
                images: $this->images
            );

            // Broadcast the result to a private channel identified by conversation ID
            broadcast(new AiChatAnswered($result['conversation_id'] ?? $this->conversationId, $result))
                ->toOthers();
        } catch (\Throwable $e) {
            Log::error('ProcessAiChatJob error', [
                'message' => $this->message,
                'conversation_id' => $this->conversationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
?>
