import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowUpRight, LogOut, Search } from 'lucide-react'
import { useCaseStore } from '../stores/caseStore'
import { useAuthStore } from '../stores/authStore'
import { ThemeToggle } from '../components/ThemeToggle'

export default function Dashboard() {
    const navigate = useNavigate()
    const { cases, fetchCases, createCase, isLoading } = useCaseStore()
    const { user, logout } = useAuthStore()

    useEffect(() => {
        fetchCases()
    }, [fetchCases])

    const handleNewCase = async () => {
        const caseId = await createCase()
        if (caseId) {
            navigate(`/dictation/${caseId}`)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'COMPLETADO'
            case 'draft': return 'BORRADOR'
            case 'borrador': return 'BORRADOR'
            case 'in_progress': return 'EN PROCESO'
            default: return status.toUpperCase()
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).toUpperCase()
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Header */}
            <header
                className="px-8 py-4"
                style={{ borderBottom: '1px solid var(--border-primary)' }}
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                                    <rect width="32" height="32" rx="6" fill="currentColor" style={{ color: 'var(--text-primary)' }} />
                                    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
                                        fill="var(--bg-primary)" fontSize="16" fontWeight="600" fontFamily="Inter">
                                        F
                                    </text>
                                </svg>
                            </div>
                            <span
                                className="text-lg font-semibold tracking-tight"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                CoronerIA
                            </span>
                        </div>

                        {/* Nav */}
                        <nav className="flex items-center gap-6">
                            <span className="mono-tag" style={{ color: 'var(--text-primary)' }}>
                                CASOS
                            </span>
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <span className="mono-tag">
                            {user?.full_name || user?.username}
                        </span>
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            className="btn-pill"
                        >
                            <LogOut size={14} />
                            SALIR
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-8 py-12">
                {/* Title Section */}
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h1
                            className="text-4xl font-semibold tracking-tight mb-2"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Protocolos
                        </h1>
                        <p className="mono-tag">
                            {cases.length} {cases.length === 1 ? 'REGISTRO' : 'REGISTROS'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2"
                                size={16}
                                style={{ color: 'var(--text-muted)' }}
                            />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="input-noir pl-11 w-64"
                                style={{ borderRadius: '9999px' }}
                            />
                        </div>

                        {/* New Case Button */}
                        <button
                            onClick={handleNewCase}
                            className="btn-pill-filled"
                        >
                            <Plus size={16} />
                            NUEVO CASO
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Cases List */}
                {isLoading ? (
                    <div
                        className="text-center py-20 mono-tag"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        CARGANDO...
                    </div>
                ) : cases.length === 0 ? (
                    <div
                        className="text-center py-20"
                        style={{ border: '1px solid var(--border-primary)', borderRadius: '0.75rem' }}
                    >
                        <p
                            className="text-lg mb-2"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            No hay protocolos
                        </p>
                        <p className="mono-tag">
                            CREA TU PRIMER CASO
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cases.map((caseItem) => (
                            <div
                                key={caseItem.id}
                                onClick={() => navigate(`/dictation/${caseItem.id}`)}
                                className="card-noir cursor-pointer group flex items-center justify-between"
                            >
                                <div className="flex items-center gap-6">
                                    {/* Protocol Number */}
                                    <div
                                        className="w-16 h-16 rounded-lg flex items-center justify-center font-mono text-sm"
                                        style={{
                                            backgroundColor: 'var(--bg-hover)',
                                            color: 'var(--text-secondary)'
                                        }}
                                    >
                                        #{(caseItem.protocol_number || caseItem.id.slice(0, 4)).toUpperCase()}
                                    </div>

                                    <div>
                                        <h3
                                            className="font-medium mb-1"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            Protocolo {caseItem.protocol_number || 'Sin número'}
                                        </h3>
                                        <p className="mono-tag text-xs">
                                            {formatDate(caseItem.created_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="category-tag">
                                        {getStatusLabel(caseItem.status)}
                                    </span>
                                    <ArrowUpRight
                                        size={18}
                                        style={{ color: 'var(--text-muted)' }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer
                className="fixed bottom-0 left-0 right-0 py-4 px-8"
                style={{ borderTop: '1px solid var(--border-primary)' }}
            >
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <p className="text-slate-500 text-xs">
                        CORONERIA V3.0 [SEKHMED]
                    </p>
                    <span className="mono-tag">
                        BY DR. SANTIAGO PALMA
                    </span>
                </div>
            </footer>
        </div>
    )
}
