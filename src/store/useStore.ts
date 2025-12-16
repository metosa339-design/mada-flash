import { create } from 'zustand';
import { NewsCategory } from '@/types';

interface AppState {
  selectedSource: string | null;
  selectedCategory: NewsCategory | null;
  searchQuery: string;
  isMenuOpen: boolean;
  viewMode: 'grid' | 'list' | 'timeline';

  setSelectedSource: (source: string | null) => void;
  setSelectedCategory: (category: NewsCategory | null) => void;
  setSearchQuery: (query: string) => void;
  toggleMenu: () => void;
  setViewMode: (mode: 'grid' | 'list' | 'timeline') => void;
  clearFilters: () => void;
}

export const useStore = create<AppState>((set) => ({
  selectedSource: null,
  selectedCategory: null,
  searchQuery: '',
  isMenuOpen: false,
  viewMode: 'grid',

  setSelectedSource: (source) => set({ selectedSource: source }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  setViewMode: (mode) => set({ viewMode: mode }),
  clearFilters: () => set({
    selectedSource: null,
    selectedCategory: null,
    searchQuery: ''
  }),
}));
