<?php

namespace App\Services\AI;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class AIService
{
    protected array $apiKeys = [];
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    public function __construct()
    {
        $keyString = config('services.gemini.api_key') ?: env('GEMINI_API_KEY');

        // Direct .env file fallback in case of cached config or env issues
        if (empty($keyString) && file_exists(base_path('.env'))) {
            $envLines = @file(base_path('.env'), FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
            foreach ($envLines as $line) {
                $trimmed = trim($line);
                if (str_starts_with($trimmed, 'GEMINI_API_KEY=')) {
                    $keyString = trim(substr($trimmed, 15), " \t\n\r\0\x0B\"'");
                    break;
                }
            }
        }

        $keys = array_filter(array_map('trim', explode(',', (string) $keyString)));
        $this->apiKeys = !empty($keys) ? array_values($keys) : [];
        $this->apiKey = $this->apiKeys[0] ?? '';
        $this->model = (string) (config('services.gemini.model') ?: env('GEMINI_MODEL', 'gemini-1.5-flash'));

        if (empty($this->apiKeys)) {
            throw new RuntimeException('GEMINI_API_KEY is not configured.');
        }
    }

    public function systemPrompt(): string
    {
        $today = date('Y-m-d');
        $tomorrow = date('Y-m-d', strtotime('+1 day'));

        return <<<PROMPT
You are SkyAI Assistant, the official virtual assistant for SkyLink Airline Booking.

CURRENT DATE:
Today: {$today}
Tomorrow: {$tomorrow}

IMPORTANT:
- Flight information MUST come from airline database through tools.
- NEVER invent flights, prices, flight numbers, seats or booking information.
- MULTILINGUAL LANGUAGE RULE (CRITICAL): ALWAYS detect the language of the customer's message and reply in the EXACT SAME LANGUAGE (e.g., English, Vietnamese, Khmer ភាសាខ្មែរ, Chinese 中文, Japanese 日本語, Korean 한국어, French, Thai, etc.). If the customer writes in English, answer 100% in natural English. If the customer writes in Khmer, answer 100% in Khmer.
- Be concise, polite, and natural.

AIRPORT CODES:
Hà Nội / Nội Bài = HAN
TP.HCM / Sài Gòn / Tân Sơn Nhất = SGN
Đà Nẵng = DAD
Nha Trang / Cam Ranh = CXR
Phú Quốc = PQC
Hải Phòng / Cát Bi = HPH
Huế / Phú Bài = HUI
Đà Lạt / Liên Khương = DLI
Cần Thơ = VCA
Quy Nhơn / Phù Cát = UIH
Singapore / Changi = SIN
Phnom Penh / Campuchia = PNH
Kuala Lumpur / Malaysia = KUL
Tokyo / Nhật Bản = NRT
Seoul / Incheon / Hàn Quốc = ICN
Bắc Kinh / Beijing / Trung Quốc = PEK
Thượng Hải / Shanghai / Trung Quốc = PVG
Quảng Châu / Guangzhou / Trung Quốc = CAN
Thâm Quyến / Shenzhen / Trung Quốc = SZX

AIRLINE POLICIES & KNOWLEDGE BASE:
1. Hành lý:
   - Hành lý xách tay: 7kg miễn phí kèm vé.
   - Hạng Economy Standard có sẵn 20kg ký gửi; Hạng Business có 30kg ký gửi; Hạng Saver không có sẵn.
   - Mua thêm hành lý: Các gói 15kg, 20kg, 25kg, 30kg có thể chọn trực tiếp tại Bước chọn dịch vụ (Services) với giá ưu đãi rẻ hơn nhiều so với mua tại sân bay.
2. Suất ăn & Chỗ ngồi:
   - Có thể chọn chỗ ngồi ưa thích (cửa sổ, lối đi, hàng đầu) ngay tại Bước chọn ghế (Seat Selection).
   - Trong luồng đặt vé SkyLink hiện có thể chọn gói Suất ăn nóng ở Bước chọn dịch vụ. Không khẳng định có loại suất ăn đặc biệt hoặc thời hạn đăng ký chung; danh mục và hạn chót phụ thuộc hãng khai thác, chuyến bay và chặng bay.
3. Giá vé Trẻ em:
   - Trẻ sơ sinh (dưới 2 tuổi): 10% giá vé người lớn (ngồi chung ghế với người lớn).
   - Trẻ em (từ 2 đến dưới 12 tuổi): 75% giá vé người lớn (có ghế riêng).
4. Thanh toán & PNR:
   - Phương thức thanh toán: Thẻ tín dụng/ghi nợ quốc tế (Visa/Mastercard), Ví MoMo, VNPAY-QR, Chuyển khoản ngân hàng.
   - Mã đặt chỗ (PNR): Gửi tức thì qua Email và tin nhắn sau khi thanh toán thành công trong 1-3 phút.
5. Giấy tờ bay & Hộ chiếu:
   - Bay quốc tế (Singapore, Nhật Bản, Hàn Quốc, Trung Quốc...): Hộ chiếu BẮT BUỘC còn hạn ít nhất 6 tháng tính từ ngày nhập cảnh. (Hộ chiếu còn hạn 5 tháng KHÔNG đủ điều kiện xuất cảnh).
   - Bay nội địa: CCCD/Hộ chiếu/Giấy khai sinh (cho trẻ em) còn hiệu lực.
6. Hóa đơn VAT:
   - Khách hàng nhập thông tin công ty (Tên, MST, Địa chỉ) tại bước Thanh toán. Hóa đơn điện tử gửi qua email trong vòng 24h.
7. Thay đổi & Xử lý sự cố:
   - Đổi ngày bay/giờ bay: Hỗ trợ đổi trước giờ bay tối thiểu 3 tiếng, phí đổi 350.000đ/chặng + chênh lệch giá vé (nếu có).
   - Sai tên đệm: Hỗ trợ chỉnh sửa lỗi chính tả/tên đệm miễn phí hoặc phí nhỏ 100.000đ khi liên hệ CSKH.
   - Hủy vé & Hoàn tiền: Hạng Thương gia (Business) được hoàn tiền (trừ phí theo quy định); Hạng Siêu tiết kiệm không áp dụng hoàn vé.
   - Chuyến bay delay/hủy: Hãng hỗ trợ đổi sang chuyến bay kế tiếp miễn phí hoặc bồi thường/hoàn tiền theo Thông tư của Bộ GTVT.
   - Check-in Online: Mở trước 24 giờ và đóng trước 60 phút so với giờ khởi hành trên website/app SkyLink.

TOOL RULES:
1. Flight searches use `search_flight` — ONLY when the customer explicitly asks to search or compare flights/tickets. NEVER call `search_flight` when the customer asks about Hotels/Resorts, Experiences/Tours/Itineraries, or Car Rental.
2. For Hotels, Experiences, and Car Rental questions: answer concisely with structured bullet points and **bold** highlights (recommended areas, tips, and what to look for) and invite the user to click the live cards displayed right below your reply to check real-time prices & book on SkyLink.
3. "hôm nay" means {$today}.
4. "ngày mai" means {$tomorrow}.
5. "cuối tuần" means this coming Saturday / Sunday.
6. If the user asks for "1 chuyến duy nhất", "chuyến rẻ nhất", "1 chuyến", or a specific number of flights, ALWAYS set `limit: 1` (or the requested number) in `search_flight`.
7. If the user asks for earliest / latest flight, set `sort_by: "departure_asc"` or `"departure_desc"`.
8. If the user asks for flights before/after a specific time (e.g. "trước 7h", "sáng sớm", "buổi tối"), pass `before_time`, `after_time`, or `time_of_day`.
9. Only flight searches query the flights database. For general policy, baggage, booking questions, use the knowledge base above or `search_airline_knowledge`.
10. If no flights are returned by tool, clearly say no matching flight was found in the database.

FLIGHT RESULTS DISPLAY RULE (VERY IMPORTANT):
- When search_flight returns flights, the UI automatically displays Flight Cards with full details (price, time, origin, destination, available seats).
- You MUST NOT list flight details (prices, times, flight numbers) in your text response — this would duplicate information and confuse the user.
- Instead, write ONLY a short intro sentence, for example:
  "Mình tìm được chuyến bay phù hợp với yêu cầu của bạn bên dưới 👇"
- Keep the intro under 2 sentences. Let the Flight Cards do the rest.
PROMPT;
    }

    public function complete(array $messages, array $tools = []): array
    {
        $payload = [
            'systemInstruction' => ['parts' => [['text' => $this->systemPrompt()]]],
            'contents' => $this->convertMessagesToGemini($messages),
            'generationConfig' => ['temperature' => 0.2],
        ];

        if (!empty($tools)) {
            $geminiTools = $this->convertToolsToGemini($tools);
            if (!empty($geminiTools)) $payload['tools'] = $geminiTools;
        }

        $candidateModels = array_slice($this->candidateModels(), 0, 2);
        $requestBudget = 2;

        $lastError = null;

        foreach ($candidateModels as $model) {
            $url = $this->baseUrl . '/models/' . $model . ':generateContent';

            foreach ($this->apiKeys as $apiKey) {
                if ($requestBudget <= 0) {
                    break 2;
                }

                $requestBudget--;
                $maxAttempts = 1;
                for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
                    Log::info('Gemini complete request', ['model' => $model, 'attempt' => $attempt, 'messages' => count($messages)]);

                    $start = microtime(true);

                    try {
                        $response = Http::withOptions([
                            'curl' => [
                                CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
                                CURLOPT_SSL_VERIFYPEER => false,
                                CURLOPT_SSL_VERIFYHOST => 0,
                            ],
                        ])
                        ->acceptJson()
                        ->withoutVerifying()
                        ->connectTimeout(5)
                        ->timeout(12)
                        ->withQueryParameters(['key' => $apiKey])
                        ->post($url, $payload);
                    } catch (\Throwable $e) {
                        $lastError = 'cURL Connection Exception: ' . $e->getMessage();
                        Log::warning("Gemini complete model {$model} connection attempt {$attempt} failed: " . $e->getMessage());
                        if ($attempt < $maxAttempts) {
                            sleep(1);
                            continue;
                        }
                        break;
                    }

                    Log::info('Gemini complete response', [
                        'duration' => round(microtime(true) - $start, 2),
                        'status' => $response->status(),
                        'model' => $model,
                    ]);

                    if ($response->successful()) {
                        return $this->parseGeminiResponse($response->json());
                    }

                    $status = $response->status();
                    if ($status === 429 || $status === 503 || empty($lastError) || !in_array($status, [404], true)) {
                        $lastError = $response->body();
                    }

                    // If rate limit (429) or busy (503), retry up to 4 times with progressive backoff to let rate limit window reset
                    if (in_array($status, [503, 429], true)) {
                        Log::warning("Gemini model {$model} key busy (HTTP {$status}), retrying attempt {$attempt}/{$maxAttempts}...");
                        if ($attempt < $maxAttempts) {
                            $sleepSecs = 1;
                            sleep($sleepSecs);
                            continue;
                        }
                        break;
                    }

                    break;
                }
            }
        }

        Log::warning('Gemini All Models and Keys Failed, engaging Fallback Engine', ['error' => $lastError]);
        
        $lastUserIndex = -1;
        for ($i = count($messages) - 1; $i >= 0; $i--) {
            if (($messages[$i]['role'] ?? '') === 'user') {
                $lastUserIndex = $i;
                break;
            }
        }

        $hasToolExecutedInCurrentTurn = false;
        if ($lastUserIndex >= 0) {
            for ($i = $lastUserIndex + 1; $i < count($messages); $i++) {
                if (($messages[$i]['role'] ?? '') === 'tool') {
                    $hasToolExecutedInCurrentTurn = true;
                    break;
                }
            }
        }

        if (!$hasToolExecutedInCurrentTurn) {
            $flightIntent = $this->parseFlightIntent($messages);
            if ($flightIntent) {
                return [
                    'role' => 'assistant',
                    'content' => null,
                    'tool_calls' => [
                        [
                            'id' => 'fallback_flight_search_' . uniqid(),
                            'type' => 'function',
                            'function' => [
                                'name' => 'search_flight',
                                'arguments' => $flightIntent,
                            ],
                        ],
                    ],
                ];
            }
        }

        if ($hasToolExecutedInCurrentTurn) {
            $lastUserMsg = '';
            foreach ($messages as $msg) {
                if (($msg['role'] ?? '') === 'user') {
                    $lastUserMsg = $msg['content'] ?? $lastUserMsg;
                }
            }
            $q = mb_strtolower($lastUserMsg, 'UTF-8');
            $introText = "Mình đã tìm được các chuyến bay phù hợp với yêu cầu của bạn từ cơ sở dữ liệu bên dưới 👇";
            if (str_contains($q, 'rẻ nhất') || str_contains($q, 're nhat') || str_contains($q, 'thấp nhất')) {
                $introText = "Chuyến bay có giá rẻ nhất phù hợp với yêu cầu của bạn là chuyến dưới đây 👇";
            }

            return [
                'role' => 'assistant',
                'content' => $introText,
                'tool_calls' => [],
            ];
        }

        return [
            'role' => 'assistant',
            'content' => $this->generateFallbackResponse($messages, $lastError),
            'tool_calls' => [],
        ];
    }

