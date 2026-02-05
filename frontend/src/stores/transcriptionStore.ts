import { create } from 'zustand'

interface TranscriptionState {
    transcript: string
    partialText: string
    isRecording: boolean
    isPaused: boolean
    isProcessing: boolean
    duration: number
    mode: 'azure' | 'edge'
    error: string | null
    mediaRecorder: MediaRecorder | null
    audioChunks: Blob[]

    startRecording: () => void
    stopRecording: () => void
    pauseRecording: () => void
    resumeRecording: () => void
    appendText: (text: string) => void
    clearTranscript: () => void
}

export const useTranscriptionStore = create<TranscriptionState>((set, get) => ({
    transcript: '',
    partialText: '',
    isRecording: false,
    isPaused: false,
    isProcessing: false,
    duration: 0,
    mode: 'azure',
    error: null,
    mediaRecorder: null,
    audioChunks: [],

    startRecording: async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            // Preferir webm con opus codec
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm'

            const mediaRecorder = new MediaRecorder(stream, { mimeType })
            const audioChunks: Blob[] = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data)
                    console.log(`📦 Chunk recibido: ${(event.data.size / 1024).toFixed(1)} KB`)
                }
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: mimeType })
                const sizeMB = (audioBlob.size / (1024 * 1024)).toFixed(2)
                console.log(`🎤 Audio total: ${sizeMB} MB`)

                // Verificar tamaño máximo (50MB límite)
                if (audioBlob.size > 50 * 1024 * 1024) {
                    set({
                        error: `Audio muy grande (${sizeMB} MB). Máximo: 50 MB.`,
                        isProcessing: false
                    })
                    stream.getTracks().forEach(track => track.stop())
                    return
                }

                set({ isProcessing: true, error: null })

                // Enviar al backend
                const formData = new FormData()
                formData.append('file', audioBlob, 'recording.webm')

                try {
                    console.log('📤 Enviando audio al backend...')

                    const controller = new AbortController()
                    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 min timeout

                    const response = await fetch('/api/transcription/transcribe', {
                        method: 'POST',
                        body: formData,
                        signal: controller.signal
                    })

                    clearTimeout(timeoutId)

                    if (!response.ok) {
                        const errorText = await response.text()
                        throw new Error(`Error en transcripción: ${errorText}`)
                    }

                    const data = await response.json()
                    console.log(`✅ Transcripción recibida: ${data.text?.length || 0} caracteres`)

                    set((state) => ({
                        transcript: state.transcript ? state.transcript + '\n' + data.text : data.text,
                        partialText: '',
                        isProcessing: false
                    }))

                } catch (err: any) {
                    console.error('❌ Error de transcripción:', err)

                    let errorMsg = 'Error al procesar audio'
                    if (err.name === 'AbortError') {
                        errorMsg = 'Timeout: El audio es muy largo. Intenta grabaciones más cortas.'
                    } else if (err.message) {
                        errorMsg = err.message
                    }

                    set({ error: errorMsg, isProcessing: false })
                }

                // Limpiar tracks
                stream.getTracks().forEach(track => track.stop())
            }

            // Start con timeslice de 10 segundos para procesar chunks periódicamente
            mediaRecorder.start(10000)
            set({ isRecording: true, isPaused: false, error: null, mediaRecorder, duration: 0 })
            console.log('🔴 Grabación iniciada')

            // Duration timer
            const timer = setInterval(() => {
                const state = get()
                if (state.isRecording && !state.isPaused) {
                    set({ duration: state.duration + 1 })
                } else {
                    clearInterval(timer)
                }
            }, 1000)

        } catch (err: any) {
            console.error('Error accediendo al micrófono:', err)
            set({ error: 'No se pudo acceder al micrófono. Verifique permisos.' })
        }
    },

    stopRecording: () => {
        const recorder = get().mediaRecorder
        if (recorder && recorder.state !== 'inactive') {
            console.log('⏹️ Deteniendo grabación...')
            recorder.stop()
        }
        set({ isRecording: false, isPaused: false, mediaRecorder: null })
    },

    pauseRecording: () => {
        const recorder = get().mediaRecorder
        if (recorder && recorder.state === 'recording') {
            recorder.pause()
            set({ isPaused: true })
        }
    },

    resumeRecording: () => {
        const recorder = get().mediaRecorder
        if (recorder && recorder.state === 'paused') {
            recorder.resume()
            set({ isPaused: false })
        }
    },

    appendText: (text: string) => {
        const current = get().transcript
        set({ transcript: current ? current + '\n' + text : text })
    },

    clearTranscript: () => {
        set({ transcript: '', partialText: '', duration: 0, error: null })
    },
}))
