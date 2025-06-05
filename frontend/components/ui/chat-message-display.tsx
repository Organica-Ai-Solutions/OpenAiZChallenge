"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  X, 
  Image as ImageIcon,
  FileText,
  Upload,
  MapPin,
  Target,
  BarChart3,
  Calendar,
  User,
  Bot
} from 'lucide-react';
import { AnimatedMessage } from './animated-message';
import { ConfidenceVisualization } from './enhanced-chat-features';
import { 
  MessageTimestamp,
  MessageStatus,
  MessageActions
} from './enhanced-chat-styling';
import { cn } from '../../lib/utils';

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "agent" | "assistant" | "system";
  timestamp: Date;
  type?: "error" | "file_upload" | "suggestion" | "analysis_start" | "analysis_result" | "batch_result";
  metadata?: {
    file_name?: string;
    file_type?: string;
    file_size?: number;
    file_preview?: string;
    analysis_ready?: boolean;
    analysis_results?: any;
    source_file?: string;
    demo_mode?: boolean;
    confidence?: number;
    coordinates?: string;
    batch_id?: string;
    processing_status?: 'pending' | 'processing' | 'completed' | 'error';
  };
  action_buttons?: Array<{
    label: string;
    action: string;
    file_reference?: string;
    coordinates?: string;
  }>;
}

interface ChatMessageDisplayProps {
  message: ChatMessage;
  isTyping?: boolean;
  onActionClick?: (action: string, data?: any) => void;
  onImageClick?: (imageUrl: string) => void;
}

// Image preview modal component
function ImagePreviewModal({ 
  imageUrl, 
  isOpen, 
  onClose 
}: { 
  imageUrl: string; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [zoom, setZoom] = useState(1);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="relative bg-white/10 rounded-lg p-4 max-w-4xl max-h-full overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 rounded-lg p-2">
          <button
            onClick={() => setZoom(zoom * 1.2)}
            className="p-1 text-white hover:text-emerald-400 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(zoom / 1.2)}
            className="p-1 text-white hover:text-emerald-400 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = imageUrl;
              link.download = 'image.png';
              link.click();
            }}
            className="p-1 text-white hover:text-emerald-400 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-white hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image */}
        <img
          src={imageUrl}
          alt="Preview"
          style={{ transform: `scale(${zoom})` }}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
        />
      </motion.div>
    </motion.div>
  );
}

