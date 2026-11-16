<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TravelServiceReservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'travel_product_id',
        'user_id',
        'booking_id',
        'reference_code',
        'start_date',
        'end_date',
        'quantity',
        'guest_count',
        'guest_name',
        'guest_email',
        'guest_phone',
        'unit_price',
        'total_price',
        'status',
        'payment_status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
            'quantity' => 'integer',
            'guest_count' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(TravelProduct::class, 'travel_product_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(TravelServicePayment::class);
    }
}
