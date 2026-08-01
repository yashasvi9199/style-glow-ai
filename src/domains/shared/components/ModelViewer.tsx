import React, { useState, useEffect } from 'react';
import { ArrowLeft, Cpu, ShieldCheck, Zap } from 'lucide-react';

interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
}

interface ModelViewerProps {
  onBack: () => void;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ onBack }) => {
  const [models, setModels] = useState<GeminiModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models');
        if (!response.ok) {
          throw new Error('Failed to fetch models from API');
        }
        const data = await response.json();
        if (data.status === 'success') {
          // Filter to show only generative content models for cleaner display
          const genModels = (data.models || []).filter((m: any) =>
            m.supportedGenerationMethods?.includes('generateContent')
          );
          setModels(genModels);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load models.');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Available Gemini Models</h2>
          <p className="text-sm text-slate-500">List of models accessible via your Cloudflare API key</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Fetching model registry...</p>
        </div>
      )}

      {error && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-red-800 font-semibold mb-2">Error loading models</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              // Retry fetching
              const fetchModels = async () => {
                try {
                  const response = await fetch('/api/models');
                  const data = await response.json();
                  if (data.status === 'success') {
                    setModels(data.models || []);
                  } else throw new Error(data.error);
                } catch (err: any) {
                  setError(err.message || 'Failed to load models.');
                } finally {
                  setLoading(false);
                }
              };
              fetchModels();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && models.length === 0 && (
        <p className="text-center text-slate-500 py-10">No models found with generateContent capabilities.</p>
      )}

      {!loading && !error && models.length > 0 && (
        <div className="space-y-4">
          {models.map((model) => (
            <div
              key={model.name}
              className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg hover:shadow-slate-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900">{model.displayName || model.name.replace('models/', '')}</h3>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-3">{model.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    <Zap className="w-3.5 h-3.5" />
                    Input Limit: {model.inputTokenLimit.toLocaleString()} tokens
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Output Limit: {model.outputTokenLimit.toLocaleString()} tokens
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-150 self-start md:self-center">
                {model.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
