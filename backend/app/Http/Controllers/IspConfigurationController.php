<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\IspConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IspConfigurationController extends Controller
{
    /**
     * Get configurations for a business.
     */
    public function index(string $publicId)
    {
        $business = Business::where('public_id', $publicId)->firstOrFail();

        $configs = IspConfiguration::where('business_id', $business->id)
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->key => $item->value];
            });

        return response()->json([
            'success' => true,
            'data' => $configs,
        ]);
    }

    /**
     * Store or update configurations.
     */
    public function store(Request $request, string $publicId)
    {
        $business = Business::where('public_id', $publicId)->firstOrFail();

        $data = $request->validate([
            'configs' => 'required|array',
            'configs.*' => 'nullable|string',
        ]);

        DB::transaction(function () use ($business, $data) {
            foreach ($data['configs'] as $key => $value) {
                IspConfiguration::updateOrCreate(
                    [
                        'business_id' => $business->id,
                        'key' => $key,
                    ],
                    [
                        'value' => $value,
                    ]
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Configuration saved successfully.',
        ]);
    }
}
