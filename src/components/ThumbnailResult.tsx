'use client';

import { GeneratedThumbnail, ThumbnailData, UserAnswers } from '@/lib/types';
import { motion } from 'framer-motion';
import { Eye, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { ThumbnailPreview } from './ThumbnailPreview';

interface ThumbnailResultProps {
  thumbnail: GeneratedThumbnail;
  similarThumbnails: ThumbnailData[];
  enhancedQuery?: string;
  userAnswers: UserAnswers;
  onRegenerate: () => void;
  onStartOver: () => void;
  regenerating?: boolean;
  onShowPaywall?: () => void;
}

export function ThumbnailResult({ 
  thumbnail, 
  similarThumbnails, 
  enhancedQuery,
  userAnswers,
  onRegenerate, 
  onStartOver,
  regenerating,
  onShowPaywall
}: ThumbnailResultProps) {
  const [showReferences, setShowReferences] = useState(false);

  // Dynamic CTR Analysis System
  const analyzeThumbnail = () => {
    let score = 75; // Base score
    let insights: string[] = [];
    let recommendations: string[] = [];
    
    // Analyze color contrast and palette
    const colorCount = thumbnail.metadata.colors.length;
    if (colorCount >= 4) {
      score += 8;
      insights.push('Excellent color diversity');
    } else if (colorCount >= 3) {
      score += 5;
      insights.push('Good color variety');
    } else {
      score += 2;
      insights.push('Limited color palette');
      recommendations.push('Consider adding more contrasting colors');
    }
    
    // Analyze visual style
    if (thumbnail.metadata.style && thumbnail.metadata.style !== 'Unknown') {
      score += 6;
      insights.push(`${thumbnail.metadata.style} style detected`);
    } else {
      score += 2;
      insights.push('Style analysis pending');
    }
    
    // Analyze target audience alignment
    if (userAnswers.targetAudience) {
      const audienceScore = analyzeAudienceAlignment(userAnswers.targetAudience, thumbnail.metadata.style);
      score += audienceScore.points;
      insights.push(audienceScore.insight);
      if (audienceScore.recommendation) {
        recommendations.push(audienceScore.recommendation);
      }
    }
    
    // Analyze emotion and content type
    if (userAnswers.emotion && userAnswers.contentType) {
      const emotionScore = analyzeEmotionContentAlignment(userAnswers.emotion, userAnswers.contentType, thumbnail.metadata.style);
      score += emotionScore.points;
      insights.push(emotionScore.insight);
    }
    
    // Analyze key elements presence
    if (userAnswers.keyElements && thumbnail.metadata.elements.length > 0) {
      const elementScore = analyzeElementAlignment(userAnswers.keyElements, thumbnail.metadata.elements);
      score += elementScore.points;
      insights.push(elementScore.insight);
    }
    
    // Analyze similar thumbnails performance
    if (similarThumbnails.length > 0) {
      const referenceScore = analyzeReferencePerformance(similarThumbnails);
      score += referenceScore.points;
      insights.push(referenceScore.insight);
    }
    
    // Cap score at 98%
    score = Math.min(score, 98);
    
    return { score, insights, recommendations };
  };
  
  // Analyze audience alignment
  const analyzeAudienceAlignment = (audience: string, style: string) => {
    if (!audience || !style) {
      return { points: 0, insight: 'Audience analysis pending' };
    }
    
    const audienceStyles: Record<string, string[]> = {
      'kids': ['bright', 'colorful', 'fun', 'cartoon'],
      'teens': ['modern', 'trendy', 'bold', 'dynamic'],
      'adults': ['professional', 'clean', 'sophisticated', 'minimal'],
      'professionals': ['corporate', 'clean', 'modern', 'professional'],
      'beginners': ['simple', 'clear', 'friendly', 'approachable'],
      'intermediate': ['balanced', 'moderate', 'engaging', 'informative'],
      'advanced': ['sophisticated', 'detailed', 'professional', 'expert'],
      'general audience': ['universal', 'appealing', 'clear', 'engaging']
    };
    
    const targetStyles = audienceStyles[audience.toLowerCase()] || [];
    if (targetStyles.length === 0) {
      return { points: 3, insight: `Custom audience: ${audience}` };
    }
    
    const isAligned = targetStyles.some(targetStyle => 
      style.toLowerCase().includes(targetStyle)
    );
    
    if (isAligned) {
      return { points: 7, insight: `Perfect for ${audience} audience` };
    } else {
      return { 
        points: 3, 
        insight: `Could better target ${audience} audience`,
        recommendation: targetStyles[0] ? `Consider ${targetStyles[0]} style elements` : 'Optimize for target audience'
      };
    }
  };
  
  // Analyze emotion and content alignment
  const analyzeEmotionContentAlignment = (emotion: string, contentType: string, style: string) => {
    if (!emotion || !style) {
      return { points: 0, insight: 'Emotion analysis pending' };
    }
    
    const emotionStyles: Record<string, string[]> = {
      'excitement': ['dynamic', 'bold', 'energetic'],
      'curiosity': ['mysterious', 'intriguing', 'teaser'],
      'urgency': ['bold', 'attention-grabbing', 'dramatic'],
      'trust': ['clean', 'professional', 'reliable'],
      'fun': ['colorful', 'playful', 'entertaining'],
      'professional': ['clean', 'corporate', 'sophisticated'],
      'Excitement': ['dynamic', 'bold', 'energetic'],
      'Curiosity': ['mysterious', 'intriguing', 'teaser'],
      'Trust': ['clean', 'professional', 'reliable'],
      'Fun': ['colorful', 'playful', 'entertaining'],
      'Professional': ['clean', 'corporate', 'sophisticated']
    };
    
    const targetStyles = emotionStyles[emotion.toLowerCase()] || [];
    if (targetStyles.length === 0) {
      return { points: 3, insight: `Custom emotion: ${emotion}` };
    }
    
    const isAligned = targetStyles.some(targetStyle => 
      style.toLowerCase().includes(targetStyle)
    );
    
    if (isAligned) {
      return { points: 6, insight: `Emotion (${emotion}) well captured` };
    } else {
      return { points: 2, insight: `Emotion alignment could improve` };
    }
  };
  
  // Analyze element alignment
  const analyzeElementAlignment = (requestedElements: string, actualElements: string[]) => {
    const requested = requestedElements.toLowerCase().split(' ');
    const actual = actualElements.map(el => el.toLowerCase());
    
    const matches = requested.filter(req => 
      actual.some(act => act.includes(req) || req.includes(act))
    );
    
    const matchPercentage = (matches.length / requested.length) * 100;
    
    if (matchPercentage >= 80) {
      return { points: 8, insight: 'All key elements included' };
    } else if (matchPercentage >= 60) {
      return { points: 5, insight: 'Most key elements present' };
    } else {
      return { points: 2, insight: 'Some key elements missing' };
    }
  };
  
  // Analyze reference performance
  const analyzeReferencePerformance = (references: ThumbnailData[]) => {
    const avgScore = references.reduce((sum, ref) => sum + ref.performanceScore, 0) / references.length;
    
    if (avgScore >= 8) {
      return { points: 5, insight: 'High-performing reference style' };
    } else if (avgScore >= 6) {
      return { points: 3, insight: 'Good reference performance' };
    } else {
      return { points: 1, insight: 'Reference performance varies' };
    }
  };
  
  // Get dynamic status based on score
  const getStatusInfo = (score: number) => {
    if (score >= 90) return { status: 'Excellent', color: 'text-green-600', bg: 'from-green-500 to-emerald-600' };
    if (score >= 80) return { status: 'Great', color: 'text-blue-600', bg: 'from-blue-500 to-cyan-600' };
    if (score >= 70) return { status: 'Good', color: 'text-yellow-600', bg: 'from-yellow-500 to-orange-600' };
    return { status: 'Fair', color: 'text-orange-600', bg: 'from-orange-500 to-red-600' };
  };
  
  // Get dynamic style analysis
  const getStyleAnalysis = () => {
    const style = thumbnail.metadata.style || userAnswers.stylePreference || 'Modern';
    const styleInsights: Record<string, { description: string, strength: string }> = {
      'Modern': { description: 'Contemporary design', strength: 'Trendy appeal' },
      'Minimal': { description: 'Clean simplicity', strength: 'Professional look' },
      'Bold': { description: 'Strong visual impact', strength: 'Attention-grabbing' },
      'Colorful': { description: 'Vibrant palette', strength: 'Eye-catching' },
      'Professional': { description: 'Corporate style', strength: 'Trust-building' },
      'Dynamic': { description: 'Energetic design', strength: 'Engagement' },
      'Bold/Dramatic': { description: 'Strong visual impact', strength: 'Attention-grabbing' },
      'Minimalist/Clean': { description: 'Clean simplicity', strength: 'Professional look' },
      'Colorful/Vibrant': { description: 'Vibrant palette', strength: 'Eye-catching' },
      'Professional/Corporate': { description: 'Corporate style', strength: 'Trust-building' },
      'Dark/Moody': { description: 'Moody atmosphere', strength: 'Emotional depth' },
      'Bright/Cheerful': { description: 'Positive energy', strength: 'Uplifting appeal' }
    };
    
    return styleInsights[style] || { description: 'Custom style', strength: 'Unique appeal' };
  };
  
  // Get dynamic color analysis
  const getColorAnalysis = () => {
    const colorCount = thumbnail.metadata.colors.length;
    if (colorCount >= 5) return { description: 'Rich palette', strength: 'Visual depth' };
    if (colorCount >= 3) return { description: 'Balanced colors', strength: 'Good contrast' };
    return { description: 'Minimal colors', strength: 'Clean look' };
  };
  
  // Get dynamic size analysis
  const getSizeAnalysis = () => {
    return {
      dimensions: '1280×720px',
      quality: 'YouTube HD',
      optimization: 'Mobile & Desktop ready'
    };
  };
  
  const analysis = analyzeThumbnail();
  const statusInfo = getStatusInfo(analysis.score);
  const styleAnalysis = getStyleAnalysis();
  const colorAnalysis = getColorAnalysis();
  const sizeAnalysis = getSizeAnalysis();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Main Thumbnail Preview */}
      <ThumbnailPreview
        imageUrl={thumbnail.imageUrl}
        alt="Generated Thumbnail"
        onRegenerate={onRegenerate}
        regenerating={regenerating}
        onShowPaywall={onShowPaywall}
      />

      {/* CTR Optimization Insights */}
      <motion.div
        className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mr-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">CTR Optimization Report</h3>
            <p className="text-gray-600">Your thumbnail is optimized for maximum clicks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{analysis.score}%</div>
            <div className="text-sm font-medium text-green-700">CTR Score</div>
            <div className="text-xs text-green-600 mt-1">{statusInfo.status} optimization</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
            <div className="text-lg font-bold text-blue-600 mb-2">{thumbnail.metadata.style || 'Modern'}</div>
            <div className="text-sm font-medium text-blue-700">Visual Style</div>
            <div className="text-xs text-blue-600 mt-1">{styleAnalysis.strength}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
            <div className="flex space-x-1 mb-2">
              {thumbnail.metadata.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="text-sm font-medium text-purple-700">Color Palette</div>
            <div className="text-xs text-purple-600 mt-1">{colorAnalysis.strength}</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
            <div className="text-lg font-bold text-orange-600 mb-2">{sizeAnalysis.quality}</div>
            <div className="text-sm font-medium text-orange-700">{sizeAnalysis.dimensions}</div>
            <div className="text-xs text-orange-600 mt-1">{sizeAnalysis.optimization}</div>
          </div>
        </div>

        {/* Dynamic Insights Section */}
        {analysis.insights.length > 0 && (
          <motion.div
            className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              AI Analysis Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-blue-700 mb-2">Strengths:</h5>
                <ul className="space-y-1">
                  {analysis.insights.slice(0, Math.ceil(analysis.insights.length / 2)).map((insight, index) => (
                    <li key={index} className="text-sm text-blue-600 flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              {analysis.recommendations.length > 0 && (
                <div>
                  <h5 className="font-medium text-orange-700 mb-2">Recommendations:</h5>
                  <ul className="space-y-1">
                    {analysis.recommendations.filter(rec => rec && rec.trim() !== '').map((rec, index) => (
                      <li key={index} className="text-sm text-orange-600 flex items-center">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mr-2" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-200">
          <motion.button
            onClick={onRegenerate}
            disabled={regenerating}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {regenerating ? 'Regenerating...' : 'Regenerate Thumbnail'}
          </motion.button>
          
          <motion.button
            onClick={onStartOver}
            className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Over
          </motion.button>
        </div>
      </motion.div>

      {/* Reference Thumbnails */}
      {similarThumbnails.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-500" />
              Reference Thumbnails Used
            </h3>
            <button
              onClick={() => setShowReferences(!showReferences)}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showReferences ? 'Hide' : 'Show'} References
            </button>
          </div>

          {showReferences && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {similarThumbnails.map((ref, index) => (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <img
                    src={ref.thumbnailUrl}
                    alt={ref.title}
                    className="w-full h-24 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-medium text-sm text-gray-800 mb-1 line-clamp-2">
                    {ref.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">{ref.channel}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {ref.category}
                    </span>
                    <span className="text-gray-500">
                      {ref.performanceScore}/10
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Generation Prompt */}
      {/* <div className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Generation Prompt</h3>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 leading-relaxed">
            {thumbnail.prompt.length > 300 
              ? `${thumbnail.prompt.substring(0, 300)}...` 
              : thumbnail.prompt
            }
          </p>
        </div>
      </div> */}
    </motion.div>
  );
}
