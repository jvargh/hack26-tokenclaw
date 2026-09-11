import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Voices are ranked by how well they suit a narrated product walkthrough:
 * clear, unhurried, and non-robotic. First match wins.
 */
const preferredVoices = [
  'Microsoft Ryan Online',
  'Microsoft Guy Online',
  'Microsoft Aria Online',
  'Google UK English Male',
  'Google UK English Female',
  'Daniel',
  'Samantha',
  'Google US English',
  'Microsoft David',
  'Microsoft Mark',
  'Microsoft Zira',
]

export interface Narrator {
  supported: boolean
  ready: boolean
  speaking: boolean
  caption: string
  voiceName: string
  speak: (text: string, onDone: () => void) => void
  cancel: () => void
}

export function useNarrator(rate = 0.97): Narrator {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [ready, setReady] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [caption, setCaption] = useState('')
  const [voiceName, setVoiceName] = useState('')

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const doneRef = useRef<(() => void) | null>(null)
  const fallbackRef = useRef<number | null>(null)
  const keepAliveRef = useRef<number | null>(null)

  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis

    const pickVoice = () => {
      const voices = synth.getVoices()
      if (voices.length === 0) return
      const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'))
      const pool = english.length > 0 ? english : voices
      const chosen =
        preferredVoices
          .map((name) => pool.find((voice) => voice.name.includes(name)))
          .find(Boolean) ?? pool[0]
      voiceRef.current = chosen ?? null
      setVoiceName(chosen?.name ?? '')
      setReady(true)
    }

    pickVoice()
    synth.addEventListener('voiceschanged', pickVoice)
    return () => synth.removeEventListener('voiceschanged', pickVoice)
  }, [supported])

  const clearTimers = useCallback(() => {
    if (fallbackRef.current !== null) {
      window.clearTimeout(fallbackRef.current)
      fallbackRef.current = null
    }
    if (keepAliveRef.current !== null) {
      window.clearInterval(keepAliveRef.current)
      keepAliveRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    clearTimers()
    doneRef.current = null
    setSpeaking(false)
    setCaption('')
    if (supported) window.speechSynthesis.cancel()
  }, [clearTimers, supported])

  const speak = useCallback(
    (text: string, onDone: () => void) => {
      if (!supported) {
        onDone()
        return
      }
      const synth = window.speechSynthesis
      clearTimers()
      synth.cancel()

      // Guarantee the completion callback fires exactly once, whether it arrives
      // from `onend`, `onerror`, or the duration fallback.
      let settled = false
      const settle = () => {
        if (settled) return
        settled = true
        clearTimers()
        doneRef.current = null
        setSpeaking(false)
        onDone()
      }
      doneRef.current = settle

      const utterance = new SpeechSynthesisUtterance(text)
      if (voiceRef.current) utterance.voice = voiceRef.current
      utterance.rate = rate
      utterance.pitch = 1
      utterance.volume = 1
      utterance.onend = settle
      utterance.onerror = settle

      setCaption(text)
      setSpeaking(true)

      // Some engines never fire `onend`. Estimate the spoken duration from word
      // count and settle anyway so the demo can never stall on a silent failure.
      const words = text.trim().split(/\s+/).length
      const estimatedMs = (words / (2.45 * rate)) * 1000 + 2600
      fallbackRef.current = window.setTimeout(settle, estimatedMs)

      // Chrome silently stops long utterances after roughly 15 seconds unless the
      // queue is nudged. Pausing and immediately resuming keeps it alive.
      keepAliveRef.current = window.setInterval(() => {
        if (!synth.speaking) return
        synth.pause()
        synth.resume()
      }, 9000)

      synth.speak(utterance)
    },
    [clearTimers, rate, supported],
  )

  useEffect(() => cancel, [cancel])

  return { supported, ready, speaking, caption, voiceName, speak, cancel }
}
