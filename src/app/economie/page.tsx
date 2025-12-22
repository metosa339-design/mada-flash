'use client';

import { useState, useEffect } from 'react';
import { Header, Footer } from '@/components';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Package,
  Mountain,
  Leaf,
  ChevronRight,
  Globe,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface EconomicIndicator {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  type: string;
  currentValue?: number;
  previousValue?: number;
  unit: string;
  change?: number;
  trend?: string;
  category?: string;
  description?: string;
}

interface ExportProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  annualExportValue?: number;
  percentOfExports?: number;
  worldRank?: number;
  trend?: string;
  isFeatured: boolean;
}

interface MiningResource {
  id: string;
  name: string;
  slug: string;
  type: string;
  subType?: string;
  description: string;
  region?: string;
  worldRank?: number;
  percentWorld?: number;
  isFeatured: boolean;
}

const TrendIcon = ({ trend }: { trend?: string }) => {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
};

const formatValue = (value: number | undefined, unit: string): string => {
  if (value === undefined) return '-';
  if (unit === 'milliards USD') return `$${value}B`;
  if (unit === 'USD/kg') return `$${value}/kg`;
  if (unit === '%') return `${value}%`;
  if (unit === 'MGA') return `${value.toLocaleString()} Ar`;
  if (unit === 'MGA/kg') return `${value.toLocaleString()} Ar/kg`;
  return `${value.toLocaleString()} ${unit}`;
};

export default function EconomiePage() {
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [exports, setExports] = useState<ExportProduct[]>([]);
  const [resources, setResources] = useState<MiningResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [indicatorsRes, exportsRes, resourcesRes] = await Promise.all([
        fetch('/api/economy/indicators'),
        fetch('/api/economy/exports'),
        fetch('/api/economy/resources'),
      ]);

      const indicatorsData = await indicatorsRes.json();
      const exportsData = await exportsRes.json();
      const resourcesData = await resourcesRes.json();

      setIndicators(indicatorsData.indicators || []);
      setExports(exportsData.products || []);
      setResources(resourcesData.resources || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const featuredExports = exports.filter(e => e.isFeatured);
  const featuredResources = resources.filter(r => r.isFeatured);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-700 via-emerald-600 to-teal-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8" />
              <span className="text-green-200 text-lg">Dashboard Économique</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Économie de Madagascar
            </h1>
            <p className="text-xl text-green-100 max-w-2xl">
              Indicateurs économiques, exportations principales et ressources minières
              de la Grande Île.
            </p>
          </div>
        </section>

        {/* Economic Indicators */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Indicateurs économiques
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {indicators.map((indicator) => (
                  <div
                    key={indicator.id}
                    className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-600">
                        {indicator.name}
                      </h3>
                      <TrendIcon trend={indicator.trend} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {formatValue(indicator.currentValue, indicator.unit)}
                    </div>
                    {indicator.change !== undefined && indicator.change !== null && (
                      <div className={`text-sm ${indicator.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {indicator.change >= 0 ? '+' : ''}{indicator.change}%
                      </div>
                    )}
                    {indicator.description && (
                      <p className="text-xs text-gray-500 mt-2">
                        {indicator.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Export Products */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-amber-600" />
                Produits d'exportation
              </h2>
              <Link
                href="/economie/exports"
                className="text-amber-600 hover:text-amber-700 flex items-center gap-1 text-sm font-medium"
              >
                Voir tous
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredExports.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                          {product.category}
                        </span>
                        {product.worldRank && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            #{product.worldRank} mondial
                          </span>
                        )}
                      </div>
                      <TrendIcon trend={product.trend} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    {product.annualExportValue && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Valeur export annuelle</span>
                          <span className="font-bold text-green-600">
                            ${(product.annualExportValue / 1000000).toFixed(0)}M
                          </span>
                        </div>
                        {product.percentOfExports && (
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-500">% des exportations</span>
                            <span className="font-medium">{product.percentOfExports}%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mining Resources */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Mountain className="w-6 h-6 text-gray-600" />
                Ressources minières
              </h2>
              <Link
                href="/ressources"
                className="text-gray-600 hover:text-gray-700 flex items-center gap-1 text-sm font-medium"
              >
                Voir toutes
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredResources.map((resource) => (
                <Link
                  key={resource.id}
                  href={`/ressources?slug=${resource.slug}`}
                  className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl p-5 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Mountain className="w-5 h-5 text-gray-500" />
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {resource.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {resource.name}
                  </h3>
                  {resource.region && (
                    <p className="text-sm text-gray-500 mb-2">
                      {resource.region}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    {resource.worldRank && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        #{resource.worldRank} mondial
                      </span>
                    )}
                    {resource.percentWorld && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {resource.percentWorld}% monde
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Madagascar en chiffres
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {exports.length}
                </div>
                <div className="text-green-100">Produits d'export</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {resources.length}
                </div>
                <div className="text-green-100">Ressources minières</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  #1
                </div>
                <div className="text-green-100">Producteur de vanille</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  80%
                </div>
                <div className="text-green-100">Vanille mondiale</div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Links */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/ressources"
                className="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all"
              >
                <Mountain className="w-10 h-10 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600">
                  Ressources minières
                </h3>
                <p className="text-gray-600 text-sm">
                  Saphirs, nickel, graphite et autres richesses du sous-sol malgache.
                </p>
                <ChevronRight className="w-6 h-6 mt-4 text-gray-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/decouvrir"
                className="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all"
              >
                <Leaf className="w-10 h-10 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600">
                  Biodiversité unique
                </h3>
                <p className="text-gray-600 text-sm">
                  Lémuriens, baobabs et espèces endémiques de Madagascar.
                </p>
                <ChevronRight className="w-6 h-6 mt-4 text-gray-400 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                href="/histoire"
                className="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all"
              >
                <Globe className="w-10 h-10 text-amber-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600">
                  Histoire économique
                </h3>
                <p className="text-gray-600 text-sm">
                  L'évolution économique de Madagascar à travers les siècles.
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
