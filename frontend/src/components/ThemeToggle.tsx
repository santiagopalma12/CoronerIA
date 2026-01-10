import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore()

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg transition-all duration-300 hover:bg-[var(--bg-hover)] group"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                {/* Sun icon */}
                <Sun
                    size={20}
                    className={`absolute inset-0 transition-all duration-300 ${theme === 'dark'
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 rotate-90 scale-75'
                        }`}
                    style={{ color: 'var(--text-secondary)' }}
                />
                {/* Moon icon */}
                <Moon
                    size={20}
                    className={`absolute inset-0 transition-all duration-300 ${theme === 'light'
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 -rotate-90 scale-75'
                        }`}
                    style={{ color: 'var(--text-secondary)' }}
                />
            </div>
        </button>
    )
}

export default ThemeToggle
