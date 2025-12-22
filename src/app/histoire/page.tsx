'use client';

import React, { useState, useEffect } from 'react';
import { Header, Footer } from '@/components';
import { Clock, Calendar, ChevronRight, MapPin, Users, Crown, Flag } from 'lucide-react';
import Link from 'next/link';

interface HistoricalEra {
  id: string;
  name: string;
  nameMg?: string;
  nameEn?: string;
  slug: string;
  description: string;
  startYear: number;
  endYear?: number;
  color: string;
  icon?: string;
  imageUrl?: string;
  _count?: {
    events: number;
    figures: number;
  };
}

interface HistoricalEvent {
  id: string;
  title: string;
  year: number;
  description: string;
  eventType: string;
  importance: number;
  isFeatured: boolean;
  era?: {
    name: string;
    slug: string;
    color: string;
  };
}

const eventTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  political: { label: 'Politique', icon: <Flag className="w-4 h-4" />, color: 'bg-blue-500' },
  economic: { label: 'Économie', icon: <MapPin className="w-4 h-4" />, color: 'bg-green-500' },
  social: { label: 'Social', icon: <Users className="w-4 h-4" />, color: 'bg-purple-500' },
  cultural: { label: 'Culture', icon: <Crown className="w-4 h-4" />, color: 'bg-yellow-500' },
  discovery: { label: 'Découverte', icon: <MapPin className="w-4 h-4" />, color: 'bg-cyan-500' },
  conflict: { label: 'Conflit', icon: <Flag className="w-4 h-4" />, color: 'bg-red-500' },
  independence: { label: 'Indépendance', icon: <Flag className="w-4 h-4" />, color: 'bg-emerald-500' },
};

export default function HistoirePage() {
  const [eras, setEras] = useState<HistoricalEra[]>([]);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [erasRes, eventsRes] = await Promise.all([
        fetch('/api/history/timeline'),
        fetch('/api/history/events?featured=true&limit=20'),
      ]);

      const erasData = await erasRes.json();
      const eventsData = await eventsRes.json();

      setEras(erasData.eras || []);
      setEvents(eventsData.events || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = selectedEra
    ? events.filter(e => e.era?.slug === selectedEra)
    : events;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-amber-600 via-orange-500 to-red-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-8 h-8" />
              <span className="text-amber-200 text-lg">Frise Chronologique</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Histoire de Madagascar
            </h1>
            <p className="text-xl text-amber-100 max-w-2xl">
              Découvrez l'histoire fascinante de la Grande Île, depuis les premiers peuplements
              austronésiens jusqu'à l'époque contemporaine.
            </p>
          </div>
        </section>

        {/* Timeline Navigation */}
        <section className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedEra(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  !selectedEra
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes les époques
              </button>
              {eras.map((era) => (
                <button
                  key={era.id}
                  onClick={() => setSelectedEra(era.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedEra === era.slug
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedEra === era.slug ? era.color : undefined,
                  }}
                >
                  <span>{era.name}</span>
                  <span className="text-xs opacity-75">
                    {era.startYear}-{era.endYear || 'présent'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Eras Grid */}
        {!selectedEra && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-amber-500" />
                Les grandes époques
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {eras.map((era) => (
                  <Link
                    key={era.id}
                    href={`/histoire/${era.slug}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100"
                  >
                    <div
                      className="h-3"
                      style={{ backgroundColor: era.color }}
                    />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: era.color }}
                        >
                          {era.startYear} - {era.endYear || 'présent'}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                        {era.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {era.description}
                      </p>
                      {era._count && (
                        <div className="flex gap-4 mt-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {era._count.events} événements
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {era._count.figures} personnages
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Timeline Events */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <Clock className="w-6 h-6 text-amber-500" />
              {selectedEra
                ? `Événements: ${eras.find(e => e.slug === selectedEra)?.name}`
                : 'Événements majeurs'}
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 via-orange-500 to-red-500 transform md:-translate-x-1/2" />

                {/* Events */}
                <div className="space-y-8">
                  {filteredEvents.map((event, index) => {
                    const typeInfo = eventTypeLabels[event.eventType] || eventTypeLabels.political;
                    const isLeft = index % 2 === 0;

                    return (
                      <div
                        key={event.id}
                        className={`relative flex items-center ${
                          isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                        }`}
                      >
                        {/* Timeline dot */}
                        <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-white border-4 border-amber-500 transform md:-translate-x-1/2 z-10" />

                        {/* Content */}
                        <div className={`ml-12 md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                          <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-2 mb-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1 ${typeInfo.color}`}
                              >
                                {typeInfo.icon}
                                {typeInfo.label}
                              </span>
                              <span className="text-sm font-bold text-amber-600">
                                {event.year}
                              </span>
                              {event.era && (
                                <span
                                  className="px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: `${event.era.color}20`,
                                    color: event.era.color,
                                  }}
                                >
                                  {event.era.name}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {event.description}
                            </p>
                            {event.importance >= 4 && (
                              <div className="mt-3 flex items-center gap-1">
                                {[...Array(event.importance)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-amber-400"
                                  />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">
                                  Importance majeure
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Explorer plus
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/politique"
                className="group bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-6 hover:shadow-xl transition-all"
              >
                <Crown className="w-10 h-10 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Dirigeants politiques</h3>
                <p className="text-blue-100 text-sm">
                  Rois, reines et présidents de Madagascar
                </p>
                <ChevronRight className="w-6 h-6 mt-4 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/economie"
                className="group bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl p-6 hover:shadow-xl transition-all"
              >
                <MapPin className="w-10 h-10 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Économie</h3>
                <p className="text-green-100 text-sm">
                  Ressources, exportations et indicateurs
                </p>
                <ChevronRight className="w-6 h-6 mt-4 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/decouvrir"
                className="group bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-6 hover:shadow-xl transition-all"
              >
                <Users className="w-10 h-10 mb-4 opacity-80" />
                <h3 className="text-xl font-bold mb-2">Découvrir Madagascar</h3>
                <p className="text-amber-100 text-sm">
                  Faune, flore, culture et traditions
                </p>
                <ChevronRight className="w-6 h-6 mt-4 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
