<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TenantRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'fullname' => 'required|string|max:255',
            'owner_user_id' => 'required|exists:users,id',
            'plans_id' => 'required|exists:plans,id',
            // public_id is auto-generated if not present, but can be passed if needed (e.g. migration)
            'public_id' => 'nullable|uuid|unique:tenants,public_id,' . $this->route('tenant'),
        ];
    }
}
