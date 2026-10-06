/**
 * Speech helper. Uses the Web Speech API when available so prompts can be
 * read aloud for pre-readers. Fails silently — audio is an enhancement,
 * never a requirement.
 */

let cachedVoice: SpeechSynthesisVoice | null = null

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  if (cachedVoice) return cachedVoice

  const voices = window.speechSynthesis.getVoices()
  cachedVoice =
    voices.find((v) => v.lang === 'ms-MY') ??
    voices.find((v) => v.lang.startsWith('ms')) ??
    voices.find((v) => v.lang === 'en-MY') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  return cachedVoice
}

export function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voice = pickVoice()
    if (voice) utterance.voice = voice
    utterance.rate = 0.9
    utterance.pitch = 1.1
    window.speechSynthesis.speak(utterance)
  } catch {
    // Audio is optional; ignore failures.
  }
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
}
