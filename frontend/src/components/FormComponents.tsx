/**
 * Componentes de formulario reutilizables para ForensIA v2.0
 * Cyber-Noir Design System
 */

import { ReactNode } from 'react'
import type { SiNo, SiNoIgnora, Medidas3D } from '../types/protocol'

// ============================================
// FORM SECTION - Contenedor de sección
// ============================================

interface FormSectionProps {
    title: string
    icon?: ReactNode
    children: ReactNode
    className?: string
}

export function FormSection({ title, icon, children, className = '' }: FormSectionProps) {
    return (
        <div
            className={`rounded-xl p-5 ${className}`}
            style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-primary)'
            }}
        >
            <div
                className="flex items-center gap-2 mb-4 pb-3"
                style={{ borderBottom: '1px solid var(--border-primary)' }}
            >
                {icon && <span style={{ color: 'var(--text-secondary)' }}>{icon}</span>}
                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    )
}

// ============================================
// FIELD ROW - Grid responsive para campos
// ============================================

interface FieldRowProps {
    children: ReactNode
    cols?: 2 | 3 | 4
}

export function FieldRow({ children, cols = 2 }: FieldRowProps) {
    const gridCols = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-4'
    }
    return (
        <div className={`grid gap-4 ${gridCols[cols]}`}>
            {children}
        </div>
    )
}

// ============================================
// TEXT FIELD - Campo de texto simple
// ============================================

interface TextFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    unit?: string
    className?: string
}

export function TextField({
    label, value, onChange, placeholder, type = 'text', unit, className = ''
}: TextFieldProps) {
    return (
        <div className={`${className}`}>
            <label className="label-noir">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="input-noir flex-1"
                />
                {unit && <span style={{ color: 'var(--text-muted)' }} className="text-sm">{unit}</span>}
            </div>
        </div>
    )
}

// ============================================
// TEXT AREA - Campo de texto multilínea
// ============================================

interface TextAreaProps {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    rows?: number
    className?: string
}

export function TextArea({
    label, value, onChange, placeholder, rows = 3, className = ''
}: TextAreaProps) {
    return (
        <div className={`${className}`}>
            <label className="label-noir">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="input-noir resize-none"
            />
        </div>
    )
}

// ============================================
// SELECT FIELD - Campo de selección
// ============================================

interface SelectFieldProps {
    label: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    placeholder?: string
    className?: string
}

export function SelectField({
    label, value, onChange, options, placeholder = 'Seleccionar...', className = ''
}: SelectFieldProps) {
    return (
        <div className={`${className}`}>
            <label className="label-noir">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="input-noir"
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    )
}

// ============================================
// TOGGLE BUTTON GROUP
// ============================================

interface ToggleButtonProps {
    active: boolean
    onClick: () => void
    variant?: 'success' | 'danger' | 'warning' | 'default'
    children: ReactNode
}

function ToggleButton({ active, onClick, variant = 'default', children }: ToggleButtonProps) {
    const colors = {
        success: { bg: '#22C55E', text: '#FFFFFF' },
        danger: { bg: '#EF4444', text: '#FFFFFF' },
        warning: { bg: '#EAB308', text: '#000000' },
        default: { bg: 'var(--text-primary)', text: 'var(--bg-primary)' }
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className="px-2.5 py-1 rounded text-xs font-medium transition-all"
            style={{
                backgroundColor: active ? colors[variant].bg : 'var(--bg-hover)',
                color: active ? colors[variant].text : 'var(--text-secondary)',
                border: `1px solid ${active ? colors[variant].bg : 'var(--border-primary)'}`
            }}
        >
            {children}
        </button>
    )
}

// ============================================
// PRESENCIA/LESIONES FIELD
// ============================================

interface PresenciaLesionesFieldProps {
    label: string
    descripcion: string
    presencia: SiNo
    lesiones: SiNoIgnora
    onDescripcionChange: (value: string) => void
    onPresenciaChange: (value: SiNo) => void
    onLesionesChange: (value: SiNoIgnora) => void
    placeholder?: string
    className?: string
}

