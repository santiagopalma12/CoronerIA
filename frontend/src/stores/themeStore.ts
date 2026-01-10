import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'dark',

            toggleTheme: () => {
                const newTheme = get().theme === 'dark' ? 'light' : 'dark'
                set({ theme: newTheme })
                document.documentElement.classList.toggle('dark', newTheme === 'dark')
                document.documentElement.classList.toggle('light', newTheme === 'light')
            },

            setTheme: (theme: Theme) => {
                set({ theme })
                document.documentElement.classList.toggle('dark', theme === 'dark')
                document.documentElement.classList.toggle('light', theme === 'light')
            }
        }),
        {
            name: 'coroneria-theme',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    document.documentElement.classList.toggle('dark', state.theme === 'dark')
                    document.documentElement.classList.toggle('light', state.theme === 'light')
                }
            }
        }
    )
)
