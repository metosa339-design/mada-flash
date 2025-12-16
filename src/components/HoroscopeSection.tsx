'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Briefcase, Activity, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { zodiacSigns, generateDailyHoroscope, type ZodiacSign, type DailyHoroscope } from '@/data/horoscope';

const elementColors = {
  feu: 'from-red-500 to-orange-500',
  terre: 'from-green-600 to-emerald-500',
  air: 'from-blue-400 to-cyan-400',
  eau: 'from-blue-600 to-purple-500',
};

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export default function HoroscopeSection() {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign>(zodiacSigns[0]);
  const [scrollIndex, setScrollIndex] = useState(0);

  const horoscope = useMemo(() => {
    return generateDailyHoroscope(selectedSign.id);
  }, [selectedSign.id]);

  const visibleSigns = 6;
  const canScrollLeft = scrollIndex > 0;
  const canScrollRight = scrollIndex < zodiacSigns.length - visibleSigns;

  const handleScrollLeft = () => {
    if (canScrollLeft) setScrollIndex(scrollIndex - 1);
  };

  const handleScrollRight = () => {
    if (canScrollRight) setScrollIndex(scrollIndex + 1);
  };

  return (
    <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Horoscope du Jour</h2>
            <p className="text-sm text-white/70">
              {new Date().toLocaleDateString('fr-MG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      {/* Zodiac Signs Carousel */}
      <div className="relative mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleScrollLeft}
            disabled={!canScrollLeft}
            className={`p-1 rounded-full ${canScrollLeft ? 'bg-white/20 hover:bg-white/30' : 'opacity-30 cursor-not-allowed'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 overflow-hidden">
            <motion.div
              className="flex gap-2"
              animate={{ x: -scrollIndex * 70 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {zodiacSigns.map((sign) => (
                <button
                  key={sign.id}
                  onClick={() => setSelectedSign(sign)}
                  className={`flex-shrink-0 w-16 p-2 rounded-xl text-center transition-all ${
                    selectedSign.id === sign.id
                      ? `bg-gradient-to-br ${elementColors[sign.element]} shadow-lg scale-105`
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">{sign.symbol}</div>
                  <div className="text-[10px] font-medium truncate">{sign.name}</div>
                </button>
              ))}
            </motion.div>
          </div>

          <button
            onClick={handleScrollRight}
            disabled={!canScrollRight}
            className={`p-1 rounded-full ${canScrollRight ? 'bg-white/20 hover:bg-white/30' : 'opacity-30 cursor-not-allowed'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Selected Sign Info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSign.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Sign Header */}
          <div className="flex items-center gap-4 mb-4 p-4 bg-white/10 rounded-xl">
            <div className={`text-5xl p-3 rounded-xl bg-gradient-to-br ${elementColors[selectedSign.element]}`}>
              {selectedSign.symbol}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{selectedSign.name}</h3>
              <p className="text-sm text-white/70">{selectedSign.nameMg} - {selectedSign.dateRange}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-gradient-to-r ${elementColors[selectedSign.element]}`}>
                Élément: {selectedSign.element}
              </span>
            </div>
          </div>

          {/* Horoscope Categories */}
          <div className="grid grid-cols-2 gap-3">
            {/* Amour */}
            <div className="p-4 bg-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span className="font-semibold text-sm">Amour</span>
                </div>
                <StarRating score={horoscope.love.score} />
              </div>
              <p className="text-xs text-white/80 leading-relaxed">{horoscope.love.message}</p>
            </div>

            {/* Travail */}
            <div className="p-4 bg-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-sm">Travail</span>
                </div>
                <StarRating score={horoscope.work.score} />
              </div>
              <p className="text-xs text-white/80 leading-relaxed">{horoscope.work.message}</p>
            </div>

            {/* Santé */}
            <div className="p-4 bg-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-sm">Santé</span>
                </div>
                <StarRating score={horoscope.health.score} />
              </div>
              <p className="text-xs text-white/80 leading-relaxed">{horoscope.health.message}</p>
            </div>

            {/* Chance */}
            <div className="p-4 bg-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-sm">Chance</span>
                </div>
                <StarRating score={horoscope.luck.score} />
              </div>
              <p className="text-xs text-white/80 leading-relaxed">{horoscope.luck.message}</p>
            </div>
          </div>

          {/* Lucky Info */}
          <div className="mt-4 p-3 bg-white/5 rounded-xl flex items-center justify-around text-sm">
            <div className="text-center">
              <span className="text-white/60 text-xs">Numéros</span>
              <div className="font-bold text-yellow-400">{horoscope.luckyNumbers.join(' - ')}</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <span className="text-white/60 text-xs">Couleur</span>
              <div className="font-bold capitalize">{horoscope.luckyColor}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