    protected function extractAirportsFromText(string $text, array $airports): array
    {
        $textLower = mb_strtolower($text, 'UTF-8');
        $matches = [];

        foreach ($airports as $name => $code) {
            $pattern = '/(?<![\p{L}\p{N}])' . preg_quote($name, '/') . '(?![\p{L}\p{N}])/u';
            if (preg_match($pattern, $textLower, $match, PREG_OFFSET_CAPTURE)) {
                $matches[] = [
                    'pos' => $match[0][1],
                    'code' => $code,
                ];
            }
        }

        if (empty($matches)) {
            return [null, null];
        }

        usort($matches, function ($a, $b) {
            return $a['pos'] <=> $b['pos'];
        });

        $origin = $matches[0]['code'] ?? null;
        $destination = null;

        for ($i = 1; $i < count($matches); $i++) {
            if ($matches[$i]['code'] !== $origin) {
                $destination = $matches[$i]['code'];
                break;
            }
        }

        return [$origin, $destination];
    }

    protected function parseFlightIntent(array $messages): ?array
    {
        $lastUserMsg = '';
        $fullHistoryText = '';

        foreach ($messages as $msg) {
            $role = $msg['role'] ?? '';
            $content = $msg['content'] ?? '';
            if (is_string($content)) {
                $fullHistoryText .= ' ' . $content;
            }
            if ($role === 'user') {
                $lastUserMsg = is_string($content) ? $content : $lastUserMsg;
            }
        }

        $q = mb_strtolower($lastUserMsg, 'UTF-8');
        $normalizedQuery = Str::ascii($q);

        // Explicitly check for policy / knowledge base questions first
        $isPolicyOrKnowledge = str_contains($q, 'hành lý') || str_contains($q, 'hanh ly') ||
                               str_contains($q, 'ký gửi') || str_contains($q, 'kí gửi') ||
                               str_contains($q, 'xách tay') || str_contains($q, 'xach tay') ||
                               str_contains($q, 'suất ăn') || str_contains($q, 'suat an') ||
                               str_contains($q, 'chỗ ngồi') || str_contains($q, 'cho ngoi') ||
                               str_contains($q, 'trẻ em') || str_contains($q, 'tre em') ||
                               str_contains($q, 'sơ sinh') || str_contains($q, 'so sinh') ||
                               str_contains($q, 'thanh toán') || str_contains($q, 'thanh toan') ||
                               str_contains($q, 'hộ chiếu') || str_contains($q, 'ho chieu') ||
                               str_contains($q, 'đổi vé') || str_contains($q, 'doi ve') || str_contains($q, 'đổi ngày') || str_contains($q, 'doi ngay') ||
                               str_contains($q, 'hủy vé') || str_contains($q, 'huy ve') || str_contains($q, 'hủy chuyến') || str_contains($q, 'huy chuyen') ||
                               str_contains($q, 'hoàn vé') || str_contains($q, 'hoan ve') || str_contains($q, 'hoàn tiền') || str_contains($q, 'hoan tien') ||
                               str_contains($q, 'check-in') || str_contains($q, 'checkin') || str_contains($q, 'thủ tục') ||
                               str_contains($q, 'khuyến mãi') || str_contains($q, 'ưu đãi') ||
                               str_contains($q, 'pnr') || str_contains($q, 'mã đặt chỗ');

        if ($isPolicyOrKnowledge) {
            return null;
        }

        $airports = [
            'hà nội' => 'HAN', 'ha noi' => 'HAN', 'hn' => 'HAN', 'nội bài' => 'HAN', 'han' => 'HAN',
            'tp hcm' => 'SGN', 'tphcm' => 'SGN', 'tp.hcm' => 'SGN', 'hcm' => 'SGN', 'hồ chí minh' => 'SGN', 'ho chi minh' => 'SGN', 'sài gòn' => 'SGN', 'sai gon' => 'SGN', 'sg' => 'SGN', 'sgn' => 'SGN',
            'đà nẵng' => 'DAD', 'da nang' => 'DAD', 'dad' => 'DAD',
            'phú quốc' => 'PQC', 'phu quoc' => 'PQC', 'pqc' => 'PQC',
            'nha trang' => 'CXR', 'cam ranh' => 'CXR', 'cxr' => 'CXR',
            'hải phòng' => 'HPH', 'hai phong' => 'HPH', 'hph' => 'HPH',
            'đà lạt' => 'DLI', 'da lat' => 'DLI', 'dli' => 'DLI',
        ];

        [$foundOrigin, $foundDestination] = $this->extractAirportsFromText($lastUserMsg, $airports);

        if (!$foundOrigin || !$foundDestination) {
            for ($i = count($messages) - 1; $i >= 0; $i--) {
                $msgContent = $messages[$i]['content'] ?? '';
                if (!is_string($msgContent) || empty($msgContent)) {
                    continue;
                }
                [$histOrigin, $histDest] = $this->extractAirportsFromText($msgContent, $airports);
                if ($histOrigin && !$foundOrigin) {
                    $foundOrigin = $histOrigin;
                }
                if ($histDest && !$foundDestination) {
                    $foundDestination = $histDest;
                }
                if ($foundOrigin && $foundDestination) {
                    break;
                }
            }
        }

        $hasFlightKeyword = str_contains($q, 'chuyến bay') || str_contains($q, 'tim chuyen') || str_contains($q, 'tìm vé') || str_contains($q, 'tim ve') || str_contains($q, 'vé bay') || str_contains($q, 'vé từ') || str_contains($q, 'vé về') || str_contains($q, 'rẻ nhất') || str_contains($q, 're nhat') || str_contains($q, 'sớm nhất') || str_contains($q, 'som nhat') || str_contains($q, 'bay') || str_contains($q, 'chuyến');

        if (!$hasFlightKeyword && !$foundOrigin && !$foundDestination) {
            return null;
        }

        if (!$foundOrigin && !$foundDestination) {
            return null;
        }

        $origin = $foundOrigin ?: 'HAN';
        $destination = $foundDestination ?: ($origin === 'HAN' ? 'SGN' : 'HAN');

        $args = [
            'origin' => $origin,
            'destination' => $destination,
            'sort_by' => 'price_asc',
        ];

        if (str_contains($normalizedQuery, 'ngay mai') || preg_match('/\bmai\b/u', $normalizedQuery)) {
            $args['date'] = now()->addDay()->toDateString();
        } elseif (str_contains($normalizedQuery, 'hom nay')) {
            $args['date'] = now()->toDateString();
        }

        if (preg_match('/\bngay\s+(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\b/u', $normalizedQuery, $dateMatch)) {
            $args['date'] = sprintf('%04d-%02d-%02d', $dateMatch[3], $dateMatch[2], $dateMatch[1]);
        }

        if (
            str_contains($normalizedQuery, 'buoi sang') ||
            str_contains($normalizedQuery, 'sang som') ||
            str_contains($normalizedQuery, 'morning')
        ) {
            $args['time_of_day'] = 'morning';
        } elseif (
            str_contains($normalizedQuery, 'buoi chieu') ||
            str_contains($normalizedQuery, 'buoi trua') ||
            str_contains($normalizedQuery, 'afternoon')
        ) {
            $args['time_of_day'] = 'afternoon';
        } elseif (
            str_contains($normalizedQuery, 'buoi toi') ||
            str_contains($normalizedQuery, 'ban dem') ||
            str_contains($normalizedQuery, 'evening')
        ) {
            $args['time_of_day'] = 'evening';
        }

        if (str_contains($normalizedQuery, 're nhat') || str_contains($normalizedQuery, '1 chuyen') || str_contains($normalizedQuery, 'thap nhat') || str_contains($normalizedQuery, 'gia re')) {
            $args['limit'] = 1;
            $args['sort_by'] = 'price_asc';
        }

        if (str_contains($normalizedQuery, 'som nhat')) {
            $args['limit'] = 1;
            $args['sort_by'] = 'departure_asc';
        }

        return $args;
    }

