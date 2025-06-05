"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  Image, 
  X, 
  Download, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  MapPin,
  Layers,
  BarChart3,
  Zap,
  Eye,
  Search,
  Target,
  FileText,
  Camera,
  Map,
  Activity,
  TrendingUp,
  Loader2,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useChatContext, ChatMessage, BatchJob } from '../../src/lib/context/chat-context';

// Real-time typing indicator component
export function TypingIndicator({ userId, userName }: { userId: string; userName?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-2 text-muted-foreground text-sm px-4 py-2"
    >
      <div className="flex space-x-1">
        <motion.div
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </div>
      <span>{userName || 'NIS Agent'} is typing...</span>
    </motion.div>
  );
}

// Enhanced file upload component
interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
}

export function EnhancedFileUpload({ 
  onFileUpload, 
  acceptedTypes = ['*'], 
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const processFiles = useCallback((files: File[]) => {
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds size limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onFileUpload(validFiles);
      
      // Simulate upload progress
      validFiles.forEach(file => {
        const fileId = `${file.name}_${Date.now()}`;
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          setUploadProgress(prev => ({ ...prev, [fileId]: Math.min(progress, 100) }));
          
          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[fileId];
                return newProgress;
              });
            }, 1000);
          }
        }, 200);
      });
    }
  }, [maxSize, onFileUpload]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  }, [processFiles]);

  return (
    <div className="relative">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200",
          isDragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-gray-300 hover:border-gray-400"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Drag & drop files here or click to select
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Max file size: {(maxSize / (1024 * 1024)).toFixed(1)}MB
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {/* Upload progress indicators */}
      <AnimatePresence>
        {Object.entries(uploadProgress).map(([fileId, progress]) => (
          <motion.div
            key={fileId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="truncate">{fileId.split('_')[0]}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Confidence visualization component
interface ConfidenceVisualizationProps {
  confidence: number;
  label?: string;
  showDetails?: boolean;
  factors?: Array<{ name: string; value: number; weight: number }>;
}

export function ConfidenceVisualization({ 
  confidence, 
  label = "Confidence",
  showDetails = false,
  factors = []
}: ConfidenceVisualizationProps) {
  const [expanded, setExpanded] = useState(false);
  
  const getConfidenceColor = (value: number) => {
    if (value >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (value >= 0.6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getConfidenceBarColor = (value: number) => {
    if (value >= 0.8) return 'bg-green-500';
    if (value >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{label}</span>
          <div className={cn("px-2 py-1 rounded-full text-xs font-medium", getConfidenceColor(confidence))}>
            {Math.round(confidence * 100)}%
          </div>
        </div>
        {showDetails && factors.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={cn("h-2 rounded-full transition-all duration-500", getConfidenceBarColor(confidence))}
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700"
          >
            {factors.map((factor, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{factor.name}</span>
                  <span className="font-medium">{Math.round(factor.value * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full"
                    style={{ width: `${factor.value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Batch processing component
interface BatchProcessingProps {
  jobs: BatchJob[];
  onStartBatch: (type: BatchJob['type'], params: any) => void;
  onCancelBatch: (jobId: string) => void;
}

export function BatchProcessing({ jobs, onStartBatch, onCancelBatch }: BatchProcessingProps) {
  const [batchType, setBatchType] = useState<BatchJob['type']>('discovery');
  const [batchParams, setBatchParams] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const handleStartBatch = async () => {
    if (isStarting) return;
    
    setIsStarting(true);
    try {
      let params = {};
      if (batchParams.trim()) {
        params = JSON.parse(batchParams);
      }
      await onStartBatch(batchType, params);
      setBatchParams('');
    } catch (error) {
      console.error('Failed to start batch job:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const getJobIcon = (type: BatchJob['type']) => {
    switch (type) {
      case 'discovery': return <Search className="h-4 w-4" />;
      case 'analysis': return <Target className="h-4 w-4" />;
      case 'vision': return <Eye className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: BatchJob['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Start Batch Processing</h3>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <select
              value={batchType}
              onChange={(e) => setBatchType(e.target.value as BatchJob['type'])}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="discovery">Site Discovery</option>
              <option value="analysis">Coordinate Analysis</option>
              <option value="vision">Vision Analysis</option>
            </select>
            <button
              onClick={handleStartBatch}
              disabled={isStarting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
          <textarea
            value={batchParams}
            onChange={(e) => setBatchParams(e.target.value)}
            placeholder="Optional parameters (JSON format)"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Active Jobs */}
      {jobs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Active Jobs</h3>
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getJobIcon(job.type)}
                  <span className="text-sm font-medium capitalize">{job.type}</span>
                  <span className={cn("text-xs capitalize", getStatusColor(job.status))}>
                    {job.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {Math.round(job.progress)}%
                  </span>
                  {job.status === 'processing' && (
                    <button
                      onClick={() => onCancelBatch(job.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              
              {job.error && (
                <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {job.error}
                </div>
              )}
              
              {job.results && job.results.length > 0 && (
                <div className="text-xs text-green-600">
                  Completed: {job.results.length} results
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Map integration component
interface MapIntegrationProps {
  onCoordinateSelect: (coordinates: string) => void;
  selectedCoordinates?: string;
  showMarkers?: boolean;
  markers?: Array<{ lat: number; lon: number; label: string; confidence?: number }>;
}

export function MapIntegration({ 
  onCoordinateSelect, 
  selectedCoordinates, 
  showMarkers = true,
  markers = [] 
}: MapIntegrationProps) {
  const [inputCoordinates, setInputCoordinates] = useState('');
  const [isValidCoordinates, setIsValidCoordinates] = useState(true);

  const validateCoordinates = (coords: string) => {
    const coordPattern = /^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/;
    return coordPattern.test(coords.trim().replace(/\s/g, ''));
  };

  const handleCoordinateChange = (value: string) => {
    setInputCoordinates(value);
    setIsValidCoordinates(validateCoordinates(value));
  };

  const handleSubmit = () => {
    if (isValidCoordinates && inputCoordinates.trim()) {
      onCoordinateSelect(inputCoordinates.trim());
      setInputCoordinates('');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium">Map Integration</span>
      </div>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputCoordinates}
          onChange={(e) => handleCoordinateChange(e.target.value)}
          placeholder="Enter coordinates (lat, lon)"
          className={cn(
            "flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800",
            isValidCoordinates ? "border-gray-300 dark:border-gray-600" : "border-red-300 dark:border-red-600"
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={!isValidCoordinates || !inputCoordinates.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Target className="h-4 w-4" />
        </button>
      </div>
      
      {!isValidCoordinates && inputCoordinates && (
        <div className="text-xs text-red-600 flex items-center space-x-1">
          <AlertCircle className="h-3 w-3" />
          <span>Invalid coordinate format. Use: latitude, longitude</span>
        </div>
      )}
      
      {selectedCoordinates && (
        <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
          Selected: {selectedCoordinates}
        </div>
      )}
      
      {showMarkers && markers.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Recent Markers</span>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {markers.map((marker, index) => (
              <div 
                key={index}
                className="flex items-center justify-between text-xs p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => onCoordinateSelect(`${marker.lat}, ${marker.lon}`)}
              >
                <span className="truncate">{marker.label}</span>
                <div className="flex items-center space-x-2">
                  {marker.confidence && (
                    <span className="text-gray-500">
                      {Math.round(marker.confidence * 100)}%
                    </span>
                  )}
                  <MapPin className="h-3 w-3 text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Advanced formatting toolbar
interface FormattingToolbarProps {
  onFormatApply: (format: string, value?: string) => void;
}

export function FormattingToolbar({ onFormatApply }: FormattingToolbarProps) {
  const formatOptions = [
    { icon: <FileText className="h-4 w-4" />, label: 'Bold', format: 'bold' },
    { icon: <FileText className="h-4 w-4" />, label: 'Italic', format: 'italic' },
    { icon: <FileText className="h-4 w-4" />, label: 'Code', format: 'code' },
    { icon: <FileText className="h-4 w-4" />, label: 'Quote', format: 'quote' },
    { icon: <FileText className="h-4 w-4" />, label: 'List', format: 'list' },
    { icon: <FileText className="h-4 w-4" />, label: 'Link', format: 'link' },
  ];

  return (
    <div className="flex items-center space-x-1 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
      {formatOptions.map((option) => (
        <button
          key={option.format}
          onClick={() => onFormatApply(option.format)}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          title={option.label}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
} 