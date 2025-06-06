'use client'
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MapPin, Calendar, Layers, Download, Share2 } from "lucide-react";

interface DiscoveryCardProps {
  discovery: {
    site_id: string;
    name?: string;
    latitude: number;
    longitude: number;
    confidence_score: number;
    validation_status: string;
    description: string;
    cultural_significance?: string;
    data_sources: string[];
    type?: string;
    period?: string;
    size?: string;
    discovery_date?: string;
  };
  onViewMap?: (discovery: any) => void;
  onAnalyze?: (discovery: any) => void;
  onExport?: (discovery: any) => void;
  onShare?: (discovery: any) => void;
}

export const GradientCard: React.FC<DiscoveryCardProps> = ({ 
  discovery, 
  onViewMap, 
  onAnalyze, 
  onExport, 
  onShare 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = -(y / rect.height) * 5;
      const rotateY = (x / rect.width) * 5;
      setRotation({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-emerald-400";
    if (confidence >= 0.8) return "text-blue-400";
    if (confidence >= 0.7) return "text-yellow-400";
    return "text-orange-400";
  };

  const getValidationBadge = (status: string) => {
    switch (status) {
      case 'verified': return "bg-emerald-600 text-emerald-100";
      case 'pending': return "bg-yellow-600 text-yellow-100";
      case 'under_review': return "bg-blue-600 text-blue-100";
      default: return "bg-slate-600 text-slate-100";
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative rounded-[24px] overflow-hidden cursor-pointer"
      style={{
        width: "360px",
        height: "480px",
        transformStyle: "preserve-3d",
        backgroundColor: "#0e131f",
        boxShadow: "0 -10px 100px 10px rgba(78, 99, 255, 0.25), 0 0 10px 0 rgba(0, 0, 0, 0.5)",
      }}
      initial={{ y: 0 }}
      animate={{
        y: isHovered ? -5 : 0,
        rotateX: rotation.x,
        rotateY: rotation.y,
        perspective: 1000,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Glass reflection overlay */}
      <motion.div
        className="absolute inset-0 z-35 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.05) 100%)",
          backdropFilter: "blur(2px)",
        }}
        animate={{
          opacity: isHovered ? 0.7 : 0.5,
          rotateX: -rotation.x * 0.2,
          rotateY: -rotation.y * 0.2,
          z: 1,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut"
        }}
      />

      {/* Dark background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #000000 0%, #0a0f1a 70%, #1a1f2e 100%)",
        }}
      />

      {/* Purple/blue glow effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-2/3 z-20"
        style={{
          background: `
            radial-gradient(ellipse at bottom right, rgba(172, 92, 255, 0.7) -10%, rgba(79, 70, 229, 0) 70%),
            radial-gradient(ellipse at bottom left, rgba(56, 189, 248, 0.7) -10%, rgba(79, 70, 229, 0) 70%)
          `,
          filter: "blur(40px)",
        }}
        animate={{
          opacity: isHovered ? 0.9 : 0.8,
          y: isHovered ? rotation.x * 0.5 : 0,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut"
        }}
      />

      {/* Bottom border glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] z-25"
        style={{
          background: "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.05) 100%)",
        }}
        animate={{
          boxShadow: isHovered
            ? "0 0 20px 4px rgba(172, 92, 255, 0.9), 0 0 30px 6px rgba(138, 58, 185, 0.7)"
            : "0 0 15px 3px rgba(172, 92, 255, 0.8), 0 0 25px 5px rgba(138, 58, 185, 0.6)",
          opacity: isHovered ? 1 : 0.9,
        }}
        transition={{
          duration: 0.4,
          ease: "easeOut"
        }}
      />

      {/* Card content */}
      <motion.div
        className="relative flex flex-col h-full p-6 z-40"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
            }}
            animate={{
              boxShadow: isHovered
                ? "0 8px 16px -2px rgba(0, 0, 0, 0.3), inset 2px 2px 5px rgba(255, 255, 255, 0.15)"
                : "0 6px 12px -2px rgba(0, 0, 0, 0.25), inset 1px 1px 3px rgba(255, 255, 255, 0.12)",
              y: isHovered ? -2 : 0,
            }}
          >
            <Layers className="h-6 w-6 text-white" />
          </motion.div>

          <Badge className={getValidationBadge(discovery.validation_status)}>
            {discovery.validation_status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Title and description */}
        <motion.div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            {discovery.name || `Archaeological Site ${discovery.site_id.slice(-4)}`}
          </h3>
          <p className="text-sm text-gray-300 mb-3 line-clamp-3">
            {discovery.description}
          </p>
          {discovery.cultural_significance && (
            <p className="text-xs text-purple-300 italic line-clamp-2">
              {discovery.cultural_significance}
            </p>
          )}
        </motion.div>

        {/* Metadata */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="h-3 w-3" />
            <span>{discovery.latitude.toFixed(4)}, {discovery.longitude.toFixed(4)}</span>
          </div>
          
          {discovery.period && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="h-3 w-3" />
              <span>{discovery.period}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Confidence</span>
            <span className={`font-semibold text-sm ${getConfidenceColor(discovery.confidence_score)}`}>
              {(discovery.confidence_score * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Data sources */}
        <div className="flex flex-wrap gap-1 mb-4">
          {discovery.data_sources.slice(0, 3).map((source, index) => (
            <Badge 
              key={`source-${index}`} 
              variant="outline" 
              className="text-xs border-slate-600 text-slate-300"
            >
              {source}
            </Badge>
          ))}
          {discovery.data_sources.length > 3 && (
            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
              +{discovery.data_sources.length - 3}
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <motion.div className="mt-auto space-y-2">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onViewMap?.(discovery);
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Eye className="h-3 w-3 mr-1" />
              View Map
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze?.(discovery);
              }}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Analyze
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onExport?.(discovery);
              }}
              className="flex-1 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(discovery);
              }}
              className="flex-1 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 