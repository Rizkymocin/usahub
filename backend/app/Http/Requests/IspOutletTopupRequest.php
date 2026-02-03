<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IspOutletTopupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:1',
        ];
    }
}