    public function stream(array $messages): \Generator
    {
        $payload = [
            'systemInstruction' => ['parts' => [['text' => $this->systemPrompt()]]],
            'contents' => $this->convertMessagesToGemini($messages),
            'generationConfig' => ['temperature' => 0.2],
        ];

        $candidateModels = array_slice($this->candidateModels(), 0, 2);
        $requestBudget = 2;

        $response = null;
        $lastError = null;

        foreach ($candidateModels as $model) {
            $url = $this->baseUrl . '/models/' . $model . ':streamGenerateContent';

            foreach ($this->apiKeys as $apiKey) {
                if ($requestBudget <= 0) {
                    break 2;
                }

                $requestBudget--;
                $maxAttempts = 1;
                for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
                    try {
                        $res = Http::withOptions([
                            'stream' => true,
                            'curl' => [
                                CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
                                CURLOPT_SSL_VERIFYPEER => false,
                                CURLOPT_SSL_VERIFYHOST => 0,
                            ],
                        ])
                        ->withoutVerifying()
                        ->acceptJson()
                        ->connectTimeout(5)
                        ->timeout(12)
                        ->withQueryParameters(['key' => $apiKey, 'alt' => 'sse'])
                        ->post($url, $payload);
                    } catch (\Throwable $e) {
                        $lastError = 'cURL Connection Exception: ' . $e->getMessage();
                        Log::warning("Gemini stream model {$model} connection attempt {$attempt} failed: " . $e->getMessage());
                        if ($attempt < $maxAttempts) {
                            sleep(1);
                            continue;
                        }
                        break;
                    }

                    if ($res->successful()) {
                        $response = $res;
                        break 3;
                    }

                    $status = $res->status();
                    if ($status === 429 || $status === 503 || empty($lastError) || !in_array($status, [404], true)) {
                        $lastError = $res->body();
                    }

                    if (in_array($status, [503, 429], true)) {
                        Log::warning("Gemini stream model {$model} key busy (HTTP {$status}), retrying attempt {$attempt}/{$maxAttempts}...");
                        if ($attempt < $maxAttempts) {
                            $sleepSecs = 1;
                            sleep($sleepSecs);
                            continue;
                        }
                        break;
                    }

                    break;
                }
            }
        }