export function ChatMessageDisplay({ 
  message, 
  isTyping = false, 
  onActionClick,
  onImageClick 
}: ChatMessageDisplayProps) {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
    setShowImagePreview(true);
    onImageClick?.(imageUrl);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'agent':
      case 'assistant':
        return <Bot className="w-4 h-4" />;
      case 'system':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'user':
        return 'You';
      case 'agent':
      case 'assistant':
        return 'NIS Agent';
      case 'system':
        return 'System';
      default:
        return 'Assistant';
    }
  };

  const isUserMessage = message.role === 'user';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex gap-3 max-w-4xl group",
          isUserMessage ? "ml-auto flex-row-reverse" : "mr-auto"
        )}
      >
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUserMessage 
            ? "bg-emerald-600/20 text-emerald-400" 
            : "bg-blue-600/20 text-blue-400"
        )}>
          {getRoleIcon(message.role)}
        </div>

        {/* Message Content */}
        <div className={cn(
          "flex-1 space-y-2",
          isUserMessage ? "items-end" : "items-start"
        )}>
                     {/* Header */}
           <div className={cn(
             "flex items-center justify-between text-xs text-gray-400 mb-2",
             isUserMessage ? "flex-row-reverse" : "flex-row"
           )}>
             <div className={cn(
               "flex items-center gap-2",
               isUserMessage ? "flex-row-reverse" : "flex-row"
             )}>
               <span className="font-medium">{getRoleLabel(message.role)}</span>
               <MessageTimestamp timestamp={message.timestamp} />
             </div>
             
             <div className={cn(
               "flex items-center gap-2",
               isUserMessage ? "flex-row-reverse" : "flex-row"
             )}>
               <MessageStatus 
                 role={message.role}
                 confidence={message.metadata?.confidence}
                 processing={message.metadata?.processing_status === 'processing'}
               />
               <MessageActions 
                 onCopy={() => navigator.clipboard.writeText(message.content)}
                 onRegenerate={!isUserMessage ? () => onActionClick?.('regenerate', { messageId: message.id }) : undefined}
               />
             </div>
           </div>

          {/* Message Bubble */}
          <div className={cn(
            "rounded-2xl p-4 max-w-2xl",
            isUserMessage
              ? "bg-emerald-600/10 border border-emerald-500/20 text-emerald-100"
              : message.type === 'error'
              ? "bg-red-600/10 border border-red-500/20 text-red-100"
              : "bg-slate-800/40 border border-slate-700/30 text-white/90"
          )}>
            {/* File Upload Display */}
            {message.type === 'file_upload' && message.metadata && (
              <div className="mb-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-shrink-0">
                    {message.metadata.file_type?.startsWith('image/') ? (
                      <ImageIcon className="w-5 h-5 text-blue-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{message.metadata.file_name}</p>
                    <p className="text-xs text-gray-400">
                      {message.metadata.file_size && formatFileSize(message.metadata.file_size)}
                      {message.metadata.file_type && ` • ${message.metadata.file_type}`}
                    </p>
                  </div>
                  {message.metadata.analysis_ready && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-xs">
                        <Upload className="w-3 h-3" />
                        Ready
                      </span>
                    </div>
                  )}
                </div>

                {/* Image Preview */}
                {message.metadata.file_preview && message.metadata.file_type?.startsWith('image/') && (
                  <div className="mt-3">
                    <img
                      src={message.metadata.file_preview}
                      alt={message.metadata.file_name}
                      className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImagePreview(message.metadata!.file_preview!)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Analysis Results */}
            {message.type === 'analysis_result' && message.metadata?.analysis_results && (
              <div className="mb-3 space-y-3">
                {/* Confidence Visualization */}
                {message.metadata.confidence && (
                  <ConfidenceVisualization
                    confidence={message.metadata.confidence}
                    label="Analysis Confidence"
                    showDetails={true}
                    factors={[
                      { name: 'Pattern Recognition', value: 0.92, weight: 0.3 },
                      { name: 'Historical Context', value: 0.85, weight: 0.25 },
                      { name: 'Satellite Quality', value: 0.88, weight: 0.2 },
                      { name: 'Cultural Significance', value: 0.79, weight: 0.25 }
                    ]}
                  />
                )}

                {/* Coordinates Display */}
                {message.metadata.coordinates && (
                  <div className="flex items-center gap-2 p-2 bg-blue-600/10 rounded-lg border border-blue-500/20">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-mono text-blue-300">{message.metadata.coordinates}</span>
                    <button
                      onClick={() => onActionClick?.('view_map', { coordinates: message.metadata!.coordinates })}
                      className="ml-auto p-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Target className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Analysis Images */}
                {message.metadata.analysis_results?.images && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {message.metadata.analysis_results.images.map((image: any, index: number) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={image.caption || `Analysis Image ${index + 1}`}
                          className="w-full rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleImagePreview(image.url)}
                        />
                        {image.caption && (
                          <p className="text-xs text-gray-400 mt-1 text-center">{image.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Main Message Content */}
            <div className="text-sm">
              {isTyping ? (
                <AnimatedMessage 
                  content={message.content}
                  isStreaming={true}
                  className="text-inherit"
                  role={message.role}
                />
              ) : (
                <AnimatedMessage 
                  content={message.content}
                  isStreaming={false}
                  className="text-inherit"
                  role={message.role}
                />
              )}
            </div>

            {/* Action Buttons */}
            {message.action_buttons && message.action_buttons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                {message.action_buttons.map((button, index) => (
                  <button
                    key={index}
                    onClick={() => onActionClick?.(button.action, {
                      file_reference: button.file_reference,
                      coordinates: button.coordinates
                    })}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-xs transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    {button.label}
                  </button>
                ))}
              </div>
            )}

            {/* Processing Status */}
            {message.metadata?.processing_status && message.metadata.processing_status !== 'completed' && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    message.metadata.processing_status === 'processing' ? "bg-blue-400 animate-pulse" :
                    message.metadata.processing_status === 'pending' ? "bg-yellow-400" :
                    "bg-red-400"
                  )} />
                  <span className="capitalize">{message.metadata.processing_status}</span>
                  {message.metadata.batch_id && (
                    <span className="text-gray-400">• Batch {message.metadata.batch_id.slice(-8)}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImagePreview && (
          <ImagePreviewModal
            imageUrl={previewImageUrl}
            isOpen={showImagePreview}
            onClose={() => setShowImagePreview(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
} 