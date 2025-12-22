'use client';

import React, { useState, useEffect } from 'react';
import { Header, Footer } from '@/components';
import {
  Leaf,
  Bird,
  TreePine,
  Landmark,
  Music,
  ChefHat,
  Sparkles,
  MapPin,
  ChevronRight,
  Filter,
  Star,
  Globe
} from 'lucide-react';
import Link from 'next/link';

interface FamousThing {
  id: string;
  name: string;
  nameEn?: string;
  nameMg?: string;
  slug: string;
  category: string;
  description: string;
  shortDesc?: string;
  scientificName?: string;
  endemic: boolean;
  conservationStatus?: string;
  region?: string;
  location?: string;
  imageUrl?: string;
  videoUrl?: string;
  funFacts?: string;
  worldRecognition?: string;
  isFeatured: boolean;
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string; gradient: string }> = {
  fauna: { label: 'Faune', icon: <Bird className="w-5 h-5" />, color: 'text-orange-600', gradient: 'from-orange-500 to-red-500' },
  flora: { label: 'Flore', icon: <TreePine className="w-5 h-5" />, color: 'text-green-600', gradient: 'from-green-500 to-emerald-500' },
  culture: { label: 'Culture', icon: <Music className="w-5 h-5" />, color: 'text-purple-600', gradient: 'from-purple-500 to-pink-500' },
  landmark: { label: 'Sites', icon: <Landmark className="w-5 h-5" />, color: 'text-blue-600', gradient: 'from-blue-500 to-cyan-500' },
  tradition: { label: 'Traditions', icon: <Sparkles className="w-5 h-5" />, color: 'text-amber-600', gradient: 'from-amber-500 to-yellow-500' },
  cuisine: { label: 'Cuisine', icon: <ChefHat className="w-5 h-5" />, color: 'text-red-600', gradient: 'from-red-500 to-orange-500' },
};

export default function DecouvrirPage() {
  const [items, setItems] = useState<FamousThing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showEndemicOnly, setShowEndemicOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/discover/famous');
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  let filteredItems = selectedCategory
    ? items.filter(i => i.category === selectedCategory)
    : items;

  if (showEndemicOnly) {
    filteredItems = filteredItems.filter(i => i.endemic);
  }

  const endemicCount = items.filter(i => i.endemic).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <Leaf className="w-8 h-8" />
              <span className="text-green-200 text-lg">Découvrir Madagascar</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Ce qui rend Madagascar unique
            </h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Faune endémique, flore exceptionnelle, culture riche et traditions millénaires.
              Explorez les trésors de la Grande Île.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <div className="bg-white/20 backdrop-blur rounded-lg px-5 py-3">
                <div className="text-2xl font-bold">{items.length}</div>
                <div className="text-green-100 text-sm">Éléments</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg px-5 py-3">
                <div className="text-2xl font-bold">{endemicCount}</div>
                <div className="text-green-100 text-sm">Endémiques</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg px-5 py-3">
                <div className="text-2xl font-bold">90%</div>
                <div className="text-green-100 text-sm">Biodiversité unique</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 py-4 overflow-x-auto">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  !selectedCategory
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Tout
              </button>

              {Object.entries(categoryConfig).map(([cat, config]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCategory === cat
                      ? `bg-gradient-to-r ${config.gradient} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {config.icon}
                  {config.label}
                </button>
              ))}

              <div className="border-l border-gray-200 h-6 mx-2" />

              <button
                onClick={() => setShowEndemicOnly(!showEndemicOnly)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  showEndemicOnly
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Star className="w-4 h-4" />
                Endémiques seulement
              </button>
            </div>
          </div>
        </section>

        {/* Items Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const config = categoryConfig[item.category] || categoryConfig.culture;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
                    >
                      {item.imageUrl ? (
                        <div className="h-48 bg-gray-200 overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className={`h-48 bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                          <div className="text-white/50 text-6xl">
                            {config.icon}
                          </div>
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color} bg-gray-100`}>
                            {config.icon}
                            {config.label}
                          </span>
                          {item.endemic && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Endémique
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {item.name}
                        </h3>

                        {item.nameMg && (
                          <p className="text-sm text-gray-500 italic mb-2">
                            {item.nameMg}
                          </p>
                        )}

                        {item.scientificName && (
                          <p className="text-xs text-gray-400 italic mb-2">
                            {item.scientificName}
                          </p>
                        )}

                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {item.shortDesc || item.description}
                        </p>

                        {item.region && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <MapPin className="w-4 h-4" />
                            {item.region}
                          </div>
                        )}

                        {item.conservationStatus && (
                          <span className={`px-2 py-1 text-xs rounded ${
                            item.conservationStatus.includes('danger')
                              ? 'bg-red-100 text-red-700'
                              : item.conservationStatus.includes('vulnérable')
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.conservationStatus}
                          </span>
                        )}

                        {item.worldRecognition && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Globe className="w-4 h-4" />
                              {item.worldRecognition}
                            </div>
                          </div>
                        )}

                        {item.funFacts && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">Le saviez-vous?</p>
                            <p className="text-sm text-gray-600">
                              {JSON.parse(item.funFacts)[0]}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Aucun élément trouvé
                </h3>
                <p className="text-gray-500">
                  Essayez de modifier vos filtres.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Biodiversity Stats */}
        <section className="py-12 bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Madagascar, hotspot de biodiversité
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">90%</div>
                <div className="text-green-100">Espèces endémiques</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">100+</div>
                <div className="text-green-100">Espèces de lémuriens</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">12 000</div>
                <div className="text-green-100">Espèces végétales</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">5ème</div>
                <div className="text-green-100">Plus grande île du monde</div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Links */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/histoire"
                className="group bg-amber-50 rounded-xl p-6 hover:bg-amber-100 transition-all"
              >
                <Landmark className="w-10 h-10 text-amber-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600">
                  Histoire de Madagascar
                </h3>
                <p className="text-gray-600 text-sm">
                  Des premiers peuplements à l'époque contemporaine.
                </p>
                <ChevronRight className="w-6 h-6 mt-4 text-gray-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/economie"
                className="group bg-green-50 rounded-xl p-6 hover:bg-green-100 transition-all"
              >
                <Leaf className="w-10 h-10 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600">
                  Économie
                </h3>
                <p className="text-gray-600 text-sm">
                  Vanille, épices et richesses de Madagascar.
                </p>
                <ChevronRight className="w-6 h-6 mt-4 text-gray-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/politique"
                className="group bg-blue-50 rounded-xl p-6 hover:bg-blue-100 transition-all"
              >
                <Music className="w-10 h-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                  Dirigeants
                </h3>
                <p className="text-gray-600 text-sm">
                  Rois, reines et présidents de Madagascar.
                </p>
                <ChevronRight className="w-6 h-6 mt-4 text-gray-400 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
