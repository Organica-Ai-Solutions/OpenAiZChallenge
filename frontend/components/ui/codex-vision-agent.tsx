import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Brain, Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Progress } from './progress';
import { Badge } from './badge';

interface VisionAnalysis {
  id: string;
  confidence: number;
  findings: string[];
  visual_elements: {
    type: string;
    description: string;
    confidence: number;
  }[];
  archaeological_insights: {
    period: string;
    significance: string;
    recommendations: string[];
  };
  metadata: any;
}

interface CodexVisionAgentProps {
  codexImage: string;
  codexMetadata: any;
  onAnalysisComplete: (analysis: VisionAnalysis) => void;
}

export function CodexVisionAgent({ codexImage, codexMetadata, onAnalysisComplete }: CodexVisionAgentProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null);

  const analyzeCodex = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    try {
      // Step 1: Initialize vision analysis
      const initResponse = await fetch('http://localhost:8000/vision/analyze/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: codexImage,
          metadata: codexMetadata,
          analysis_type: 'codex'
        })
      });

      if (!initResponse.ok) {
        throw new Error('Failed to initialize vision analysis');
      }

      const { analysis_id } = await initResponse.json();
      setProgress(20);

      // Step 2: Process visual elements
      const visualResponse = await fetch(`http://localhost:8000/vision/analyze/visual/${analysis_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus_areas: ['symbols', 'patterns', 'text', 'artifacts']
        })
      });

      if (!visualResponse.ok) {
        throw new Error('Failed to analyze visual elements');
      }

      const visualData = await visualResponse.json();
      setProgress(50);

      // Step 3: Generate archaeological insights
      const insightsResponse = await fetch(`http://localhost:8000/vision/analyze/insights/${analysis_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: codexMetadata,
          visual_elements: visualData.elements
        })
      });

      if (!insightsResponse.ok) {
        throw new Error('Failed to generate archaeological insights');
      }

      const insightsData = await insightsResponse.json();
      setProgress(80);

      // Step 4: Finalize analysis
      const finalResponse = await fetch(`http://localhost:8000/vision/analyze/finalize/${analysis_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visual_analysis: visualData,
          archaeological_insights: insightsData
        })
      });

      if (!finalResponse.ok) {
        throw new Error('Failed to finalize analysis');
      }

      const finalAnalysis = await finalResponse.json();
      setProgress(100);
      setAnalysis(finalAnalysis);
      onAnalysisComplete(finalAnalysis);

    } catch (error) {
      console.error('Vision analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [codexImage, codexMetadata, onAnalysisComplete]);

  return (
    <div className="space-y-4">
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
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-400">Visual Elements</h4>
                  <div className="space-y-2">
                    {analysis.visual_elements.map((element, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-white">{element.type}</span>
                        <span className="text-slate-400">({Math.round(element.confidence * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-400">Archaeological Insights</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-white">
                      <span className="text-slate-400">Period:</span> {analysis.archaeological_insights.period}
                    </div>
                    <div className="text-sm text-white">
                      <span className="text-slate-400">Significance:</span> {analysis.archaeological_insights.significance}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-400">Key Findings</h4>
                <div className="space-y-1">
                  {analysis.findings.map((finding, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white">{finding}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {!isAnalyzing && !analysis && (
            <Button
              onClick={analyzeCodex}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              Start Vision Analysis
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 