'use client';

import { motion } from 'framer-motion';
import { Radio, Tv, Newspaper, Globe, X } from 'lucide-react';
import { newsSources } from '@/data/sources';
import { useStore } from '@/store/useStore';
import { NewsSource } from '@/types';

const typeIcons = {
  journal: Newspaper,
  tv: Tv,
  radio: Radio,
  web: Globe
};

const typeLabels = {
  journal: 'Journaux',
  tv: 'Télévisions',
  radio: 'Radios',
  web: 'Web'
};

export default function SourceFilter() {
  const { selectedSource, setSelectedSource } = useStore();

  const groupedSources = newsSources.reduce((acc, source) => {
    if (!acc[source.type]) acc[source.type] = [];
    acc[source.type].push(source);
    return acc;
  }, {} as Record<NewsSource['type'], NewsSource[]>);

  return (
    <section className="py-8 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Filtrer par source
          </h3>
          {selectedSource && (
            <button
              onClick={() => setSelectedSource(null)}
              className="flex items-center gap-1 text-sm text-[#ff6b35] hover:text-[#e55a2b]"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Horizontal Scroll Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          <button
            onClick={() => setSelectedSource(null)}
            className={`filter-pill shrink-0 ${!selectedSource ? 'active' : ''}`}
          >
            Toutes
          </button>
          {newsSources.map((source) => (
            <button
              key={source.id}
              onClick={() => setSelectedSource(source.id)}
              className={`filter-pill shrink-0 flex items-center gap-2 ${
                selectedSource === source.id ? 'active' : ''
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: source.color }}
              ></span>
              {source.shortName}
            </button>
          ))}
        </div>

        {/* Grouped Sources (Desktop) */}
        <div className="hidden lg:grid grid-cols-4 gap-6 mt-6">
          {(Object.keys(groupedSources) as NewsSource['type'][]).map((type) => {
            const Icon = typeIcons[type];
            return (
              <div key={type} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5 text-[#ff6b35]" />
                  <span className="font-semibold text-sm">{typeLabels[type]}</span>
                </div>
                <div className="space-y-1">
                  {groupedSources[type].map((source) => (
                    <button
                      key={source.id}
                      onClick={() => setSelectedSource(source.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                        selectedSource === source.id
                          ? 'bg-gradient-to-r from-[#ff6b35] to-[#ff3d7f] text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: source.color }}
                      ></span>
                      <span className="truncate">{source.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
