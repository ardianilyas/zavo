
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  name: string | null
  email: string | null
  setUser: (name: string, email: string) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: null,
      email: null,
      setUser: (name, email) => set({ name, email }),
      clearUser: () => set({ name: null, email: null }),
    }),
    {
      name: 'user-storage',
    }
  )
)
