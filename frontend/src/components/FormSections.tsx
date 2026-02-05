/**
 * Secciones de formulario para ForensIA v2.0
 * Cada sección corresponde a una parte del protocolo IMLCF
 */

import { useState } from 'react'
import { Brain, Activity, User, Skull, Camera, FileText, Thermometer, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import {
    FormSection, TextField, TextArea, SelectField,
    PresenciaLesionesField, OrganWeightField, CheckboxGroup, TemperatureField
} from './FormComponents'
import type {
    DatosGenerales, FenomenosCadavericos, ExamenInternoCabeza, ExamenInternoCuello, ExamenExternoCabeza, AparatoGenital,
    ExamenInternoTorax, ExamenInternoAbdomen, CausasDeMuerte,
    ExamenExterno, Prenda, LesionesTraumaticas, Perennizacion, DatosReferenciales, OrganosAdicionales
} from '../types/protocol'

// ============================================
// HELPER: Safe getter para objetos anidados
// ============================================

function get<T>(obj: any, path: string, defaultValue: T): T {
    const value = path.split('.').reduce((acc, part) => acc?.[part], obj)
    return value ?? defaultValue
}

// ============================================
// 1. DATOS GENERALES
// ============================================

interface DatosGeneralesFormProps {
    data: Partial<DatosGenerales>
    onChange: (field: string, value: any) => void
}

export function DatosGeneralesForm({ data, onChange }: DatosGeneralesFormProps) {
    return (
        <FormSection title="Datos Generales" icon={<User size={18} />}>
            <div className="grid grid-cols-2 gap-4">
                <TextField
                    label="N° de Informe"
                    value={data.numero_informe || ''}
                    onChange={(v) => onChange('numero_informe', v)}
                    placeholder="Ej: 001-2026"
                />
                <TextField
                    label="Fecha"
                    value={data.fecha_informe || ''}
                    onChange={(v) => onChange('fecha_informe', v)}
                    type="text"
                    placeholder="DD/MM/YYYY"
                />
            </div>

            <div className="border-t border-slate-700 pt-4 mt-4">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Datos del Fallecido</h4>
                <div className="grid grid-cols-3 gap-4">
                    <TextField
                        label="Nombre"
                        value={get(data, 'fallecido.nombre', '')}
                        onChange={(v) => onChange('fallecido.nombre', v)}
                    />
                    <TextField
                        label="Apellido Paterno"
                        value={get(data, 'fallecido.apellido_paterno', '')}
                        onChange={(v) => onChange('fallecido.apellido_paterno', v)}
                    />
                    <TextField
                        label="Apellido Materno"
                        value={get(data, 'fallecido.apellido_materno', '')}
                        onChange={(v) => onChange('fallecido.apellido_materno', v)}
                    />
                </div>
                <div className="grid grid-cols-4 gap-4 mt-3">
                    <SelectField
                        label="Sexo"
                        value={get(data, 'fallecido.sexo', '')}
                        onChange={(v) => onChange('fallecido.sexo', v)}
                        options={[
                            { value: 'M', label: 'Masculino' },
                            { value: 'F', label: 'Femenino' }
                        ]}
                    />
                    <TextField
                        label="Edad"
                        value={String(get(data, 'fallecido.edad', '') || '')}
                        onChange={(v) => onChange('fallecido.edad', parseInt(v) || null)}
                        type="number"
                    />
                    <TextField
                        label="Talla (m)"
                        value={String(get(data, 'fallecido.talla', '') || '')}
                        onChange={(v) => onChange('fallecido.talla', parseFloat(v) || null)}
                        type="number"
                        placeholder="1.70"
                    />
                    <TextField
                        label="Peso (kg)"
                        value={String(get(data, 'fallecido.peso', '') || '')}
                        onChange={(v) => onChange('fallecido.peso', parseFloat(v) || null)}
                        type="number"
                        placeholder="70.5"
                    />
                    <TextField
                        label="Nacionalidad"
                        value={get(data, 'fallecido.nacionalidad', '')}
                        onChange={(v) => onChange('fallecido.nacionalidad', v)}
                    />
                    <TextField
                        label="Ocupación"
                        value={get(data, 'fallecido.ocupacion', '')}
                        onChange={(v) => onChange('fallecido.ocupacion', v)}
                    />
                </div>
            </div>

            <div className="border-t border-slate-700 pt-4 mt-4">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Ubicación</h4>
                <div className="grid grid-cols-2 gap-4">
                    <TextField
                        label="Lugar del Fallecimiento"
                        value={data.lugar_fallecimiento || ''}
                        onChange={(v) => onChange('lugar_fallecimiento', v)}
                    />
                    <TextField
                        label="Lugar del Hecho"
                        value={data.lugar_hecho || ''}
                        onChange={(v) => onChange('lugar_hecho', v)}
                    />
                </div>
            </div>

            <div className="border-t border-slate-700 pt-4 mt-4">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Datos de Necropsia</h4>
                <div className="grid grid-cols-2 gap-4">
                    <TextField
                        label="C. Médico N° (Primero)"
                        value={data.cm_medico_primero || ''}
                        onChange={(v) => onChange('cm_medico_primero', v)}
                    />
                    <TextField
                        label="C. Médico N° (Segundo)"
                        value={data.cm_medico_segundo || ''}
                        onChange={(v) => onChange('cm_medico_segundo', v)}
                    />
                    <TextField
                        label="Hora Inicio"
                        value={data.hora_inicio_necropsia || ''}
                        onChange={(v) => onChange('hora_inicio_necropsia', v)}
                        placeholder="HH:MM"
                    />
                    <TextField
                        label="Hora Término"
                        value={data.hora_termino_necropsia || ''}
                        onChange={(v) => onChange('hora_termino_necropsia', v)}
                        placeholder="HH:MM"
                    />
                </div>
            </div>
        </FormSection>
    )
}

// ============================================
// 2. FENÓMENOS CADAVÉRICOS
// ============================================

interface FenomenosCadavericosFormProps {
    data: Partial<FenomenosCadavericos>
    onChange: (field: string, value: any) => void
}

export function FenomenosCadavericosForm({ data, onChange }: FenomenosCadavericosFormProps) {
    return (
        <FormSection title="Fenómenos Cadavéricos" icon={<Thermometer size={18} />}>
            {/* Livideces */}
            <div className="bg-slate-900/50 rounded-lg p-3">
                <h4 className="font-medium text-white mb-3">Livideces</h4>
                <CheckboxGroup
                    label="Ubicación"
                    options={[
                        { value: 'dorsales', label: 'Dorsales' },
                        { value: 'ventrales', label: 'Ventrales' },
                        { value: 'lateral_derecho', label: 'Lat. Derecho' },
                        { value: 'lateral_izquierdo', label: 'Lat. Izquierdo' },
                        { value: 'en_pantalon', label: 'En Pantalón' }
                    ]}
                    selected={get(data, 'livideces.ubicacion', [])}
                    onChange={(v) => onChange('livideces.ubicacion', v)}
                />
                <div className="mt-3">
                    <SelectField
                        label="Estado"
                        value={get(data, 'livideces.estado', '')}
                        onChange={(v) => onChange('livideces.estado', v)}
                        options={[
                            { value: 'modificable', label: 'Modificable' },
                            { value: 'poco_modificable', label: 'Poco Modificable' },
                            { value: 'no_modificable', label: 'No Modificable' }
                        ]}
                    />
                </div>
                <div className="mt-3">
                    <TextArea
                        label="Observaciones"
                        value={get(data, 'livideces.observaciones', '')}
                        onChange={(v) => onChange('livideces.observaciones', v)}
                        rows={2}
                    />
                </div>
            </div>

            {/* Rigidez */}
            <div className="bg-slate-900/50 rounded-lg p-3">
                <h4 className="font-medium text-white mb-3">Rigidez</h4>
                <CheckboxGroup
                    label="Ubicación"
                    options={[
                        { value: 'mandibula', label: 'Mandíbula' },
                        { value: 'cuello', label: 'Cuello' },
                        { value: 'miembros_superiores', label: 'Miembros Superiores' },
                        { value: 'miembros_inferiores', label: 'Miembros Inferiores' }
                    ]}
                    selected={get(data, 'rigidez.ubicacion', [])}
                    onChange={(v) => onChange('rigidez.ubicacion', v)}
                />
                <div className="mt-3">
                    <SelectField
                        label="Estado"
                        value={get(data, 'rigidez.estado', '')}
                        onChange={(v) => onChange('rigidez.estado', v)}
                        options={[
                            { value: 'instalado', label: 'Instalado' },
                            { value: 'parcial', label: 'Parcial' },
                            { value: 'flacida', label: 'Flácida' }
                        ]}
                    />
                </div>
            </div>

            {/* Temperaturas */}
            <div className="bg-slate-900/50 rounded-lg p-3">
                <h4 className="font-medium text-white mb-3">Temperatura</h4>
                <TemperatureField
                    ambiental={get(data, 'temperatura.ambiental', null)}
                    rectal={get(data, 'temperatura.rectal', null)}
                    hepatica={get(data, 'temperatura.hepatica', null)}
                    onAmbientalChange={(v) => onChange('temperatura.ambiental', v)}
                    onRectalChange={(v) => onChange('temperatura.rectal', v)}
                    onHepaticaChange={(v) => onChange('temperatura.hepatica', v)}
                />
            </div>

            {/* Tiempo de muerte */}
            <TextField
                label="Tiempo Aproximado de Muerte"
                value={data.tiempo_muerte_horas || ''}
                onChange={(v) => onChange('tiempo_muerte_horas', v)}
                placeholder="Ej: 6-12 horas"
            />
        </FormSection>
    )
}

// ============================================
// 4. EXAMEN INTERNO CABEZA
// ============================================

interface ExamenInternoCabezaFormProps {
    data: Partial<ExamenInternoCabeza>
    onChange: (field: string, value: any) => void
}

export function ExamenInternoCabezaForm({ data, onChange }: ExamenInternoCabezaFormProps) {
    return (
        <FormSection title="Examen Interno - Cabeza" icon={<Brain size={18} />}>
            <PresenciaLesionesField
                label="Bóveda Craneal"
                descripcion={get(data, 'boveda.descripcion', '')}
                presencia={get(data, 'boveda.presencia', 'si')}
                lesiones={get(data, 'boveda.lesiones', 'no')}
                onDescripcionChange={(v) => onChange('boveda.descripcion', v)}
                onPresenciaChange={(v) => onChange('boveda.presencia', v)}
                onLesionesChange={(v) => onChange('boveda.lesiones', v)}
            />

            <PresenciaLesionesField
                label="Base del Cráneo"
                descripcion={get(data, 'base_craneo.descripcion', '')}
                presencia={get(data, 'base_craneo.presencia', 'si')}
                lesiones={get(data, 'base_craneo.lesiones', 'no')}
                onDescripcionChange={(v) => onChange('base_craneo.descripcion', v)}
                onPresenciaChange={(v) => onChange('base_craneo.presencia', v)}
                onLesionesChange={(v) => onChange('base_craneo.lesiones', v)}
            />

            <TextArea
                label="Meninges (Duramadre y Aracnoides)"
                value={get(data, 'meninges_duramadre_aracnoide', '')}
                onChange={(v) => onChange('meninges_duramadre_aracnoide', v)}
                placeholder="Descripción de hallazgos en meninges..."
            />

            <OrganWeightField
                label="Encéfalo"
                peso={get(data, 'encefalo.peso', 0)}
                medidas={get(data, 'encefalo.medidas', { largo: 0, ancho: 0, alto: 0 })}
                descripcion={get(data, 'encefalo.descripcion', '')}
                presencia={get(data, 'encefalo.presencia', 'si')}
                lesiones={get(data, 'encefalo.lesiones', 'no')}
                onPesoChange={(v) => onChange('encefalo.peso', v)}
                onMedidasChange={(v) => onChange('encefalo.medidas', v)}
                onDescripcionChange={(v) => onChange('encefalo.descripcion', v)}
                onPresenciaChange={(v) => onChange('encefalo.presencia', v)}
                onLesionesChange={(v) => onChange('encefalo.lesiones', v)}
            />

            <TextArea
                label="Vasos"
                value={get(data, 'vasos', '')}
                onChange={(v) => onChange('vasos', v)}
                placeholder="Descripción del sistema vascular cerebral..."
            />
        </FormSection>
    )
}

// ============================================
// 6. EXAMEN INTERNO TÓRAX
// ============================================

interface ExamenInternoToraxFormProps {
    data: Partial<ExamenInternoTorax>
    onChange: (field: string, value: any) => void
}

export function ExamenInternoToraxForm({ data, onChange }: ExamenInternoToraxFormProps) {
    return (
        <FormSection title="Examen Interno - Tórax" icon={<Activity size={18} />}>
            <PresenciaLesionesField
                label="Columna Dorsal y Parrilla Costal"
                descripcion={get(data, 'columna_dorsal_parrilla_costal.descripcion', '')}
                presencia={get(data, 'columna_dorsal_parrilla_costal.presencia', 'si')}
                lesiones={get(data, 'columna_dorsal_parrilla_costal.lesiones', 'no')}
                onDescripcionChange={(v) => onChange('columna_dorsal_parrilla_costal.descripcion', v)}
                onPresenciaChange={(v) => onChange('columna_dorsal_parrilla_costal.presencia', v)}
                onLesionesChange={(v) => onChange('columna_dorsal_parrilla_costal.lesiones', v)}
            />

            <TextArea
                label="Pleuras y Cavidades"
                value={get(data, 'pleuras_cavidades', '')}
                onChange={(v) => onChange('pleuras_cavidades', v)}
                placeholder="Adherencias / Contenido / Alteraciones..."
                rows={1}
            />

            <TextArea
                label="Mediastino"
                value={get(data, 'mediastino', '')}
                onChange={(v) => onChange('mediastino', v)}
                rows={1}
            />

            <OrganWeightField
                label="Timo"
                peso={get(data, 'timo.peso', 0)}
                medidas={get(data, 'timo.medidas', { largo: 0, ancho: 0, alto: 0 })}
                descripcion={get(data, 'timo.descripcion', '')}
                presencia={get(data, 'timo.presencia', 'si')}
                lesiones={get(data, 'timo.lesiones', 'no')}
                onPesoChange={(v) => onChange('timo.peso', v)}
                onMedidasChange={(v) => onChange('timo.medidas', v)}
                onDescripcionChange={(v) => onChange('timo.descripcion', v)}
                onPresenciaChange={(v) => onChange('timo.presencia', v)}
                onLesionesChange={(v) => onChange('timo.lesiones', v)}
            />

            {/* Pulmones */}
            <div className="bg-slate-900/50 rounded-lg p-3 mt-4">
                <h4 className="font-medium text-white mb-3">Pulmones</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <OrganWeightField
                        label="Pulmón Derecho"
                        peso={get(data, 'pulmones.derecho.peso', 0)}
                        medidas={get(data, 'pulmones.derecho.medidas', { largo: 0, ancho: 0, alto: 0 })}
                        descripcion={get(data, 'pulmones.derecho.descripcion', '')}
                        presencia={get(data, 'pulmones.derecho.presencia', 'si')}
                        lesiones={get(data, 'pulmones.derecho.lesiones', 'no')}
                        onPesoChange={(v) => onChange('pulmones.derecho.peso', v)}
                        onMedidasChange={(v) => onChange('pulmones.derecho.medidas', v)}
                        onDescripcionChange={(v) => onChange('pulmones.derecho.descripcion', v)}
                        onPresenciaChange={(v) => onChange('pulmones.derecho.presencia', v)}
                        onLesionesChange={(v) => onChange('pulmones.derecho.lesiones', v)}
                    />
                    <OrganWeightField
                        label="Pulmón Izquierdo"
                        peso={get(data, 'pulmones.izquierdo.peso', 0)}
                        medidas={get(data, 'pulmones.izquierdo.medidas', { largo: 0, ancho: 0, alto: 0 })}
                        descripcion={get(data, 'pulmones.izquierdo.descripcion', '')}
                        presencia={get(data, 'pulmones.izquierdo.presencia', 'si')}
                        lesiones={get(data, 'pulmones.izquierdo.lesiones', 'no')}
                        onPesoChange={(v) => onChange('pulmones.izquierdo.peso', v)}
                        onMedidasChange={(v) => onChange('pulmones.izquierdo.medidas', v)}
                        onDescripcionChange={(v) => onChange('pulmones.izquierdo.descripcion', v)}
                        onPresenciaChange={(v) => onChange('pulmones.izquierdo.presencia', v)}
                        onLesionesChange={(v) => onChange('pulmones.izquierdo.lesiones', v)}
                    />
                </div>
                <TextArea
                    label="Características Generales Pulmones"
                    value={get(data, 'pulmones.caracteristicas', '')}
                    onChange={(v) => onChange('pulmones.caracteristicas', v)}
                    rows={1}
                    className="mt-2"
                />
            </div>

            <PresenciaLesionesField
                label="Pericardio"
                descripcion={get(data, 'pericardio.descripcion', '')}
                presencia={get(data, 'pericardio.presencia', 'si')}
                lesiones={get(data, 'pericardio.lesiones', 'no')}
                onDescripcionChange={(v) => onChange('pericardio.descripcion', v)}
                onPresenciaChange={(v) => onChange('pericardio.presencia', v)}
                onLesionesChange={(v) => onChange('pericardio.lesiones', v)}
            />

            {/* Corazón */}
            <div className="bg-slate-900/50 rounded-lg p-3 mt-4">
                <h4 className="font-medium text-white mb-3">Corazón</h4>
                <OrganWeightField
                    label="Corazón"
                    peso={get(data, 'corazon.peso', 0)}
                    medidas={get(data, 'corazon.medidas', { largo: 0, ancho: 0, alto: 0 })}
                    descripcion={get(data, 'corazon.descripcion', '')}
                    presencia={get(data, 'corazon.presencia', 'si')}
                    lesiones={get(data, 'corazon.lesiones', 'no')}
                    onPesoChange={(v) => onChange('corazon.peso', v)}
                    onMedidasChange={(v) => onChange('corazon.medidas', v)}
                    onDescripcionChange={(v) => onChange('corazon.descripcion', v)}
                    onPresenciaChange={(v) => onChange('corazon.presencia', v)}
                    onLesionesChange={(v) => onChange('corazon.lesiones', v)}
                />

                <h5 className="font-medium text-slate-300 mt-2 text-sm">Válvulas (mm)</h5>
                <div className="grid grid-cols-4 gap-3">
                    <TextField label="Aórtica" value={String(get(data, 'corazon.valvulas.aortica_mm', '') || '')} onChange={(v) => onChange('corazon.valvulas.aortica_mm', parseFloat(v) || 0)} type="number" unit="mm" />
                    <TextField label="Mitral" value={String(get(data, 'corazon.valvulas.mitral_mm', '') || '')} onChange={(v) => onChange('corazon.valvulas.mitral_mm', parseFloat(v) || 0)} type="number" unit="mm" />
                    <TextField label="Tricúspide" value={String(get(data, 'corazon.valvulas.tricuspide_mm', '') || '')} onChange={(v) => onChange('corazon.valvulas.tricuspide_mm', parseFloat(v) || 0)} type="number" unit="mm" />
                    <TextField label="Pulmonar" value={String(get(data, 'corazon.valvulas.pulmonar_mm', '') || '')} onChange={(v) => onChange('corazon.valvulas.pulmonar_mm', parseFloat(v) || 0)} type="number" unit="mm" />
                </div>
                <TextArea
                    label="Características Válvulas"
                    value={get(data, 'corazon.valvulas.caracteristicas', '')}
                    onChange={(v) => onChange('corazon.valvulas.caracteristicas', v)}
                    rows={1}
                />

                <h5 className="font-medium text-slate-300 mt-2 text-sm">Paredes Ventriculares (mm)</h5>
                <div className="grid grid-cols-2 gap-3">
                    <TextField label="Derecha" value={String(get(data, 'corazon.paredes_ventriculares.derecha_mm', '') || '')} onChange={(v) => onChange('corazon.paredes_ventriculares.derecha_mm', parseFloat(v) || 0)} type="number" unit="mm" />
                    <TextField label="Izquierda" value={String(get(data, 'corazon.paredes_ventriculares.izquierda_mm', '') || '')} onChange={(v) => onChange('corazon.paredes_ventriculares.izquierda_mm', parseFloat(v) || 0)} type="number" unit="mm" />
                </div>
                <TextArea
                    label="Observaciones Paredes"
                    value={get(data, 'corazon.paredes_ventriculares.observaciones', '')}
                    onChange={(v) => onChange('corazon.paredes_ventriculares.observaciones', v)}
                    rows={1}
                />

                <div className="grid grid-cols-2 gap-4 mt-2">
                    <TextArea label="Arteria Aorta / Pulmonar" value={get(data, 'corazon.arteria_aorta_pulmonar', '')} onChange={(v) => onChange('corazon.arteria_aorta_pulmonar', v)} rows={1} />
                    <TextArea label="Arterias Coronarias" value={get(data, 'corazon.arterias_coronarias', '')} onChange={(v) => onChange('corazon.arterias_coronarias', v)} rows={1} />
                </div>
            </div>
        </FormSection>
    )
}

// ============================================
// 7. EXAMEN INTERNO ABDOMEN
// ============================================

interface ExamenInternoAbdomenFormProps {
    data: Partial<ExamenInternoAbdomen>
    onChange: (field: string, value: any) => void
}

export function ExamenInternoAbdomenForm({ data, onChange }: ExamenInternoAbdomenFormProps) {
    return (
        <FormSection title="Examen Interno - Abdomen" icon={<Activity size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PresenciaLesionesField
                    label="Columna Lumbosacra y Pelvis"
                    descripcion={get(data, 'columna_lumbosacra_pelvis.descripcion', '')}
                    presencia={get(data, 'columna_lumbosacra_pelvis.presencia', 'si')}
                    lesiones={get(data, 'columna_lumbosacra_pelvis.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('columna_lumbosacra_pelvis.descripcion', v)}
                    onPresenciaChange={(v) => onChange('columna_lumbosacra_pelvis.presencia', v)}
                    onLesionesChange={(v) => onChange('columna_lumbosacra_pelvis.lesiones', v)}
                />
                <PresenciaLesionesField
                    label="Pared Peritoneal"
                    descripcion={get(data, 'pared_peritoneal.descripcion', '')}
                    presencia={get(data, 'pared_peritoneal.presencia', 'si')}
                    lesiones={get(data, 'pared_peritoneal.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('pared_peritoneal.descripcion', v)}
                    onPresenciaChange={(v) => onChange('pared_peritoneal.presencia', v)}
                    onLesionesChange={(v) => onChange('pared_peritoneal.lesiones', v)}
                />
            </div>

            <div className="bg-slate-900/30 p-3 rounded border border-slate-700 mt-3 mb-3">
                <h5 className="text-sm font-medium text-slate-300 mb-2">Cavidad Peritoneal</h5>
                <div className="grid grid-cols-2 gap-4">
                    <SelectField
                        label="Estado"
                        value={get(data, 'cavidad_peritoneal.estado', 'libre')}
                        onChange={(v) => onChange('cavidad_peritoneal.estado', v)}
                        options={[{ value: 'libre', label: 'Libre' }, { value: 'contenido', label: 'Contenido' }]}
                    />
                    <TextField
                        label="Volumen (cm3)"
                        value={String(get(data, 'cavidad_peritoneal.volumen_cm3', '') || '')}
                        onChange={(v) => onChange('cavidad_peritoneal.volumen_cm3', parseFloat(v) || 0)}
                        type="number"
                    />
                </div>
                <TextField
                    label="Contenido (Detalle)"
                    value={get(data, 'cavidad_peritoneal.contenido', '')}
                    onChange={(v) => onChange('cavidad_peritoneal.contenido', v)}
                    className="mt-2"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PresenciaLesionesField
                    label="Diafragma"
                    descripcion={get(data, 'diafragma.descripcion', '')}
                    presencia={get(data, 'diafragma.presencia', 'si')}
                    lesiones={get(data, 'diafragma.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('diafragma.descripcion', v)}
                    onPresenciaChange={(v) => onChange('diafragma.presencia', v)}
                    onLesionesChange={(v) => onChange('diafragma.lesiones', v)}
                />
                <PresenciaLesionesField
                    label="Epiplones"
                    descripcion={get(data, 'epiplones.descripcion', '')}
                    presencia={get(data, 'epiplones.presencia', 'si')}
                    lesiones={get(data, 'epiplones.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('epiplones.descripcion', v)}
                    onPresenciaChange={(v) => onChange('epiplones.presencia', v)}
                    onLesionesChange={(v) => onChange('epiplones.lesiones', v)}
                />
                <PresenciaLesionesField
                    label="Mesenterio"
                    descripcion={get(data, 'mesenterio.descripcion', '')}
                    presencia={get(data, 'mesenterio.presencia', 'si')}
                    lesiones={get(data, 'mesenterio.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('mesenterio.descripcion', v)}
                    onPresenciaChange={(v) => onChange('mesenterio.presencia', v)}
                    onLesionesChange={(v) => onChange('mesenterio.lesiones', v)}
                />
            </div>

            <div className="mt-4 border-t border-slate-700 pt-4">
                <h4 className="font-medium text-indigo-400 mb-3 block">Estómago</h4>
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <SelectField
                        label="Presencia"
                        value={get(data, 'estomago.presencia', 'si')}
                        onChange={(v) => onChange('estomago.presencia', v)}
                        options={[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }]}
                    />
                    <SelectField
                        label="Lesiones"
                        value={get(data, 'estomago.lesiones', 'no')}
                        onChange={(v) => onChange('estomago.lesiones', v)}
                        options={[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }, { value: 'ignora', label: 'Ignora' }]}
                    />
                </div>
                <TextArea
                    label="Descripción"
                    value={get(data, 'estomago.descripcion', '')}
                    onChange={(v) => onChange('estomago.descripcion', v)}
                    rows={1}
                />
                <TextArea
                    label="Contenido Gástrico"
                    value={get(data, 'estomago.contiene', '')}
                    onChange={(v) => onChange('estomago.contiene', v)}
                    rows={1}
                    className="mt-2"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <PresenciaLesionesField
                    label="Intestino Delgado"
                    descripcion={get(data, 'intestino_delgado.descripcion', '')}
                    presencia={get(data, 'intestino_delgado.presencia', 'si')}
                    lesiones={get(data, 'intestino_delgado.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('intestino_delgado.descripcion', v)}
                    onPresenciaChange={(v) => onChange('intestino_delgado.presencia', v)}
                    onLesionesChange={(v) => onChange('intestino_delgado.lesiones', v)}
                />
                <PresenciaLesionesField
                    label="Intestino Grueso"
                    descripcion={get(data, 'intestino_grueso.descripcion', '')}
                    presencia={get(data, 'intestino_grueso.presencia', 'si')}
                    lesiones={get(data, 'intestino_grueso.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('intestino_grueso.descripcion', v)}
                    onPresenciaChange={(v) => onChange('intestino_grueso.presencia', v)}
                    onLesionesChange={(v) => onChange('intestino_grueso.lesiones', v)}
                />
            </div>
            <TextField
                label="Apéndice"
                value={get(data, 'apendice', '')}
                onChange={(v) => onChange('apendice', v)}
                className="mt-3"
            />

            <div className="mt-4 border-t border-slate-700 pt-4">
                <h4 className="text-white font-medium mb-2">Hígado y Vías Biliares</h4>
                <OrganWeightField
                    label="Hígado"
                    peso={get(data, 'higado.peso', 0)}
                    medidas={get(data, 'higado.medidas', { largo: 0, ancho: 0, alto: 0 })}
                    descripcion={get(data, 'higado.descripcion', '')}
                    presencia={get(data, 'higado.presencia', 'si')}
                    lesiones={get(data, 'higado.lesiones', 'no')}
                    onPesoChange={(v) => onChange('higado.peso', v)}
                    onMedidasChange={(v) => onChange('higado.medidas', v)}
                    onDescripcionChange={(v) => onChange('higado.descripcion', v)}
                    onPresenciaChange={(v) => onChange('higado.presencia', v)}
                    onLesionesChange={(v) => onChange('higado.lesiones', v)}
                />
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <TextArea
                        label="Vesícula (Descripción)"
                        value={get(data, 'vesicula_biliar.descripcion', '')}
                        onChange={(v) => onChange('vesicula_biliar.descripcion', v)}
                        rows={1}
                    />
                    <div className="flex items-center">
                        <CheckboxGroup
                            label="Litiasis"
                            options={[{ value: 'si', label: 'Presenta Litiasis' }]}
                            selected={get(data, 'vesicula_biliar.litiasis', false) ? ['si'] : []}
                            onChange={(v) => onChange('vesicula_biliar.litiasis', v.includes('si'))}
                        />
                    </div>
                </div>
            </div>

            <OrganWeightField
                label="Bazo"
                peso={get(data, 'bazo.peso', 0)}
                medidas={get(data, 'bazo.medidas', { largo: 0, ancho: 0, alto: 0 })}
                descripcion={get(data, 'bazo.descripcion', '')}
                presencia={get(data, 'bazo.presencia', 'si')}
                lesiones={get(data, 'bazo.lesiones', 'no')}
                onPesoChange={(v) => onChange('bazo.peso', v)}
                onMedidasChange={(v) => onChange('bazo.medidas', v)}
                onDescripcionChange={(v) => onChange('bazo.descripcion', v)}
                onPresenciaChange={(v) => onChange('bazo.presencia', v)}
                onLesionesChange={(v) => onChange('bazo.lesiones', v)}
                className="mt-4"
            />

            {/* Riñones */}
            <div className="bg-slate-900/50 rounded-lg p-3 mt-4">
                <h4 className="font-medium text-white mb-3">Riñones</h4>
                <div className="grid grid-cols-2 gap-4">
                    <OrganWeightField
                        label="Riñón Derecho"
                        peso={get(data, 'rinones.derecho.peso', 0)}
                        medidas={get(data, 'rinones.derecho.medidas', { largo: 0, ancho: 0, alto: 0 })}
                        descripcion={get(data, 'rinones.derecho.descripcion', '')}
                        presencia={get(data, 'rinones.derecho.presencia', 'si')}
                        lesiones={get(data, 'rinones.derecho.lesiones', 'no')}
                        onPesoChange={(v) => onChange('rinones.derecho.peso', v)}
                        onMedidasChange={(v) => onChange('rinones.derecho.medidas', v)}
                        onDescripcionChange={(v) => onChange('rinones.derecho.descripcion', v)}
                        onPresenciaChange={(v) => onChange('rinones.derecho.presencia', v)}
                        onLesionesChange={(v) => onChange('rinones.derecho.lesiones', v)}
                    />
                    <OrganWeightField
                        label="Riñón Izquierdo"
                        peso={get(data, 'rinones.izquierdo.peso', 0)}
                        medidas={get(data, 'rinones.izquierdo.medidas', { largo: 0, ancho: 0, alto: 0 })}
                        descripcion={get(data, 'rinones.izquierdo.descripcion', '')}
                        presencia={get(data, 'rinones.izquierdo.presencia', 'si')}
                        lesiones={get(data, 'rinones.izquierdo.lesiones', 'no')}
                        onPesoChange={(v) => onChange('rinones.izquierdo.peso', v)}
                        onMedidasChange={(v) => onChange('rinones.izquierdo.medidas', v)}
                        onDescripcionChange={(v) => onChange('rinones.izquierdo.descripcion', v)}
                        onPresenciaChange={(v) => onChange('rinones.izquierdo.presencia', v)}
                        onLesionesChange={(v) => onChange('rinones.izquierdo.lesiones', v)}
                    />
                </div>
                <TextArea
                    label="Características Generales Riñones"
                    value={get(data, 'rinones.caracteristicas', '')}
                    onChange={(v) => onChange('rinones.caracteristicas', v)}
                    className="mt-2"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <TextArea
                    label="Suprarrenales"
                    value={get(data, 'suprarrenales', '')}
                    onChange={(v) => onChange('suprarrenales', v)}
                />
                <PresenciaLesionesField
                    label="Vías de Excreción Renal"
                    descripcion={get(data, 'vias_excrecion_renal.descripcion', '')}
                    presencia={get(data, 'vias_excrecion_renal.presencia', 'si')}
                    lesiones={get(data, 'vias_excrecion_renal.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('vias_excrecion_renal.descripcion', v)}
                    onPresenciaChange={(v) => onChange('vias_excrecion_renal.presencia', v)}
                    onLesionesChange={(v) => onChange('vias_excrecion_renal.lesiones', v)}
                />
            </div>
            <PresenciaLesionesField
                label="Vasos Abdominales"
                descripcion={get(data, 'vasos.descripcion', '')}
                presencia={get(data, 'vasos.presencia', 'si')}
                lesiones={get(data, 'vasos.lesiones', 'no')}
                onDescripcionChange={(v) => onChange('vasos.descripcion', v)}
                onPresenciaChange={(v) => onChange('vasos.presencia', v)}
                onLesionesChange={(v) => onChange('vasos.lesiones', v)}
                className="mt-3"
            />

            <OrganWeightField
                label="Páncreas"
                peso={get(data, 'pancreas.peso', 0)}
                medidas={get(data, 'pancreas.medidas', { largo: 0, ancho: 0, alto: 0 })}
                descripcion={get(data, 'pancreas.descripcion', '')}
                presencia={get(data, 'pancreas.presencia', 'si')}
                lesiones={get(data, 'pancreas.lesiones', 'no')}
                onPesoChange={(v) => onChange('pancreas.peso', v)}
                onMedidasChange={(v) => onChange('pancreas.medidas', v)}
                onDescripcionChange={(v) => onChange('pancreas.descripcion', v)}
                onPresenciaChange={(v) => onChange('pancreas.presencia', v)}
                onLesionesChange={(v) => onChange('pancreas.lesiones', v)}
                className="mt-4"
            />
        </FormSection>
    )
}

// Imports consolidated at top

// ... existing imports ...

// ============================================
// 12. CAUSAS DE MUERTE
// ============================================

interface CausasMuerteFormProps {
    data: Partial<CausasDeMuerte>
    onChange: (field: string, value: any) => void
    findingsContext?: string // Contexto completo para el análisis
}

export function CausasMuerteForm({ data, onChange, findingsContext = '' }: CausasMuerteFormProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisError, setAnalysisError] = useState('')
    // const [analysisSuccess, setAnalysisSuccess] = useState(false) // Removing unused variable
    const [reasoning, setReasoning] = useState('')

    const handleAnalyze = async () => {
        if (!findingsContext || findingsContext.length < 50) {
            setAnalysisError('No hay suficientes hallazgos registrados para analizar (mínimo 50 caracteres).')
            return
        }

        setIsAnalyzing(true)
        setAnalysisError('')
        // setAnalysisSuccess(false)
        setReasoning('')

        try {
            const response = await fetch('/api/ner/analyze-death-cause', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ findings_text: findingsContext })
            })

            if (!response.ok) throw new Error('Error en el servicio de análisis')

            const result = await response.json()

            // Auto-fill fields if they are empty or if user confirms (here we just overwrite for demo speed)
            if (result.causa_final) onChange('diagnostico_presuntivo.causa_final.texto', result.causa_final)
            if (result.causa_intermedia) onChange('diagnostico_presuntivo.causa_intermedia.texto', result.causa_intermedia)
            if (result.causa_basica) onChange('diagnostico_presuntivo.causa_basica.texto', result.causa_basica)

            if (result.razonamiento_clinico) {
                setReasoning(result.razonamiento_clinico)
            }

            // setAnalysisSuccess(true)
        } catch (error) {
            console.error(error)
            setAnalysisError('No se pudo completar el análisis con Sekhmed AI. Intente nuevamente.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <FormSection title="Causa(s) de Muerte" icon={<Skull size={18} />}>

            {/* Advanced AI Analysis Section */}
            <div className="mb-6 rounded-xl p-4 border border-blue-500/30 bg-blue-500/5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Brain className="text-blue-400" size={20} />
                        <h4 className="font-semibold text-blue-100">Razonamiento Forense (Sekhmed AI)</h4>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                        ADVANCED REASONING
                    </span>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                    Utilice el motor de IA avanzado para deducir la cadena causal basada en los hallazgos registrados.
                </p>

                {analysisError && (
                    <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-start gap-2">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        {analysisError}
                    </div>
                )}

                {reasoning && (
                    <div className="mb-4 p-4 rounded bg-slate-900/50 border border-slate-700 text-sm animate-in fade-in slide-in-from-top-2 duration-500">
                        <h5 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            Análisis Clínico:
                        </h5>
                        <p className="text-slate-300 leading-relaxed font-mono text-xs md:text-sm">
                            {reasoning}
                        </p>
                    </div>
                )}

                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            ANALIZANDO EVIDENCIA...
                        </>
                    ) : (
                        <>
                            <Brain size={18} className="group-hover:scale-110 transition-transform" />
                            ANALIZAR CAUSA DE MUERTE
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Diagnóstico Presuntivo */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="font-medium text-amber-400 mb-4">Diagnóstico Presuntivo</h4>

                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <TextField
                                    label="Causa Final"
                                    value={get(data, 'diagnostico_presuntivo.causa_final.texto', '')}
                                    onChange={(v) => onChange('diagnostico_presuntivo.causa_final.texto', v)}
                                    placeholder="Ej: Shock hipovolémico"
                                />
                            </div>
                            <TextField
                                label="CIE-10"
                                value={get(data, 'diagnostico_presuntivo.causa_final.cie10', '')}
                                onChange={(v) => onChange('diagnostico_presuntivo.causa_final.cie10', v)}
                                placeholder="Código"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <TextField
                                    label="Causa Intermedia"
                                    value={get(data, 'diagnostico_presuntivo.causa_intermedia.texto', '')}
                                    onChange={(v) => onChange('diagnostico_presuntivo.causa_intermedia.texto', v)}
                                />
                            </div>
                            <TextField
                                label="CIE-10"
                                value={get(data, 'diagnostico_presuntivo.causa_intermedia.cie10', '')}
                                onChange={(v) => onChange('diagnostico_presuntivo.causa_intermedia.cie10', v)}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <TextField
                                    label="Causa Básica"
                                    value={get(data, 'diagnostico_presuntivo.causa_basica.texto', '')}
                                    onChange={(v) => onChange('diagnostico_presuntivo.causa_basica.texto', v)}
                                />
                            </div>
                            <TextField
                                label="CIE-10"
                                value={get(data, 'diagnostico_presuntivo.causa_basica.cie10', '')}
                                onChange={(v) => onChange('diagnostico_presuntivo.causa_basica.cie10', v)}
                            />
                        </div>

                        <TextField
                            label="Agente Causante"
                            value={get(data, 'diagnostico_presuntivo.agente_causante', '')}
                            onChange={(v) => onChange('diagnostico_presuntivo.agente_causante', v)}
                        />

                        <div className="border-t border-slate-700 pt-3 mt-2">
                            <h5 className="text-xs font-medium text-slate-400 mb-2">Etiología Médico Legal</h5>
                            <div className="grid grid-cols-2 gap-2">
                                <SelectField
                                    label="Forma"
                                    value={get(data, 'diagnostico_presuntivo.etiologia.forma', '')}
                                    onChange={(v) => onChange('diagnostico_presuntivo.etiologia.forma', v)}
                                    options={[{ value: 'HOMICIDA', label: 'Homicida' }, { value: 'SUICIDA', label: 'Suicida' }, { value: 'ACCIDENTAL', label: 'Accidental' }, { value: 'NATURAL', label: 'Natural' }, { value: 'INDETERMINADA', label: 'Indeterminada' }]}
                                />
                                <TextField
                                    label="Agente"
                                    value={get(data, 'diagnostico_presuntivo.etiologia.agente', '')}
                                    onChange={(v) => onChange('diagnostico_presuntivo.etiologia.agente', v)}
                                />
                            </div>
                            <TextField
                                label="Tipo de Agente"
                                value={get(data, 'diagnostico_presuntivo.etiologia.tipo_agente', '')}
                                onChange={(v) => onChange('diagnostico_presuntivo.etiologia.tipo_agente', v)}
                                className="mt-2"
                            />
                        </div>

                        <TextField
                            label="Fecha Cierre Presuntivo"
                            value={get(data, 'fecha_cierre_presuntivo', '')}
                            onChange={(v) => onChange('fecha_cierre_presuntivo', v)}
                            type="datetime-local"
                        />
                    </div>
                </div>

                {/* Diagnóstico Integrado */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="font-medium text-emerald-400 mb-4">Diagnóstico Integrado</h4>

                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <TextField
                                    label="Causa Final"
                                    value={get(data, 'diagnostico_integrado.causa_final.texto', '')}
                                    onChange={(v) => onChange('diagnostico_integrado.causa_final.texto', v)}
                                />
                            </div>
                            <TextField
                                label="CIE-10"
                                value={get(data, 'diagnostico_integrado.causa_final.cie10', '')}
                                onChange={(v) => onChange('diagnostico_integrado.causa_final.cie10', v)}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <TextField
                                    label="Causa Intermedia"
                                    value={get(data, 'diagnostico_integrado.causa_intermedia.texto', '')}
                                    onChange={(v) => onChange('diagnostico_integrado.causa_intermedia.texto', v)}
                                />
                            </div>
                            <TextField
                                label="CIE-10"
                                value={get(data, 'diagnostico_integrado.causa_intermedia.cie10', '')}
                                onChange={(v) => onChange('diagnostico_integrado.causa_intermedia.cie10', v)}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <TextField
                                    label="Causa Básica"
                                    value={get(data, 'diagnostico_integrado.causa_basica.texto', '')}
                                    onChange={(v) => onChange('diagnostico_integrado.causa_basica.texto', v)}
                                />
                            </div>
                            <TextField
                                label="CIE-10"
                                value={get(data, 'diagnostico_integrado.causa_basica.cie10', '')}
                                onChange={(v) => onChange('diagnostico_integrado.causa_basica.cie10', v)}
                            />
                        </div>

                        <TextField
                            label="Agente Causante"
                            value={get(data, 'diagnostico_integrado.agente_causante', '')}
                            onChange={(v) => onChange('diagnostico_integrado.agente_causante', v)}
                        />

                        <div className="border-t border-slate-700 pt-3 mt-2">
                            <h5 className="text-xs font-medium text-slate-400 mb-2">Etiología Médico Legal</h5>
                            <div className="grid grid-cols-2 gap-2">
                                <SelectField
                                    label="Forma"
                                    value={get(data, 'diagnostico_integrado.etiologia.forma', '')}
                                    onChange={(v) => onChange('diagnostico_integrado.etiologia.forma', v)}
                                    options={[{ value: 'HOMICIDA', label: 'Homicida' }, { value: 'SUICIDA', label: 'Suicida' }, { value: 'ACCIDENTAL', label: 'Accidental' }, { value: 'NATURAL', label: 'Natural' }, { value: 'INDETERMINADA', label: 'Indeterminada' }]}
                                />
                                <TextField
                                    label="Agente"
                                    value={get(data, 'diagnostico_integrado.etiologia.agente', '')}
                                    onChange={(v) => onChange('diagnostico_integrado.etiologia.agente', v)}
                                />
                            </div>
                            <TextField
                                label="Tipo de Agente"
                                value={get(data, 'diagnostico_integrado.etiologia.tipo_agente', '')}
                                onChange={(v) => onChange('diagnostico_integrado.etiologia.tipo_agente', v)}
                                className="mt-2"
                            />
                        </div>

                        <TextField
                            label="Fecha Cierre Integrado"
                            value={get(data, 'fecha_cierre_integrado', '')}
                            onChange={(v) => onChange('fecha_cierre_integrado', v)}
                            type="datetime-local"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <TextArea
                    label="Datos Preliminares"
                    value={get(data, 'datos_preliminares', '')}
                    onChange={(v) => onChange('datos_preliminares', v)}
                    rows={2}
                    placeholder="Información preliminar del caso..."
                />
                <TextArea
                    label="Conclusiones"
                    value={get(data, 'conclusiones', '')}
                    onChange={(v) => onChange('conclusiones', v)}
                    rows={4}
                    placeholder="Conclusiones del protocolo..."
                    className="mt-3"
                />
            </div>
        </FormSection>
    )
}

// ============================================
// 1.1 PRENDAS
// ============================================

interface PrendasFormProps {
    data: Prenda[]
    onChange: (prendas: Prenda[]) => void
}

export function PrendasForm({ data = [], onChange }: PrendasFormProps) {
    return (
        <FormSection title="Prendas de Vestir" icon={<User size={18} />}>
            <div className="space-y-4">
                {data.map((prenda, index) => (
                    <div key={index} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            <TextField
                                label="Tipo"
                                value={prenda.tipo}
                                onChange={(v) => {
                                    const newData = [...data];
                                    newData[index] = { ...prenda, tipo: v };
                                    onChange(newData);
                                }}
                            />
                            <TextField
                                label="Color"
                                value={prenda.color}
                                onChange={(v) => {
                                    const newData = [...data];
                                    newData[index] = { ...prenda, color: v };
                                    onChange(newData);
                                }}
                            />
                            <TextField
                                label="Material"
                                value={prenda.material}
                                onChange={(v) => {
                                    const newData = [...data];
                                    newData[index] = { ...prenda, material: v };
                                    onChange(newData);
                                }}
                            />
                        </div>
                        <TextField
                            label="Descripción"
                            value={prenda.descripcion}
                            onChange={(v) => {
                                const newData = [...data];
                                newData[index] = { ...prenda, descripcion: v };
                                onChange(newData);
                            }}
                        />
                    </div>
                ))}
                {(!data || data.length === 0) && <p className="text-slate-500 italic">No se han registrado prendas.</p>}
            </div>
        </FormSection>
    )
}

// ============================================
// NEW: EXAMEN EXTERNO
// ============================================

interface ExamenExternoFormProps {
    data: Partial<ExamenExterno>
    onChange: (field: string, value: any) => void
}

export function ExamenExternoForm({ data, onChange }: ExamenExternoFormProps) {
    return (
        <FormSection title="Examen Externo (General)" icon={<User size={18} />}>
            <div className="grid grid-cols-2 gap-4">
                <TextArea
                    label="Piel"
                    value={get(data, 'piel', '')}
                    onChange={(v) => onChange('piel', v)}
                    rows={2}
                />
                <TextArea
                    label="Cabeza (General)"
                    value={get(data, 'cabeza', '')}
                    onChange={(v) => onChange('cabeza', v)}
                    rows={2}
                    placeholder="Cabello, ojos, nariz, boca, oídos..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-900/30 p-3 rounded border border-slate-800">
                    <h4 className="text-emerald-400 font-medium mb-2">Señas Particulares</h4>
                    <TextArea
                        label="Cicatrices"
                        value={get(data, 'cicatrices', '')}
                        onChange={(v) => onChange('cicatrices', v)}
                        rows={2}
                    />
                    <TextArea
                        label="Tatuajes"
                        value={get(data, 'tatuajes', '')}
                        onChange={(v) => onChange('tatuajes', v)}
                        rows={2}
                        className="mt-2"
                    />
                </div>

                <div className="space-y-2">
                    <TextArea
                        label="Cuello"
                        value={get(data, 'cuello', '')}
                        onChange={(v) => onChange('cuello', v)}
                        rows={1}
                    />
                    <TextArea
                        label="Tórax"
                        value={get(data, 'torax', '')}
                        onChange={(v) => onChange('torax', v)}
                        rows={1}
                    />
                    <TextArea
                        label="Abdomen"
                        value={get(data, 'abdomen', '')}
                        onChange={(v) => onChange('abdomen', v)}
                        rows={1}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <TextArea
                    label="Miembros Superiores"
                    value={get(data, 'miembros_superiores', '')}
                    onChange={(v) => onChange('miembros_superiores', v)}
                    rows={2}
                />
                <TextArea
                    label="Miembros Inferiores"
                    value={get(data, 'miembros_inferiores', '')}
                    onChange={(v) => onChange('miembros_inferiores', v)}
                    rows={2}
                />
            </div>
        </FormSection>
    )
}

// ============================================
// NEW: EXAMEN EXTERNO - CABEZA (Detallado)
// ============================================

interface ExamenExternoCabezaFormProps {
    data: Partial<ExamenExternoCabeza>
    onChange: (field: string, value: any) => void
}

export function ExamenExternoCabezaForm({ data, onChange }: ExamenExternoCabezaFormProps) {
    return (
        <FormSection title="Examen Externo - Cabeza" icon={<Brain size={18} />}>
            <div className="grid grid-cols-2 gap-4">
                <TextField
                    label="Perímetro Cefálico (cm)"
                    value={String(get(data, 'perimetro_cefalico', '') || '')}
                    onChange={(v) => onChange('perimetro_cefalico', parseFloat(v) || 0)}
                    type="number"
                />
                <SelectField
                    label="Forma"
                    value={get(data, 'forma', '')}
                    onChange={(v) => onChange('forma', v)}
                    options={[
                        { value: 'normocefalo', label: 'Normocéfalo' },
                        { value: 'dolicocefalo', label: 'Dolicocéfalo' },
                        { value: 'braquicefalo', label: 'Braquicéfalo' },
                        { value: 'turricefalo', label: 'Turricéfalo' }
                    ]}
                />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
                <SelectField
                    label="Cabello"
                    value={get(data, 'cabello', '')}
                    onChange={(v) => onChange('cabello', v)}
                    options={[
                        { value: 'lacio', label: 'Lacio' },
                        { value: 'ondulado', label: 'Ondulado' },
                        { value: 'rizado', label: 'Rizado' },
                        { value: 'calvicie', label: 'Calvicie' }
                    ]}
                />
                <TextField
                    label="Otro Color/Características"
                    value={get(data, 'otro_color_cabello', '')}
                    onChange={(v) => onChange('otro_color_cabello', v)}
                />
            </div>
            <PresenciaLesionesField
                label="Integridad / Lesiones"
                descripcion={get(data, 'caracteristicas', '')}
                presencia={get(data, 'presencia', 'si')}
                lesiones={get(data, 'lesiones', 'no')}
                onDescripcionChange={(v) => onChange('caracteristicas', v)}
                onPresenciaChange={(v) => onChange('presencia', v)}
                onLesionesChange={(v) => onChange('lesiones', v)}
            />
        </FormSection>
    )
}

// ============================================
// NEW: EXAMEN INTERNO - CUELLO
// ============================================

interface ExamenInternoCuelloFormProps {
    data: Partial<ExamenInternoCuello>
    onChange: (field: string, value: any) => void
}

export function ExamenInternoCuelloForm({ data, onChange }: ExamenInternoCuelloFormProps) {
    return (
        <FormSection title="Examen Interno - Cuello" icon={<Activity size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PresenciaLesionesField
                    label="Columna Cervical"
                    descripcion={get(data, 'columna_cervical.descripcion', '')}
                    presencia={get(data, 'columna_cervical.presencia', 'si')}
                    lesiones={get(data, 'columna_cervical.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('columna_cervical.descripcion', v)}
                    onPresenciaChange={(v) => onChange('columna_cervical.presencia', v)}
                    onLesionesChange={(v) => onChange('columna_cervical.lesiones', v)}
                />
                <PresenciaLesionesField
                    label="Faringe"
                    descripcion={get(data, 'faringe.descripcion', '')}
                    presencia={get(data, 'faringe.presencia', 'si')}
                    lesiones={get(data, 'faringe.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('faringe.descripcion', v)}
                    onPresenciaChange={(v) => onChange('faringe.presencia', v)}
                    onLesionesChange={(v) => onChange('faringe.lesiones', v)}
                />
                <PresenciaLesionesField
                    label="Esófago"
                    descripcion={get(data, 'esofago.descripcion', '')}
                    presencia={get(data, 'esofago.presencia', 'si')}
                    lesiones={get(data, 'esofago.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('esofago.descripcion', v)}
                    onPresenciaChange={(v) => onChange('esofago.presencia', v)}
                    onLesionesChange={(v) => onChange('esofago.lesiones', v)}
                />
                <PresenciaLesionesField
                    label="Laringe"
                    descripcion={get(data, 'laringe.descripcion', '')}
                    presencia={get(data, 'laringe.presencia', 'si')}
                    lesiones={get(data, 'laringe.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('laringe.descripcion', v)}
                    onPresenciaChange={(v) => onChange('laringe.presencia', v)}
                    onLesionesChange={(v) => onChange('laringe.lesiones', v)}
                />
                <PresenciaLesionesField
                    label="Glotis"
                    descripcion={get(data, 'glotis.descripcion', '')}
                    presencia={get(data, 'glotis.presencia', 'si')}
                    lesiones={get(data, 'glotis.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('glotis.descripcion', v)}
                    onPresenciaChange={(v) => onChange('glotis.presencia', v)}
                    onLesionesChange={(v) => onChange('glotis.lesiones', v)}
                />
                <PresenciaLesionesField
                    label="Epiglotis"
                    descripcion={get(data, 'epiglotis.descripcion', '')}
                    presencia={get(data, 'epiglotis.presencia', 'si')}
                    lesiones={get(data, 'epiglotis.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('epiglotis.descripcion', v)}
                    onPresenciaChange={(v) => onChange('epiglotis.presencia', v)}
                    onLesionesChange={(v) => onChange('epiglotis.lesiones', v)}
                />
                <PresenciaLesionesField
                    label="Hioides"
                    descripcion={get(data, 'hioides.descripcion', '')}
                    presencia={get(data, 'hioides.presencia', 'si')}
                    lesiones={get(data, 'hioides.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('hioides.descripcion', v)}
                    onPresenciaChange={(v) => onChange('hioides.presencia', v)}
                    onLesionesChange={(v) => onChange('hioides.lesiones', v)}
                />
                <PresenciaLesionesField
                    label="Tráquea"
                    descripcion={get(data, 'traquea.descripcion', '')}
                    presencia={get(data, 'traquea.presencia', 'si')}
                    lesiones={get(data, 'traquea.lesiones', 'no')}
                    onDescripcionChange={(v) => onChange('traquea.descripcion', v)}
                    onPresenciaChange={(v) => onChange('traquea.presencia', v)}
                    onLesionesChange={(v) => onChange('traquea.lesiones', v)}
                />
            </div>

            <div className="mt-4 border-t border-slate-700 pt-4">
                <h4 className="text-white font-medium mb-2">Tiroides</h4>
                <OrganWeightField
                    label="Tiroides (Peso/Medidas)"
                    peso={get(data, 'tiroides.peso', 0)}
                    medidas={get(data, 'tiroides.medidas', { largo: 0, ancho: 0, alto: 0 })}
                    descripcion={get(data, 'tiroides.descripcion', '')}
                    presencia={get(data, 'tiroides.presencia', 'si')}
                    lesiones={get(data, 'tiroides.lesiones', 'no')}
                    onPesoChange={(v) => onChange('tiroides.peso', v)}
                    onMedidasChange={(v) => onChange('tiroides.medidas', v)}
                    onDescripcionChange={(v) => onChange('tiroides.descripcion', v)}
                    onPresenciaChange={(v) => onChange('tiroides.presencia', v)}
                    onLesionesChange={(v) => onChange('tiroides.lesiones', v)}
                />
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <TextField
                        label="Color"
                        value={get(data, 'tiroides.color', '')}
                        onChange={(v) => onChange('tiroides.color', v)}
                    />
                    <TextField
                        label="Consistencia"
                        value={get(data, 'tiroides.consistencia', '')}
                        onChange={(v) => onChange('tiroides.consistencia', v)}
                    />
                    <TextField
                        label="Superficie"
                        value={get(data, 'tiroides.superficie', '')}
                        onChange={(v) => onChange('tiroides.superficie', v)}
                    />
                    <TextField
                        label="Alteraciones"
                        value={get(data, 'tiroides.alteraciones', '')}
                        onChange={(v) => onChange('tiroides.alteraciones', v)}
                    />
                </div>
            </div>

            <div className="mt-4">
                <TextArea
                    label="Vasos del Cuello"
                    value={get(data, 'vasos', '')}
                    onChange={(v) => onChange('vasos', v)}
                />
            </div>
        </FormSection>
    )
}

// ============================================
// NEW: APARATO GENITAL
// ============================================

interface AparatoGenitalFormProps {
    data: Partial<AparatoGenital>
    onChange: (field: string, value: any) => void
}

export function AparatoGenitalForm({ data, onChange }: AparatoGenitalFormProps) {
    // Helper simple para detectar sexo si viniera en props, pero por ahora mostramos ambos colapsables o tabs.
    // Asumiremos que se muestran ambos y el usuario llena el que corresponde.
    return (
        <FormSection title="Aparato Genital" icon={<User size={18} />}>

            {/* FEMENINO */}
            <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-3 mb-4">
                <h4 className="text-pink-400 font-bold mb-3">Femenino</h4>
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <SelectField
                        label="Presencia"
                        value={get(data, 'femenino.presencia', 'no')}
                        onChange={(v) => onChange('femenino.presencia', v)}
                        options={[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }]}
                    />
                </div>

                {(get(data, 'femenino.presencia', '') as string) === 'si' && (
                    <>
                        <OrganWeightField
                            label="Útero"
                            peso={get(data, 'femenino.utero.peso', 0)}
                            medidas={get(data, 'femenino.utero.medidas', { largo: 0, ancho: 0, alto: 0 })}
                            descripcion={get(data, 'femenino.utero.descripcion', '')}
                            presencia={get(data, 'femenino.utero.presencia', 'si')}
                            lesiones={get(data, 'femenino.utero.lesiones', 'no')}
                            onPesoChange={(v) => onChange('femenino.utero.peso', v)}
                            onMedidasChange={(v) => onChange('femenino.utero.medidas', v)}
                            onDescripcionChange={(v) => onChange('femenino.utero.descripcion', v)}
                            onPresenciaChange={(v) => onChange('femenino.utero.presencia', v)}
                            onLesionesChange={(v) => onChange('femenino.utero.lesiones', v)}
                        />

                        <div className="mt-3 bg-slate-800/50 p-3 rounded">
                            <h5 className="text-sm font-medium text-slate-300 mb-2">Cavidad Endometrial</h5>
                            <div className="grid grid-cols-2 gap-3">
                                <SelectField
                                    label="Ocupada"
                                    value={get(data, 'femenino.cavidad_endometrial.ocupada', 'no')}
                                    onChange={(v) => onChange('femenino.cavidad_endometrial.ocupada', v)}
                                    options={[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }, { value: 'ignora', label: 'Ignora' }]}
                                />
                                <TextField
                                    label="Semanas Gestación"
                                    value={String(get(data, 'femenino.cavidad_endometrial.semanas_gestacion', '') || '')}
                                    onChange={(v) => onChange('femenino.cavidad_endometrial.semanas_gestacion', parseFloat(v) || 0)}
                                    type="number"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <CheckboxGroup
                                    label="Contenido"
                                    options={[
                                        { value: 'placenta', label: 'Placenta' },
                                        { value: 'feto', label: 'Feto' },
                                        { value: 'otros', label: 'Otros' }
                                    ]}
                                    // Hack simple para checkbox group con booleans independientes
                                    selected={[
                                        get(data, 'femenino.cavidad_endometrial.placenta', false) ? 'placenta' : '',
                                        get(data, 'femenino.cavidad_endometrial.feto', false) ? 'feto' : '',
                                        get(data, 'femenino.cavidad_endometrial.otros', false) ? 'otros' : ''
                                    ].filter(Boolean)}
                                    onChange={(vals) => {
                                        onChange('femenino.cavidad_endometrial.placenta', vals.includes('placenta'));
                                        onChange('femenino.cavidad_endometrial.feto', vals.includes('feto'));
                                        onChange('femenino.cavidad_endometrial.otros', vals.includes('otros'));
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-3">
                            <h5 className="text-sm font-medium text-slate-300 mb-2">Anexos (Ovarios)</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <OrganWeightField
                                    label="Ovario Derecho"
                                    peso={get(data, 'femenino.anexos.derecho.peso', 0)}
                                    medidas={get(data, 'femenino.anexos.derecho.medidas', { largo: 0, ancho: 0, alto: 0 })}
                                    descripcion={get(data, 'femenino.anexos.derecho.descripcion', '')}
                                    presencia={get(data, 'femenino.anexos.derecho.presencia', 'si')}
                                    lesiones={get(data, 'femenino.anexos.derecho.lesiones', 'no')}
                                    onPesoChange={(v) => onChange('femenino.anexos.derecho.peso', v)}
                                    onMedidasChange={(v) => onChange('femenino.anexos.derecho.medidas', v)}
                                    onDescripcionChange={(v) => onChange('femenino.anexos.derecho.descripcion', v)}
                                    onPresenciaChange={(v) => onChange('femenino.anexos.derecho.presencia', v)}
                                    onLesionesChange={(v) => onChange('femenino.anexos.derecho.lesiones', v)}
                                />
                                <OrganWeightField
                                    label="Ovario Izquierdo"
                                    peso={get(data, 'femenino.anexos.izquierdo.peso', 0)}
                                    medidas={get(data, 'femenino.anexos.izquierdo.medidas', { largo: 0, ancho: 0, alto: 0 })}
                                    descripcion={get(data, 'femenino.anexos.izquierdo.descripcion', '')}
                                    presencia={get(data, 'femenino.anexos.izquierdo.presencia', 'si')}
                                    lesiones={get(data, 'femenino.anexos.izquierdo.lesiones', 'no')}
                                    onPesoChange={(v) => onChange('femenino.anexos.izquierdo.peso', v)}
                                    onMedidasChange={(v) => onChange('femenino.anexos.izquierdo.medidas', v)}
                                    onDescripcionChange={(v) => onChange('femenino.anexos.izquierdo.descripcion', v)}
                                    onPresenciaChange={(v) => onChange('femenino.anexos.izquierdo.presencia', v)}
                                    onLesionesChange={(v) => onChange('femenino.anexos.izquierdo.lesiones', v)}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* MASCULINO */}
            <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-3">
                <h4 className="text-blue-400 font-bold mb-3">Masculino</h4>
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <SelectField
                        label="Presencia"
                        value={get(data, 'masculino.presencia', 'no')}
                        onChange={(v) => onChange('masculino.presencia', v)}
                        options={[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }]}
                    />
                </div>
                {(get(data, 'masculino.presencia', '') as string) === 'si' && (
                    <div className="space-y-3">
                        <TextArea
                            label="Próstata (Descripción)"
                            value={get(data, 'masculino.prostata', '')}
                            onChange={(v) => onChange('masculino.prostata', v)}
                        />
                        <SelectField
                            label="Lesiones"
                            value={get(data, 'masculino.lesiones', 'no')}
                            onChange={(v) => onChange('masculino.lesiones', v)}
                            options={[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }, { value: 'ignora', label: 'Ignora' }]}
                        />
                    </div>
                )}
            </div>

        </FormSection>
    )
}

// ============================================
// NEW: LESIONES TRAUMÁTICAS (Descripción)
// ============================================

interface LesionesTraumaticasFormProps {
    data: Partial<LesionesTraumaticas>
    onChange: (field: string, value: any) => void
}

export function LesionesTraumaticasForm({ data, onChange }: LesionesTraumaticasFormProps) {
    return (
        <FormSection title="Lesiones Traumáticas" icon={<Activity size={18} />}>
            <TextArea
                label="Descripción Detallada (Lesiones Traumáticas Externas e Internas)"
                value={get(data, 'descripcion', '')}
                onChange={(v) => onChange('descripcion', v)}
                rows={6}
                placeholder="Describa detalle de lesiones traumáticas..."
            />
        </FormSection>
    )
}

// ============================================
// NEW: PERENNIZACIÓN y DATOS REFERENCIALES
// ============================================

interface PerennizacionFormProps {
    data: Partial<Perennizacion>
    onChange: (field: string, value: any) => void
}

export function PerennizacionForm({ data, onChange }: PerennizacionFormProps) {
    return (
        <FormSection title="Perennización de Evidencias" icon={<Camera size={18} />}>
            <div className="grid grid-cols-2 gap-4 mb-3">
                <SelectField
                    label="¿Se realizó perennización?"
                    value={get(data, 'se_realizo', 'no')}
                    onChange={(v) => onChange('se_realizo', v)}
                    options={[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }]}
                />
            </div>

            {(get(data, 'se_realizo', '') as string) === 'si' && (
                <>
                    <h5 className="text-sm font-medium text-slate-300 mb-2">Tipo de Medio</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                        <CheckboxGroup
                            label="Fotográfico"
                            options={[
                                { value: 'revelado', label: 'Foto Revelado' },
                                { value: 'digital', label: 'Digital' }
                            ]}
                            selected={[
                                get(data, 'tipo.fotografico_revelado', false) ? 'revelado' : '',
                                get(data, 'tipo.fotografico_digital', false) ? 'digital' : ''
                            ].filter(Boolean)}
                            onChange={(vals) => {
                                onChange('tipo.fotografico_revelado', vals.includes('revelado'));
                                onChange('tipo.fotografico_digital', vals.includes('digital'));
                            }}
                        />
                        <CheckboxGroup
                            label="Video"
                            options={[
                                { value: 'cinta', label: 'Cinta' },
                                { value: 'cd', label: 'Disco C.' },
                                { value: 'memoria', label: 'M. Digital' }
                            ]}
                            selected={[
                                get(data, 'tipo.video_cinta', false) ? 'cinta' : '',
                                get(data, 'tipo.video_disco_compacto', false) ? 'cd' : '',
                                get(data, 'tipo.video_memoria_digital', false) ? 'memoria' : ''
                            ].filter(Boolean)}
                            onChange={(vals) => {
                                onChange('tipo.video_cinta', vals.includes('cinta'));
                                onChange('tipo.video_disco_compacto', vals.includes('cd'));
                                onChange('tipo.video_memoria_digital', vals.includes('memoria'));
                            }}
                        />
                    </div>

                    <TextArea
                        label="Código de Vistas Tomadas"
                        value={get(data, 'codigo_vistas', '')}
                        onChange={(v) => onChange('codigo_vistas', v)}
                        rows={2}
                        className="mb-3"
                    />

                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <TextField label="Responsable (Nombre)" value={get(data, 'responsable.nombre', '')} onChange={(v) => onChange('responsable.nombre', v)} />
                        <TextField label="Apellido P." value={get(data, 'responsable.apellido_paterno', '')} onChange={(v) => onChange('responsable.apellido_paterno', v)} />
                        <TextField label="Apellido M." value={get(data, 'responsable.apellido_materno', '')} onChange={(v) => onChange('responsable.apellido_materno', v)} />
                    </div>

                    <div className="border-t border-slate-700 pt-3">
                        <div className="grid grid-cols-2 gap-4">
                            <SelectField label="Registro en Cuadernillo?" value={get(data, 'registro_cuadernillo', 'no')} onChange={(v) => onChange('registro_cuadernillo', v)} options={[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }]} />
                        </div>
                        <TextArea
                            label="Detalle del Registro"
                            value={get(data, 'detalle_registro', '')}
                            onChange={(v) => onChange('detalle_registro', v)}
                            className="mt-2"
                        />
                        <TextArea
                            label="Observaciones"
                            value={get(data, 'observaciones', '')}
                            onChange={(v) => onChange('observaciones', v)}
                            className="mt-2"
                        />
                    </div>
                </>
            )}
        </FormSection>
    )
}

interface DatosReferencialesFormProps {
    data: Partial<DatosReferenciales>
    onChange: (field: string, value: any) => void
}

export function DatosReferencialesForm({ data, onChange }: DatosReferencialesFormProps) {
    return (
        <FormSection title="Datos Referenciales y Destino" icon={<FileText size={18} />}>
            <TextArea
                label="Datos Referenciales (Narrativa)"
                value={get(data, 'datos_referenciales', '')}
                onChange={(v) => onChange('datos_referenciales', v)}
                rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <SelectField
                    label="Situación del Cadáver"
                    value={get(data, 'tipo_situacion_cadaver', '')}
                    onChange={(v) => onChange('tipo_situacion_cadaver', v)}
                    options={[
                        { value: 'identificado', label: 'Identificado' },
                        { value: 'nn', label: 'NN' },
                        { value: 'restos_oseos', label: 'Restos Óseos' }
                    ]}
                />

                <SelectField
                    label="Donación Órganos/Tejidos"
                    value={get(data, 'donacion_organos_tejidos', 'no')}
                    onChange={(v) => onChange('donacion_organos_tejidos', v)}
                    options={[{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }]}
                />
            </div>
            <TextArea
                label="Detalle Donación"
                value={get(data, 'detalle_donacion', '')}
                onChange={(v) => onChange('detalle_donacion', v)}
                className="mt-2"
            />

            <div className="flex items-center gap-2 mt-3 bg-slate-900/30 p-3 rounded">
                <CheckboxGroup
                    label=""
                    options={[{ value: 'si', label: 'Donado a Institución Educativa' }]}
                    selected={get(data, 'donado_institucion_educativa', false) ? ['si'] : []}
                    onChange={(v) => onChange('donado_institucion_educativa', v.includes('si'))}
                />
                <div className="flex-1">
                    <TextField
                        label="Nombre Institución"
                        value={get(data, 'institucion', '')}
                        onChange={(v) => onChange('institucion', v)}
                    />
                </div>
            </div>
        </FormSection>
    )
}

// ============================================
// NEW: ÓRGANOS ADICIONALES
// ============================================

interface OrganosAdicionalesFormProps {
    data: Partial<OrganosAdicionales>
    onChange: (field: string, value: any) => void
}

export function OrganosAdicionalesForm({ data, onChange }: OrganosAdicionalesFormProps) {
    return (
        <FormSection title="Órganos Adicionales" icon={<Activity size={18} />}>
            <div className="flex gap-6 mb-3">
                <CheckboxGroup
                    label=""
                    options={[{ value: 'placenta', label: 'Placenta' }]}
                    selected={get(data, 'placenta', false) ? ['placenta'] : []}
                    onChange={(v) => onChange('placenta', v.includes('placenta'))}
                />
                <CheckboxGroup
                    label=""
                    options={[{ value: 'cordon', label: 'Cordón Umbilical' }]}
                    selected={get(data, 'cordon_umbilical', false) ? ['cordon'] : []}
                    onChange={(v) => onChange('cordon_umbilical', v.includes('cordon'))}
                />
            </div>
            <TextArea
                label="Características"
                value={get(data, 'caracteristicas', '')}
                onChange={(v) => onChange('caracteristicas', v)}
                rows={3}
            />
        </FormSection>
    )
}
