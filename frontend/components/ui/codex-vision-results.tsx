import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Brain, Sparkles, Loader2, AlertCircle, CheckCircle, MapPin } from 'lucide-react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Progress } from './progress';

interface VisionResultsProps {
  analysis: any;
  isAnalyzing: boolean;
  progress: number;
  error: string | null;
}

export function CodexVisionResults({ analysis, isAnalyzing, progress, error }: VisionResultsProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Vision Agent Analysis</h3>
            </div>
            {analysis && (
              <Badge variant="success" className="bg-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-4 h-4 mr-1" />
                Analysis Complete
              </Badge>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing codex with vision agent...</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}

          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Visual Elements */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-400">Visual Elements</h4>
                  <div className="space-y-2">
                    {analysis.visual_elements?.map((element: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-white">{element.type}</span>
                        <span className="text-slate-400">({Math.round(element.confidence * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Archaeological Insights */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-400">Archaeological Insights</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-white">
                      <span className="text-slate-400">Period:</span> {analysis.archaeological_insights?.period}
                    </div>
                    <div className="text-sm text-white">
                      <span className="text-slate-400">Significance:</span> {analysis.archaeological_insights?.significance}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Findings */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-400">Key Findings</h4>
                <div className="space-y-2">
                  {analysis.archaeological_insights?.recommendations?.map((finding: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white">{finding}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coordinate Relevance */}
              {analysis.coordinate_relevance && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-400">Geographic Relevance</h4>
                  <div className="space-y-2">
                    {Object.entries(analysis.coordinate_relevance).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="text-white">{key}:</span>
                        <span className="text-slate-400">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 