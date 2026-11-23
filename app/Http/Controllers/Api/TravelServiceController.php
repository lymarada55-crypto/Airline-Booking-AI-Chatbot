<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\TravelProduct;
use App\Models\TravelServicePayment;
use App\Models\TravelServiceReservation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use App\Services\Payment\PaymentFactory;

class TravelServiceController extends Controller
{
    private const TYPES = ['hotel', 'experience', 'car'];

    public function index(Request $request, string $type): JsonResponse
    {
        $this->validateType($type);

        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:20'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:200'],
            'sort' => ['nullable', 'in:price_asc,price_desc,rating_desc'],
            'start_date' => ['nullable', 'date', 'after_or_equal:today'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
        ]);

        $products = TravelProduct::query()
            ->where('type', $type)
            ->where('is_active', true)
            ->when($validated['q'] ?? null, function ($query, string $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($validated['city'] ?? null, fn ($query, string $city) => $query->where('city', 'like', "%{$city}%"))
            ->when($validated['guests'] ?? null, fn ($query, int $guests) => $query->where('max_guests', '>=', $guests));

        match ($validated['sort'] ?? 'rating_desc') {
            'price_asc' => $products->orderBy('price'),
            'price_desc' => $products->orderByDesc('price'),
            default => $products->orderByDesc('rating')->orderBy('price'),
        };

        $page = $products->paginate($validated['per_page'] ?? 12);
        $page->getCollection()->transform(function (TravelProduct $product) use ($type, $validated) {
            $product->setAttribute(
                'available_units',
                $this->availableUnits(
                    $product,
                    $type,
                    $validated['start_date'] ?? null,
                    $validated['end_date'] ?? null
                )
            );

            return $product;
        });

        return response()->json([
            'status' => 'success',
            'type' => $type,
            'data' => $page,
        ]);
    }

    public function show(string $type, int $id): JsonResponse
    {
        $this->validateType($type);

        $product = TravelProduct::query()
            ->where('type', $type)
            ->where('is_active', true)
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $product,
        ]);
    }

    public function storeReservation(Request $request, string $type, int $id): JsonResponse
    {
        $this->validateType($type);

        $product = TravelProduct::query()
            ->where('type', $type)
            ->where('is_active', true)
            ->findOrFail($id);

        $validated = $request->validate([
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => [
                Rule::requiredIf(in_array($type, ['hotel', 'car'], true)),
                'nullable',
                'date',
                'after:start_date',
            ],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:10'],
            'guest_count' => ['required', 'integer', 'min:1', 'max:20'],
            'guest_name' => [Rule::requiredIf(in_array($type, ['hotel', 'experience', 'car'], true)), 'nullable', 'string', 'max:255'],
            'guest_email' => [Rule::requiredIf(in_array($type, ['hotel', 'experience', 'car'], true)), 'nullable', 'email', 'max:255'],
            'guest_phone' => [
                Rule::requiredIf(in_array($type, ['hotel', 'experience', 'car'], true)),
                'nullable',
                'string',
                'regex:/^\+?[0-9\s().-]{8,30}$/',
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
            'booking_id' => ['nullable', 'integer'],
        ]);

        $quantity = (int) ($validated['quantity'] ?? 1);
        $startDate = Carbon::parse($validated['start_date']);
        $endDate = isset($validated['end_date']) ? Carbon::parse($validated['end_date']) : null;

        $reservation = DB::transaction(function () use ($type, $id, $request, $validated, $quantity, $startDate, $endDate) {
            $booking = null;
            if (! empty($validated['booking_id'])) {
                $booking = Booking::query()
                    ->where('user_id', $request->user()->id)
                    ->lockForUpdate()
                    ->findOrFail($validated['booking_id']);

                if ($booking->status !== 'paid') {
                    throw ValidationException::withMessages([
                        'booking_id' => 'Chỉ có thể gắn dịch vụ với vé đã thanh toán.',
                    ]);
                }
            }

            $product = TravelProduct::query()
                ->where('type', $type)
                ->where('is_active', true)
                ->lockForUpdate()
                ->findOrFail($id);

            if ($validated['guest_count'] > $product->max_guests * ($type === 'experience' ? 1 : $quantity)) {
                throw ValidationException::withMessages([
                    'guest_count' => 'Dịch vụ không đáp ứng số lượng khách đã chọn.',
                ]);
            }

            $requestedUnits = $type === 'experience' ? $validated['guest_count'] : $quantity;
            $availableUnits = $this->availableUnits(
                $product,
                $type,
                $startDate->toDateString(),
                $endDate?->toDateString()
            );

            if ($requestedUnits > $availableUnits) {
                throw ValidationException::withMessages([
                    'quantity' => 'Dịch vụ không còn đủ số lượng cho ngày bạn chọn.',
                ]);
            }

            $multiplier = $type === 'experience'
                ? $validated['guest_count']
                : max(1, $startDate->diffInDays($endDate)) * $quantity;
            $totalPrice = round((float) $product->price * $multiplier, 2);

            return TravelServiceReservation::create([
                'travel_product_id' => $product->id,
                'user_id' => $request->user()->id,
                'booking_id' => $booking?->id,
                'reference_code' => strtoupper(Str::random(10)),
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate?->toDateString(),
                'quantity' => $quantity,
                'guest_count' => $validated['guest_count'],
                'guest_name' => $validated['guest_name'] ?? null,
                'guest_email' => $validated['guest_email'] ?? null,
                'guest_phone' => $validated['guest_phone'] ?? null,
                'unit_price' => $product->price,
                'total_price' => $totalPrice,
                'status' => 'pending_payment',
                'payment_status' => 'unpaid',
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Đã đặt dịch vụ trong hệ thống SkyLink.',
            'data' => $reservation->load(['product', 'booking:id,pnr_code']),
        ], 201);
    }

    public function reservations(Request $request): JsonResponse
    {
        $perPage = max(1, min((int) $request->query('per_page', 50), 100));
        $reservations = TravelServiceReservation::query()
            ->with(['product', 'booking:id,pnr_code', 'payments'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $reservations,
        ]);
    }

    public function showReservation(Request $request, int $id): JsonResponse
    {
        $reservation = TravelServiceReservation::query()
            ->where('user_id', $request->user()->id)
            ->with(['product', 'booking:id,pnr_code', 'payments'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $reservation,
        ]);
    }

    public function payReservation(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'payment_method' => ['required', 'string', 'in:momo,vnpay'],
        ]);

        return DB::transaction(function () use ($validated, $request, $id) {
            $reservation = TravelServiceReservation::query()
                ->where('user_id', $request->user()->id)
                ->with('product')
                ->lockForUpdate()
                ->findOrFail($id);

            if (! in_array($reservation->product->type, ['hotel', 'experience', 'car'], true)) {
                throw ValidationException::withMessages([
                    'reservation' => 'Loại dịch vụ này chưa hỗ trợ thanh toán riêng.',
                ]);
            }

            if ($reservation->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'reservation' => 'Không thể thanh toán dịch vụ đã bị hủy.',
                ]);
            }

            if ($reservation->payment_status === 'paid') {
                throw ValidationException::withMessages([
                    'payment_status' => 'Dịch vụ này đã được thanh toán.',
                ]);
            }

            if (! in_array($reservation->status, ['pending_payment', 'booked'], true)) {
                throw ValidationException::withMessages([
                    'status' => 'Đặt dịch vụ này hiện không ở trạng thái chờ thanh toán.',
                ]);
            }

            $serviceType = match ($reservation->product->type) {
                'hotel' => 'HOTEL',
                'experience' => 'EXPERIENCE',
                'car' => 'CAR',
            };
            try {
                $gateway = PaymentFactory::create($validated['payment_method']);
                $paymentResult = $gateway->processPayment(
                    (int) round((float) $reservation->total_price),
                    $serviceType . '_' . $reservation->reference_code
                );
            } catch (\Exception $exception) {
                report($exception);

                return response()->json([
                    'status' => 'error',
                    'message' => 'Không thể xử lý thanh toán dịch vụ lúc này. Vui lòng thử lại.',
                ], 500);
            }

            if (($paymentResult['status'] ?? null) !== 'success') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Thanh toán dịch vụ thất bại.',
                ], 400);
            }

            TravelServicePayment::create([
                'travel_service_reservation_id' => $reservation->id,
                'transaction_id' => $paymentResult['transaction_id'] . '_R' . $reservation->id,
                'amount' => (int) round((float) $reservation->total_price),
                'payment_method' => $validated['payment_method'],
                'status' => 'success',
                'paid_at' => now(),
            ]);

            $reservation->update([
                'payment_status' => 'paid',
                'status' => 'pending_confirmation',
            ]);

            return response()->json([
                'status' => 'success',
                'message' => match ($reservation->product->type) {
                    'hotel' => 'Thanh toán khách sạn thành công.',
                    'experience' => 'Thanh toán trải nghiệm thành công.',
                    'car' => 'Thanh toán thuê xe thành công.',
                },
                'data' => $reservation->fresh(['product', 'booking:id,pnr_code', 'payments']),
                'demo_payment' => true,
            ]);
        });
    }

    public function cancelReservation(Request $request, int $id): JsonResponse
    {
        $reservation = TravelServiceReservation::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        if (! in_array($reservation->status, ['pending_payment', 'booked', 'pending_confirmation'], true)) {
            throw ValidationException::withMessages([
                'status' => 'Chỉ có thể hủy dịch vụ đang được đặt.',
            ]);
        }

        if ($reservation->payment_status === 'paid') {
            throw ValidationException::withMessages([
                'payment_status' => 'Đặt chỗ đã thanh toán. Vui lòng liên hệ hỗ trợ để được hướng dẫn hủy và hoàn tiền.',
            ]);
        }

        $reservation->update(['status' => 'cancelled']);

        return response()->json([
            'status' => 'success',
            'message' => 'Đã hủy yêu cầu đặt dịch vụ.',
            'data' => $reservation,
        ]);
    }

    public function adminReservations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'in:all,hotel,car,experience'],
            'status' => ['nullable', 'in:all,pending_payment,booked,pending_confirmation,confirmed,cancelled'],
            'payment_status' => ['nullable', 'in:all,paid,unpaid'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:200'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 10);

        $reservations = TravelServiceReservation::query()
            ->with([
                'product',
                'user:id,name,email',
                'booking:id,pnr_code',
                'payments',
            ])
            ->when(($validated['search'] ?? '') !== '', function ($query) use ($validated) {
                $search = $validated['search'];
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('reference_code', 'like', "%{$search}%")
                        ->orWhere('guest_name', 'like', "%{$search}%")
                        ->orWhere('guest_email', 'like', "%{$search}%")
                        ->orWhereHas('product', fn ($productQuery) => $productQuery->where('name', 'like', "%{$search}%")->orWhere('city', 'like', "%{$search}%"))
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('payments', fn ($paymentQuery) => $paymentQuery->where('transaction_id', 'like', "%{$search}%"))
                        ->orWhereHas('booking', fn ($bookingQuery) => $bookingQuery->where('pnr_code', 'like', "%{$search}%"));
                });
            })
            ->when(
                ! empty($validated['type']) && $validated['type'] !== 'all',
                fn ($query) => $query->whereHas('product', fn ($pq) => $pq->where('type', $validated['type']))
            )
            ->when(
                ! empty($validated['status']) && $validated['status'] !== 'all',
                fn ($query) => $query->where('status', $validated['status'])
            )
            ->when(
                ! empty($validated['payment_status']) && $validated['payment_status'] !== 'all',
                fn ($query) => $query->where('payment_status', $validated['payment_status'])
            )
            ->latest()
            ->paginate($perPage);

        $summary = [
            'total_products' => TravelProduct::count(),
            'active_products' => TravelProduct::where('is_active', true)->count(),
            'total_reservations' => TravelServiceReservation::count(),
            'paid_reservations' => TravelServiceReservation::where('payment_status', 'paid')->count(),
            'unpaid_reservations' => TravelServiceReservation::where('payment_status', '!=', 'paid')->count(),
            'total_revenue' => (float) TravelServiceReservation::where('payment_status', 'paid')->sum('total_price'),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $reservations,
            'summary' => $summary,
        ]);
    }

    public function adminProducts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'in:all,hotel,car,experience'],
            'status' => ['nullable', 'in:all,active,inactive'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 8);

        $products = TravelProduct::query()
            ->withCount('reservations')
            ->when(($validated['search'] ?? '') !== '', function ($query) use ($validated) {
                $search = $validated['search'];
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                });
            })
            ->when(
                ! empty($validated['type']) && $validated['type'] !== 'all',
                fn ($query) => $query->where('type', $validated['type'])
            )
            ->when(
                ! empty($validated['status']) && $validated['status'] !== 'all',
                fn ($query) => $query->where('is_active', $validated['status'] === 'active')
            )
            ->latest('id')
            ->paginate($perPage);

        $summary = [
            'total_products' => TravelProduct::count(),
            'active_products' => TravelProduct::where('is_active', true)->count(),
            'hotels' => TravelProduct::where('type', 'hotel')->count(),
            'cars' => TravelProduct::where('type', 'car')->count(),
            'experiences' => TravelProduct::where('type', 'experience')->count(),
            'total_reservations' => TravelServiceReservation::count(),
            'paid_reservations' => TravelServiceReservation::where('payment_status', 'paid')->count(),
            'total_revenue' => (float) TravelServiceReservation::where('payment_status', 'paid')->sum('total_price'),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $products,
            'summary' => $summary,
        ]);
    }

    public function storeProduct(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:hotel,car,experience'],
            'name' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image_url' => ['nullable', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0'],
            'price_unit' => ['nullable', 'string', 'max:50'],
            'rating' => ['nullable', 'numeric', 'min:1', 'max:5'],
            'max_guests' => ['required', 'integer', 'min:1', 'max:100'],
            'inventory_count' => ['required', 'integer', 'min:0', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $defaultUnit = match ($validated['type']) {
            'hotel' => 'đêm',
            'car' => 'ngày',
            default => 'khách',
        };

        $baseSlug = Str::slug($validated['name']);
        $slug = ($baseSlug ?: 'service') . '-' . strtolower(Str::random(5));

        $product = TravelProduct::create([
            'type' => $validated['type'],
            'name' => $validated['name'],
            'slug' => $slug,
            'city' => $validated['city'],
            'location' => $validated['location'] ?: $validated['city'],
            'description' => $validated['description'] ?: 'Dịch vụ đối tác chính thức của SkyLink Airlines.',
            'image_url' => $validated['image_url'] ?: null,
            'price' => $validated['price'],
            'price_unit' => $validated['price_unit'] ?: $defaultUnit,
            'rating' => $validated['rating'] ?? 4.8,
            'max_guests' => $validated['max_guests'],
            'inventory_count' => $validated['inventory_count'],
            'is_active' => $validated['is_active'] ?? true,
            'is_demo' => false,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Đã thêm dịch vụ du lịch mới thành công.',
            'data' => $product,
        ], 201);
    }

    public function updateProduct(Request $request, int $id): JsonResponse
    {
        $product = TravelProduct::findOrFail($id);

        $validated = $request->validate([
            'type' => ['sometimes', 'in:hotel,car,experience'],
            'name' => ['sometimes', 'string', 'max:255'],
            'city' => ['sometimes', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image_url' => ['nullable', 'string', 'max:1000'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'price_unit' => ['nullable', 'string', 'max:50'],
            'rating' => ['nullable', 'numeric', 'min:1', 'max:5'],
            'max_guests' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'inventory_count' => ['sometimes', 'integer', 'min:0', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $product->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Đã cập nhật dịch vụ thành công.',
            'data' => $product->fresh()->loadCount('reservations'),
        ]);
    }

    public function destroyProduct(int $id): JsonResponse
    {
        $product = TravelProduct::withCount('reservations')->findOrFail($id);

        if ($product->reservations_count > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể xóa dịch vụ đã phát sinh đơn đặt. Vui lòng chuyển sang trạng thái Tạm ngưng bán.',
            ], 422);
        }

        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Đã xóa dịch vụ khỏi danh mục.',
        ]);
    }

    public function updateReservationStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:confirmed,cancelled'],
        ]);

        $reservation = TravelServiceReservation::with('product')->findOrFail($id);
        if (! in_array($reservation->status, ['pending_payment', 'booked', 'pending_confirmation'], true)) {
            throw ValidationException::withMessages([
                'status' => 'Chỉ có thể cập nhật dịch vụ đang được đặt.',
            ]);
        }

        if ($validated['status'] === 'confirmed' && $reservation->payment_status !== 'paid') {
            throw ValidationException::withMessages([
                'status' => 'Chỉ xác nhận dịch vụ sau khi thanh toán thành công.',
            ]);
        }

        if ($validated['status'] === 'cancelled' && $reservation->payment_status === 'paid') {
            throw ValidationException::withMessages([
                'status' => 'Không thể hủy dịch vụ đã thanh toán khi chưa có quy trình hoàn tiền.',
            ]);
        }

        $reservation->update(['status' => $validated['status']]);

        return response()->json([
            'status' => 'success',
            'data' => $reservation->load(['product', 'user:id,name,email', 'booking:id,pnr_code', 'payments']),
        ]);
    }

    private function validateType(string $type): void
    {
        if (! in_array($type, self::TYPES, true)) {
            abort(404);
        }
    }

    private function availableUnits(
        TravelProduct $product,
        string $type,
        ?string $startDate,
        ?string $endDate
    ): int {
        if (! $startDate) {
            return $product->inventory_count;
        }

        $reservations = TravelServiceReservation::query()
            ->where('travel_product_id', $product->id)
            ->whereIn('status', ['pending_payment', 'booked', 'pending_confirmation']);

        if ($type === 'experience') {
            $reservations->whereDate('start_date', $startDate);
            $reservedUnits = (int) $reservations->sum('guest_count');
        } else {
            $reservations
                ->whereDate('start_date', '<', $endDate)
                ->whereDate('end_date', '>', $startDate);
            $reservedUnits = (int) $reservations->sum('quantity');
        }

        return max(0, $product->inventory_count - $reservedUnits);
    }
}
