<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResellerPaymentRequest extends FormRequest
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
            'tenant_id'           => 'required|exists:tenants,id',
            'business_id'         => 'required|exists:businesses,id',
            'outlet_id'           => 'required|exists:isp_outlets,id',
            'reseller_invoice_id' => 'required|exists:reseller_invoices,id',
            'amount'              => 'required|integer|min:0',
            'payment_method'      => 'required|in:cash,transfer',
            'paid_at'             => 'nullable|date',
            'created_by_user_id'  => 'required|exists:users,id',
        ];
    }
}
