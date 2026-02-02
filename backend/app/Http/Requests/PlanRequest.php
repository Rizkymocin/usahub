<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('plan');

        return [
            'name'          => 'required|string|max:255',
            'max_business'  => 'required|integer|min:1',
            'max_users'     => 'required|integer|min:1',
            'price'         => 'required|integer|min:0',
            'billing_cycle' => 'required|in:monthly,custom',
        ];
    }
}