export function PresenciaLesionesField({
    label, descripcion, presencia, lesiones,
    onDescripcionChange, onPresenciaChange, onLesionesChange,
    placeholder = 'Descripción...', className = ''
}: PresenciaLesionesFieldProps) {
    return (
        <div
            className={`rounded-lg p-4 ${className}`}
            style={{
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid var(--border-primary)'
            }}
        >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {label}
                </span>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Presencia */}
                    <div className="flex items-center gap-2">
                        <span className="mono-tag text-xs">Presencia:</span>
                        <div className="flex gap-1">
                            <ToggleButton
                                active={presencia === 'si'}
                                onClick={() => onPresenciaChange('si')}
                                variant="success"
                            >
                                Sí
                            </ToggleButton>
                            <ToggleButton
                                active={presencia === 'no'}
                                onClick={() => onPresenciaChange('no')}
                                variant="danger"
                            >
                                No
                            </ToggleButton>
                        </div>
                    </div>

                    {/* Lesiones */}
                    <div className="flex items-center gap-2">
                        <span className="mono-tag text-xs">Lesiones:</span>
                        <div className="flex gap-1">
                            <ToggleButton
                                active={lesiones === 'si'}
                                onClick={() => onLesionesChange('si')}
                                variant="danger"
                            >
                                Sí
                            </ToggleButton>
                            <ToggleButton
                                active={lesiones === 'no'}
                                onClick={() => onLesionesChange('no')}
                                variant="success"
                            >
                                No
                            </ToggleButton>
                            <ToggleButton
                                active={lesiones === 'ignora'}
                                onClick={() => onLesionesChange('ignora')}
                                variant="warning"
                            >
                                ?
                            </ToggleButton>
                        </div>
                    </div>
                </div>
            </div>
            <textarea
                value={descripcion}
                onChange={(e) => onDescripcionChange(e.target.value)}
                placeholder={placeholder}
                rows={2}
                className="input-noir text-sm resize-none"
            />
        </div>
    )
}

// ============================================
// ORGAN WEIGHT FIELD - Peso y Medidas de órgano
// ============================================

interface OrganWeightFieldProps {
    label: string
    peso: number
    medidas: Medidas3D
    descripcion: string
    presencia: SiNo
    lesiones: SiNoIgnora
    onPesoChange: (value: number) => void
    onMedidasChange: (medidas: Medidas3D) => void
    onDescripcionChange: (value: string) => void
    onPresenciaChange: (value: SiNo) => void
    onLesionesChange: (value: SiNoIgnora) => void
    className?: string
}

export function OrganWeightField({
    label, peso, medidas, descripcion, presencia, lesiones,
    onPesoChange, onMedidasChange, onDescripcionChange,
    onPresenciaChange, onLesionesChange, className = ''
}: OrganWeightFieldProps) {
    return (
        <div
            className={`rounded-lg p-4 ${className}`}
            style={{
                backgroundColor: 'var(--bg-hover)',
                border: '1px solid var(--border-primary)'
            }}
        >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {label}
                </span>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Presencia */}
                    <div className="flex items-center gap-2">
                        <span className="mono-tag text-xs">Presencia:</span>
                        <div className="flex gap-1">
                            <ToggleButton
                                active={presencia === 'si'}
                                onClick={() => onPresenciaChange('si')}
                                variant="success"
                            >
                                Sí
                            </ToggleButton>
                            <ToggleButton
                                active={presencia === 'no'}
                                onClick={() => onPresenciaChange('no')}
                                variant="danger"
                            >
                                No
                            </ToggleButton>
                        </div>
                    </div>

                    {/* Lesiones */}
                    <div className="flex items-center gap-2">
                        <span className="mono-tag text-xs">Lesiones:</span>
                        <div className="flex gap-1">
                            <ToggleButton
                                active={lesiones === 'si'}
                                onClick={() => onLesionesChange('si')}
                                variant="danger"
                            >
                                Sí
                            </ToggleButton>
                            <ToggleButton
                                active={lesiones === 'no'}
                                onClick={() => onLesionesChange('no')}
                                variant="success"
                            >
                                No
                            </ToggleButton>
                            <ToggleButton
                                active={lesiones === 'ignora'}
                                onClick={() => onLesionesChange('ignora')}
                                variant="warning"
                            >
                                ?
                            </ToggleButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Peso y Medidas */}
            <div className="grid grid-cols-4 gap-2 mb-3">
                <div>
                    <label className="label-noir text-xs">Peso</label>
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            value={peso || ''}
                            onChange={(e) => onPesoChange(parseFloat(e.target.value) || 0)}
                            className="input-noir text-sm py-1.5 px-2"
                            placeholder="0"
                        />
                        <span style={{ color: 'var(--text-muted)' }} className="text-xs">g</span>
                    </div>
                </div>
                <div>
                    <label className="label-noir text-xs">Largo</label>
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            value={medidas.largo || ''}
                            onChange={(e) => onMedidasChange({ ...medidas, largo: parseFloat(e.target.value) || 0 })}
                            className="input-noir text-sm py-1.5 px-2"
                            placeholder="0"
                        />
                        <span style={{ color: 'var(--text-muted)' }} className="text-xs">cm</span>
                    </div>
                </div>
                <div>
                    <label className="label-noir text-xs">Ancho</label>
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            value={medidas.ancho || ''}
                            onChange={(e) => onMedidasChange({ ...medidas, ancho: parseFloat(e.target.value) || 0 })}
                            className="input-noir text-sm py-1.5 px-2"
                            placeholder="0"
                        />
                        <span style={{ color: 'var(--text-muted)' }} className="text-xs">cm</span>
                    </div>
                </div>
                <div>
                    <label className="label-noir text-xs">Alto</label>
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            value={medidas.alto || ''}
                            onChange={(e) => onMedidasChange({ ...medidas, alto: parseFloat(e.target.value) || 0 })}
                            className="input-noir text-sm py-1.5 px-2"
                            placeholder="0"
                        />
                        <span style={{ color: 'var(--text-muted)' }} className="text-xs">cm</span>
                    </div>
                </div>
            </div>

            {/* Descripción */}
            <textarea
                value={descripcion}
                onChange={(e) => onDescripcionChange(e.target.value)}
                placeholder="Características / Descripción..."
                rows={2}
                className="input-noir text-sm resize-none"
            />
        </div>
    )
}

