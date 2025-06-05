"use client";

import React from "react";
import { useAnimatedText, useAIResponseAnimation, useUserMessageAnimation } from "./animated-text";
import { cn } from "../../lib/utils";

interface AnimatedMessageProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
  delay?: number;
  role?: 'user' | 'assistant' | 'agent' | 'system';
}

// Function to parse and format markdown-like text with emoticons
function formatMessage(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  let keyIndex = 0;

  // Enhanced emoji mapping for archaeological context
  const emojiMap: Record<string, string> = {
    // Existing emojis
    '🏛️': '🏛️', '📍': '📍', '🎯': '🎯', '📅': '📅', '🌿': '🌿',
    '🔬': '🔬', '👁️': '👁️', '🛰️': '🛰️', '🔍': '🔍', '📊': '📊',
    '🤖': '🤖', '💡': '💡', '🌍': '🌍', '📚': '📚', '⚙️': '⚙️',
    '🚀': '🚀', '✅': '✅', '❌': '❌', '⚠️': '⚠️', '🟢': '🟢', '🔴': '🔴',
    '⏱️': '⏱️', '🆔': '🆔', '📋': '📋',
    
    // Additional archaeological emojis
    '⛏️': '⛏️', '🪨': '🪨', '🗿': '🗿', '🏺': '🏺', '📜': '📜',
    '🔥': '🔥', '⚡': '⚡', '💎': '💎', '🌟': '🌟', '🔱': '🔱',
    '🏹': '🏹', '🛡️': '🛡️', '⚔️': '⚔️', '👑': '👑', '🏰': '🏰',
    
    // Status and analysis emojis
    '📈': '📈', '📉': '📉', '📌': '📌', '🎲': '🎲', '🎨': '🎨',
    '🔧': '🔧', '⚗️': '⚗️', '🧭': '🧭', '🗺️': '🗺️', '📡': '📡'
  };

  // Regex patterns for formatting
  const patterns = [
    // Bold text **text**
    { regex: /\*\*(.*?)\*\*/g, format: (match: string, text: string) => 
      <strong key={`bold-${keyIndex++}`} className="font-bold text-emerald-300">{text}</strong> 
    },
    // Italic text *text*
    { regex: /\*(.*?)\*/g, format: (match: string, text: string) => 
      <em key={`italic-${keyIndex++}`} className="italic text-blue-300">{text}</em> 
    },
    // Code text `text`
    { regex: /`([^`]+)`/g, format: (match: string, text: string) => 
      <code key={`code-${keyIndex++}`} className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded text-sm font-mono border border-slate-600">{text}</code> 
    },
    // Headers ### text
    { regex: /^### (.*$)/gm, format: (match: string, text: string) => 
      <h3 key={`h3-${keyIndex++}`} className="text-lg font-bold text-emerald-300 mt-4 mb-2">{text}</h3> 
    },
    // Headers ## text
    { regex: /^## (.*$)/gm, format: (match: string, text: string) => 
      <h2 key={`h2-${keyIndex++}`} className="text-xl font-bold text-emerald-300 mt-4 mb-2">{text}</h2> 
    },
    // Coordinates pattern
    { regex: /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/g, format: (match: string) => 
      <span key={`coords-${keyIndex++}`} className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded-md font-mono text-sm border border-blue-700/50">{match}</span> 
    },
    // Percentage pattern
    { regex: /(\d+(?:\.\d+)?%)/g, format: (match: string) => 
      <span key={`percent-${keyIndex++}`} className="bg-emerald-900/40 text-emerald-300 px-1.5 py-0.5 rounded font-semibold">{match}</span> 
    },
    // Image URLs
    { regex: /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s]*)?)/gi, format: (match: string) => 
      <div key={`image-${keyIndex++}`} className="my-3">
        <img 
          src={match} 
          alt="Image" 
          className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-slate-600/30" 
          onClick={() => window.open(match, '_blank')}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            // Fallback to link display
            const link = document.createElement('a');
            link.href = match;
            link.textContent = match;
            link.className = "text-blue-400 hover:text-blue-300 underline";
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            target.parentNode?.replaceChild(link, target);
          }}
        />
      </div>
    },
    // URLs/Links (non-images)
    { regex: /(https?:\/\/[^\s]+\.(?!jpg|jpeg|png|gif|webp|svg)[^\s]*)/gi, format: (match: string) => 
      <a key={`link-${keyIndex++}`} href={match} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">{match}</a> 
    },
    // Base64 Images
    { regex: /(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)/g, format: (match: string) => 
      <div key={`base64-image-${keyIndex++}`} className="my-3">
        <img 
          src={match} 
          alt="Uploaded Image" 
          className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-slate-600/30" 
          onClick={() => {
            const newWindow = window.open();
            if (newWindow) {
              newWindow.document.write(`<img src="${match}" style="max-width: 100%; max-height: 100vh; object-fit: contain;" />`);
            }
          }}
        />
      </div>
    }
  ];

  // Split text by lines to preserve formatting
  const lines = text.split('\n');
  
  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      parts.push(<br key={`br-${keyIndex++}`} />);
    }

    let remainingText = line;
    let lineKey = 0;

    // Process each formatting pattern
    patterns.forEach(pattern => {
      const newParts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = pattern.regex.exec(remainingText)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          const beforeText = remainingText.slice(lastIndex, match.index);
          if (beforeText) {
            newParts.push(beforeText);
          }
        }

        // Add formatted match - handle different numbers of capturing groups
        if (match.length >= 3) {
          // For patterns with 2 capturing groups (like coordinates)
          newParts.push(pattern.format(match[0], match[1] || ''));
        } else {
          // For patterns with 1 capturing group or just the full match
          newParts.push(pattern.format(match[0], match[1] || ''));
        }
        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < remainingText.length) {
        newParts.push(remainingText.slice(lastIndex));
      }

      // If we found matches, update remainingText
      if (newParts.length > 0) {
        remainingText = '';
        newParts.forEach(part => {
          if (typeof part === 'string') {
            remainingText += part;
          } else {
            parts.push(part);
          }
        });
      }
      
      // Reset regex
      pattern.regex.lastIndex = 0;
    });

    // If no patterns matched, add the line as is
    if (remainingText === line) {
      // Process emojis in the remaining text
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      let emojiMatch;
      let lastEmojiIndex = 0;
      
      while ((emojiMatch = emojiRegex.exec(remainingText)) !== null) {
        // Add text before emoji
        if (emojiMatch.index > lastEmojiIndex) {
          parts.push(remainingText.slice(lastEmojiIndex, emojiMatch.index));
        }
        
        // Add enhanced emoji
        parts.push(
          <span key={`emoji-${keyIndex++}`} className="text-lg animate-pulse">
            {emojiMap[emojiMatch[0]] || emojiMatch[0]}
          </span>
        );
        
        lastEmojiIndex = emojiMatch.index + emojiMatch[0].length;
      }
      
      // Add remaining text after last emoji
      if (lastEmojiIndex < remainingText.length) {
        parts.push(remainingText.slice(lastEmojiIndex));
      }
    }
  });

  return parts;
}

export function AnimatedMessage({ content, isStreaming = false, className, delay = 0, role = 'assistant' }: AnimatedMessageProps) {
  // Use different animations based on role and streaming state
  let animatedContent: string;
  
  if (role === 'user') {
    // User messages appear instantly
    animatedContent = useUserMessageAnimation(content);
  } else {
    // AI responses stream nicely
    animatedContent = useAIResponseAnimation(content, isStreaming);
  }

  const formattedContent = formatMessage(animatedContent || content); // Fallback to full content

  return (
    <div className={cn(
      "prose prose-invert max-w-none",
      "text-slate-300 leading-relaxed",
      "prose-strong:text-emerald-300 prose-strong:font-bold",
      "prose-em:text-blue-300 prose-em:italic",
      "prose-code:bg-slate-800 prose-code:text-emerald-400 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
      "prose-h1:text-emerald-300 prose-h1:font-bold prose-h1:text-xl prose-h1:mb-4",
      "prose-h2:text-emerald-300 prose-h2:font-bold prose-h2:text-lg prose-h2:mb-3",
      "prose-h3:text-emerald-300 prose-h3:font-bold prose-h3:text-base prose-h3:mb-2",
      "prose-ul:list-none prose-ul:space-y-1",
      "prose-li:relative prose-li:pl-6",
      "prose-li:before:content-['•'] prose-li:before:absolute prose-li:before:left-0 prose-li:before:text-emerald-400 prose-li:before:font-bold",
      className
    )}>
      {formattedContent.map((part, index) => (
        <React.Fragment key={index}>{part}</React.Fragment>
      ))}
    </div>
  );
}

// Enhanced typing indicator with archaeological theme
export function ArchaeologicalTypingIndicator() {
  return (
    <div className="flex items-center space-x-2 text-slate-400 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
      </div>
      <span className="text-sm">🏛️ NIS Protocol analyzing...</span>
    </div>
  );
} 