/**
 * ForensIA v2.0 - Modelo de Datos Completo
 * Basado en el Sistema de Gestión Forense IMLCF Perú
 */

// ============================================
// TIPOS BASE
// ============================================

export type SiNo = 'si' | 'no';
export type SiNoIgnora = 'si' | 'no' | 'ignora';
export type Sexo = 'M' | 'F';

export interface Medidas3D {
    largo: number;  // cm
    ancho: number;  // cm
    alto: number;   // cm
}

export interface PresenciaLesiones {
    presencia: SiNo;
    lesiones: SiNoIgnora;
}

export interface OrganoConPeso extends PresenciaLesiones {
    peso: number;           // gramos
    medidas: Medidas3D;     // cm
    descripcion: string;
    caracteristicas?: string;
}

// ============================================
// 1. DATOS GENERALES
// ============================================

export interface Direccion {
    calle: string;
    numero: string;
    interior?: string;
    manzana?: string;
    lote?: string;
    urbanizacion?: string;
}

export interface DatosFallecido {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    sexo: Sexo;
    edad: number;
    talla?: number;  // metros
    peso?: number;   // kg
    raza: string;
    nacionalidad: string;
    religion: string;
    religion_otra?: string;
    estado_civil: string;
    ocupacion: string;
    profesion: string;
}

export interface Informante {
    nombre: string;
    parentesco: string;
}

export interface Prenda {
    tipo: string;
    color: string;
    material: string;
    descripcion: string;
}

export interface Objeto {
    tipo: string;
    color: string;
    estado: string;
    descripcion: string;
}

export interface DatosGenerales {
    numero_informe: string;
    fecha_informe: string;  // ISO date

    fallecido: DatosFallecido;

    lugar_fallecimiento: string;
    lugar_hecho: string;
    lugar_residencia: string;
    direccion: Direccion;

    informante: Informante;

    cm_medico_primero: string;
    cm_medico_segundo: string;
    autoridades_presentes: string;
    tipo_autoridad: string;
    tecnico_apoyo: string;
    otras_autoridades: string;

    hora_inicio_necropsia: string;
    hora_termino_necropsia: string;

    prendas: Prenda[];
    objetos: Objeto[];
    circunstancias_muerte?: string;
}

// ============================================
// NEW SECTION: EXAMEN EXTERNO (General)
// ============================================

export interface ExamenExterno {
    piel: string;
    cicatrices: string;
    tatuajes: string;
    cabeza: string;      // General ext. description
    cuello: string;      // General ext. description
    torax: string;       // General ext. description
    abdomen: string;     // General ext. description
    miembros_superiores: string;
    miembros_inferiores: string;
    genitales_externos: string;
    observaciones: string;
    descripcion_general?: string;
}

// ============================================
// 2. FENÓMENOS CADAVÉRICOS
// ============================================

export type UbicacionLividez = 'dorsales' | 'ventrales' | 'lateral_derecho' | 'lateral_izquierdo' | 'en_pantalon';
export type EstadoLividez = 'modificable' | 'poco_modificable' | 'no_modificable';
export type UbicacionRigidez = 'mandibula' | 'cuello' | 'miembros_superiores' | 'miembros_inferiores';
export type EstadoRigidez = 'instalado' | 'parcial' | 'flacida';

export interface FenomenosOculares {
    pupilas: string;
    corneas: string;
    tension_ocular: string;
    observaciones: string;
}

export interface Livideces {
    ubicacion: UbicacionLividez[];
    estado: EstadoLividez;
    observaciones: string;
}

export interface Putrefaccion {
    fase: string;
    observaciones: string;
}

export interface Rigidez {
    ubicacion: UbicacionRigidez[];
    estado: EstadoRigidez;
    observaciones: string;
}

export interface Temperaturas {
    ambiental: number;  // °C
    rectal: number;     // °C
    hepatica: number;   // °C
}

export interface FenomenosCadavericos {
    oculares: FenomenosOculares;
    livideces: Livideces;
    putrefaccion: Putrefaccion;
    flora_fauna: string;
    rigidez: Rigidez;
    temperatura: Temperaturas;
    tiempo_muerte_horas: string;  // Rango aproximado
}

// ============================================
// 3. EXAMEN EXTERNO - CABEZA
// ============================================

export interface ExamenExternoCabeza extends PresenciaLesiones {
    perimetro_cefalico: number;  // cm
    forma: string;
    cabello: string;
    otro_color_cabello?: string;
    caracteristicas: string;
}

