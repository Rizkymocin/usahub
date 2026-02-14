<?php

namespace App\Repositories;

use App\Models\IspAnouncement;
use Illuminate\Database\Eloquent\Collection;

class IspAnouncementRepository
{
    public function getAnouncements(int $businessId)
    {
        return IspAnouncement::where('business_id', $businessId)->get();
    }
    public function create(array $data)
    {
        return IspAnouncement::create($data);
    }

    public function update(int $id, array $data)
    {
        $anouncement = IspAnouncement::find($id);
        if ($anouncement) {
            $anouncement->update($data);
            return $anouncement;
        }
        return null;
    }

    public function delete(int $id)
    {
        $anouncement = IspAnouncement::find($id);
        if ($anouncement) {
            return $anouncement->delete();
        }
        return false;
    }
}
