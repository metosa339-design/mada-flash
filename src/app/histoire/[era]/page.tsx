'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header, Footer } from '@/components';
import { Clock, Calendar, ChevronLeft, ChevronRight, User, Flag, BookOpen } from 'lucide-react';
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
  events: HistoricalEvent[];
  figures: HistoricalFigure[];
}

interface HistoricalEvent {
  id: string;
  title: string;
  year: number;
  description: string;
  eventType: string;
  importance: number;
  location?: string;
}

interface HistoricalFigure {
  id: string;
  name: string;
  title?: string;
  slug: string;
  role: string;
  birthYear?: number;
  deathYear?: number;
  shortBio?: string;
  imageUrl?: string;
}

export default function EraDetailPage() {
  const params = useParams();
  const eraSlug = params.era as string;

  const [era, setEra] = useState<HistoricalEra | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eraSlug) {
      fetchEra();
    }
  }, [eraSlug]);

  const fetchEra = async () => {
    try {
      const res = await fetch(`/api/history/timeline?era=${eraSlug}`);
      const data = await res.json();
      setEra(data);
    } catch (error) {
      console.error('Error fetching era:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!era) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Époque non trouvée</h1>
            <Link href="/histoire" className="text-amber-600 hover:underline">
              Retour à l'histoire
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="text-white py-16"
          style={{ backgroundColor: era.color }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <Link
              href="/histoire"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour à la timeline
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-8 h-8" />
              <span className="text-white/80 text-lg">
                {era.startYear} - {era.endYear || 'présent'}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {era.name}
            </h1>

            {era.nameMg && (
              <p className="text-xl text-white/80 mb-2">
                {era.nameMg}
              </p>
            )}

            <p className="text-lg text-white/90 max-w-3xl mt-6">
              {era.description}
            </p>

            <div className="flex gap-6 mt-8">
              <div className="bg-white/20 backdrop-blur rounded-lg px-6 py-4">
                <div className="text-3xl font-bold">{era.events?.length || 0}</div>
                <div className="text-white/80">Événements</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg px-6 py-4">
                <div className="text-3xl font-bold">{era.figures?.length || 0}</div>
                <div className="text-white/80">Personnages</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg px-6 py-4">
                <div className="text-3xl font-bold">
                  {(era.endYear || new Date().getFullYear()) - era.startYear}
                </div>
                <div className="text-white/80">Années</div>
              </div>
            </div>
          </div>
        </section>

        {/* Historical Figures */}
        {era.figures && era.figures.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <User className="w-6 h-6" style={{ color: era.color }} />
                Personnages de cette époque
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {era.figures.map((figure) => (
                  <div
                    key={figure.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
                  >
                    <div
                      className="h-2"
                      style={{ backgroundColor: era.color }}
                    />
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {figure.imageUrl ? (
                          <img
                            src={figure.imageUrl}
                            alt={figure.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                            style={{ backgroundColor: era.color }}
                          >
                            {figure.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {figure.title && (
                              <span className="text-gray-500 text-sm mr-2">
                                {figure.title}
                              </span>
                            )}
                            {figure.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {figure.role}
                            {figure.birthYear && (
                              <span className="ml-2">
                                ({figure.birthYear}
                                {figure.deathYear ? ` - ${figure.deathYear}` : ''})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {figure.shortBio && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                          {figure.shortBio}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Events Timeline */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <BookOpen className="w-6 h-6" style={{ color: era.color }} />
              Événements de cette période
            </h2>

            {era.events && era.events.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div
                  className="absolute left-4 top-0 bottom-0 w-1 rounded-full"
                  style={{ backgroundColor: era.color }}
                />

                <div className="space-y-6">
                  {era.events
                    .sort((a, b) => a.year - b.year)
                    .map((event) => (
                      <div key={event.id} className="relative pl-12">
                        {/* Timeline dot */}
                        <div
                          className="absolute left-2 top-6 w-5 h-5 rounded-full border-4 border-white shadow"
                          style={{ backgroundColor: era.color }}
                        />

                        <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className="text-lg font-bold"
                              style={{ color: era.color }}
                            >
                              {event.year}
                            </span>
                            {event.location && (
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Flag className="w-3 h-3" />
                                {event.location}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {event.title}
                          </h3>
                          <p className="text-gray-600">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucun événement enregistré pour cette période.
              </p>
            )}
          </div>
        </section>

        {/* Navigation */}
        <section className="py-8 bg-white border-t">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between">
              <Link
                href="/histoire"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Toutes les époques
              </Link>
              <Link
                href="/politique"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
              >
                Voir les dirigeants
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
