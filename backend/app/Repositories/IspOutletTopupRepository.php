<?php

namespace App\Repositories;

use App\Models\IspOutletTopup;
use Illuminate\Database\Eloquent\Collection;

class IspOutletTopupRepository
{
    public function create(array $data): IspOutletTopup
    {
        return IspOutletTopup::create($data);
    }

    public function findById(int $id): ?IspOutletTopup
    {
        return IspOutletTopup::find($id);
    }
}
