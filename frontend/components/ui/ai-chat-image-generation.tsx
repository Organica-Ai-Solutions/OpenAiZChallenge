"use client"

import * as React from "react"
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export interface ImageGenerationProps {
  children: React.ReactNode;
}

export const ImageGeneration = React.forwardRef<HTMLDivElement, ImageGenerationProps>(
  ({ children }, ref) => {
    const [progress, setProgress] = React.useState(0);
    const [loadingState, setLoadingState] = React.useState<
      "starting" | "generating" | "completed"
    >("starting");
    const duration = 30000;

    React.useEffect(() => {
      const startingTimeout = setTimeout(() => {
        setLoadingState("generating");

        const startTime = Date.now();

        const interval = setInterval(() => {
          const elapsedTime = Date.now() - startTime;
          const progressPercentage = Math.min(
            100,
            (elapsedTime / duration) * 100
          );

          setProgress(progressPercentage);

          if (progressPercentage >= 100) {
            clearInterval(interval);
            setLoadingState("completed");
          }
        }, 16);

        return () => clearInterval(interval);
      }, 3000);

      return () => clearTimeout(startingTimeout);
    }, [duration]);

    return (
      <div ref={ref} className="flex flex-col gap-2">
        <motion.span
          className="bg-[linear-gradient(110deg,var(--color-muted-foreground),35%,var(--color-foreground),50%,var(--color-muted-foreground),75%,var(--color-muted-foreground))] bg-[length:200%_100%] bg-clip-text text-transparent text-base font-medium"
          initial={{ backgroundPosition: "200% 0" }}
          animate={{
            backgroundPosition:
              loadingState === "completed" ? "0% 0" : "-200% 0",
          }}
          transition={{
            repeat: loadingState === "completed" ? 0 : Infinity,
            duration: 3,
            ease: "linear",
          }}
        >
          {loadingState === "starting" && "Getting started."}
          {loadingState === "generating" && "Creating image. May take a moment."}
          {loadingState === "completed" && "Image created."}
        </motion.span>
        <div className="relative rounded-xl border bg-card max-w-md overflow-hidden">
            {children}
          <motion.div
            className="absolute w-full h-[125%] -top-[25%] pointer-events-none backdrop-blur-3xl"
            initial={false}
            animate={{
              clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
              opacity: loadingState === "completed" ? 0 : 1,
            }}
            style={{
              clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
              maskImage:
                progress === 0
                  ? "linear-gradient(to bottom, black -5%, black 100%)"
                  : `linear-gradient(to bottom, transparent ${progress - 5}%, transparent ${progress}%, black ${progress + 5}%)`,
              WebkitMaskImage:
                progress === 0
                  ? "linear-gradient(to bottom, black -5%, black 100%)"
                  : `linear-gradient(to bottom, transparent ${progress - 5}%, transparent ${progress}%, black ${progress + 5}%)`,
            }}
          />
        </div>
      </div>
    );
  }
);

ImageGeneration.displayName = "ImageGeneration";

// Enhanced Text Response Component with Better Typography
export interface EnhancedTextResponseProps {
  children: React.ReactNode;
  isTyping?: boolean;
  confidence?: number;
  agent?: string;
  className?: string;
}

