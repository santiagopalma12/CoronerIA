/**
 * Professional Anatomical Model for CoronerIA
 * Medical-grade visualization with detailed organ representation
 */

import { useState } from 'react'

interface AnatomyModelProps {
    highlightedOrgans: string[]
    onOrganClick?: (organ: string) => void
}

// Organ labels in Spanish
const ORGAN_LABELS: Record<string, string> = {
    encefalo: 'Encéfalo',
    pulmon_izquierdo: 'Pulmón Izq.',
    pulmon_derecho: 'Pulmón Der.',
    corazon: 'Corazón',
    higado: 'Hígado',
    bazo: 'Bazo',
    estomago: 'Estómago',
    rinon_izquierdo: 'Riñón Izq.',
    rinon_derecho: 'Riñón Der.',
    intestinos: 'Intestinos'
}

export function AnatomyModel({ highlightedOrgans, onOrganClick }: AnatomyModelProps) {
    const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null)

    const isHighlighted = (organ: string) => highlightedOrgans.includes(organ)
    const isHovered = (organ: string) => hoveredOrgan === organ

    const getOrganStyle = (organ: string): React.CSSProperties => {
        const highlighted = isHighlighted(organ)
        const hovered = isHovered(organ)

        return {
            fill: highlighted
                ? 'var(--organ-highlighted)'
                : hovered
                    ? 'var(--organ-hover)'
                    : 'var(--organ-normal)',
            stroke: highlighted
                ? 'var(--accent-danger)'
                : hovered
                    ? 'var(--accent-primary)'
                    : 'var(--border-secondary)',
            strokeWidth: highlighted ? 2 : hovered ? 1.5 : 1,
            opacity: highlighted ? 1 : hovered ? 0.9 : 0.7,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        }
    }

    const handleOrganClick = (organ: string) => {
        if (onOrganClick) {
            onOrganClick(organ)
        }
    }

    const OrganTooltip = () => {
        if (!hoveredOrgan) return null
        return (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md text-xs font-medium z-20"
                style={{
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)',
                    boxShadow: 'var(--shadow-md)'
                }}>
                {ORGAN_LABELS[hoveredOrgan] || hoveredOrgan}
            </div>
        )
    }

    return (
        <div className="relative w-full h-full flex flex-col rounded-lg overflow-hidden"
            style={{ backgroundColor: 'var(--anatomy-bg)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-panel)' }}>
                <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Modelo Anatómico
                    </h3>
                    {highlightedOrgans.length > 0 && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--accent-secondary)' }}>
                            {highlightedOrgans.length} órgano(s) detectado(s)
                        </p>
                    )}
                </div>

                {/* Legend */}
                <div className="flex gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: 'var(--organ-highlighted)' }}></span>
                        <span style={{ color: 'var(--text-tertiary)' }}>Detectado</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: 'var(--organ-normal)' }}></span>
                        <span style={{ color: 'var(--text-tertiary)' }}>Normal</span>
                    </div>
                </div>
            </div>

            {/* Anatomy SVG */}
            <div className="flex-1 flex items-center justify-center p-4 relative">
                <OrganTooltip />

                <svg
                    viewBox="0 0 240 380"
                    className="w-auto h-full max-h-[calc(100%-2rem)]"
                    style={{ maxWidth: '200px' }}
                >
                    <defs>
                        {/* Body gradient */}
                        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: 'var(--anatomy-body)', stopOpacity: 0.8 }} />
                            <stop offset="100%" style={{ stopColor: 'var(--anatomy-body)', stopOpacity: 0.4 }} />
                        </linearGradient>

                        {/* Highlighted organ glow */}
                        <filter id="organGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* ========== BODY OUTLINE ========== */}
                    <g opacity="0.6">
                        {/* Head - more detailed skull shape */}
                        <path
                            d="M120 10 
                               C145 10 165 30 165 55 
                               C165 75 155 90 145 95
                               L140 100 L100 100 L95 95
                               C85 90 75 75 75 55
                               C75 30 95 10 120 10"
                            fill="url(#bodyGrad)"
                            stroke="var(--border-secondary)"
                            strokeWidth="1"
                        />

                        {/* Neck */}
                        <path
                            d="M100 100 L100 120 Q100 125 105 125 
                               L135 125 Q140 125 140 120 L140 100"
                            fill="url(#bodyGrad)"
                            stroke="var(--border-secondary)"
                            strokeWidth="1"
                        />

                        {/* Torso - anatomically shaped */}
                        <path
                            d="M50 125 
                               C45 125 40 130 40 140
                               L40 260 
                               Q40 280 60 290
                               L80 295 L80 310
                               L90 310 L90 295
                               L110 295
                               L110 310 L120 310 L120 295
                               L130 295 L130 310 L140 310 L140 295
                               L150 295 L150 310 L160 310 L160 295
                               L180 290
                               Q200 280 200 260
                               L200 140
                               C200 130 195 125 190 125
                               L140 125 L100 125
                               Z"
                            fill="url(#bodyGrad)"
                            stroke="var(--border-secondary)"
                            strokeWidth="1"
                        />

                        {/* Ribcage lines */}
                        <path d="M55 145 Q120 155 185 145" fill="none" stroke="var(--border-secondary)" strokeWidth="0.5" opacity="0.5" />
                        <path d="M55 160 Q120 170 185 160" fill="none" stroke="var(--border-secondary)" strokeWidth="0.5" opacity="0.5" />
                        <path d="M55 175 Q120 185 185 175" fill="none" stroke="var(--border-secondary)" strokeWidth="0.5" opacity="0.5" />
                        <path d="M60 190 Q120 198 180 190" fill="none" stroke="var(--border-secondary)" strokeWidth="0.5" opacity="0.5" />

                        {/* Diaphragm line */}
                        <path d="M50 205 Q120 220 190 205" fill="none" stroke="var(--border-secondary)" strokeWidth="0.8" opacity="0.6" strokeDasharray="4 2" />
                    </g>

                    {/* ========== ORGANS ========== */}

                    {/* Brain/Encéfalo */}
                    <g
                        onMouseEnter={() => setHoveredOrgan('encefalo')}
                        onMouseLeave={() => setHoveredOrgan(null)}
                        onClick={() => handleOrganClick('encefalo')}
                        style={getOrganStyle('encefalo')}
                        filter={isHighlighted('encefalo') ? 'url(#organGlow)' : ''}
                    >
                        <ellipse cx="120" cy="50" rx="30" ry="25" />
                        {/* Brain folds */}
                        <path d="M95 45 Q105 42 110 48" fill="none" strokeWidth="0.8" />
                        <path d="M110 40 Q120 38 130 43" fill="none" strokeWidth="0.8" />
                        <path d="M130 48 Q140 45 145 50" fill="none" strokeWidth="0.8" />
                        <path d="M100 55 Q115 58 130 55" fill="none" strokeWidth="0.8" />
                    </g>

                    {/* Left Lung / Pulmón Izquierdo */}
                    <path
                        d="M60 140 
                           C50 145 48 165 50 185 
                           C52 200 58 210 75 210
                           C90 210 100 195 100 175
                           L100 155
                           C100 145 90 138 75 138
                           C68 138 62 139 60 140"
                        onMouseEnter={() => setHoveredOrgan('pulmon_izquierdo')}
                        onMouseLeave={() => setHoveredOrgan(null)}
                        onClick={() => handleOrganClick('pulmon_izquierdo')}
                        style={getOrganStyle('pulmon_izquierdo')}
                        filter={isHighlighted('pulmon_izquierdo') ? 'url(#organGlow)' : ''}
                    />

                    {/* Right Lung / Pulmón Derecho */}
                    <path
                        d="M180 140 
                           C190 145 192 165 190 185 
                           C188 200 182 210 165 210
                           C150 210 140 195 140 175
                           L140 155
                           C140 145 150 138 165 138
                           C172 138 178 139 180 140"
                        onMouseEnter={() => setHoveredOrgan('pulmon_derecho')}
                        onMouseLeave={() => setHoveredOrgan(null)}
                        onClick={() => handleOrganClick('pulmon_derecho')}
                        style={getOrganStyle('pulmon_derecho')}
                        filter={isHighlighted('pulmon_derecho') ? 'url(#organGlow)' : ''}
                    />

                    {/* Heart / Corazón */}
                    <path
                        d="M105 155
                           C100 150 95 155 95 165
                           C95 180 120 200 120 200
                           C120 200 145 180 145 165
                           C145 155 140 150 135 155
                           L120 170
                           L105 155"
                        onMouseEnter={() => setHoveredOrgan('corazon')}
                        onMouseLeave={() => setHoveredOrgan(null)}
                        onClick={() => handleOrganClick('corazon')}
                        style={getOrganStyle('corazon')}
                        filter={isHighlighted('corazon') ? 'url(#organGlow)' : ''}
                    />

                    {/* Liver / Hígado */}
                    <path
                        d="M100 215
                           C80 218 70 225 70 235
                           C70 250 90 260 120 260
                           C150 260 175 255 180 245
                           C185 235 180 225 165 220
                           C150 215 130 212 100 215"
                        onMouseEnter={() => setHoveredOrgan('higado')}
                        onMouseLeave={() => setHoveredOrgan(null)}
                        onClick={() => handleOrganClick('higado')}
                        style={getOrganStyle('higado')}
                        filter={isHighlighted('higado') ? 'url(#organGlow)' : ''}
                    />

                    {/* Stomach / Estómago */}
                    <path
                        d="M80 220
                           C70 225 65 235 68 250
                           C72 265 85 275 100 275
                           C115 275 125 265 125 250
                           C125 240 118 230 105 225
                           C92 220 85 218 80 220"
                        onMouseEnter={() => setHoveredOrgan('estomago')}
                        onMouseLeave={() => setHoveredOrgan(null)}
                        onClick={() => handleOrganClick('estomago')}
                        style={getOrganStyle('estomago')}
                        filter={isHighlighted('estomago') ? 'url(#organGlow)' : ''}
                    />

                    {/* Spleen / Bazo */}
                    <ellipse
                        cx="55" cy="235" rx="12" ry="18"
                        onMouseEnter={() => setHoveredOrgan('bazo')}
                        onMouseLeave={() => setHoveredOrgan(null)}
                        onClick={() => handleOrganClick('bazo')}
                        style={getOrganStyle('bazo')}
                        filter={isHighlighted('bazo') ? 'url(#organGlow)' : ''}
                    />

                    {/* Left Kidney / Riñón Izquierdo */}
                    <ellipse
                        cx="65" cy="265" rx="12" ry="18"
                        transform="rotate(-15 65 265)"
                        onMouseEnter={() => setHoveredOrgan('rinon_izquierdo')}
                        onMouseLeave={() => setHoveredOrgan(null)}
                        onClick={() => handleOrganClick('rinon_izquierdo')}
                        style={getOrganStyle('rinon_izquierdo')}
                        filter={isHighlighted('rinon_izquierdo') ? 'url(#organGlow)' : ''}
                    />

                    {/* Right Kidney / Riñón Derecho */}
                    <ellipse
                        cx="175" cy="265" rx="12" ry="18"
                        transform="rotate(15 175 265)"
                        onMouseEnter={() => setHoveredOrgan('rinon_derecho')}
                        onMouseLeave={() => setHoveredOrgan(null)}
                        onClick={() => handleOrganClick('rinon_derecho')}
                        style={getOrganStyle('rinon_derecho')}
                        filter={isHighlighted('rinon_derecho') ? 'url(#organGlow)' : ''}
                    />
                </svg>
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 text-center border-t"
                style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-panel)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Click en un órgano para navegar a su sección
                </p>
            </div>
        </div>
    )
}

export default AnatomyModel
