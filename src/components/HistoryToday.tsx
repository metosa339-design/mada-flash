'use client';

import { useState, useEffect } from 'react';
import { Calendar, Flag, History, Sparkles } from 'lucide-react';

interface HistoricalEvent {
  id: string;
  day: number;
  month: number;
  year: number;
  title: string;
  description: string;
  location: string | null;
  isMadagascar: boolean;
  imageUrl: string | null;
  source: string | null;
}

interface HistoryData {
  date: {
    day: number;
    month: number;
    formatted: string;
  };
  events: HistoricalEvent[];
  count: number;
}

export default function HistoryToday() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => {
    fetchTodayHistory();
  }, []);

  // Auto-rotate events every 6 seconds
  useEffect(() => {
    if (!data || data.events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % data.events.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [data]);

  const fetchTodayHistory = async () => {
    try {
      const response = await fetch('/api/history/today');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateYearsAgo = (year: number) => {
    const currentYear = new Date().getFullYear();
    return currentYear - year;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-white/80 animate-pulse">
        <History className="w-4 h-4" />
        <span className="text-sm">Chargement...</span>
      </div>
    );
  }

  if (!data || data.events.length === 0) {
    return null;
  }

  const currentEvent = data.events[currentEventIndex];

  return (
    <div className="relative overflow-hidden">
      {/* Ticker Banner */}
      <div className="flex items-center gap-3 py-2">
        {/* Label fixe */}
        <div className="flex-shrink-0 flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="text-sm font-bold text-white whitespace-nowrap">
            Ce jour dans l'histoire
          </span>
        </div>

        {/* Séparateur */}
        <div className="w-px h-6 bg-white/30"></div>

        {/* Contenu défilant */}
        <div className="flex-1 overflow-hidden">
          <div
            key={currentEventIndex}
            className="flex items-center gap-3 animate-fade-in"
          >
            {/* Badge année */}
            <span className="flex-shrink-0 bg-white text-amber-600 font-bold text-sm px-2.5 py-1 rounded-full">
              {currentEvent.year}
            </span>

            {/* Badge Madagascar si applicable */}
            {currentEvent.isMadagascar && (
              <span className="flex-shrink-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Flag className="w-3 h-3" />
                Madagascar
              </span>
            )}

            {/* Titre de l'événement */}
            <span className="text-white font-medium truncate">
              {currentEvent.title}
            </span>

            {/* Info temps */}
            <span className="flex-shrink-0 text-white/70 text-sm whitespace-nowrap">
              (il y a {calculateYearsAgo(currentEvent.year)} ans)
            </span>
          </div>
        </div>

        {/* Indicateur de progression */}
        {data.events.length > 1 && (
          <div className="flex-shrink-0 flex items-center gap-1">
            {data.events.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentEventIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentEventIndex
                    ? 'bg-white w-6'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Événement ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Barre de progression animée */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
        <div
          key={`progress-${currentEventIndex}`}
          className="h-full bg-white/60 animate-progress"
          style={{ animationDuration: '6s' }}
        ></div>
      </div>

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-progress {
          animation: progress linear forwards;
        }
      `}</style>
    </div>
  );
}