// ============================================
// CHECKBOX GROUP - Grupo de checkboxes
// ============================================

interface CheckboxGroupProps {
    label: string
    options: { value: string; label: string }[]
    selected: string[]
    onChange: (selected: string[]) => void
    className?: string
}

export function CheckboxGroup({ label, options, selected, onChange, className = '' }: CheckboxGroupProps) {
    const handleToggle = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter(v => v !== value))
        } else {
            onChange([...selected, value])
        }
    }

    return (
        <div className={`${className}`}>
            <label className="label-noir">{label}</label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleToggle(opt.value)}
                        className="px-3 py-1.5 rounded-lg text-sm transition"
                        style={{
                            backgroundColor: selected.includes(opt.value)
                                ? 'var(--text-primary)'
                                : 'var(--bg-hover)',
                            color: selected.includes(opt.value)
                                ? 'var(--bg-primary)'
                                : 'var(--text-secondary)',
                            border: `1px solid ${selected.includes(opt.value)
                                ? 'var(--text-primary)'
                                : 'var(--border-primary)'}`
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

// ============================================
// TEMPERATURE FIELD - Campos de temperatura
// ============================================

interface TemperatureFieldProps {
    ambiental: number | null
    rectal: number | null
    hepatica: number | null
    onAmbientalChange: (value: number | null) => void
    onRectalChange: (value: number | null) => void
    onHepaticaChange: (value: number | null) => void
}

export function TemperatureField({
    ambiental, rectal, hepatica,
    onAmbientalChange, onRectalChange, onHepaticaChange
}: TemperatureFieldProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label className="label-noir">Temp. Ambiental</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        step="0.1"
                        value={ambiental ?? ''}
                        onChange={(e) => onAmbientalChange(e.target.value ? parseFloat(e.target.value) : null)}
                        className="input-noir"
                        placeholder="0.0"
                    />
                    <span style={{ color: 'var(--text-muted)' }}>°C</span>
                </div>
            </div>
            <div>
                <label className="label-noir">Temp. Rectal</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        step="0.1"
                        value={rectal ?? ''}
                        onChange={(e) => onRectalChange(e.target.value ? parseFloat(e.target.value) : null)}
                        className="input-noir"
                        placeholder="0.0"
                    />
                    <span style={{ color: 'var(--text-muted)' }}>°C</span>
                </div>
            </div>
            <div>
                <label className="label-noir">Temp. Hepática</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        step="0.1"
                        value={hepatica ?? ''}
                        onChange={(e) => onHepaticaChange(e.target.value ? parseFloat(e.target.value) : null)}
                        className="input-noir"
                        placeholder="0.0"
                    />
                    <span style={{ color: 'var(--text-muted)' }}>°C</span>
                </div>
            </div>
        </div>
    )
}
