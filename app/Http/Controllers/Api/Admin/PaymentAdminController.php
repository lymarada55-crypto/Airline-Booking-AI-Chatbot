<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentAdminController extends Controller
{
    // GET /api/admin/payments
    public function index(Request $request)
    {
        $search = trim((string) $request->get('search', ''));
        $status = strtolower(trim((string) $request->get('status', 'all')));
        $method = strtolower(trim((string) $request->get('method', 'all')));
        $sortDir = strtolower((string) $request->get('sort', 'desc')) === 'asc' ? 'asc' : 'desc';
        $perPage = max(1, min((int) $request->query('per_page', 8), 50));

        $query = Payment::with([
            'booking.user',
            'booking.flight.departureAirport',
            'booking.flight.arrivalAirport',
        ]);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                    ->orWhereHas('booking.user', function ($u) use ($search) {
                        $u->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('booking', function ($b) use ($search) {
                        $b->where('id', 'like', "%{$search}%")
                            ->orWhere('pnr_code', 'like', "%{$search}%");
                    });
            });
        }

        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($method !== '' && $method !== 'all') {
            if ($method === 'other') {
                $query->whereNotIn('payment_method', ['vnpay', 'momo', 'VNPAY', 'MOMO']);
            } else {
                $query->where('payment_method', 'like', "%{$method}%");
            }
        }

        $payments = $query->orderBy('id', $sortDir)->paginate($perPage);

        $payments->getCollection()->transform(function (Payment $p) {
            $depCode = $p->booking?->flight?->departureAirport?->code;
            $arrCode = $p->booking?->flight?->arrivalAirport?->code;
            $route = ($depCode && $arrCode) ? "{$depCode} → {$arrCode}" : '—';

            return [
                'id' => $p->id,
                'transaction_id' => $p->transaction_id ?: ('TXN-' . str_pad((string) $p->id, 6, '0', STR_PAD_LEFT)),
                'booking_id' => $p->booking_id,
                'pnr_code' => $p->booking?->pnr_code ?: ("BK{$p->booking_id}"),
                'route' => $route,
                'flight_number' => $p->booking?->flight?->flight_number ?: '',
                'customer_name' => $p->booking?->user?->name ?? 'Khách hàng',
                'customer_email' => $p->booking?->user?->email ?? '—',
                'amount' => (int) ($p->amount ?? 0),
                'payment_method' => strtolower((string) ($p->payment_method ?: 'vnpay')),
                'status' => strtolower((string) ($p->status ?: 'pending')),
                'paid_at' => $p->paid_at
                    ? $p->paid_at->format('Y-m-d H:i:s')
                    : ($p->created_at ? $p->created_at->format('Y-m-d H:i:s') : null),
            ];
        });

        $summary = [
            'total_transactions' => Payment::count(),
            'total_collected' => (int) Payment::where('status', 'success')->sum('amount'),
            'success_count' => Payment::where('status', 'success')->count(),
            'pending_count' => Payment::where('status', 'pending')->count(),
            'failed_count' => Payment::where('status', 'failed')->count(),
        ];

        $payload = $payments->toArray();
        $payload['summary'] = $summary;

        return response()->json($payload);
    }

    // DELETE /api/admin/payments/{id}
    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);

        if (strtolower((string) $payment->status) === 'success') {
            return response()->json([
                'message' => 'Không thể xóa giao dịch đã thanh toán thành công (bảo toàn chứng từ tài chính).',
            ], 422);
        }

        $payment->delete();

        return response()->json([
            'message' => 'Đã xóa bản ghi giao dịch thành công.',
        ]);
    }
}
