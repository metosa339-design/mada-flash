'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Radio, Tv, Newspaper, Globe, ExternalLink, Play, Users } from 'lucide-react';
import { newsSources } from '@/data/sources';
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
  web: 'Médias Web'
};

const typeDescriptions = {
  journal: 'Presse écrite et quotidiens',
  tv: 'Chaînes de télévision nationales',
  radio: 'Stations de radio FM',
  web: 'Portails d\'information en ligne'
};

export default function SourcesSection() {
  const groupedSources = newsSources.reduce((acc, source) => {
    if (!acc[source.type]) acc[source.type] = [];
    acc[source.type].push(source);
    return acc;
  }, {} as Record<NewsSource['type'], NewsSource[]>);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="gradient-text">Nos Sources</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Mada-Flash.mg agrège l'actualité des principaux médias malgaches.
            Chaque information est sourcée et vérifiable.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
          >
            <div className="text-3xl font-bold gradient-text">{newsSources.length}</div>
            <div className="text-sm text-gray-500">Sources actives</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
          >
            <div className="text-3xl font-bold gradient-text">
              {groupedSources.tv?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Chaînes TV</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
          >
            <div className="text-3xl font-bold gradient-text">
              {groupedSources.journal?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Journaux</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
          >
            <div className="text-3xl font-bold gradient-text">24/7</div>
            <div className="text-sm text-gray-500">Veille continue</div>
          </motion.div>
        </div>

        {/* Sources by Type */}
        <div className="space-y-8">
          {(Object.keys(groupedSources) as NewsSource['type'][]).map((type, typeIndex) => {
            const Icon = typeIcons[type];
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: typeIndex * 0.1 }}
              >
                {/* Type Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{typeLabels[type]}</h3>
                    <p className="text-sm text-gray-500">{typeDescriptions[type]}</p>
                  </div>
                </div>

                {/* Sources Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedSources[type].map((source, index) => (
                    <motion.a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {/* Logo Placeholder */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                          style={{ background: source.color }}
                        >
                          {source.shortName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate group-hover:text-[#ff6b35] transition-colors">
                            {source.name}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {source.url.replace('https://', '').replace('http://', '')}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full text-gray-600">
            <Users className="w-5 h-5" />
            <span>Vous êtes un média malgache ?</span>
            <a href="mailto:contact@mada-flash.mg" className="font-semibold text-[#ff6b35] hover:underline">
              Contactez-nous
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
