'use client';

import { useState, useEffect } from 'react';
import { Header, Footer } from '@/components';
import { Mountain, MapPin, Globe, Award, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';

interface MiningResource {
  id: string;
  name: string;
  nameEn?: string;
  nameMg?: string;
  slug: string;
  type: string;
  subType?: string;
  description: string;
  descriptionEn?: string;
  region?: string;
  locations?: string;
  productionVolume?: string;
  exportValue?: string;
  worldRank?: number;
  percentWorld?: number;
  discoveryYear?: number;
  exploitationStart?: number;
  imageUrl?: string;
  operators?: string;
  environmentalImpact?: string;
  isFeatured: boolean;
}

const resourceTypeConfig: Record<string, { label: string; color: string; gradient: string }> = {
  precious_stone: { label: 'Pierres précieuses', color: 'text-purple-600', gradient: 'from-purple-500 to-pink-500' },
  mineral: { label: 'Minéraux', color: 'text-gray-600', gradient: 'from-gray-500 to-gray-700' },
  metal: { label: 'Métaux', color: 'text-amber-600', gradient: 'from-amber-500 to-orange-500' },
  energy: { label: 'Énergie', color: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500' },
};

export default function RessourcesPage() {
  const [resources, setResources] = useState<MiningResource[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/economy/resources');
      const data = await res.json();
      setResources(data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = selectedType
    ? resources.filter(r => r.type === selectedType)
    : resources;

  const byType = {
    precious_stone: resources.filter(r => r.type === 'precious_stone'),
    mineral: resources.filter(r => r.type === 'mineral'),
    metal: resources.filter(r => r.type === 'metal'),
    energy: resources.filter(r => r.type === 'energy'),
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <Mountain className="w-8 h-8" />
              <span className="text-gray-300 text-lg">Richesses du sous-sol</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Ressources Minières de Madagascar
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Saphirs, rubis, nickel, graphite et autres trésors qui font de Madagascar
              une destination majeure pour l'industrie minière mondiale.
            </p>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-2 py-4 overflow-x-auto">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  !selectedType
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Toutes ({resources.length})
              </button>
              {Object.entries(resourceTypeConfig).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedType === type
                      ? `bg-gradient-to-r ${config.gradient} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {config.label} ({byType[type as keyof typeof byType]?.length || 0})
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => {
                  const config = resourceTypeConfig[resource.type] || resourceTypeConfig.mineral;

                  return (
                    <div
                      key={resource.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
                    >
                      <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <span className={`text-xs font-medium ${config.color} uppercase tracking-wide`}>
                              {config.label}
                            </span>
                            {resource.subType && (
                              <span className="ml-2 text-xs text-gray-400">
                                • {resource.subType}
                              </span>
                            )}
                          </div>
                          <Mountain className="w-6 h-6 text-gray-300" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                          {resource.name}
                        </h3>

                        {resource.region && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <MapPin className="w-4 h-4" />
                            {resource.region}
                          </div>
                        )}

                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {resource.description}
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {resource.worldRank && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              #{resource.worldRank} mondial
                            </span>
                          )}
                          {resource.percentWorld && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {resource.percentWorld}% monde
                            </span>
                          )}
                        </div>

                        {resource.productionVolume && (
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Production:</span> {resource.productionVolume}
                          </div>
                        )}

                        {resource.discoveryYear && (
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Découverte:</span> {resource.discoveryYear}
                          </div>
                        )}

                        {resource.operators && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500">Exploitants:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {JSON.parse(resource.operators).slice(0, 2).map((op: string, i: number) => (
                                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {op}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Map Section Placeholder */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-gray-600" />
              Carte des ressources
            </h2>
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Carte interactive des gisements</p>
                <p className="text-sm">Visualisez la répartition des ressources minières</p>
              </div>
            </div>
          </div>
        </section>

        {/* Environmental Note */}
        <section className="py-12 bg-amber-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-amber-800 mb-3">
                Note sur l'exploitation minière
              </h3>
              <p className="text-gray-700">
                L'exploitation des ressources minières à Madagascar soulève d'importantes questions
                environnementales et sociales. La préservation de la biodiversité unique de l'île
                et le respect des communautés locales sont des enjeux majeurs pour un développement
                minier responsable.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="py-8 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between">
              <Link
                href="/economie"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
                Dashboard Économique
              </Link>
              <Link
                href="/decouvrir"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Découvrir Madagascar
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
