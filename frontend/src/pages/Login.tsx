import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isOnline] = useState(navigator.onLine)

    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const success = await login(username, password)

        if (success) {
            navigate('/dashboard')
        } else {
            setError('Credenciales incorrectas')
        }

        setIsLoading(false)
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            {/* Login Card */}
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-6">
                        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                            <rect width="40" height="40" rx="8" fill="currentColor" style={{ color: 'var(--text-primary)' }} />
                            <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
                                fill="var(--bg-primary)" fontSize="20" fontWeight="600" fontFamily="Inter">
                                F
                            </text>
                        </svg>
                    </div>
                    <h1
                        className="text-3xl font-semibold tracking-tight mb-2"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        CoronerIA
                    </h1>
                    <p
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Asistente de Documentación Médico-Legal
                    </p>
                </div>

                {/* Form Card */}
                <div
                    className="rounded-xl p-8"
                    style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)'
                    }}
                >
                    {/* Mode Badge */}
                    <div className="flex justify-center mb-8">
                        <span className="category-tag">
                            {isOnline ? 'CLOUD' : 'EDGE'}
                        </span>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="label-noir">Usuario</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-noir"
                                placeholder="doctor.legista"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-noir">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-noir"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div
                                className="p-3 rounded-lg text-sm"
                                style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    color: 'var(--accent-danger)'
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-pill-filled w-full justify-center disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    INICIAR SESIÓN
                                    <ArrowUpRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p
                    className="text-center mt-8 font-mono text-xs uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}
                >
                    CoronerIA v3.0 [Gemini 3]
                </p>
            </div>
        </div>
    )
}