        if (!$response) {
            Log::warning('Gemini Stream Failed on all keys/models, engaging Fallback Streaming Engine', ['error' => $lastError]);
            $fallbackText = $this->generateFallbackResponse($messages, $lastError);
            $words = preg_split('/(\s+)/u', $fallbackText, -1, PREG_SPLIT_DELIM_CAPTURE);
            foreach ($words as $word) {
                yield ['content' => $word, 'done' => false];
                usleep(25000); // 25ms streaming simulation
            }
            yield ['content' => '', 'done' => true];
            return;
        }

        $body = $response->toPsrResponse()->getBody();
        $buffer = '';

        while (!$body->eof()) {
            $chunk = $body->read(8192);

            if ($chunk === '') {
                usleep(10000);
                continue;
            }

            $buffer .= $chunk;

            while (($position = strpos($buffer, "\n")) !== false) {
                $line = trim(substr($buffer, 0, $position));
                $buffer = substr($buffer, $position + 1);

                if ($line === '') continue;
                if (str_starts_with($line, 'data:')) $line = trim(substr($line, 5));

                $json = json_decode($line, true);
                if (!is_array($json)) continue;

                $content = $this->extractText($json);

                if ($content !== '') {
                    yield ['content' => $content, 'done' => false];
                }
            }
        }

