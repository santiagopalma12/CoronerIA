/**
 * Dictation Page - ForensIA v2.0
 * Cyber-Noir Minimalist Design
 */

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Mic, Pause, Play, Square,
    Save, Download, ArrowUpRight, Eye, EyeOff
} from 'lucide-react'
import { useCaseStore } from '../stores/caseStore'
import { useTranscriptionStore } from '../stores/transcriptionStore'
import { AnatomyModel } from '../components/AnatomyModel'
import { ThemeToggle } from '../components/ThemeToggle'
import {
    DatosGeneralesForm,
    FenomenosCadavericosForm,
    ExamenInternoCabezaForm,
    ExamenInternoToraxForm,
    ExamenInternoAbdomenForm,
    CausasMuerteForm,
    ExamenExternoForm,
    PrendasForm,
    ExamenExternoCabezaForm,
    ExamenInternoCuelloForm,
    AparatoGenitalForm,
    LesionesTraumaticasForm,
    PerennizacionForm,
    DatosReferencialesForm,
    OrganosAdicionalesForm
} from '../components/FormSections'

// ============================================
// SECCIONES DEL PROTOCOLO
// ============================================

const SECTIONS = [
    { id: 'datos_generales', label: 'DATOS GENERALES' },
    { id: 'examen_externo', label: 'EXAMEN EXTERNO' },
    { id: 'fenomenos', label: 'FENÓMENOS' },
    { id: 'cabeza', label: 'CABEZA (INT)' },
    { id: 'cuello', label: 'CUELLO' },
    { id: 'torax', label: 'TÓRAX' },
    { id: 'abdomen', label: 'ABDOMEN' },
    { id: 'genitales', label: 'GENITALES' },
    { id: 'lesiones', label: 'LESIONES' },
    { id: 'perennizacion', label: 'EVIDENCIA' },
    { id: 'referenciales', label: 'REF/DESTINO' },
    { id: 'adicionales', label: 'ADICIONALES' },
    { id: 'causas', label: 'CAUSA MUERTE' },
]

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function Dictation() {
    const { caseId } = useParams()
    const navigate = useNavigate()
    const [activeSection, setActiveSection] = useState('datos_generales')
    const [isOnline] = useState(navigator.onLine)
    const [showAnatomyModel, setShowAnatomyModel] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const { currentCase, loadCase, updateField, updateNestedField, saveCase } = useCaseStore()
    const {
        transcript, partialText, isRecording, isPaused, duration,
        startRecording, stopRecording, pauseRecording, resumeRecording
    } = useTranscriptionStore()

    // ============================================
    // EFECTOS
    // ============================================

    useEffect(() => {
        if (caseId) {
            loadCase(caseId)
        }
    }, [caseId, loadCase])

    // Detectar órganos mencionados en la transcripción
    const detectedOrgans = useMemo(() => {
        if (!transcript) return []
        const text = transcript.toLowerCase()
        const organs: string[] = []

        if (text.includes('encéfalo') || text.includes('cerebro') || text.includes('encefalo')) organs.push('encefalo')
        if (text.includes('pulmón derecho') || text.includes('pulmon derecho')) organs.push('pulmon_derecho')
        if (text.includes('pulmón izquierdo') || text.includes('pulmon izquierdo')) organs.push('pulmon_izquierdo')
        if (text.includes('corazón') || text.includes('corazon')) organs.push('corazon')
        if (text.includes('hígado') || text.includes('higado')) organs.push('higado')
        if (text.includes('bazo')) organs.push('bazo')
        if (text.includes('riñón derecho') || text.includes('rinon derecho')) organs.push('rinon_derecho')
        if (text.includes('riñón izquierdo') || text.includes('rinon izquierdo')) organs.push('rinon_izquierdo')

        return organs
    }, [transcript])

    // Auto-extraer entidades con NER cuando cambia el transcript
    useEffect(() => {
        const extractEntities = async () => {
            if (!transcript || !caseId || transcript.length < 20) return

            try {
                console.log('🔍 Extrayendo entidades v2.0...')
                const response = await fetch('/api/ner/extract', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: transcript })
                })

                if (!response.ok) return

                const data = await response.json()
                console.log('📋 Entidades extraídas:', data)

                if (data.mapped_fields && Object.keys(data.mapped_fields).length > 0) {
                    console.log('✨ Aplicando campos al formulario:', Object.keys(data.mapped_fields))

                    for (const [fieldPath, value] of Object.entries(data.mapped_fields)) {
                        const parts = fieldPath.split('.')
                        if (parts.length >= 2) {
                            const section = parts[0] as keyof typeof currentCase
                            const restPath = parts.slice(1)
                            updateNestedField(section as any, restPath, value)
                            console.log(`  📝 ${fieldPath} = ${value}`)
                        }
                    }

                    await saveCase()
                    console.log('💾 Caso guardado con entidades extraídas')
                }
            } catch (error) {
                console.error('Error NER:', error)
            }
        }

        const timer = setTimeout(extractEntities, 1000)
        return () => clearTimeout(timer)
    }, [transcript, caseId])

    // ============================================
    // HANDLERS
    // ============================================

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleSave = async () => {
        setIsSaving(true)
        await saveCase()

        // Check for error in store after save attempt
        const currentError = useCaseStore.getState().error
        if (currentError) {
            alert(`Error al guardar: ${currentError}`)
        } else {
            // Optional: Simple toast or confirmation
            const btn = document.getElementById('save-btn')
            if (btn) {
                const originalText = btn.innerText
                btn.innerText = '¡GUARDADO!'
                setTimeout(() => {
                    btn.innerText = originalText
                }, 2000)
            }
        }

        setIsSaving(false)
    }

    const handleExport = async () => {
        try {
            const response = await fetch('/api/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_id: caseId }),
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `protocolo_${caseId?.slice(0, 8)}.pdf`
                a.click()
            }
        } catch (error) {
            console.error('Export error:', error)
        }
    }

    const handleSectionChange = useCallback((section: string) => {
        return (field: string, value: any) => {
            if (field.includes('.')) {
                const path = field.split('.')
                updateNestedField(section as any, path, value)
            } else {
                updateField(section as any, field, value)
            }
        }
    }, [updateField, updateNestedField])

    const handleOrganClick = (organ: string) => {
        const organToSection: Record<string, string> = {
            encefalo: 'cabeza',
            pulmon_derecho: 'torax',
            pulmon_izquierdo: 'torax',
            corazon: 'torax',
            higado: 'abdomen',
            bazo: 'abdomen',
            rinon_derecho: 'abdomen',
            rinon_izquierdo: 'abdomen',
        }
        const section = organToSection[organ]
        if (section) {
            setActiveSection(section)
        }
    }

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Header */}
            <header
                className="px-6 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border-primary)' }}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1
                            className="font-medium"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Protocolo {currentCase?.protocol_number || currentCase?.datos_generales?.numero_informe || 'Nuevo'}
                        </h1>
                        <p className="mono-tag text-xs">
                            {currentCase?.datos_generales?.fallecido?.nombre
                                ? `${currentCase.datos_generales.fallecido.nombre} ${currentCase.datos_generales.fallecido.apellido_paterno || ''}`
                                : 'SIN IDENTIFICAR'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="category-tag text-xs">
                        {isOnline ? 'AZURE' : 'EDGE'}
                    </span>
                    <ThemeToggle />
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-pill text-xs disabled:opacity-50"
                    >
                        <Save size={14} />
                        {isSaving ? 'GUARDANDO...' : 'GUARDAR'}
                    </button>
                    <button
                        onClick={handleExport}
                        className="btn-pill-filled text-xs"
                    >
                        <Download size={14} />
                        PDF
                        <ArrowUpRight size={12} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Secciones */}
                <aside
                    className="w-48 p-4 overflow-y-auto"
                    style={{ borderRight: '1px solid var(--border-primary)' }}
                >
                    <h3 className="mono-tag text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                        SECCIONES
                    </h3>
                    <nav className="space-y-1">
                        {SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg font-mono text-xs uppercase tracking-wide transition-all ${activeSection === section.id
                                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {section.label}
                            </button>
                        ))}
                    </nav>

                    {/* Toggle Anatomy Model */}
                    <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
                        <button
                            onClick={() => setShowAnatomyModel(!showAnatomyModel)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs uppercase text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition"
                        >
                            {showAnatomyModel ? <EyeOff size={14} /> : <Eye size={14} />}
                            {showAnatomyModel ? 'OCULTAR' : 'MODELO'}
                        </button>
                    </div>
                </aside>

                {/* Center - Form Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Recording Controls */}
                        <div
                            className="rounded-xl p-4 flex items-center justify-between"
                            style={{
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-primary)'
                            }}
                        >
                            <div className="flex items-center gap-4">
                                {!isRecording ? (
                                    <button
                                        onClick={startRecording}
                                        className="btn-pill-filled"
                                        style={{ backgroundColor: '#EF4444', borderColor: '#EF4444' }}
                                    >
                                        <Mic size={16} />
                                        INICIAR DICTADO
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={isPaused ? resumeRecording : pauseRecording}
                                            className="btn-pill"
                                            style={{ borderColor: '#EAB308', color: '#EAB308' }}
                                        >
                                            {isPaused ? <Play size={16} /> : <Pause size={16} />}
                                        </button>
                                        <button
                                            onClick={stopRecording}
                                            className="btn-pill"
                                        >
                                            <Square size={16} />
                                            DETENER
                                        </button>
                                    </div>
                                )}

                                {/* Duration */}
                                {isRecording && (
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full recording-indicator"
                                            style={{ backgroundColor: '#EF4444' }}
                                        />
                                        <span
                                            className="font-mono text-sm"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {formatDuration(duration)}
                                        </span>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Full Transcription Panel - Always Visible */}
                        <div className="card-noir p-4">
                            <h3 className="mono-tag text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                                TRANSCRIPCIÓN EN VIVO {isRecording && <span className="animate-pulse text-red-500">●</span>}
                            </h3>
                            <div
                                className="w-full h-48 rounded-lg p-3 font-mono text-sm overflow-y-auto whitespace-pre-wrap transition-all"
                                style={{
                                    backgroundColor: 'var(--bg-primary)',
                                    border: '1px solid var(--border-primary)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                {transcript ? (
                                    <>
                                        {transcript}
                                        {partialText && <span style={{ color: 'var(--text-secondary)' }}> {partialText}</span>}
                                    </>
                                ) : (
                                    <span style={{ color: 'var(--text-tertiary)' }} className="italic">
                                        {isRecording ? 'Escuchando...' : 'La transcripción aparecerá aquí...'}
                                    </span>
                                )}
                                {partialText && <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-current align-middle"></span>}
                            </div>

                        </div>

                        {/* Form Sections */}
                        <div className="card-noir">
                            {activeSection === 'datos_generales' && (
                                <>
                                    <DatosGeneralesForm
                                        data={currentCase?.datos_generales || {}}
                                        onChange={handleSectionChange('datos_generales')}
                                    />
                                    <div className="mt-4">
                                        <PrendasForm
                                            data={currentCase?.datos_generales?.prendas || []}
                                            onChange={(prendas) => updateField('datos_generales' as any, 'prendas', prendas)}
                                        />
                                    </div>
                                </>
                            )}

                            {activeSection === 'examen_externo' && (
                                <>
                                    <ExamenExternoForm
                                        data={currentCase?.examen_externo || {}}
                                        onChange={handleSectionChange('examen_externo')}
                                    />
                                    <h4 className="mono-tag text-xs my-4 text-center">CABEZA (EXTERNO)</h4>
                                    <ExamenExternoCabezaForm
                                        data={currentCase?.examen_externo_cabeza || {}}
                                        onChange={handleSectionChange('examen_externo_cabeza')}
                                    />
                                </>
                            )}

                            {activeSection === 'fenomenos' && (
                                <FenomenosCadavericosForm
                                    data={currentCase?.fenomenos_cadavericos || {}}
                                    onChange={handleSectionChange('fenomenos_cadavericos')}
                                />
                            )}

                            {activeSection === 'cabeza' && (
                                <ExamenInternoCabezaForm
                                    data={currentCase?.examen_interno_cabeza || {}}
                                    onChange={handleSectionChange('examen_interno_cabeza')}
                                />
                            )}

                            {activeSection === 'cuello' && (
                                <ExamenInternoCuelloForm
                                    data={currentCase?.examen_interno_cuello || {}}
                                    onChange={handleSectionChange('examen_interno_cuello')}
                                />
                            )}

                            {activeSection === 'torax' && (
                                <ExamenInternoToraxForm
                                    data={currentCase?.examen_interno_torax || {}}
                                    onChange={handleSectionChange('examen_interno_torax')}
                                />
                            )}

                            {activeSection === 'abdomen' && (
                                <ExamenInternoAbdomenForm
                                    data={currentCase?.examen_interno_abdomen || {}}
                                    onChange={handleSectionChange('examen_interno_abdomen')}
                                />
                            )}

                            {activeSection === 'genitales' && (
                                <AparatoGenitalForm
                                    data={currentCase?.aparato_genital || {}}
                                    onChange={handleSectionChange('aparato_genital')}
                                />
                            )}

                            {activeSection === 'lesiones' && (
                                <LesionesTraumaticasForm
                                    data={currentCase?.lesiones_traumaticas || {}}
                                    onChange={handleSectionChange('lesiones_traumaticas')}
                                />
                            )}

                            {activeSection === 'perennizacion' && (
                                <PerennizacionForm
                                    data={currentCase?.perennizacion || {}}
                                    onChange={handleSectionChange('perennizacion')}
                                />
                            )}

                            {activeSection === 'referenciales' && (
                                <DatosReferencialesForm
                                    data={currentCase?.datos_referenciales || {}}
                                    onChange={handleSectionChange('datos_referenciales')}
                                />
                            )}

                            {activeSection === 'adicionales' && (
                                <OrganosAdicionalesForm
                                    data={currentCase?.organos_adicionales || {}}
                                    onChange={handleSectionChange('organos_adicionales')}
                                />
                            )}

                            {activeSection === 'causas' && (
                                <CausasMuerteForm
                                    data={currentCase?.causas_muerte || {}}
                                    onChange={handleSectionChange('causas_muerte')}
                                />
                            )}
                        </div>
                    </div>
                </main>

                {/* Right Panel - Anatomy Model */}
                {showAnatomyModel && (
                    <aside
                        className="w-72 p-4 overflow-y-auto"
                        style={{ borderLeft: '1px solid var(--border-primary)' }}
                    >
                        <h3 className="mono-tag text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                            MODELO ANATÓMICO
                        </h3>
                        <AnatomyModel
                            highlightedOrgans={detectedOrgans}
                            onOrganClick={handleOrganClick}
                        />

                        {/* Legend */}
                        <div className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <p className="mb-2">Los órganos mencionados se iluminan automáticamente.</p>
                            <p>Clic en órgano para ir a su sección.</p>
                        </div>

                        {/* Detected Organs List */}
                        {detectedOrgans.length > 0 && (
                            <div
                                className="mt-4 p-3 rounded-lg"
                                style={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border-primary)'
                                }}
                            >
                                <h4 className="mono-tag text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                                    DETECTADOS
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                    {detectedOrgans.map((organ) => (
                                        <span
                                            key={organ}
                                            className="px-2 py-1 rounded text-xs font-mono uppercase"
                                            style={{
                                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                                color: '#EF4444',
                                                border: '1px solid rgba(239, 68, 68, 0.3)'
                                            }}
                                        >
                                            {organ.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                )}
            </div>
        </div>
    )
}
