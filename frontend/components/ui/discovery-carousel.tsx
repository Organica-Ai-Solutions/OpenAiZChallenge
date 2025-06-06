'use client'
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradientCard } from "./gradient-card";

interface DiscoveryCarouselProps {
  discoveries: any[];
  onViewMap?: (discovery: any) => void;
  onAnalyze?: (discovery: any) => void;
  onExport?: (discovery: any) => void;
  onShare?: (discovery: any) => void;
  itemsPerView?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const DiscoveryCarousel: React.FC<DiscoveryCarouselProps> = ({
  discoveries,
  onViewMap,
  onAnalyze,
  onExport,
  onShare,
  itemsPerView = 3,
  autoPlay = false,
  autoPlayInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  const totalItems = discoveries.length;
  const maxIndex = Math.max(0, totalItems - itemsPerView);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && totalItems > itemsPerView) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, maxIndex, autoPlayInterval, totalItems, itemsPerView]);

  const goToNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
    setIsAutoPlaying(false);
  };

  if (totalItems === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <div className="text-center">
          <MoreHorizontal className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No discoveries to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Carousel Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">
            Archaeological Discoveries
          </h3>
          <p className="text-sm text-slate-400">
            Showing {Math.min(currentIndex + itemsPerView, totalItems)} of {totalItems} discoveries
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {autoPlay && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="border-slate-600 text-slate-300"
            >
              {isAutoPlaying ? 'Pause' : 'Play'}
            </Button>
          )}
          
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="border-slate-600 text-slate-300 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentIndex >= maxIndex}
              className="border-slate-600 text-slate-300 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <motion.div
          ref={carouselRef}
          className="flex gap-6"
          animate={{
            x: -currentIndex * (360 + 24), // card width + gap
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.6
          }}
        >
          <AnimatePresence mode="popLayout">
            {discoveries.map((discovery, index) => (
              <motion.div
                key={discovery.site_id}
                className="flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { delay: index * 0.1 }
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.02 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
              >
                <GradientCard
                  discovery={discovery}
                  onViewMap={onViewMap}
                  onAnalyze={onAnalyze}
                  onExport={onExport}
                  onShare={onShare}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Pagination Dots */}
      {totalItems > itemsPerView && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-purple-500 w-6'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar (for auto-play) */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: autoPlayInterval / 1000,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        </div>
      )}
    </div>
  );
}; 