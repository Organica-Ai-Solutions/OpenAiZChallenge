"use client"

import { useCallback } from "react"

interface AudioEffectsHook {
  playNotification: () => void
  playSuccess: () => void
  playError: () => void
  playClick: () => void
  playMessage: () => void
}

export function useAudioEffects(enabled: boolean = true): AudioEffectsHook {
  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled) return
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = type
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (error) {
      console.log('Audio not supported')
    }
  }, [enabled])

  const playNotification = useCallback(() => {
    playSound(800, 0.2, 'sine')
    setTimeout(() => playSound(600, 0.2, 'sine'), 100)
  }, [playSound])

  const playSuccess = useCallback(() => {
    playSound(523, 0.15, 'sine') // C
    setTimeout(() => playSound(659, 0.15, 'sine'), 100) // E
    setTimeout(() => playSound(784, 0.25, 'sine'), 200) // G
  }, [playSound])

  const playError = useCallback(() => {
    playSound(300, 0.5, 'sawtooth')
  }, [playSound])

  const playClick = useCallback(() => {
    playSound(1000, 0.1, 'square')
  }, [playSound])

  const playMessage = useCallback(() => {
    playSound(440, 0.1, 'sine')
  }, [playSound])

  return {
    playNotification,
    playSuccess,
    playError,
    playClick,
    playMessage
  }
} 