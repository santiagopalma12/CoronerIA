import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    user_id: string
    username: string
    full_name: string
    role: string
}

interface AuthState {
    token: string | null
    user: User | null
    isAuthenticated: boolean
    login: (username: string, password: string) => Promise<boolean>
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,

            login: async (username: string, password: string) => {
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password }),
                    })

                    if (!response.ok) {
                        return false
                    }

                    const data = await response.json()

                    set({
                        token: data.token,
                        user: {
                            user_id: data.user_id,
                            username: data.username,
                            full_name: data.full_name,
                            role: data.role,
                        },
                        isAuthenticated: true,
                    })

                    return true
                } catch (error) {
                    console.error('Login error:', error)
                    return false
                }
            },

            logout: () => {
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                })
            },
        }),
        {
            name: 'forensia-auth',
        }
    )
)
