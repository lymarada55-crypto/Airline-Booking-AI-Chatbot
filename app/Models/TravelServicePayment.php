<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelServicePayment extends Model
{
    protected $fillable = [
        'travel_service_reservation_id',
        'transaction_id',
        'amount',
        'payment_method',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(TravelServiceReservation::class, 'travel_service_reservation_id');
    }
}
