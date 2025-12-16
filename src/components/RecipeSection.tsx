'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ChefHat,
  Clock,
  Users,
  Flame,
  ChevronDown,
  ChevronUp,
  Utensils,
  Soup,
  Cake,
  Salad,
  Fish
} from 'lucide-react';
import { getDailyMenu, type Recipe } from '@/data/recipes';

const categoryIcons: Record<string, React.ReactNode> = {
  viande: <Utensils className="w-5 h-5" />,
  poisson: <Fish className="w-5 h-5" />,
  legumes: <Salad className="w-5 h-5" />,
  dessert: <Cake className="w-5 h-5" />,
  accompagnement: <Soup className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  viande: 'from-red-500 to-rose-500',
  poisson: 'from-blue-500 to-cyan-500',
  legumes: 'from-green-500 to-emerald-500',
  dessert: 'from-pink-500 to-purple-500',
  accompagnement: 'from-amber-500 to-orange-500',
};

const difficultyColors = {
  facile: 'bg-green-100 text-green-700',
  moyen: 'bg-amber-100 text-amber-700',
  difficile: 'bg-red-100 text-red-700',
};

function RecipeCard({ recipe, label }: { recipe: Recipe; label: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Image URL based on recipe category
  const getRecipeImage = () => {
    const images: Record<string, string> = {
      viande: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
      poisson: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
      legumes: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
      accompagnement: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=300&fit=crop',
    };
    return images[recipe.category] || images.viande;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
    >
      {/* Header with Image */}
      <div className="relative h-32">
        <Image
          src={getRecipeImage()}
          alt={recipe.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Category Badge */}
        <div className={`absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r ${categoryColors[recipe.category]} text-white text-xs font-medium`}>
          {categoryIcons[recipe.category]}
          <span className="capitalize">{recipe.category}</span>
        </div>

        {/* Label */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-white/90 text-xs font-medium text-gray-700">
          {label}
        </div>

        {/* Recipe Name */}
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="text-white font-bold text-lg leading-tight">{recipe.name}</h3>
          <p className="text-white/80 text-xs">{recipe.nameMg}</p>
        </div>
      </div>

      {/* Quick Info */}
      <div className="p-3 border-b border-gray-100">
        <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {recipe.prepTime} + {recipe.cookTime}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {recipe.servings} pers.
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${difficultyColors[recipe.difficulty]}`}>
            {recipe.difficulty}
          </span>
        </div>
      </div>

      {/* Expandable Content */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 flex items-center justify-center gap-1 text-sm font-medium text-[#ff6b35] hover:bg-orange-50 transition-colors"
      >
        {isExpanded ? (
          <>
            <span>Masquer la recette</span>
            <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            <span>Voir la recette</span>
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              {/* Ingredients */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="p-1 bg-orange-100 rounded">
                    <Utensils className="w-3.5 h-3.5 text-[#ff6b35]" />
                  </span>
                  Ingrédients
                </h4>
                <ul className="space-y-1">
                  {recipe.ingredients.map((ingredient, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-[#ff6b35] mt-1">•</span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="p-1 bg-orange-100 rounded">
                    <Flame className="w-3.5 h-3.5 text-[#ff6b35]" />
                  </span>
                  Préparation
                </h4>
                <ol className="space-y-2">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ff6b35] text-white text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Astuce: </span>
                  {recipe.tips}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RecipeSection() {
  const menu = useMemo(() => getDailyMenu(), []);

  return (
    <section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#ff6b35] to-orange-500 rounded-lg text-white">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recette du Jour</h2>
            <p className="text-sm text-gray-600">
              Menu du {menu.dayName} - Cuisine malgache traditionnelle
            </p>
          </div>
        </div>
      </div>

      {/* Daily Menu */}
      <div className="grid gap-4">
        {menu.mainDish && (
          <RecipeCard recipe={menu.mainDish} label="Plat principal" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menu.sideDish && (
            <RecipeCard recipe={menu.sideDish} label="Accompagnement" />
          )}
          {menu.dessert && (
            <RecipeCard recipe={menu.dessert} label="Dessert" />
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-4 p-3 bg-white/60 rounded-lg text-center">
        <p className="text-xs text-gray-500">
          Les recettes changent chaque jour. Revenez demain pour découvrir de nouveaux plats malgaches!
        </p>
      </div>
    </section>
  );
}