        yield ['content' => '', 'done' => true];
    }

    private function candidateModels(): array
    {
        return array_values(array_unique(array_filter([
            $this->model,
            'gemini-2.0-flash',
            'gemini-flash-latest',
            'gemini-1.5-flash-latest',
            'gemini-1.5-flash',
        ])));
    }

    private function convertMessagesToGemini(array $messages): array
    {
        $contents = [];

        foreach ($messages as $message) {
            $role = $message['role'] ?? 'user';

            if ($role === 'system') continue;

            if ($role === 'user') {
                $parts = [];
                $text = (string) ($message['content'] ?? '');
                if ($text !== '') {
                    $parts[] = ['text' => $text];
                }

                if (!empty($message['images']) && is_array($message['images'])) {
                    foreach ($message['images'] as $img) {
                        if (is_string($img) && str_starts_with($img, 'data:')) {
                            if (preg_match('/^data:([^;]+);base64,(.+)$/s', $img, $matches)) {
                                $parts[] = [
                                    'inlineData' => [
                                        'mimeType' => $matches[1],
                                        'data' => trim($matches[2]),
                                    ],
                                ];
                            }
                        } elseif (is_array($img) && !empty($img['data'])) {
                            $rawMime = $img['mime_type'] ?? $img['mimeType'] ?? 'image/jpeg';
                            $rawBase64 = preg_replace('/^data:[^;]+;base64,/s', '', (string)$img['data']);
                            $parts[] = [
                                'inlineData' => [
                                    'mimeType' => $rawMime,
                                    'data' => trim($rawBase64),
                                ],
                            ];
                        }
                    }
                }

                if (empty($parts)) {
                    $parts[] = ['text' => ' '];
                }

                $contents[] = [
                    'role' => 'user',
                    'parts' => $parts,
                ];
                continue;
            }

            if ($role === 'assistant') {
                $parts = [];

                if (!empty($message['content'])) {
                    $parts[] = ['text' => (string) $message['content']];
                }

                foreach ($message['tool_calls'] ?? [] as $toolCall) {
                    $name = $toolCall['function']['name'] ?? null;
                    $arguments = $toolCall['function']['arguments'] ?? [];

                    if (is_string($arguments)) {
                        $arguments = json_decode($arguments, true) ?? [];
                    }

                    if ($name) {
                        $part = [
                            'functionCall' => [
                                'name' => $name,
                                'args' => $arguments,
                            ],
                        ];

                        if (!empty($toolCall['thought_signature'])) {
                            $part['thoughtSignature'] = $toolCall['thought_signature'];
                        }

                        $parts[] = $part;
                    }
                }

                if (!empty($parts)) {
                    $contents[] = ['role' => 'model', 'parts' => $parts];
                }

                continue;
            }

            if ($role === 'tool') {
                $result = $message['content'] ?? '';

                if (is_string($result)) {
                    $decoded = json_decode($result, true);
                    if (json_last_error() === JSON_ERROR_NONE) $result = $decoded;
                }

                $contents[] = [
                    'role' => 'user',
                    'parts' => [[
                        'functionResponse' => [
                            'name' => $message['tool_name'] ?? 'unknown',
                            'response' => is_array($result) ? $result : ['result' => $result],
                        ],
                    ]],
                ];
            }
        }

        return $contents;
    }

    private function convertToolsToGemini(array $tools): array
    {
        $functionDeclarations = [];

        foreach ($tools as $tool) {
            if (($tool['type'] ?? '') !== 'function' || !isset($tool['function'])) continue;

            $function = $tool['function'];
            $parameters = $function['parameters'] ?? ['type' => 'object', 'properties' => new \stdClass()];

            $this->cleanGeminiSchema($parameters);

            $functionDeclarations[] = [
                'name' => $function['name'] ?? '',
                'description' => $function['description'] ?? '',
                'parameters' => $parameters,
            ];
        }

        return empty($functionDeclarations) ? [] : [['function_declarations' => $functionDeclarations]];
    }

    private function cleanGeminiSchema(array &$schema): void
    {
        unset($schema['additionalProperties'], $schema['nullable']);

        if (isset($schema['properties']) && is_array($schema['properties'])) {
            foreach ($schema['properties'] as &$property) {
                if (is_array($property)) $this->cleanGeminiSchema($property);
            }
            unset($property);
        }

        if (isset($schema['items']) && is_array($schema['items'])) {
            $this->cleanGeminiSchema($schema['items']);
        }
    }

    private function parseGeminiResponse(array $json): array
    {
        $candidate = $json['candidates'][0] ?? null;

        if (!$candidate) {
            throw new RuntimeException('Gemini returned no candidate.');
        }

        $parts = $candidate['content']['parts'] ?? [];
        $text = '';
        $toolCalls = [];

        foreach ($parts as $part) {
            if (isset($part['text'])) $text .= $part['text'];

            if (isset($part['functionCall'])) {
                $call = $part['functionCall'];

                $toolCalls[] = [
                    'id' => 'gemini_' . uniqid(),
                    'type' => 'function',
                    'thought_signature' => $part['thoughtSignature'] ?? null,
                    'function' => [
                        'name' => $call['name'] ?? '',
                        'arguments' => $call['args'] ?? [],
                    ],
                ];
            }
        }

        return [
            'role' => 'assistant',
            'content' => $text,
            'tool_calls' => $toolCalls,
        ];
    }

    private function extractText(array $json): string
    {
        $parts = $json['candidates'][0]['content']['parts'] ?? [];
        $text = '';

        foreach ($parts as $part) {
            if (isset($part['text'])) $text .= $part['text'];
        }

        return $text;
    }

    protected function formatErrorMessage(?string $rawError): string
    {
        if (empty($rawError)) {
            return 'Hệ thống AI tạm thời không phản hồi. Bạn vui lòng thử lại sau nhé.';
        }

        if (str_contains($rawError, '503') || str_contains($rawError, 'high demand') || str_contains($rawError, 'UNAVAILABLE')) {
            return 'Máy chủ Google AI hiện tại đang quá tải tạm thời (High Demand 503). Bạn bấm nút thử lại sau vài giây nhé! ✈️';
        }

        if (str_contains($rawError, '429') || str_contains($rawError, 'RESOURCE_EXHAUSTED') || str_contains($rawError, 'Quota exceeded')) {
            return 'Hệ thống Trợ lý SkyAI đang nhận nhiều truy vấn cùng lúc (chạm giới hạn lượt gọi Free Tier từ Google API). Bạn vui lòng đợi 15-20 giây rồi gửi lại nhé! ✈️';
        }

        if (str_contains($rawError, '404') || str_contains($rawError, 'NOT_FOUND')) {
            return 'Mô hình AI hiện tại không khả dụng trên API key này. Bạn kiểm tra lại key Google Gemini nhé.';
        }

        return 'Lỗi trợ lý AI: ' . $rawError;
    }

    protected function generateFallbackResponse(array $messages, ?string $lastError = null): string
    {
        $lastUserMsg = '';
        for ($i = count($messages) - 1; $i >= 0; $i--) {
            if (($messages[$i]['role'] ?? '') === 'user') {
                $lastUserMsg = $messages[$i]['content'] ?? '';
                break;
            }
        }

        $query = mb_strtolower($lastUserMsg, 'UTF-8');

        if (str_contains($query, 'hành lý') || str_contains($query, 'hanh ly') || str_contains($query, 'ký gửi') || str_contains($query, 'kí gửi') || str_contains($query, 'xách tay') || str_contains($query, 'xach tay')) {
            return "🧳 **Quy định Hành lý SkyLink Airline:**\n\n" .
                   "1. **Hành lý xách tay:** Miễn phí **7kg** kèm theo mỗi vé cho tất cả các hạng ghế.\n" .
                   "2. **Hành lý ký gửi miễn phí:**\n" .
                   "   - **Hạng vé Economy Standard (Phổ thông tiêu chuẩn):** Miễn phí **20kg** ký gửi.\n" .
                   "   - **Hạng vé Business (Thương gia):** Miễn phí **30kg** ký gửi.\n" .
                   "   - **Hạng vé Saver (Siêu tiết kiệm):** Chưa bao gồm hành lý ký gửi sẵn.\n\n" .
                   "💡 *Mẹo:* Bạn có thể chọn mua thêm các gói hành lý ký gửi (15kg, 20kg, 25kg, 30kg) với giá ưu đãi trực tiếp tại Bước chọn dịch vụ (Services) khi đặt vé hoặc làm thủ tục trực tuyến nhé!";
        }

        if (str_contains($query, 'trẻ em') || str_contains($query, 'sơ sinh') || str_contains($query, 'em bé') || str_contains($query, 'tre em') || str_contains($query, 'so sinh')) {
            return "👶 **Quy định Giá vé Trẻ em & Em bé:**\n\n" .
                   "1. **Em bé (Dưới 2 tuổi):** Tính **10% giá vé người lớn** (em bé ngồi chung ghế với người lớn đi cùng).\n" .
                   "2. **Trẻ em (Từ 2 đến dưới 12 tuổi):** Tính **75% giá vé người lớn** (có ghế ngồi riêng biệt).\n" .
                   "3. **Hành khách từ 12 tuổi trở lên:** Áp dụng giá vé người lớn chuẩn.\n\n" .
                   "Vui lòng mang theo Giấy khai sinh bản gốc/sao trích lục hoặc Hộ chiếu của bé khi làm thủ tục tại sân bay nhé!";
        }

        if (str_contains($query, 'đổi vé') || str_contains($query, 'hoàn vé') || str_contains($query, 'hủy vé') || str_contains($query, 'đổi ngày') || str_contains($query, 'doi ve') || str_contains($query, 'hoan ve')) {
            return "🔄 **Chính sách Đổi vé & Hủy vé SkyLink:**\n\n" .
                   "- **Thay đổi ngày/giờ bay:** Hỗ trợ trước giờ khởi hành tối thiểu 3 tiếng. Phí đổi: **350.000 VNĐ/chặng** + chênh lệch giá vé (nếu có).\n" .
                   "- **Hoàn/Hủy vé:** Áp dụng cho hạng Thương gia (Business) có hoàn tiền (trừ phí quy định). Hạng Siêu tiết kiệm không áp dụng hoàn vé.\n" .
                   "- **Sửa tên đệm/chính tả:** Hỗ trợ miễn phí hoặc phí nhỏ 100.000đ khi liên hệ Tổng đài CSKH.";
        }

        if (str_contains($query, 'checkin') || str_contains($query, 'check-in') || str_contains($query, 'thủ tục')) {
            return "📱 **Check-in Online (Thủ tục trực tuyến):**\n\n" .
                   "- Hệ thống mở thủ tục trực tuyến từ **24 giờ đến 60 phút** trước giờ khởi hành.\n" .
                   "- Bạn truy cập mục **'Check-in Online'** trên thanh Menu, nhập Mã đặt chỗ (PNR) và Họ tên để tự chọn chỗ ngồi ưa thích và tải Thẻ lên máy bay (Boarding Pass) điện tử nhé!";
        }

        if (str_contains($query, 'thanh toán') || str_contains($query, 'pnr') || str_contains($query, 'hóa đơn') || str_contains($query, 'thanh toan')) {
            return "💳 **Phương thức Thanh toán & Mã đặt chỗ (PNR):**\n\n" .
                   "- Hỗ trợ thanh toán qua: Thẻ Visa/Mastercard, Ví MoMo, VNPAY-QR, Chuyển khoản ngân hàng.\n" .
                   "- Mã đặt chỗ (PNR) và Vé điện tử sẽ được tự động gửi qua Email của bạn ngay trong 1-3 phút sau khi thanh toán thành công.\n" .
                   "- Hóa đơn VAT điện tử sẽ gửi qua email trong 24h nếu chọn nhập thông tin xuất hóa đơn tại bước thanh toán.";
        }

        $isCheapestFlightQuestion =
            str_contains($query, 'rẻ nhất') ||
            str_contains($query, 're nhat') ||
            str_contains($query, 'giá thấp nhất') ||
            str_contains($query, 'gia thap nhat') ||
            str_contains($query, 'cheap');

        if ($isCheapestFlightQuestion && (
            str_contains($query, 'chuyến bay') ||
            str_contains($query, 'chuyen bay') ||
            str_contains($query, 'vé') ||
            str_contains($query, 've ') ||
            str_contains($query, 'flight')
        )) {
            return 'Để tìm chuyến bay rẻ nhất, bạn cho mình biết điểm đi, điểm đến và ngày bay nhé?';
        }

        if (str_contains($query, 'chuyến bay') || str_contains($query, 'vé') || str_contains($query, 'bay') || str_contains($query, 'giá')) {
            return "✈️ **Trợ lý SkyAI (Hãng hàng không SkyLink Airline):**\n\nHệ thống hiện đang lưu trữ đầy đủ lịch trình các chuyến bay nội địa và quốc tế. Bạn có thể sử dụng thanh tìm kiếm trực tiếp trên trang chủ để tra cứu thông tin giờ bay và đặt vé dễ dàng:\n- **Điểm đi & điểm đến:** Hà Nội (HAN), TP.HCM (SGN), Đà Nẵng (DAD), Phú Quốc (PQC)...\n- **Hạng vé:** Phổ thông (Economy), Thương gia (Business).\n\nChúc bạn chọn được hành trình ưng ý nhất cùng SkyLink Airline!";
        }

        return "✈️ **Trợ lý Trực tuyến SkyAI:**\n\nXin chào! Trợ lý SkyAI luôn sẵn sàng đồng hành cùng bạn. Hệ thống SkyLink Airline đang hỗ trợ các dịch vụ:\n- Tìm kiếm & Đặt vé máy bay trực tuyến\n- Quy định hành lý & Đổi/Hủy vé\n- Check-in Online & Chọn chỗ ngồi\n\nBạn cần hỗ trợ thêm thông tin nào, hãy đặt câu hỏi cho mình nhé!";
    }
}