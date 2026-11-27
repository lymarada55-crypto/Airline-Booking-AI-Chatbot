<?php

namespace App\Services\AI;

use App\Services\AI\Tools\SearchFlightTool;
use App\Services\AI\Tools\GetFlightDetailsTool;
use App\Services\AI\Tools\CheckSeatAvailabilityTool;
use App\Services\AI\Tools\GetAirportInfoTool;
use App\Services\AI\Tools\GetBookingInfoTool;
use App\Services\AI\Tools\SearchKnowledgeTool;
use App\Models\AIConversation;
use App\Models\AIMessage;
use App\Models\TravelProduct;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class AIChatService
{
    public function __construct(
        protected AIService $aiService,
        protected SearchFlightTool $searchFlightTool,
        protected GetFlightDetailsTool $getFlightDetailsTool,
        protected CheckSeatAvailabilityTool $checkSeatAvailabilityTool,
        protected GetAirportInfoTool $getAirportInfoTool,
        protected GetBookingInfoTool $getBookingInfoTool,
        protected SearchKnowledgeTool $searchKnowledgeTool,
    ) {}

    public function chat(string $message, ?Model $user = null, ?string $conversationId = null, array $images = []): array
    {
        $conversation = $this->conversation($conversationId, $user);
        $this->saveUserMessage($conversation, $message);

        $history = $this->history($conversation);
        if (!empty($images)) {
            // Attach images to the latest user message in $history
            $lastIndex = count($history) - 1;
            if ($lastIndex >= 0 && ($history[$lastIndex]['role'] ?? '') === 'user') {
                $history[$lastIndex]['images'] = $images;
            }
        }

        $messages = [
            ['role' => 'system', 'content' => $this->aiService->systemPrompt()],
            ...$history,
        ];

        $cheapestFlightReply = $this->cheapestFlightFollowUp($conversation, $message);
        if ($cheapestFlightReply !== null) {
            $conversation->messages()->create([
                'role' => 'assistant',
                'content' => $cheapestFlightReply['message'],
            ]);

            return [
                'type' => 'message',
                ...$cheapestFlightReply,
                'conversation_id' => $conversation->uuid,
                'quick_replies' => [],
            ];
        }

        $travelReply = $this->travelServiceReply($message);
        if ($travelReply !== null) {
            $conversation->messages()->create([
                'role' => 'assistant',
                'content' => $travelReply['message'],
            ]);

            return [
                'type' => 'message',
                'message' => $travelReply['message'],
                'flights' => [],
                'conversation_id' => $conversation->uuid,
                'quick_replies' => $travelReply['quick_replies'] ?? [],
            ];
        }

        $tools = $this->shouldUseTools($message) ? $this->getTools() : [];
        $flights = [];

        for ($attempt = 0; $attempt < 3; $attempt++) {
            $response = $this->aiService->complete($messages, $tools);
            $toolCalls = $response['tool_calls'] ?? [];

            if (!$toolCalls) {
                $content = trim((string) ($response['content'] ?? ''));
                $conversation->messages()->create(['role' => 'assistant', 'content' => $content]);

                return [
                    'type' => 'message',
                    'message' => $content,
                    'flights' => $flights,
                    'conversation_id' => $conversation->uuid,
                    'quick_replies' => [],
                ];
            }

            $conversation->messages()->create([
                'role' => 'assistant',
                'content' => $response['content'] ?? null,
                'tool_calls' => $toolCalls,
            ]);

            $messages[] = $response;

            foreach ($toolCalls as $toolCall) {
                $toolName = $toolCall['function']['name'] ?? '';
                $arguments = $this->normalizeArguments($toolCall['function']['arguments'] ?? []);

                if (!$toolName) continue;

                $result = $this->executeToolCall($toolName, $arguments, $user);

                if (!empty($result['flights'])) {
                    $flights = array_merge($flights, $result['flights']);
                }

                $this->saveToolMessage($conversation, $toolCall, $toolName, $arguments, $result);

                $messages[] = [
                    'role' => 'tool',
                    'tool_call_id' => $toolCall['id'] ?? null,
                    'tool_name' => $toolName,
                    'content' => json_encode($result, JSON_UNESCAPED_UNICODE),
                ];
            }
        }

        throw new \RuntimeException('AI tool-call limit exceeded.');
    }

    public function streamChat(string $message, ?Model $user = null, ?string $conversationId = null, array $images = []): \Generator
    {
        $conversation = $this->conversation($conversationId, $user);
        $this->saveUserMessage($conversation, $message);

        yield ['type' => 'conversation', 'conversation_id' => $conversation->uuid];

        $history = $this->history($conversation);
        if (!empty($images)) {
            // Attach images to the latest user message in $history
            $lastIndex = count($history) - 1;
            if ($lastIndex >= 0 && ($history[$lastIndex]['role'] ?? '') === 'user') {
                $history[$lastIndex]['images'] = $images;
            }
        }

        $messages = [
            ['role' => 'system', 'content' => $this->aiService->systemPrompt()],
            ...$history,
        ];

        yield ['type' => 'status', 'status' => 'thinking', 'message' => 'SkyAI đang kiểm tra thông tin...'];

        $cheapestFlightReply = $this->cheapestFlightFollowUp($conversation, $message);
        if ($cheapestFlightReply !== null) {
            $conversation->messages()->create([
                'role' => 'assistant',
                'content' => $cheapestFlightReply['message'],
            ]);

            yield ['type' => 'chunk', 'content' => $cheapestFlightReply['message']];
            yield [
                'type' => 'done',
                ...$cheapestFlightReply,
                'conversation_id' => $conversation->uuid,
                'quick_replies' => [],
            ];
            return;
        }

        $travelReply = $this->travelServiceReply($message);
        if ($travelReply !== null) {
            $conversation->messages()->create([
                'role' => 'assistant',
                'content' => $travelReply['message'],
            ]);

            yield ['type' => 'chunk', 'content' => $travelReply['message']];
            yield [
                'type' => 'done',
                'conversation_id' => $conversation->uuid,
                'message' => $travelReply['message'],
                'flights' => [],
                'quick_replies' => $travelReply['quick_replies'] ?? [],
            ];
            return;
        }

        $tools = $this->shouldUseTools($message) ? $this->getTools() : [];
        if (empty($tools)) {
            yield from $this->streamFinalAnswer($conversation, $messages);
            return;
        }

        $response = $this->aiService->complete($messages, $tools);
        $toolCalls = $response['tool_calls'] ?? [];

        if (!$toolCalls) {
            $content = trim((string) ($response['content'] ?? ''));
            if ($content !== '') {
                $conversation->messages()->create([
                    'role' => 'assistant',
                    'content' => $content,
                ]);

                yield ['type' => 'chunk', 'content' => $content];

                yield [
                    'type' => 'done',
                    'conversation_id' => $conversation->uuid,
                    'message' => $content,
                    'flights' => [],
                    'quick_replies' => [],
                ];
                return;
            }

            yield from $this->streamFinalAnswer($conversation, $messages);
            return;
        }

        $conversation->messages()->create([
            'role' => 'assistant',
            'content' => $response['content'] ?? null,
            'tool_calls' => $toolCalls,
        ]);

        $messages[] = $response;
        $flights = [];

        foreach ($toolCalls as $toolCall) {
            $toolName = $toolCall['function']['name'] ?? '';
            $arguments = $this->normalizeArguments($toolCall['function']['arguments'] ?? []);

            yield [
                'type' => 'tool',
                'status' => 'executing',
                'tool' => $toolName,
                'message' => $this->toolMessage($toolName),
            ];

            $result = $this->executeToolCall($toolName, $arguments, $user);

            if (!empty($result['flights'])) {
                $flights = array_merge($flights, $result['flights']);
            }

            $this->saveToolMessage($conversation, $toolCall, $toolName, $arguments, $result);

            $messages[] = [
                'role' => 'tool',
                'tool_call_id' => $toolCall['id'] ?? null,
                'tool_name' => $toolName,
                'content' => json_encode($result, JSON_UNESCAPED_UNICODE),
            ];
        }

        // Nếu tìm thấy chuyến bay, trả về ngay lập tức
        if (!empty($flights)) {
            $count = count($flights);
            $content = $this->getLocalizedFlightIntro($message, $count);

            $conversation->messages()->create([
                'role' => 'assistant',
                'content' => $content,
            ]);

            yield ['type' => 'chunk', 'content' => $content];

            yield [
                'type' => 'done',
                'conversation_id' => $conversation->uuid,
                'message' => $content,
                'flights' => $flights,
                'quick_replies' => [],
            ];
            return;
        }

        // Nếu tool tìm chuyến bay trả về không có chuyến
        foreach ($toolCalls as $tc) {
            if (($tc['function']['name'] ?? '') === 'search_flight') {
                $content = $this->getLocalizedNoFlights($message);
                $conversation->messages()->create([
                    'role' => 'assistant',
                    'content' => $content,
                ]);

                yield ['type' => 'chunk', 'content' => $content];

                yield [
                    'type' => 'done',
                    'conversation_id' => $conversation->uuid,
                    'message' => $content,
                    'flights' => [],
                    'quick_replies' => [],
                ];
                return;
            }
        }

        // Đối với các tool khác (chính sách, tra cứu booking), tổng hợp câu trả lời từ AI
        yield ['type' => 'status', 'status' => 'writing', 'message' => 'Đang tổng hợp câu trả lời...'];
        
        yield from $this->streamFinalAnswer($conversation, $messages);
    }

    private function streamFinalAnswer(AIConversation $conversation, array $messages): \Generator
    {
        $content = '';

        foreach ($this->aiService->stream($messages) as $chunk) {
            if (is_array($chunk) && ($chunk['done'] ?? false) === true) break;

            $text = is_string($chunk) ? $chunk : ($chunk['content'] ?? '');
            if ($text === '') continue;

            $content .= $text;
            yield ['type' => 'chunk', 'content' => $text];
        }

        $conversation->messages()->create([
            'role' => 'assistant',
            'content' => $content,
        ]);

        yield [
            'type' => 'done',
            'conversation_id' => $conversation->uuid,
            'message' => $content,
            'flights' => [],
            'quick_replies' => [],
        ];
    }

    private function travelServiceReply(string $message): ?array
    {
        $ascii = Str::ascii(mb_strtolower(trim($message), 'UTF-8'));

        // Do not intercept explicit flight searches or airline policy/PNR queries
        foreach ([
            'tim chuyen bay', 'tim ve', 'chuyen bay', 've may bay', 'bay tu', 'bay di',
            'flight', 'book flight', 'ma dat cho', 'pnr', 'check-in', 'checkin',
            'hanh ly', 'hoan ve', 'huy ve', 'doi ve', 'quy dinh',
        ] as $flightKw) {
            if (str_contains($ascii, $flightKw)) {
                return null;
            }
        }

        $serviceType = null;
        $serviceTitleVi = '';
        $unitLabel = '';
        $routePath = '';

        foreach (['khach san', 'resort', 'hotel', 'luu tru', 'nghi duong', 'phong nghi'] as $kw) {
            if (str_contains($ascii, $kw)) {
                $serviceType = 'hotel';
                $serviceTitleVi = 'Khách sạn & Resort';
                $unitLabel = '/đêm';
                $routePath = '/travel/hotel';
                break;
            }
        }

        if (!$serviceType) {
            foreach (['thue xe', 'car rental', 'tu lai', 'tai xe', 'xe 7 cho', 'xe 4 cho', 'o to'] as $kw) {
                if (str_contains($ascii, $kw)) {
                    $serviceType = 'car';
                    $serviceTitleVi = 'Thuê xe';
                    $unitLabel = '/ngày';
                    $routePath = '/travel/car';
                    break;
                }
            }
        }

        if (!$serviceType) {
            foreach (['trai nghiem', 'tour', 'lich trinh', 'choi gi', 'tham quan', 'diem den', 'attraction', 'experience', 'kham pha'] as $kw) {
                if (str_contains($ascii, $kw)) {
                    $serviceType = 'experience';
                    $serviceTitleVi = 'Trải nghiệm & Tour';
                    $unitLabel = '/khách';
                    $routePath = '/travel/experience';
                    break;
                }
            }
        }

        if (!$serviceType) {
            return null;
        }

        $cityMap = [
            'da nang' => 'Đà Nẵng',
            'danang' => 'Đà Nẵng',
            'phu quoc' => 'Phú Quốc',
            'phuquoc' => 'Phú Quốc',
            'ha noi' => 'Hà Nội',
            'hanoi' => 'Hà Nội',
            'ho chi minh' => 'TP. Hồ Chí Minh',
            'sai gon' => 'TP. Hồ Chí Minh',
            'saigon' => 'TP. Hồ Chí Minh',
            'nha trang' => 'Nha Trang',
            'da lat' => 'Đà Lạt',
            'dalat' => 'Đà Lạt',
            'hoi an' => 'Hội An',
            'hue' => 'Huế',
            'quy nhon' => 'Quy Nhơn',
            'thuong hai' => 'Thượng Hải',
            'shanghai' => 'Thượng Hải',
            'tokyo' => 'Tokyo',
            'seoul' => 'Seoul',
            'singapore' => 'Singapore',
        ];

        $detectedCity = null;
        foreach ($cityMap as $needle => $dbCity) {
            if (str_contains($ascii, $needle)) {
                $detectedCity = $dbCity;
                break;
            }
        }

        $query = TravelProduct::query()
            ->where('type', $serviceType)
            ->where('is_active', true);

        if ($detectedCity) {
            $query->where('city', 'like', '%' . $detectedCity . '%');
        }

        $items = $query->orderByDesc('rating')->orderBy('price')->limit(4)->get();

        // Fallback if specific city has 0 rows: show top rated overall for that service type
        if ($items->isEmpty() && $detectedCity) {
            $items = TravelProduct::query()
                ->where('type', $serviceType)
                ->where('is_active', true)
                ->orderByDesc('rating')
                ->limit(4)
                ->get();
        }

        $cityLabel = $detectedCity ? " tại **{$detectedCity}**" : ' nổi bật trên SkyLink';
        $lines = [];
        $lines[] = "Dưới đây là những gợi ý **{$serviceTitleVi}** được đánh giá cao nhất{$cityLabel} từ hệ thống SkyLink:";
        $lines[] = '';

        foreach ($items as $idx => $item) {
            $num = $idx + 1;
            $price = number_format((float) $item->price, 0, ',', '.') . ' ₫';
            $rating = number_format((float) ($item->rating ?? 4.7), 1);
            $loc = $item->city ? " ({$item->city})" : '';
            $lines[] = "{$num}. **{$item->name}**{$loc} — Đánh giá **{$rating}/5★**, giá từ **{$price}{$unitLabel}**";
        }

        $lines[] = '';
        $lines[] = '✨ Bạn có thể bấm trực tiếp vào các thẻ gợi ý bên dưới để xem chi tiết, so sánh trên bản đồ OpenStreetMap và đặt giữ chỗ ngay (miễn phí hủy 24h)!';

        $targetUrl = $detectedCity
            ? $routePath . '?q=' . rawurlencode($detectedCity)
            : $routePath;

        return [
            'message' => implode("\n", $lines),
            'quick_replies' => [
                ['label' => "Xem tất cả {$serviceTitleVi}" . ($detectedCity ? " ở {$detectedCity}" : ''), 'payload' => "open:{$targetUrl}"],
                ['label' => 'Tìm chuyến bay kèm theo', 'payload' => $detectedCity ? "Tìm chuyến bay giá tốt đi {$detectedCity} cuối tuần này" : 'Tìm chuyến bay giá tốt cuối tuần này'],
            ],
        ];
    }

    private function cheapestFlightFollowUp(AIConversation $conversation, string $message): ?array
    {
        $query = mb_strtolower(trim($message), 'UTF-8');
        $asksForCheapest = str_contains($query, 'rẻ nhất')
            || str_contains($query, 're nhat')
            || str_contains($query, 'giá thấp nhất')
            || str_contains($query, 'gia thap nhat')
            || str_contains($query, 'cheapest')
            || str_contains($query, 'cheapest flight');

        if (!$asksForCheapest) {
            return null;
        }

        $currentUserMessageId = $conversation->messages()
            ->where('role', 'user')
            ->latest('id')
            ->value('id');

        if (!$currentUserMessageId) {
            return null;
        }

        $previousUserMessageId = $conversation->messages()
            ->where('role', 'user')
            ->where('id', '<', $currentUserMessageId)
            ->latest('id')
            ->value('id');

        if (!$previousUserMessageId) {
            return $this->missingCheapestFlightContext();
        }

        $searchMessage = $conversation->messages()
            ->where('role', 'tool')
            ->where('tool_name', 'search_flight')
            ->where('id', '>', $previousUserMessageId)
            ->where('id', '<', $currentUserMessageId)
            ->latest('id')
            ->first();

        if (!$searchMessage) {
            return $this->missingCheapestFlightContext();
        }

        $result = $searchMessage->tool_result;
        if ($result instanceof \ArrayObject) {
            $result = $result->getArrayCopy();
        } elseif (is_string($result)) {
            $result = json_decode($result, true);
        }

        if (!is_array($result)) {
            return $this->missingCheapestFlightContext();
        }

        $flights = $result['flights'] ?? [];
        if ($flights instanceof \ArrayObject) {
            $flights = $flights->getArrayCopy();
        }

        if (!is_array($flights)) {
            return $this->missingCheapestFlightContext();
        }

        $flights = array_values(array_filter(
            $flights,
            fn ($flight) => is_array($flight) && is_numeric($flight['base_price'] ?? null)
        ));

        if ($flights === []) {
            return [
                'message' => 'Danh sách chuyến bay vừa tìm không có chuyến phù hợp để so sánh giá.',
                'flights' => [],
            ];
        }

        usort(
            $flights,
            fn (array $first, array $second) => (float) $first['base_price'] <=> (float) $second['base_price']
        );

        $cheapestFlight = $flights[0];
        $flightNumber = $cheapestFlight['flight_number'] ?? 'Chuyến bay';
        $origin = $cheapestFlight['origin'] ?? '';
        $destination = $cheapestFlight['destination'] ?? '';
        $route = $origin !== '' && $destination !== '' ? " ({$origin} → {$destination})" : '';
        $departureTime = isset($cheapestFlight['departure_time'])
            ? ' khởi hành lúc ' . substr((string) $cheapestFlight['departure_time'], 11, 5)
            : '';
        $price = number_format((float) $cheapestFlight['base_price'], 0, ',', '.');

        return [
            'message' => "Trong danh sách vừa tìm, chuyến rẻ nhất là **{$flightNumber}**{$route}{$departureTime}, giá **{$price} VND**.",
            'flights' => [$cheapestFlight],
        ];
    }

    private function missingCheapestFlightContext(): array
    {
        return [
            'message' => 'Bạn muốn tìm chuyến rẻ nhất cho hành trình nào? Vui lòng cho biết điểm đi, điểm đến và ngày bay.',
            'flights' => [],
        ];
    }

    private function saveUserMessage(AIConversation $conversation, string $message): void
    {
        DB::transaction(function () use ($conversation, $message) {
            if (!$conversation->title) {
                $conversation->update(['title' => Str::limit($message, 160)]);
            }

            $conversation->messages()->create([
                'role' => 'user',
                'content' => $message,
            ]);
        });
    }

    private function saveToolMessage(AIConversation $conversation, array $toolCall, string $toolName, array $arguments, array $result): void
    {
        $conversation->messages()->create([
            'role' => 'tool',
            'content' => json_encode($result, JSON_UNESCAPED_UNICODE),
            'tool_call_id' => $toolCall['id'] ?? null,
            'tool_name' => $toolName,
            'tool_arguments' => $arguments,
            'tool_result' => $result,
        ]);
    }

    private function shouldUseTools(string $message): bool
    {
        $ascii = Str::ascii(mb_strtolower(trim($message), 'UTF-8'));

        $explicitFlightIntent = false;
        foreach ([
            'tim chuyen bay', 'tim ve', 'chuyen bay', 've may bay', 'bay tu', 'bay di',
            'flight', 'book flight', 'booking', 'ma dat cho', 'pnr', 've cua toi',
            'ghe trong', 'chon ghe', 'hoan ve', 'huy ve', 'doi ve', 'check-in', 'checkin',
            'hanh ly', 'chinh sach', 'quy dinh',
        ] as $flightKw) {
            if (str_contains($ascii, $flightKw)) {
                $explicitFlightIntent = true;
                break;
            }
        }

        // If user is asking about Hotels, Experiences/Tours, or Car Rental without asking for flights,
        // let the LLM answer directly as a travel concierge instead of triggering search_flight.
        if (!$explicitFlightIntent) {
            foreach ([
                'khach san', 'resort', 'hotel', 'luu tru', 'nghi duong', 'phong nghi',
                'trai nghiem', 'tour', 'lich trinh', 'choi gi', 'tham quan', 'diem den', 'attraction', 'experience',
                'thue xe', 'car rental', 'tu lai', 'tai xe', 'xe 7 cho', 'xe 4 cho',
            ] as $travelKw) {
                if (str_contains($ascii, $travelKw)) {
                    return false;
                }
            }
        }

        if ($explicitFlightIntent) {
            return true;
        }

        foreach ([
            'di tu', 'dat ve', 'dat cho', 'ghe', 'cho ngoi', 'dich vu',
            'san bay', 'noi bai', 'tan son nhat', 'da nang', 'cam ranh', 'phu quoc',
        ] as $keyword) {
            if (str_contains($ascii, $keyword)) return true;
        }

        return false;
    }

    private function toolMessage(string $toolName): string
    {
        return match ($toolName) {
            'search_flight' => 'Đang tìm chuyến bay phù hợp...',
            'get_flight_details' => 'Đang lấy thông tin chuyến bay...',
            'check_seat_availability' => 'Đang kiểm tra ghế trống...',
            'get_airport_info' => 'Đang kiểm tra thông tin sân bay...',
            'get_booking_info' => 'Đang kiểm tra booking của bạn...',
            'search_airline_knowledge' => 'Đang tìm trong kho kiến thức SkyLink...',
            default => 'Đang kiểm tra thông tin...',
        };
    }

    public function getTools(): array
    {
        return [
            $this->searchFlightTool->definition(),
            $this->getFlightDetailsTool->definition(),
            $this->checkSeatAvailabilityTool->definition(),
            $this->getAirportInfoTool->definition(),
            $this->getBookingInfoTool->definition(),
            $this->searchKnowledgeTool->definition(),
        ];
    }

    private function executeToolCall(string $toolName, array $arguments, ?Model $user): array
    {
        try {
            return match ($toolName) {
                'search_flight' => $this->searchFlightTool->execute($arguments),
                'get_flight_details' => $this->getFlightDetailsTool->execute($arguments),
                'check_seat_availability' => $this->checkSeatAvailabilityTool->execute($arguments),
                'get_airport_info' => $this->getAirportInfoTool->execute($arguments),
                'get_booking_info' => $this->getBookingInfoTool->execute($arguments, $user),
                'search_airline_knowledge' => $this->searchKnowledgeTool->execute($arguments),
                default => ['type' => 'error', 'message' => 'Unknown AI tool.'],
            };
        } catch (Throwable $e) {
            Log::error('AI Tool Execution Error', [
                'tool' => $toolName,
                'arguments' => $arguments,
                'error' => $e->getMessage(),
            ]);

            return [
                'type' => 'error',
                'tool' => $toolName,
                'message' => 'Không thể lấy dữ liệu từ hệ thống lúc này.',
            ];
        }
    }

    private function normalizeArguments(mixed $arguments): array
    {
        if (is_array($arguments)) return $arguments;

        if (is_string($arguments) && $arguments !== '') {
            $decoded = json_decode($arguments, true);
            if (is_array($decoded)) return $decoded;
        }

        return [];
    }

    private function conversation(?string $conversationId, ?Model $user): AIConversation
    {
        if ($conversationId) {
            $query = AIConversation::where('uuid', $conversationId);

            if ($user) {
                $query->where(fn($q) => $q->where('user_id', $user->getKey())->orWhereNull('user_id'));
            } else {
                $query->whereNull('user_id');
            }

            return $query->firstOrFail();
        }

        return AIConversation::create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $user?->getKey(),
        ]);
    }

    private function history(AIConversation $conversation): array
    {
        return $conversation->messages()->oldest('id')->get()->map(function (AIMessage $message) {
            if ($message->role === 'assistant' && $message->tool_calls) {
                $toolCalls = $message->tool_calls;

                if (is_string($toolCalls)) {
                    $toolCalls = json_decode($toolCalls, true) ?? [];
                }

                return [
                    'role' => 'assistant',
                    'content' => $message->content,
                    'tool_calls' => is_array($toolCalls) ? $toolCalls : [],
                ];
            }

            if ($message->role === 'tool') {
                return [
                    'role' => 'tool',
                    'content' => $message->content,
                    'tool_call_id' => $message->tool_call_id,
                    'tool_name' => $message->tool_name,
                ];
            }

            return array_filter([
                'role' => $message->role,
                'content' => $message->content,
            ], fn($value) => $value !== null);
        })->values()->all();
    }

    private function getLocalizedFlightIntro(string $userMessage, int $count): string
    {
        $lang = $this->detectLanguage($userMessage);
        return match ($lang) {
            'en' => $count === 1
                ? "Here is the best matching flight for your request 👇"
                : "Here are {$count} matching flights for your request 👇",
            'km' => "នេះជាជើងហោះហើរដែលស័ក្តិសមបំផុតសម្រាប់អ្នក 👇",
            'zh' => $count === 1
                ? "以下是为您找到的最合适航班 👇"
                : "以下是为您找到的 {$count} 个航班 👇",
            'ja' => "ご希望に合ったフライトが見つかりました 👇",
            'ko' => "요청하신 일정에 맞는 항공편입니다 👇",
            'fr' => "Voici le vol le plus adapté à votre demande 👇",
            default => $count === 1
                ? "Dưới đây là chuyến bay phù hợp nhất với yêu cầu của bạn 👇"
                : "Mình tìm được {$count} chuyến bay phù hợp theo yêu cầu của bạn bên dưới 👇",
        };
    }

    private function getLocalizedNoFlights(string $userMessage): string
    {
        $lang = $this->detectLanguage($userMessage);
        return match ($lang) {
            'en' => "Sorry, we could not find any matching flights in the database for your request. Would you like me to check another date?",
            'km' => "សូមអភ័យទោស មិនមានជើងហោះហើរដែលត្រូវគ្នានៅក្នុងប្រព័ន្ធទេ។ តើអ្នកចង់ពិនិត្យមើលកាលបរិច្ឆេទផ្សេងទៀតទេ?",
            'zh' => "抱歉，数据库中暂未找到符合您要求的航班。您想查询其他日期吗？",
            'ja' => "申し訳ございません。該当するフライトが見つかりませんでした。他の日付でお探ししますか？",
            'ko' => "죄송합니다. 조건에 맞는 항공편을 찾을 수 없습니다. 다른 날짜로 검색해 드릴까요?",
            'fr' => "Désolé, aucun vol correspondant n'a été trouvé pour votre demande. Souhaitez-vous vérifier une autre date ?",
            default => "Rất tiếc, hiện tại không tìm thấy chuyến bay phù hợp trong cơ sở dữ liệu cho yêu cầu của bạn. Bạn có muốn mình kiểm tra vào một ngày khác không?",
        };
    }

    private function detectLanguage(string $text): string
    {
        // Khmer unicode range
        if (preg_match('/[\x{1780}-\x{17FF}]/u', $text)) return 'km';
        // Chinese
        if (preg_match('/[\x{4E00}-\x{9FFF}]/u', $text)) return 'zh';
        // Japanese (Hiragana/Katakana)
        if (preg_match('/[\x{3040}-\x{30FF}]/u', $text)) return 'ja';
        // Korean (Hangul)
        if (preg_match('/[\x{AC00}-\x{D7AF}]/u', $text)) return 'ko';

        // Vietnamese specific diacritics
        if (preg_match('/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/ui', $text)) {
            return 'vi';
        }

        // Check common English keywords
        $lower = strtolower($text);
        foreach (['flight', 'fly', 'book', 'ticket', 'tomorrow', 'today', 'from', 'to', 'hanoi', 'saigon', 'find', 'search', 'cheap', 'price', 'passport', 'baggage', 'seat', 'when', 'how', 'can i', 'hello', 'hi', 'where'] as $enWord) {
            if (str_contains($lower, $enWord)) return 'en';
        }

        return 'vi';
    }
}