<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OutletPinLoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'phone'     => ['required', 'string'],
            'pin'       => ['required', 'digits_between:4,6'],
            'device_id' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required'     => 'Nomor HP wajib diisi.',
            'pin.required'       => 'PIN wajib diisi.',
            'pin.digits_between' => 'PIN harus 4–6 digit.',
        ];
    }
}
