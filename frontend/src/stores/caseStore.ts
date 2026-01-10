import { create } from 'zustand'
import type { ProtocoloNecropsia } from '../types/protocol'

// ============================================
// INTERFACES
// ============================================

interface CaseListItem {
    id: string
    protocol_number: string | null
    status: string
    created_at: string
    deceased_name?: string
    numero_informe?: string
}

interface CaseState {
    cases: CaseListItem[]
    currentCase: Partial<ProtocoloNecropsia> | null
    isLoading: boolean
    error: string | null

    fetchCases: () => Promise<void>
    createCase: () => Promise<string | null>
    loadCase: (caseId: string) => Promise<void>
    updateField: (section: keyof ProtocoloNecropsia, field: string, value: any) => void
    updateNestedField: (section: keyof ProtocoloNecropsia, path: string[], value: any) => void
    saveCase: () => Promise<void>
    clearCase: () => void
}

// ============================================
// SECCIONES DEL PROTOCOLO
// ============================================

const PROTOCOL_SECTIONS = [
    'datos_generales',
    'fenomenos_cadavericos',
    'examen_externo_cabeza',
    'examen_interno_cabeza',
    'examen_interno_cuello',
    'examen_interno_torax',
    'examen_interno_abdomen',
    'aparato_genital',
    'lesiones_traumaticas',
    'perennizacion',
    'datos_referenciales',
    'causas_muerte',
    'organos_adicionales',
] as const

// ============================================
// STORE
// ============================================

export const useCaseStore = create<CaseState>((set, get) => ({
    cases: [],
    currentCase: null,
    isLoading: false,
    error: null,

    fetchCases: async () => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch('/api/cases')
            const data = await response.json()
            set({ cases: data, isLoading: false })
        } catch (error) {
            set({ error: 'Error cargando casos', isLoading: false })
        }
    },

    createCase: async () => {
        try {
            const response = await fetch('/api/cases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })
            const data = await response.json()

            // Refresh list
            await get().fetchCases()

            return data.id
        } catch (error) {
            set({ error: 'Error creando caso' })
            return null
        }
    },

    loadCase: async (caseId: string) => {
        set({ isLoading: true, error: null })
        try {
            const response = await fetch(`/api/cases/${caseId}`)
            const data = await response.json()
            set({ currentCase: data, isLoading: false })
        } catch (error) {
            set({ error: 'Error cargando caso', isLoading: false })
        }
    },

    updateField: (section: keyof ProtocoloNecropsia, field: string, value: any) => {
        const current = get().currentCase
        if (!current) return

        const sectionData = (current[section] as Record<string, any>) || {}

        set({
            currentCase: {
                ...current,
                [section]: {
                    ...sectionData,
                    [field]: value,
                },
            },
        })
    },

    // Para campos anidados como: examen_interno_torax.pulmones.derecho.peso
    updateNestedField: (section: keyof ProtocoloNecropsia, path: string[], value: any) => {
        const current = get().currentCase
        if (!current) return

        const sectionData = JSON.parse(JSON.stringify(current[section] || {}))

        // Navegar al campo anidado
        let target = sectionData
        for (let i = 0; i < path.length - 1; i++) {
            if (!target[path[i]]) {
                target[path[i]] = {}
            }
            target = target[path[i]]
        }

        // Establecer el valor
        target[path[path.length - 1]] = value

        set({
            currentCase: {
                ...current,
                [section]: sectionData,
            },
        })
    },

    saveCase: async () => {
        const current = get().currentCase
        if (!current || !current.id) return

        try {
            // Construir objeto con todas las secciones
            const payload: Record<string, any> = {}

            for (const section of PROTOCOL_SECTIONS) {
                if (current[section]) {
                    payload[section] = current[section]
                }
            }

            await fetch(`/api/cases/${current.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
        } catch (error) {
            set({ error: 'Error guardando caso' })
        }
    },

    clearCase: () => {
        set({ currentCase: null })
    },
}))
