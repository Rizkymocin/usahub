<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MobileAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'user' => 'required|string',
            'password' => 'required|string',
        ]);

        $login_type = filter_var($request->user, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($login_type, $request->user)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'user' => ['Invalid credentials.'],
            ]);
        }

        $token = $user->createToken('mobile_auth_token')->plainTextToken;

        // Get roles with proper format (array of objects with 'name' property)
        $roles = $user->roles->map(function ($role) {
            return ['name' => $role->name];
        });

        // Find business from business_user table
        $business = null;
        $businessUser = DB::table('business_users')
            ->where('user_id', $user->id)
            ->first();

        if ($businessUser) {
            $business = Business::find($businessUser->business_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => array_merge($user->toArray(), [
                    'roles' => $roles,
                    'business' => $business,
                    'business_public_id' => $business ? $business->public_id : null,
                ]),
                'token' => $token,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get roles with proper format
        $roles = $user->roles->map(function ($role) {
            return ['name' => $role->name];
        });

        // Find business from business_user table
        $business = null;
        $businessUser = DB::table('business_users')
            ->where('user_id', $user->id)
            ->first();

        if ($businessUser) {
            $business = Business::find($businessUser->business_id);
        }

        return response()->json([
            'success' => true,
            'data' => array_merge($user->toArray(), [
                'roles' => $roles,
                'business' => $business,
                'business_public_id' => $business ? $business->public_id : null,
            ]),
        ]);
    }
}
