'use client';

import React, { useState, useEffect } from 'react';
import { Header, Footer } from '@/components';
import { Crown, User, Calendar, ChevronRight, Flag, Building } from 'lucide-react';
import Link from 'next/link';

interface PoliticalLeader {
  id: string;
  name: string;
  slug: string;
  title: string;
  startYear: number;
  endYear?: number;
  biography: string;
  shortBio?: string;
  birthYear?: number;
  deathYear?: number;
  type: string;
  dynasty?: string;
  party?: string;
  imageUrl?: string;
  majorEvents?: string;
  achievements?: string;
}

const leaderTypeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  monarch: { label: 'Monarchie', color: 'bg-amber-500', icon: <Crown className="w-5 h-5" /> },
  president: { label: 'Présidence', color: 'bg-blue-600', icon: <Building className="w-5 h-5" /> },
  colonial: { label: 'Colonial', color: 'bg-gray-600', icon: <Flag className="w-5 h-5" /> },
  prime_minister: { label: 'Premier Ministre', color: 'bg-green-600', icon: <User className="w-5 h-5" /> },
};

export default function PolitiquePage() {
  const [leaders, setLeaders] = useState<PoliticalLeader[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const res = await fetch('/api/history/leaders');
      const data = await res.json();
      setLeaders(data.leaders || []);
    } catch (error) {
      console.error('Error fetching leaders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaders = selectedType
    ? leaders.filter(l => l.type === selectedType)
    : leaders;

  const monarchs = leaders.filter(l => l.type === 'monarch');
  const presidents = leaders.filter(l => l.type === 'president');
  const colonial = leaders.filter(l => l.type === 'colonial');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-8 h-8" />
              <span className="text-blue-200 text-lg">Histoire Politique</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Dirigeants de Madagascar
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl">
              Des rois Merina aux présidents de la République, découvrez ceux qui ont
              façonné l'histoire politique de Madagascar.
            </p>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-2 py-4 overflow-x-auto">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  !selectedType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous ({leaders.length})
              </button>
              <button
                onClick={() => setSelectedType('monarch')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedType === 'monarch'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Crown className="w-4 h-4" />
                Monarchie ({monarchs.length})
              </button>
              <button
                onClick={() => setSelectedType('president')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedType === 'president'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Building className="w-4 h-4" />
                Présidents ({presidents.length})
              </button>
              <button
                onClick={() => setSelectedType('colonial')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedType === 'colonial'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Flag className="w-4 h-4" />
                Période coloniale ({colonial.length})
              </button>
            </div>
          </div>
        </section>

        {/* Leaders Timeline */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 via-gray-500 to-blue-600 transform md:-translate-x-1/2" />

                <div className="space-y-8">
                  {filteredLeaders.map((leader, index) => {
                    const config = leaderTypeConfig[leader.type] || leaderTypeConfig.president;
                    const isLeft = index % 2 === 0;

                    return (
                      <div
                        key={leader.id}
                        className={`relative flex items-start ${
                          isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                        }`}
                      >
                        {/* Timeline marker */}
                        <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 z-10">
                          <div className={`w-6 h-6 rounded-full ${config.color} flex items-center justify-center text-white shadow-lg`}>
                            {config.icon}
                          </div>
                        </div>

                        {/* Content */}
                        <div className={`ml-16 md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all">
                            <div className={`h-2 ${config.color}`} />
                            <div className="p-5">
                              <div className="flex items-start gap-4">
                                {leader.imageUrl ? (
                                  <img
                                    src={leader.imageUrl}
                                    alt={leader.name}
                                    className="w-20 h-20 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className={`w-20 h-20 rounded-lg ${config.color} flex items-center justify-center text-white text-2xl font-bold`}>
                                    {leader.name.charAt(0)}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-xs text-white ${config.color}`}>
                                      {leader.title}
                                    </span>
                                    <span className="text-sm font-medium text-gray-500">
                                      {leader.startYear} - {leader.endYear || 'présent'}
                                    </span>
                                  </div>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {leader.name}
                                  </h3>
                                  {leader.dynasty && (
                                    <p className="text-sm text-amber-600">
                                      Dynastie {leader.dynasty}
                                    </p>
                                  )}
                                  {leader.party && (
                                    <p className="text-sm text-blue-600">
                                      {leader.party}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <p className="text-gray-600 mt-4 line-clamp-3">
                                {leader.shortBio || leader.biography}
                              </p>

                              {leader.majorEvents && (
                                <div className="mt-4">
                                  <p className="text-xs text-gray-500 mb-2">Événements majeurs:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {JSON.parse(leader.majorEvents).slice(0, 3).map((event: string, i: number) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                      >
                                        {event}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {leader.birthYear && (
                                <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {leader.birthYear}
                                    {leader.deathYear ? ` - ${leader.deathYear}` : ''}
                                  </span>
                                </div>
                              )}
                            </div>
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

        {/* Quick Stats */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              En chiffres
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-amber-50 rounded-xl p-6 text-center">
                <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-amber-600">{monarchs.length}</div>
                <div className="text-gray-600">Rois et Reines</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600">{presidents.length}</div>
                <div className="text-gray-600">Présidents</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600">
                  {monarchs.length > 0 ? monarchs[monarchs.length - 1]?.endYear! - monarchs[0]?.startYear : 0}
                </div>
                <div className="text-gray-600">Années de monarchie</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <Flag className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600">
                  {new Date().getFullYear() - 1960}
                </div>
                <div className="text-gray-600">Années d'indépendance</div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="py-8 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between">
              <Link
                href="/histoire"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
                Histoire de Madagascar
              </Link>
              <Link
                href="/economie"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                Économie
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
