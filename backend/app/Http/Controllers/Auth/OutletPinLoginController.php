<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\OutletPinLoginRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class OutletPinLoginController extends Controller
{
    public function login(OutletPinLoginRequest $request)
    {
        $user = User::where('phone', $request->phone)
            ->where('is_active', true)
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'phone' => ['Outlet tidak ditemukan atau tidak aktif'],
            ]);
        }

        // pastikan role isp_outlet
        if (! $user->hasRole('isp_outlet')) {
            throw ValidationException::withMessages([
                'phone' => ['Akun ini bukan outlet'],
            ]);
        }

        // cek PIN
        if (! Hash::check($request->pin, $user->pin_hash)) {
            throw ValidationException::withMessages([
                'pin' => ['PIN salah'],
            ]);
        }

        // optional: kunci ke device
        if ($user->device_id && $request->device_id) {
            if ($user->device_id !== $request->device_id) {
                throw ValidationException::withMessages([
                    'device_id' => ['Perangkat tidak dikenali'],
                ]);
            }
        }

        // simpan device_id pertama kali
        if (! $user->device_id && $request->device_id) {
            $user->update([
                'device_id' => $request->device_id,
            ]);
        }

        // hapus token lama (1 device = 1 sesi)
        $user->tokens()->delete();

        $token = $user->createToken(
            'outlet-mobile',
            ['outlet']
        )->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token'   => $token,
            'user'    => [
                'id'   => $user->public_id,
                'name' => $user->name,
                'phone' => $user->phone,
            ],
        ]);
    }
}