// ============================================
// 4. EXAMEN INTERNO - CABEZA
// ============================================

export interface EstructuraCraneal extends PresenciaLesiones {
    descripcion: string;
}

export interface Encefalo extends OrganoConPeso {
    // Hereda peso, medidas, descripcion, presencia, lesiones
}

export interface ExamenInternoCabeza {
    boveda: EstructuraCraneal;
    cuero_cabelludo_interno: EstructuraCraneal;
    base_craneo: EstructuraCraneal;
    meninges_duramadre_aracnoide: string;
    encefalo: Encefalo;
    vasos: string;
    macizo_facial: PresenciaLesiones;
}

// ============================================
// 5. EXAMEN INTERNO - CUELLO
// ============================================

export interface Tiroides extends OrganoConPeso {
    color: string;
    consistencia: string;
    superficie: string;
    simetria: string;
    alteraciones: string;
}

export interface ExamenInternoCuello {
    columna_cervical: EstructuraCraneal;
    faringe: EstructuraCraneal;
    esofago: EstructuraCraneal;
    laringe: EstructuraCraneal;
    glotis: EstructuraCraneal;
    epiglotis: EstructuraCraneal;
    hioides: EstructuraCraneal;
    traquea: EstructuraCraneal;
    tiroides: Tiroides;
    vasos: string;
}

// ============================================
// 6. EXAMEN INTERNO - TÓRAX
// ============================================

export interface Valvulas {
    aortica_mm: number;
    mitral_mm: number;
    tricuspide_mm: number;
    pulmonar_mm: number;
    caracteristicas: string;
}

export interface ParedesVentriculares {
    derecha_mm: number;
    izquierda_mm: number;
    observaciones: string;
}

export interface Corazon extends OrganoConPeso {
    valvulas: Valvulas;
    paredes_ventriculares: ParedesVentriculares;
    arteria_aorta_pulmonar: string;
    arterias_coronarias: string;
}

export interface Pulmones {
    derecho: OrganoConPeso;
    izquierdo: OrganoConPeso;
    caracteristicas: string;
}

export interface ExamenInternoTorax {
    columna_dorsal_parrilla_costal: EstructuraCraneal;
    pleuras_cavidades: string;  // Adherencias/Contenido/Alteraciones
    mediastino: string;
    timo: OrganoConPeso;
    pulmones: Pulmones;
    pericardio: EstructuraCraneal;
    corazon: Corazon;
    pulmones_descripcion?: string;
}

// ============================================
// 7. EXAMEN INTERNO - ABDOMEN/PELVIS
// ============================================

export interface CavidadPeritoneal {
    estado: 'libre' | 'contenido';
    contenido: string;
    volumen_cm3: number;
}

export interface Estomago extends PresenciaLesiones {
    descripcion: string;
    contiene: string;
}

export interface VesiculaBiliar {
    descripcion: string;  // Distensión/Serosa/Mucosa/Alteraciones
    litiasis: boolean;
}

export interface Rinones {
    derecho: OrganoConPeso;
    izquierdo: OrganoConPeso;
    caracteristicas: string;
}

export interface ExamenInternoAbdomen {
    columna_lumbosacra_pelvis: EstructuraCraneal;
    pared_peritoneal: EstructuraCraneal;
    cavidad_peritoneal: CavidadPeritoneal;
    diafragma: EstructuraCraneal;
    epiplones: EstructuraCraneal;
    mesenterio: EstructuraCraneal;
    estomago: Estomago;
    intestino_delgado: EstructuraCraneal;
    intestino_grueso: EstructuraCraneal;
    apendice: string;
    higado: OrganoConPeso;
    vesicula_biliar: VesiculaBiliar;
    bazo: OrganoConPeso;
    pancreas: OrganoConPeso;
    rinones: Rinones;
    suprarrenales: string;
    vias_excrecion_renal: EstructuraCraneal;
    vasos: EstructuraCraneal;
}

// ============================================
// 8. APARATO GENITAL
// ============================================

export interface CavidadEndometrial {
    ocupada: SiNoIgnora;
    placenta: boolean;
    feto: boolean;
    semanas_gestacion?: number;
    otros: boolean;
    caracteristicas: string;
}

export interface Ovarios {
    presencia: SiNo;
    derecho: OrganoConPeso;
    izquierdo: OrganoConPeso;
    caracteristicas: string;
}

