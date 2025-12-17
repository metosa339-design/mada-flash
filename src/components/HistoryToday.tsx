'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ChevronDown, ChevronUp, Flag, History } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => {
    fetchTodayHistory();
  }, []);

  // Auto-rotate events every 8 seconds
  useEffect(() => {
    if (!data || data.events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % data.events.length);
    }, 8000);

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
      <div className="flex items-center gap-3 text-white animate-pulse">
        <div className="w-8 h-8 bg-white/20 rounded-full"></div>
        <div className="h-4 bg-white/20 rounded w-64"></div>
      </div>
    );
  }

  if (!data || data.events.length === 0) {
    return null;
  }

  const currentEvent = data.events[currentEventIndex];

  return (
    <div className="text-white">
      {/* Banner compact */}
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Icon */}
        <div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
          <History className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full">
              {data.date.formatted}
            </span>
            {currentEvent.isMadagascar && (
              <span className="text-xs font-medium bg-green-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flag className="w-3 h-3" />
                Madagascar
              </span>
            )}
            <span className="text-xs opacity-75">
              Il y a {calculateYearsAgo(currentEvent.year)} ans ({currentEvent.year})
            </span>
          </div>
          <p className="font-semibold truncate mt-1">
            {currentEvent.title}
          </p>
        </div>

        {/* Navigation dots */}
        {data.events.length > 1 && (
          <div className="flex gap-1 mx-2">
            {data.events.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentEventIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentEventIndex ? 'bg-white w-4' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Expand button */}
        <button className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Expanded view */}
      {isExpanded && (
        <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4 animate-in slide-in-from-top duration-300">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.events.map((event, idx) => (
              <article
                key={event.id}
                className={`p-3 rounded-lg transition-all cursor-pointer ${
                  idx === currentEventIndex
                    ? 'bg-white text-gray-900'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => setCurrentEventIndex(idx)}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    idx === currentEventIndex
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/20'
                  }`}>
                    {event.year}
                  </span>
                  {event.isMadagascar && (
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      idx === currentEventIndex
                        ? 'bg-green-500 text-white'
                        : 'bg-green-500/50'
                    }`}>
                      <Flag className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                  {event.title}
                </h3>

                {/* Description */}
                <p className={`text-xs line-clamp-2 ${
                  idx === currentEventIndex ? 'text-gray-600' : 'opacity-75'
                }`}>
                  {event.description}
                </p>

                {/* Location */}
                {event.location && (
                  <div className={`flex items-center gap-1 mt-2 text-xs ${
                    idx === currentEventIndex ? 'text-gray-500' : 'opacity-60'
                  }`}>
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-white/20 text-center text-xs opacity-75">
            {data.count} événement{data.count > 1 ? 's' : ''} historique{data.count > 1 ? 's' : ''} ce {data.date.formatted}
          </div>
        </div>
      )}
    </div>
  );
}
