'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Menu,
  X,
  Search,
  Bell,
  TrendingUp,
  Clock,
  ChevronDown
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { newsSources } from '@/data/sources';
import { categories, categoryLabels } from '@/data/news';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const {
    isMenuOpen,
    toggleMenu,
    searchQuery,
    setSearchQuery,
    selectedSource,
    setSelectedSource,
    selectedCategory,
    setSelectedCategory,
    clearFilters
  } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentTime = new Date().toLocaleTimeString('fr-MG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const currentDate = new Date().toLocaleDateString('fr-MG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-2 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {currentTime}
            </span>
            <span className="hidden sm:inline text-gray-300">{currentDate}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">+15% visiteurs</span>
            </span>
            <div className="flex items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full live-indicator"></span>
              <span className="text-xs font-medium">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass shadow-lg'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Mada-Flash Logo"
                  width={72}
                  height={72}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold">
                  <span className="text-[#00a8e8]">Mada-Flash</span>
                  <span className="text-[#00a8e8] text-base">.mg</span>
                </h1>
                <p className="text-xs text-gray-500 -mt-1">L'Info en Bref. Toujours la Source.</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={clearFilters}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !selectedCategory && !selectedSource
                    ? 'gradient-bg text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                Tout
              </button>
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'gradient-bg text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
              <div className="relative">
                <button
                  onClick={() => setShowSourceDropdown(!showSourceDropdown)}
                  className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100"
                >
                  Sources
                  <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showSourceDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 max-h-80 overflow-y-auto"
                    >
                      <button
                        onClick={() => {
                          setSelectedSource(null);
                          setShowSourceDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          !selectedSource
                            ? 'gradient-bg text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        Toutes les sources
                      </button>
                      {newsSources.map((source) => (
                        <button
                          key={source.id}
                          onClick={() => {
                            setSelectedSource(source.id);
                            setShowSourceDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                            selectedSource === source.id
                              ? 'gradient-bg text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ background: source.color }}
                          ></span>
                          {source.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-full hover:bg-gray-100 transition-all"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-full hover:bg-gray-100 transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-all"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pb-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher une actualité..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={toggleMenu}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-lg font-bold gradient-text">Menu</h2>
                  <button
                    onClick={toggleMenu}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Catégories
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        clearFilters();
                        toggleMenu();
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                        !selectedCategory ? 'gradient-bg text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      Toutes les actualités
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          toggleMenu();
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                          selectedCategory === cat
                            ? 'gradient-bg text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {categoryLabels[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sources */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Sources
                  </h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {newsSources.map((source) => (
                      <button
                        key={source.id}
                        onClick={() => {
                          setSelectedSource(source.id);
                          toggleMenu();
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                          selectedSource === source.id
                            ? 'gradient-bg text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: source.color }}
                        ></span>
                        <span className="text-sm">{source.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
