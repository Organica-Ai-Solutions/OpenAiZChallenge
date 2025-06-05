"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

interface UseAnimatedTextOptions {
  delimiter?: string;
  speed?: 'instant' | 'fast' | 'normal' | 'slow' | 'very-slow';
  enabled?: boolean;
}

export function useAnimatedText(
  text: string, 
  options: UseAnimatedTextOptions = {}
) {
  const { 
    delimiter = "", 
    speed = 'normal', 
    enabled = true 
  } = options;

  const [cursor, setCursor] = useState(0);
  const [startingCursor, setStartingCursor] = useState(0);
  const [prevText, setPrevText] = useState(text);

  // If animation is disabled, return full text immediately
  if (!enabled || speed === 'instant') {
    return text;
  }

  if (prevText !== text) {
    setPrevText(text);
    setStartingCursor(text.startsWith(prevText) ? cursor : 0);
  }

  useEffect(() => {
    const parts = text.split(delimiter);
    
    // Speed configurations for different animation types
    const getAnimationDuration = () => {
      const baseSpeed = {
        'fast': 0.8,
        'normal': 1.5,
        'slow': 2.5,
        'very-slow': 4.0
      }[speed] || 1.5;

      // Adjust based on delimiter type
      if (delimiter === "") {
        // Character by character (slowest)
        return baseSpeed * 1.5;
      } else if (delimiter === " ") {
        // Word by word (medium)
        return baseSpeed * 0.8;
      } else {
        // Chunk by chunk (fastest)
        return baseSpeed * 0.5;
      }
    };

    const duration = getAnimationDuration();
    
    const controls = animate(startingCursor, parts.length, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setCursor(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [startingCursor, text, delimiter, speed]);

  return text.split(delimiter).slice(0, cursor).join(delimiter);
}

// Hook specifically for AI responses with natural streaming
export function useAIResponseAnimation(text: string, isStreaming: boolean = true) {
  return useAnimatedText(text, {
    delimiter: " ", // Word by word for natural flow
    speed: 'slow', // Slower for better readability
    enabled: isStreaming
  });
}

// Hook for user messages (instant)
export function useUserMessageAnimation(text: string) {
  return useAnimatedText(text, {
    speed: 'instant',
    enabled: false
  });
} 