export const EnhancedTextResponse = ({ 
  children, 
  isTyping = false, 
  confidence, 
  agent,
  className 
}: EnhancedTextResponseProps) => {
  const [displayedText, setDisplayedText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const text = React.useMemo(() => 
    typeof children === 'string' ? children : '', 
    [children]
  );

  React.useEffect(() => {
    if (isTyping && text) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < text.length) {
            setDisplayedText(text.slice(0, prev + 1));
            return prev + 1;
          }
          clearInterval(timer);
          return prev;
        });
      }, 50);

      return () => clearInterval(timer);
    } else {
      setDisplayedText(text);
      setCurrentIndex(text.length);
    }
  }, [text, isTyping]);

  return (
    <motion.div
      className={cn(
        "relative p-6 rounded-2xl border border-white/10",
        "bg-gradient-to-br from-white/[0.05] to-white/[0.02]",
        "backdrop-blur-xl shadow-xl",
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Agent Header */}
      {agent && (
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
            <span className="text-sm font-bold text-white">🤖</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90">{agent}</h3>
            {confidence && (
              <div className="flex items-center gap-2 mt-1">
                <div className="text-xs text-white/60">Confidence:</div>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-400 to-indigo-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-white/80 font-medium">{confidence}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Text Content */}
      <div className="space-y-4">
        <motion.div
          className="prose prose-invert max-w-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div 
            className="text-white/90 leading-relaxed"
            style={{
              fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
              fontSize: '15px',
              lineHeight: '1.6'
            }}
          >
            {/* Enhanced Typography with Rich Formatting */}
            <div className="space-y-3">
              {/* Simulate enhanced text with emojis and formatting */}
              <TypewriterText 
                text={displayedText} 
                isActive={isTyping}
                className="text-white/90"
              />
              
              {!isTyping && displayedText && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 pt-4 border-t border-white/10"
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge>✨ AI Generated</Badge>
                    <Badge variant="secondary">🧠 Neural Response</Badge>
                    <Badge variant="accent">⚡ Real-time</Badge>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animated Border */}
      <motion.div
        className="absolute inset-0 rounded-2xl border border-violet-500/30 opacity-0"
        animate={{
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

// Typewriter Text Component
interface TypewriterTextProps {
  text: string;
  isActive?: boolean;
  className?: string;
  speed?: number;
}

const TypewriterText = ({ text, isActive = false, className, speed = 50 }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = React.useState("");
  const [showCursor, setShowCursor] = React.useState(true);

  React.useEffect(() => {
    if (isActive) {
      let index = 0;
      const timer = setInterval(() => {
        if (index <= text.length) {
          setDisplayText(text.slice(0, index));
          index++;
        } else {
          clearInterval(timer);
          setShowCursor(false);
        }
      }, speed);

      return () => clearInterval(timer);
    } else {
      setDisplayText(text);
      setShowCursor(false);
    }
  }, [text, isActive, speed]);

  // Cursor blinking effect
  React.useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <span className={className}>
      {/* Enhanced text formatting */}
      <EnhancedTextFormatter text={displayText} />
      {isActive && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-violet-400 ml-1"
          animate={{ opacity: showCursor ? 1 : 0 }}
          transition={{ duration: 0.1 }}
        />
      )}
    </span>
  );
};

// Enhanced Text Formatter for Rich Typography
interface EnhancedTextFormatterProps {
  text: string;
}

const EnhancedTextFormatter = ({ text }: EnhancedTextFormatterProps) => {
  // Enhanced text processing with emojis, bolds, and different sizes
  const formatText = (input: string) => {
    return input
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-white/80">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-violet-300 font-mono text-sm">$1</code>')
      .replace(/#{1,3}\s(.+)/g, '<h3 class="text-lg font-bold text-white mb-2 mt-4">🎯 $1</h3>')
      .replace(/- (.+)/g, '<li class="text-white/90 ml-4">• $1</li>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: formatText(text) }}
      className="space-y-2"
    />
  );
};

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'accent';
}

const Badge = ({ children, variant = 'default' }: BadgeProps) => {
  const variants = {
    default: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    secondary: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    accent: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
      variants[variant]
    )}>
      {children}
    </span>
  );
};

EnhancedTextResponse.displayName = "EnhancedTextResponse";

// Demo Component
export const ImageGenerationDemo = () => {
  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="space-y-8 max-w-2xl">
        <ImageGeneration>
          <img
            className="aspect-video max-w-md object-cover"
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop"
            alt="AI Generated Landscape"
          />
        </ImageGeneration>

        <EnhancedTextResponse 
          isTyping={false}
          confidence={94}
          agent="AI Assistant"
        >
          **Welcome to the enhanced AI chat experience!** 🚀
          
          Here's what makes this special:
          
          - ✨ **Beautiful typography** with proper spacing
          - 🎨 **Rich text formatting** with *emphasis* and `code`
          - 🧠 **Smart animations** and transitions
          - 💫 **Modern design** with glass-morphism effects
          
          ### Key Features:
          This system provides **real-time AI responses** with enhanced visual feedback and professional typography that makes reading a pleasure.
        </EnhancedTextResponse>
      </div>
    </div>
  );
}; 