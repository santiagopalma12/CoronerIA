/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // x.ai Cyber-Noir palette
                noir: {
                    50: '#FAFAFA',
                    100: '#F5F5F5',
                    200: '#E5E5E5',
                    300: '#D4D4D4',
                    400: '#A3A3A3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                    950: '#0A0A0A',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['GeistMono', 'JetBrains Mono', 'Fira Code', 'monospace'],
            },
            animation: {
                'pulse-recording': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-4px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            borderColor: {
                DEFAULT: 'rgba(255, 255, 255, 0.15)',
            },
        },
    },
    plugins: [],
}
