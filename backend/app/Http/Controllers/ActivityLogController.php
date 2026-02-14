<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use App\Models\Business;

class ActivityLogController extends Controller
{
    public function index(Request $request, $public_id)
    {
        $business = Business::where('public_id', $public_id)->firstOrFail();

        // Get IDs of users belonging to this business
        $userIds = $business->users()->pluck('users.id');

        // Fetch logs where the action was performed by one of these users
        $query = Activity::whereIn('causer_id', $userIds)
            ->where('causer_type', 'App\Models\User')
            ->with(['causer', 'subject'])
            ->orderBy('created_at', 'desc');

        // Filter by specific user (causer)
        if ($request->has('user_id')) {
            $query->where('causer_id', $request->user_id);
        }

        // Filter by subject type (e.g., 'App\Models\Product')
        if ($request->has('subject_type')) {
            $query->where('subject_type', $request->subject_type);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        // Exclude specific events
        if ($request->has('exclude_events')) {
            $events = explode(',', $request->exclude_events);
            $query->whereNotIn('event', $events);
        }

        $logs = $query->paginate($request->get('per_page', 20));

        return response()->json($logs);
    }
}
