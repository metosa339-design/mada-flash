'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, ChevronRight, Flag } from 'lucide-react';

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
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    fetchTodayHistory();
  }, []);

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
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-amber-200 dark:bg-amber-800 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-amber-100 dark:bg-amber-800/50 rounded"></div>
          <div className="h-20 bg-amber-100 dark:bg-amber-800/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.events.length === 0) {
    return null; // Don't show if no events
  }

  return (
    <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-amber-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-500 rounded-xl text-white">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">
            Ce jour dans l'histoire
          </h2>
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            {data.date.formatted}
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {data.events.map((event) => (
          <article
            key={event.id}
            className={`relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md transition-all duration-300 ${
              expandedEvent === event.id ? 'ring-2 ring-amber-400' : ''
            } ${event.isMadagascar ? 'border-l-4 border-green-500' : ''}`}
          >
            {/* Madagascar Badge */}
            {event.isMadagascar && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                <Flag className="w-3 h-3" />
                Madagascar
              </div>
            )}

            <div
              className="p-4 cursor-pointer"
              onClick={() =>
                setExpandedEvent(expandedEvent === event.id ? null : event.id)
              }
            >
              {/* Year Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {event.year}
                </span>
                <span className="text-amber-600 dark:text-amber-400 text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Il y a {calculateYearsAgo(event.year)} ans
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 pr-24">
                {event.title}
              </h3>

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
              )}

              {/* Description - Expandable */}
              <p
                className={`text-gray-600 dark:text-gray-300 text-sm ${
                  expandedEvent === event.id ? '' : 'line-clamp-2'
                }`}
              >
                {event.description}
              </p>

              {/* Expand indicator */}
              <div className="flex items-center justify-end mt-2 text-amber-500">
                <ChevronRight
                  className={`w-5 h-5 transition-transform ${
                    expandedEvent === event.id ? 'rotate-90' : ''
                  }`}
                />
              </div>

              {/* Source */}
              {expandedEvent === event.id && event.source && (
                <p className="text-xs text-gray-400 mt-2 italic">
                  Source: {event.source}
                </p>
              )}
            </div>

            {/* Image if available */}
            {event.imageUrl && expandedEvent === event.id && (
              <div className="px-4 pb-4">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-sm text-amber-600 dark:text-amber-400">
        {data.count} événement{data.count > 1 ? 's' : ''} historique
        {data.count > 1 ? 's' : ''} ce jour
      </div>
    </section>
  );
}
