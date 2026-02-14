import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from '@/lib/axios';
import { useAuthStore } from './auth.store';
import { useStockStore, type AllocationStock } from './stock.store';

export interface SaleItem {
    voucher_product_id: number;
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

export type RecipientType = 'outlet' | 'reseller' | 'end_user';

export const useSaleStore = defineStore('sale', () => {
    const auth = useAuthStore();
    const stockStore = useStockStore();

    // State
    const items = ref<SaleItem[]>([]);
    const channelType = ref<'outlet' | 'reseller' | 'admin'>('admin'); // Default for finance mobile
    const soldToType = ref<RecipientType>('end_user');
    const recipientId = ref<number | null>(null);
    const customerName = ref('');
    const customerPhone = ref('');
    const paymentMethod = ref<'cash' | 'partial' | 'credit'>('cash');
    const paidAmount = ref(0);
    const isPrepaid = ref(false);
    const pendingDeliveries = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Getters
    const totalAmount = computed(() => {
        return items.value.reduce((acc, item) => acc + item.subtotal, 0);
    });

    const remainingAmount = computed(() => {
        return Math.max(0, totalAmount.value - paidAmount.value);
    });

    const canCheckout = computed(() => {
        if (items.value.length === 0) return false;
        if (soldToType.value !== 'end_user' && !recipientId.value) return false;
        if (soldToType.value === 'end_user' && !customerName.value) return false;
        return true;
    });

    // Actions
    function addToCart(stock: AllocationStock) {
        const existing = items.value.find(i => i.voucher_product_id === stock.voucher_product_id);

        if (existing) {
            // Check if we have enough available stock
            if (existing.quantity < stock.qty_available) {
                existing.quantity++;
                existing.subtotal = existing.quantity * existing.unit_price;
            }
        } else {
            if (stock.qty_available > 0) {
                items.value.push({
                    voucher_product_id: stock.voucher_product_id,
                    name: stock.voucher_product.name,
                    quantity: 1,
                    unit_price: Number(stock.voucher_product.selling_price),
                    subtotal: Number(stock.voucher_product.selling_price)
                });
            }
        }
    }

    function removeFromCart(productId: number) {
        const index = items.value.findIndex(i => i.voucher_product_id === productId);
        if (index !== -1) {
            const item = items.value[index]!;
            if (item.quantity > 1) {
                item.quantity--;
                item.subtotal = item.quantity * item.unit_price;
            } else {
                items.value.splice(index, 1);
            }
        }
    }

    function updateQuantity(stock: AllocationStock, quantity: number) {
        const index = items.value.findIndex(i => i.voucher_product_id === stock.voucher_product_id);
        const maxStock = stock.qty_available;
        let newQty = Math.max(0, Math.min(quantity, maxStock));

        if (newQty === 0) {
            if (index !== -1) {
                items.value.splice(index, 1);
            }
            return;
        }

        if (index !== -1) {
            const item = items.value[index]!;
            item.quantity = newQty;
            item.subtotal = item.quantity * item.unit_price;
        } else {
            items.value.push({
                voucher_product_id: stock.voucher_product_id,
                name: stock.voucher_product.name,
                quantity: newQty,
                unit_price: Number(stock.voucher_product.selling_price),
                subtotal: Number(stock.voucher_product.selling_price) * newQty
            });
        }
    }

    function clearCart() {
        items.value = [];
        paidAmount.value = 0;
        customerName.value = '';
        customerPhone.value = '';
        recipientId.value = null;
        isPrepaid.value = false;
    }

    async function submitSale() {
        if (!auth.user?.business_public_id) throw new Error("Business ID not found");

        loading.value = true;
        error.value = null;

        try {
            const payload = {
                channel_type: channelType.value,
                source_type: 'allocated_stock', // Mobile finance always sells from allocated stock
                sold_to_type: soldToType.value,
                payment_method: paymentMethod.value,
                paid_amount: paidAmount.value,
                items: items.value.map(item => ({
                    voucher_product_id: item.voucher_product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                })),
                is_prepaid: isPrepaid.value
            };

            // Add conditional fields
            if (soldToType.value === 'outlet') {
                (payload as any).outlet_id = recipientId.value;
                (payload as any).sold_to_id = recipientId.value;
            } else if (soldToType.value === 'reseller') {
                (payload as any).reseller_id = recipientId.value;
                (payload as any).sold_to_id = recipientId.value;
            } else {
                (payload as any).customer_name = customerName.value;
                (payload as any).customer_phone = customerPhone.value;
            }

            const response = await axios.post(`/businesses/${auth.user.business_public_id}/voucher-sales`, payload);

            if (response.data.success) {
                clearCart();
                // Refresh stock info
                await stockStore.fetchMyStock(auth.user.business_public_id);
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to create sale');
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || err.message || 'Failed to process sale';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    const debts = ref<any[]>([]);

    async function fetchDebts() {
        if (!auth.user?.business_public_id) return;
        try {
            const response = await axios.get(`/businesses/${auth.user.business_public_id}/voucher-sales`);
            if (response.data.success) {
                // Filter for debts on client side for now
                debts.value = response.data.data.filter((sale: any) => Number(sale.remaining_amount) > 0);
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function submitDebtPayment(payload: { salePublicId: string, amount: number, note?: string }) {
        if (!auth.user?.business_public_id) throw new Error("Business ID not found");

        try {
            const response = await axios.post(
                `/businesses/${auth.user.business_public_id}/voucher-sales/${payload.salePublicId}/payments`,
                {
                    amount: payload.amount,
                    note: payload.note,
                    payment_method: 'cash' // Default for collection
                }
            );

            if (response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message);
            }
        } catch (err: any) {
            throw err;
        }
    }

    async function fetchPendingDeliveries() {
        if (!auth.user?.business_public_id) return;
        try {
            const response = await axios.get(`/businesses/${auth.user.business_public_id}/voucher-sales/pending-delivery`);
            if (response.data.success) {
                pendingDeliveries.value = response.data.data;
            }
        } catch (err) {
            console.error('Failed to fetch pending deliveries:', err);
        }
    }

    async function markAsDelivered(salePublicId: string, deliveredItems: { voucher_product_id: number, delivered_qty: number }[], deliveryNote?: string) {
        if (!auth.user?.business_public_id) throw new Error("Business ID not found");

        try {
            const response = await axios.post(
                `/businesses/${auth.user.business_public_id}/voucher-sales/${salePublicId}/mark-delivered`,
                {
                    items: deliveredItems,
                    delivery_note: deliveryNote
                }
            );

            if (response.data.success) {
                // Refresh pending deliveries
                await fetchPendingDeliveries();
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to mark as delivered');
            }
        } catch (err: any) {
            throw err;
        }
    }

    return {
        items,
        channelType,
        soldToType,
        recipientId,
        customerName,
        customerPhone,
        paymentMethod,
        paidAmount,
        isPrepaid,
        pendingDeliveries,
        loading,
        error,
        totalAmount,
        remainingAmount,
        canCheckout,
        debts,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        submitSale,
        fetchDebts,
        submitDebtPayment,
        fetchPendingDeliveries,
        markAsDelivered
    };
});
