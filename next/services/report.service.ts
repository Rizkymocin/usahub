import axios from "@/lib/axios"

export interface ProfitAndLossData {
    summary: {
        revenue: { value: number, formatted: string }
        expense: { value: number, formatted: string }
        net_income: { value: number, formatted: string }
        net_margin_percentage: number
    }
    chart_data: Array<{
        month: string
        revenue: number
        expense: number
    }>
}

export interface BusinessPerformanceData {
    business_id: number
    public_id: string
    name: string
    revenue: number
    expense: number
    net_income: number
    revenue_formatted: string
    expense_formatted: string
    net_income_formatted: string
    margin_percentage: number
    value: number
}

export interface ReportFilters {
    start_date?: string
    end_date?: string
    business_id?: string
}

export const reportService = {
    async getProfitAndLoss(filters?: ReportFilters) {
        const { data } = await axios.get<{ success: boolean, data: ProfitAndLossData }>('/tenant/reports/profit-loss', { params: filters })
        return data.data
    },

    async getBusinessPerformance(filters?: ReportFilters) {
        const { data } = await axios.get<{ success: boolean, data: BusinessPerformanceData[] }>('/tenant/reports/business-performance', { params: filters })
        return data.data
    },

    async getCashFlow(filters?: ReportFilters) {
        const { data } = await axios.get('/tenant/reports/cash-flow', { params: filters })
        return data.data
    },

    async getArAp(filters?: ReportFilters) {
        const { data } = await axios.get('/tenant/reports/ar-ap', { params: filters })
        return data.data
    },

    async getGeneralLedger(filters?: ReportFilters & { account_code?: string }) {
        const { data } = await axios.get('/tenant/reports/general-ledger', { params: filters })
        return data.data
    }
}
