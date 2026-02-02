
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  name: string | null
  email: string | null
  role: string | null
  setUser: (name: string, email: string, role: string) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: null,
      email: null,
      role: null,
      setUser: (name, email, role) => set({ name, email, role }),
      clearUser: () => set({ name: null, email: null, role: null }),
    }),
    {
      name: 'user-storage',
    }
  )
)
