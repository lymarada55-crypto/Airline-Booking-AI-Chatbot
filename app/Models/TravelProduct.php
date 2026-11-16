<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TravelProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'slug',
        'city',
        'location',
        'description',
        'image_url',
        'price',
        'price_unit',
        'rating',
        'max_guests',
        'inventory_count',
        'details',
        'is_active',
        'is_demo',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'rating' => 'decimal:1',
            'max_guests' => 'integer',
            'inventory_count' => 'integer',
            'details' => 'array',
            'is_active' => 'boolean',
            'is_demo' => 'boolean',
        ];
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(TravelServiceReservation::class);
    }
}
