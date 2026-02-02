import { useAccountStore } from "./account.store"

export const useAccounts = () => useAccountStore((state) => state.accounts)
export const useIsAccountLoading = () => useAccountStore((state) => state.isLoading)
export const useAccountError = () => useAccountStore((state) => state.error)
export const useAccountActions = () => {
    const fetchAccounts = useAccountStore((state) => state.fetchAccounts)
    const addAccount = useAccountStore((state) => state.addAccount)
    const removeAccount = useAccountStore((state) => state.removeAccount)
    const reset = useAccountStore((state) => state.reset)
    return { fetchAccounts, addAccount, removeAccount, reset }
}
