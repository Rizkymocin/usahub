import { useBusinessUserStore } from "./business-user.store"

export const useBusinessUsers = () => useBusinessUserStore((state) => state.users)
export const useIsBusinessUserLoading = () => useBusinessUserStore((state) => state.isLoading)
export const useBusinessUserError = () => useBusinessUserStore((state) => state.error)
export const useBusinessUserActions = () => {
    const fetchUsers = useBusinessUserStore((state) => state.fetchUsers)
    const addUser = useBusinessUserStore((state) => state.addUser)
    const removeUser = useBusinessUserStore((state) => state.removeUser)
    const reset = useBusinessUserStore((state) => state.reset)
    return { fetchUsers, addUser, removeUser, reset }
}
