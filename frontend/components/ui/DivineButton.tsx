'use client';

import React, { useEffect, useRef, useState } from 'react';

interface DivineButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isAnalyzing?: boolean;
  children?: React.ReactNode;
  className?: string;
  variant?: 'zeus' | 'apollo' | 'athena' | 'hermes';
}

export default function DivineButton({ 
  onClick, 
  disabled = false, 
  isAnalyzing = false, 
  children, 
  className = '',
  variant = 'zeus'
}: DivineButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [clickEffect, setClickEffect] = useState(false);

  // 🌟 Add sparkle effect on mount
  useEffect(() => {
    if (buttonRef.current && typeof window !== 'undefined') {
      // Import sparkle effect
      import('./sparkle.js').then(({ addDivineSparkles }) => {
        if (buttonRef.current) {
          buttonRef.current.setAttribute('data-divine-button', 'true');
          addDivineSparkles(buttonRef.current);
        }
      });
    }
  }, []);

  // 🎨 Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'zeus':
        return {
          gradient: 'from-blue-600 via-purple-600 to-blue-600',
          hoverGradient: 'hover:from-blue-700 hover:via-purple-700 hover:to-blue-700',
          glow: 'shadow-blue-500/25',
          border: 'border-blue-400/50',
          icon: '⚡'
        };
      case 'apollo':
        return {
          gradient: 'from-yellow-500 via-orange-500 to-yellow-500',
          hoverGradient: 'hover:from-yellow-600 hover:via-orange-600 hover:to-yellow-600',
          glow: 'shadow-yellow-500/25',
          border: 'border-yellow-400/50',
          icon: '☀️'
        };
      case 'athena':
        return {
          gradient: 'from-emerald-600 via-teal-600 to-emerald-600',
          hoverGradient: 'hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-700',
          glow: 'shadow-emerald-500/25',
          border: 'border-emerald-400/50',
          icon: '🦉'
        };
      case 'hermes':
        return {
          gradient: 'from-indigo-600 via-pink-600 to-indigo-600',
          hoverGradient: 'hover:from-indigo-700 hover:via-pink-700 hover:to-indigo-700',
          glow: 'shadow-indigo-500/25',
          border: 'border-indigo-400/50',
          icon: '🕊️'
        };
      default:
        return getVariantStyles();
    }
  };

  const styles = getVariantStyles();

  // 🔥 Handle click with divine effects
  const handleClick = () => {
    if (disabled) return;
    
    setClickEffect(true);
    setTimeout(() => setClickEffect(false), 300);
    
    // Add screen flash effect
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
      pointer-events: none;
      z-index: 9999;
      animation: divineFlash 0.5s ease-out;
    `;
    
    // Add flash animation
    if (!document.querySelector('#divine-flash-styles')) {
      const style = document.createElement('style');
      style.id = 'divine-flash-styles';
      style.textContent = `
        @keyframes divineFlash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(flash);
    setTimeout(() => {
      if (flash.parentNode) {
        flash.parentNode.removeChild(flash);
      }
    }, 500);
    
    onClick();
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden
        w-full py-4 px-8
        bg-gradient-to-r ${styles.gradient} ${styles.hoverGradient}
        text-white font-bold text-lg
        rounded-xl
        border-2 ${styles.border}
        shadow-2xl ${styles.glow}
        transform transition-all duration-300
        ${isHovered ? 'scale-105 shadow-3xl' : 'scale-100'}
        ${clickEffect ? 'scale-95' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-4xl'}
        ${className}
      `}
      style={{
        background: isHovered 
          ? `linear-gradient(45deg, ${styles.gradient.replace('from-', '').replace('via-', '').replace('to-', '').split(' ').join(', ')})` 
          : undefined,
        boxShadow: isHovered 
          ? `0 0 30px ${styles.glow.replace('shadow-', '').replace('/25', '')}, 0 0 60px ${styles.glow.replace('shadow-', '').replace('/25', '')}, inset 0 0 20px rgba(255,255,255,0.1)`
          : undefined
      }}
    >
      {/* Celestial Border Animation */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className={`
          absolute inset-0 
          bg-gradient-to-r from-transparent via-white/20 to-transparent
          ${isAnalyzing ? 'animate-pulse' : ''}
          ${isHovered ? 'animate-ping' : ''}
        `}></div>
      </div>

      {/* Divine Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

      {/* Button Content */}
      <div className="relative z-10 flex items-center justify-center gap-3">
        {isAnalyzing ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <div className="text-2xl animate-bounce">{styles.icon}</div>
            </div>
            <span className="text-xl font-bold">UNLEASHING DIVINE POWER...</span>
            <div className="text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>👼</div>
          </>
        ) : (
          <>
            <div className="text-2xl">🌟</div>
            <span className="text-xl font-bold">
              {children || "RUN DIVINE ANALYSIS"}
            </span>
            <div className="text-2xl">🏛️</div>
          </>
        )}
      </div>

      {/* Sparkle Points */}
      {!disabled && (
        <>
          <div className="absolute top-2 left-6 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-4 right-8 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-3 left-12 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-2 right-6 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-6 left-1/2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        </>
      )}

      {/* Zeus Lightning Effect (on hover) */}
      {isHovered && variant === 'zeus' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-yellow-300 to-transparent opacity-60 animate-pulse"></div>
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-yellow-300 to-transparent opacity-60 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        </div>
      )}

      {/* Divine Blessing Text (when active) */}
      {isAnalyzing && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-yellow-300 whitespace-nowrap animate-pulse">
          ⚡ Zeus Blessing Active ⚡
        </div>
      )}
    </button>
  );
} 