export interface AparatoGenitalFemenino {
    presencia: SiNo;
    utero: OrganoConPeso;
    cavidad_endometrial: CavidadEndometrial;
    anexos: Ovarios;
}

export interface AparatoGenitalMasculino {
    presencia: SiNo;
    prostata: string;
    lesiones: SiNoIgnora;
}

export interface AparatoGenital {
    femenino?: AparatoGenitalFemenino;
    masculino?: AparatoGenitalMasculino;
}

// ============================================
// 9. LESIONES TRAUMÁTICAS
// ============================================

export interface LesionesTraumaticas {
    descripcion: string;  // Texto narrativo de lesiones externas e internas
}

// ============================================
// 10. PERENNIZACIÓN
// ============================================

export interface TipoPerennizacion {
    fotografico_revelado: boolean;
    fotografico_digital: boolean;
    video_cinta: boolean;
    video_disco_compacto: boolean;
    video_memoria_digital: boolean;
}

export interface ResponsableImagen {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
}

export interface Perennizacion {
    se_realizo: SiNo;
    tipo: TipoPerennizacion;
    codigo_vistas: string;
    responsable: ResponsableImagen;
    registro_cuadernillo: SiNo;
    detalle_registro: string;
    observaciones: string;
}

// ============================================
// 11. DATOS REFERENCIALES
// ============================================

export interface DatosReferenciales {
    datos_referenciales: string;  // Área de texto libre
    tipo_situacion_cadaver: string;
    donacion_organos_tejidos: string;
    detalle_donacion: string;
    donado_institucion_educativa: boolean;
    institucion: string;
}

// ============================================
// 12. CAUSA(S) DE MUERTE
// ============================================

export interface CausaMuerte {
    texto: string;
    cie10: string;
}

export interface EtiologiaMedicoLegal {
    forma: string;
    agente: string;
    tipo_agente: string;
}

export interface DiagnosticoMuerte {
    activo: boolean;
    causa_final: CausaMuerte;
    causa_intermedia: CausaMuerte;
    causa_basica: CausaMuerte;
    agente_causante: string;
    etiologia: EtiologiaMedicoLegal;
}

export interface CausasDeMuerte {
    diagnostico_presuntivo: DiagnosticoMuerte;
    diagnostico_integrado: DiagnosticoMuerte;
    datos_preliminares: string;
    conclusiones: string;
    fecha_cierre_presuntivo: string;
    fecha_cierre_integrado: string;
}

// ============================================
// 13. ÓRGANOS ADICIONALES
// ============================================

export interface OrganosAdicionales {
    placenta: boolean;
    cordon_umbilical: boolean;
    caracteristicas: string;
}

// ============================================
// PROTOCOLO COMPLETO
// ============================================

export interface ProtocoloNecropsia {
    id: string;
    created_at: string;
    updated_at: string;
    status: 'borrador' | 'en_proceso' | 'completado' | 'firmado';

    // v2.0 Sections
    datos_generales: DatosGenerales;
    fenomenos_cadavericos: FenomenosCadavericos;
    examen_externo: ExamenExterno;
    examen_externo_cabeza: ExamenExternoCabeza;
    examen_interno_cabeza: ExamenInternoCabeza;
    examen_interno_cuello: ExamenInternoCuello;
    examen_interno_torax: ExamenInternoTorax;
    examen_interno_abdomen: ExamenInternoAbdomen;
    aparato_genital: AparatoGenital;
    lesiones_traumaticas: LesionesTraumaticas;
    perennizacion: Perennizacion;
    datos_referenciales: DatosReferenciales;
    causas_muerte: CausasDeMuerte;
    organos_adicionales: OrganosAdicionales;

    // Legacy v1 fields (for backwards compatibility)
    protocol_number?: string;
    datos_administrativos?: Record<string, any>;
    // examen_externo?: Record<string, any>; // REMOVING TO AVOID DUPLICATE
    examen_interno?: Record<string, any>;
    conclusiones?: Record<string, any>;
}

// ============================================
// VALORES POR DEFECTO
// ============================================

export const defaultOrganoConPeso: OrganoConPeso = {
    peso: 0,
    medidas: { largo: 0, ancho: 0, alto: 0 },
    descripcion: '',
    presencia: 'si',
    lesiones: 'no'
};

export const defaultPresenciaLesiones: PresenciaLesiones = {
    presencia: 'si',
    lesiones: 'no'
};

export const defaultEstructuraCraneal: EstructuraCraneal = {
    descripcion: '',
    presencia: 'si',
    lesiones: 'no'
};
