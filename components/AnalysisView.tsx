
import React, { useState } from 'react';
import { AnalysisResult, DetailedAnalysis } from '../types';
import { Sparkles, Shirt, Heart, Layout, ScanFace, Sun, Smile, ChevronDown, ChevronUp, Camera, Leaf } from 'lucide-react';

interface AnalysisViewProps {
  imageSrc: string;
  analysis: AnalysisResult;
  onRetake: () => void;
  rateLimitRemaining: number;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ imageSrc, analysis, onRetake, rateLimitRemaining }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'recapture' | 'emotional' | 'wellness'>('overview');
  const [expandedDetails, setExpandedDetails] = useState<string[]>(['general']);
  const [expandedSuggestions, setExpandedSuggestions] = useState<number[]>([]);

  const detailItems = [
    { key: 'general', label: 'General', icon: Sparkles, color: 'text-slate-900', bg: 'bg-slate-50' },
    { key: 'clothing', label: 'Clothing', icon: Shirt, color: 'text-slate-900', bg: 'bg-white' },
    { key: 'pose', label: 'Pose', icon: Heart, color: 'text-slate-900', bg: 'bg-slate-50' },
    { key: 'background', label: 'Background', icon: Layout, color: 'text-slate-900', bg: 'bg-white' },
    { key: 'hair', label: 'Hair', icon: Sparkles, color: 'text-slate-900', bg: 'bg-slate-50' },
    { key: 'skin', label: 'Skin', icon: ScanFace, color: 'text-slate-900', bg: 'bg-white'},
    { key: 'lighting', label: 'Lighting', icon: Sun, color: 'text-slate-900', bg: 'bg-slate-50' },
    { key: 'expression', label: 'Expression', icon: Smile, color: 'text-slate-900', bg: 'bg-white'  },
  ];

  const toggleDetail = (key: string) => {
    setExpandedDetails(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const toggleSuggestion = (idx: number) => {
    setExpandedSuggestions(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const parseSuggestion = (suggestion: string) => {
    const parts = suggestion.split('=');
    if (parts.length === 2) {
      return {
        observation: parts[0].trim(),
        recommendation: parts[1].trim()
      };
    }
    return {
      observation: suggestion,
      recommendation: null
    };
  };

  const topSuggestions = analysis.suggestions || [];

  return (
    <div className="w-full max-w-2xl mx-auto pb-28">
      {/* Image Header */}
      <div className="relative mb-6 rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-900 flex justify-center">
        <img src={imageSrc} alt="User" className="w-full h-auto object-contain max-h-[400px]" />
        <div className="absolute top-4 left-4">
           <span className="px-3 py-1.5 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-slate-800 shadow-sm border border-white/50">
             Analysis Complete
           </span>
        </div>
      </div>

      {/* Tabs Grid */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'overview', label: 'Summary' },
          { id: 'details', label: 'Analysis' },
          { id: 'recapture', label: 'Recapture' },
          { id: 'emotional', label: 'Emotional' },
          { id: 'wellness', label: 'Skin Advisor' },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex-grow text-center shadow-sm border ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="text-indigo-600" fill="currentColor" size={20} />
              AI Verdict
            </h2>
            <p className="text-slate-700 leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 px-1">Primary Recommendations</h3>
            <ul className="space-y-3">
              {topSuggestions.slice(0, 3).map((suggestion, idx) => {
                const { observation, recommendation } = parseSuggestion(suggestion);
                const isExpanded = expandedSuggestions.includes(idx);
                
                return (
                  <li key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex gap-3 items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-700 text-sm font-medium">{observation}</p>
                        {recommendation && (
                          <>
                            {isExpanded && (
                              <p className="text-indigo-600 text-sm mt-2 font-medium">
                                → {recommendation}
                              </p>
                            )}
                            <button
                              onClick={() => toggleSuggestion(idx)}
                              className="text-xs text-indigo-500 hover:text-indigo-700 mt-2 font-medium"
                            >
                              {isExpanded ? 'Hide recommendation' : 'Show recommendation'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {detailItems.map(item => {
            const Icon = item.icon;
            const isExpanded = expandedDetails.includes(item.key);
            
            return (
              <div key={item.key} className={`${item.bg} rounded-xl shadow-sm border border-slate-100 overflow-hidden`}>
                <button 
                  onClick={() => toggleDetail(item.key)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm ${item.color}`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800">{item.label}</h3>
                  </div>
                  {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {analysis.details[item.key as keyof DetailedAnalysis]}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'recapture' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-6">
            <h2 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
              <Camera size={20} className="text-amber-600" />
              How to Take a Better Photo
            </h2>
            <p className="text-amber-800/80 text-sm">
              Follow these specific tips to instantly improve your next shot without any editing.
            </p>
          </div>

          <div className="grid gap-3">
            {analysis.recaptureSuggestions?.map((tip, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4 items-start">
                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600 font-bold text-sm">
                   {idx + 1}
                 </div>
                 <div>
                   <p className="text-slate-800 font-medium leading-relaxed">{tip}</p>
                 </div>
              </div>
            ))}
            {(!analysis.recaptureSuggestions || analysis.recaptureSuggestions.length === 0) && (
               <div className="text-center p-8 text-slate-400">
                 No specific recapture advice available for this image.
               </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'emotional' && analysis.emotionalAnalysis && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-sky-50 p-6 rounded-2xl border border-sky-100 mb-4">
            <h2 className="text-lg font-bold text-sky-900 mb-2 flex items-center gap-2">
              <Smile size={20} className="text-sky-600" />
              Emotional & Social Perception
            </h2>
            <p className="text-sky-800/80 text-sm">
              How your expression and vibe are perceived by others.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(analysis.emotionalAnalysis).map(([key, value]) => (
              <div key={key} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <p className="text-slate-800 font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'wellness' && analysis.skinWellness && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-4">
            <h2 className="text-lg font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <Leaf size={20} className="text-emerald-600" />
              Skin Wellness Advisor
            </h2>
            <p className="text-emerald-800/80 text-sm">
              Gentle, non-medical personalized advice for healthy skin glow.
            </p>
          </div>
          <div className="space-y-3">
            {Array.isArray(analysis.skinWellness) ? (
              analysis.skinWellness.map((remedy, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <h3 className="font-semibold text-slate-800">{remedy.title}</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed pl-4">{remedy.description}</p>
                  <div className="pl-4 mt-1">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      Ingredients: {remedy.ingredients}
                    </span>
                  </div>
                </div>
              ))
            ) : (
               <p className="text-slate-500">Analysis format updated.</p>
            )}
          </div>
        </div>
      )}
      
      {/* Disclaimer */}
      {analysis.disclaimerText && (
        <div className="mt-8 mb-4 px-4 py-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-[10px] text-slate-400 text-center leading-tight">
            {analysis.disclaimerText}
          </p>
        </div>
      )}

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-slate-200 flex flex-col items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        {rateLimitRemaining > 0 && (
          <div className="text-xs text-amber-600 font-medium">
            ⏱️ Wait {Math.ceil(rateLimitRemaining / 1000)}s to retake
          </div>
        )}
        <button 
          onClick={onRetake}
          disabled={rateLimitRemaining > 0}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${
            rateLimitRemaining > 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Retake
        </button>
      </div>
    </div>
  );
};
