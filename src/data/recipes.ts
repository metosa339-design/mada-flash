// Recettes malgaches traditionnelles

export interface Recipe {
  id: string;
  name: string;
  nameMg: string; // Nom en malgache
  category: 'viande' | 'poisson' | 'legumes' | 'dessert' | 'accompagnement';
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  ingredients: string[];
  instructions: string[];
  tips: string;
  imageKeyword: string; // Pour trouver une image appropriée
}

export const malagasyRecipes: Recipe[] = [
  // VIANDES
  {
    id: 'romazava',
    name: 'Romazava',
    nameMg: 'Romazava',
    category: 'viande',
    description: 'Le plat national malgache, un ragoût de viande aux brèdes (feuilles vertes) parfumé aux herbes locales.',
    prepTime: '20 min',
    cookTime: '45 min',
    servings: 6,
    difficulty: 'moyen',
    ingredients: [
      '500g de viande de zébu (ou boeuf)',
      '2 bottes de brèdes mafana (ou cresson)',
      '2 tomates mûres',
      '2 oignons',
      '4 gousses d\'ail',
      '1 morceau de gingembre frais',
      'Sel et poivre',
      'Huile végétale'
    ],
    instructions: [
      'Coupez la viande en morceaux moyens et faites-la revenir dans l\'huile.',
      'Ajoutez les oignons émincés et l\'ail haché, faites dorer.',
      'Incorporez les tomates coupées en dés et le gingembre râpé.',
      'Couvrez d\'eau et laissez mijoter 30 minutes.',
      'Ajoutez les brèdes lavées et coupées.',
      'Laissez cuire encore 15 minutes jusqu\'à ce que les brèdes soient tendres.',
      'Assaisonnez selon votre goût.'
    ],
    tips: 'Servez avec du riz blanc bien chaud. Le romazava se bonifie réchauffé le lendemain!',
    imageKeyword: 'beef stew vegetables'
  },
  {
    id: 'henakisoa-ravitoto',
    name: 'Ravitoto au porc',
    nameMg: 'Henakisoa sy Ravitoto',
    category: 'viande',
    description: 'Feuilles de manioc pilées cuisinées avec de la viande de porc, un classique de la cuisine malgache.',
    prepTime: '30 min',
    cookTime: '1h30',
    servings: 6,
    difficulty: 'moyen',
    ingredients: [
      '500g de porc (épaule ou poitrine)',
      '400g de feuilles de manioc pilées (ravitoto)',
      '2 oignons',
      '4 gousses d\'ail',
      '1 tomate',
      'Huile végétale',
      'Sel'
    ],
    instructions: [
      'Faites revenir la viande de porc coupée en morceaux.',
      'Ajoutez les oignons et l\'ail émincés.',
      'Incorporez le ravitoto et mélangez bien.',
      'Ajoutez la tomate et couvrez d\'eau.',
      'Laissez mijoter à feu doux pendant 1h30 minimum.',
      'Le plat est prêt quand l\'huile remonte à la surface.',
      'Ajustez l\'assaisonnement.'
    ],
    tips: 'Plus le ravitoto mijote longtemps, meilleur il est. N\'hésitez pas à le préparer la veille.',
    imageKeyword: 'pork cassava leaves'
  },
  {
    id: 'henan-omby-ritra',
    name: 'Zébu grillé aux épices',
    nameMg: 'Henan\'omby ritra',
    category: 'viande',
    description: 'Viande de zébu marinée et grillée, tendre et parfumée aux épices malgaches.',
    prepTime: '15 min + 2h marinade',
    cookTime: '20 min',
    servings: 4,
    difficulty: 'facile',
    ingredients: [
      '600g de viande de zébu (ou boeuf)',
      '3 gousses d\'ail',
      '1 morceau de gingembre',
      '2 cuillères à soupe de sauce soja',
      '1 cuillère à soupe d\'huile',
      'Sel et poivre'
    ],
    instructions: [
      'Coupez la viande en lanières ou en cubes.',
      'Préparez la marinade avec l\'ail, le gingembre râpé, la sauce soja et l\'huile.',
      'Laissez mariner au minimum 2 heures au frais.',
      'Faites griller à feu vif sur une poêle ou au barbecue.',
      'Servez immédiatement.'
    ],
    tips: 'Accompagnez de riz et de rougail tomate pour un repas complet.',
    imageKeyword: 'grilled beef skewers'
  },
  {
    id: 'akoho-sy-voanio',
    name: 'Poulet au coco',
    nameMg: 'Akoho sy Voanio',
    category: 'viande',
    description: 'Poulet mijoté dans du lait de coco, parfumé au gingembre et au curcuma.',
    prepTime: '15 min',
    cookTime: '40 min',
    servings: 4,
    difficulty: 'facile',
    ingredients: [
      '1 poulet découpé en morceaux',
      '400ml de lait de coco',
      '2 tomates',
      '2 oignons',
      '1 cuillère à café de curcuma',
      '1 morceau de gingembre',
      'Sel et poivre'
    ],
    instructions: [
      'Faites dorer les morceaux de poulet dans un peu d\'huile.',
      'Ajoutez les oignons émincés et faites revenir.',
      'Incorporez les tomates, le gingembre râpé et le curcuma.',
      'Versez le lait de coco et mélangez.',
      'Laissez mijoter 35-40 minutes à couvert.',
      'Servez chaud avec du riz.'
    ],
    tips: 'Pour plus de saveur, utilisez du lait de coco frais pressé.',
    imageKeyword: 'coconut chicken curry'
  },

  // POISSONS
  {
    id: 'trondro-coco',
    name: 'Poisson au lait de coco',
    nameMg: 'Trondro sy Voanio',
    category: 'poisson',
    description: 'Poisson frais cuit dans une sauce onctueuse au lait de coco et aux épices.',
    prepTime: '15 min',
    cookTime: '25 min',
    servings: 4,
    difficulty: 'facile',
    ingredients: [
      '4 filets de poisson (tilapia, mérou ou autre)',
      '400ml de lait de coco',
      '2 tomates',
      '1 oignon',
      '2 gousses d\'ail',
      'Gingembre frais',
      'Citron vert',
      'Sel et poivre'
    ],
    instructions: [
      'Assaisonnez les filets de poisson avec sel, poivre et jus de citron.',
      'Faites revenir l\'oignon et l\'ail dans une poêle.',
      'Ajoutez les tomates coupées et le gingembre.',
      'Versez le lait de coco et portez à ébullition.',
      'Déposez délicatement les filets de poisson.',
      'Laissez cuire à feu doux 15-20 minutes.',
      'Servez avec du riz.'
    ],
    tips: 'Le poisson est cuit quand sa chair s\'effeuille facilement à la fourchette.',
    imageKeyword: 'fish coconut milk'
  },
  {
    id: 'makamba-grille',
    name: 'Crevettes grillées',
    nameMg: 'Makamba voky',
    category: 'poisson',
    description: 'Grosses crevettes de Madagascar grillées avec ail et beurre, un délice côtier.',
    prepTime: '10 min',
    cookTime: '10 min',
    servings: 4,
    difficulty: 'facile',
    ingredients: [
      '500g de grosses crevettes',
      '50g de beurre',
      '4 gousses d\'ail',
      'Persil frais',
      'Jus de citron',
      'Sel et piment'
    ],
    instructions: [
      'Décortiquez les crevettes en gardant la queue.',
      'Faites fondre le beurre avec l\'ail haché.',
      'Saisissez les crevettes 2-3 minutes de chaque côté.',
      'Arrosez de jus de citron et parsemez de persil.',
      'Servez immédiatement.'
    ],
    tips: 'Ne surcuisez pas les crevettes, elles doivent rester tendres et juteuses.',
    imageKeyword: 'grilled prawns garlic butter'
  },

  // LÉGUMES
  {
    id: 'lasary-voatabia',
    name: 'Rougail tomate',
    nameMg: 'Lasary Voatabia',
    category: 'legumes',
    description: 'Condiment malgache incontournable à base de tomates fraîches, oignons et piment.',
    prepTime: '10 min',
    cookTime: '0 min',
    servings: 6,
    difficulty: 'facile',
    ingredients: [
      '4 tomates bien mûres',
      '2 oignons',
      '1 petit piment (sakay)',
      'Sel',
      'Huile végétale (optionnel)'
    ],
    instructions: [
      'Coupez les tomates en petits dés.',
      'Émincez finement les oignons.',
      'Hachez le piment selon votre goût.',
      'Mélangez le tout avec le sel.',
      'Ajoutez un filet d\'huile si désiré.',
      'Laissez reposer 15 minutes avant de servir.'
    ],
    tips: 'Le lasary accompagne tous les plats malgaches. Ajustez le piment selon vos préférences.',
    imageKeyword: 'fresh tomato salsa'
  },
  {
    id: 'voanjobory',
    name: 'Haricots à la malgache',
    nameMg: 'Voanjobory',
    category: 'legumes',
    description: 'Pois du cap ou haricots mijotés avec oignons et tomates, un plat végétarien savoureux.',
    prepTime: '15 min + trempage',
    cookTime: '1h',
    servings: 4,
    difficulty: 'facile',
    ingredients: [
      '300g de pois du cap ou haricots blancs',
      '2 oignons',
      '2 tomates',
      '2 gousses d\'ail',
      'Huile végétale',
      'Sel'
    ],
    instructions: [
      'Faites tremper les haricots toute une nuit.',
      'Faites-les cuire jusqu\'à ce qu\'ils soient tendres.',
      'Dans une autre casserole, faites revenir oignons et ail.',
      'Ajoutez les tomates et laissez réduire.',
      'Incorporez les haricots cuits et leur eau de cuisson.',
      'Laissez mijoter 20 minutes.',
      'Assaisonnez et servez.'
    ],
    tips: 'Ce plat est encore meilleur réchauffé. Parfait pour un repas végétarien.',
    imageKeyword: 'white beans tomato stew'
  },
  {
    id: 'sakamalao',
    name: 'Brèdes mafana sautées',
    nameMg: 'Sakamalao',
    category: 'legumes',
    description: 'Feuilles de brèdes mafana qui piquent légèrement, sautées à l\'ail.',
    prepTime: '10 min',
    cookTime: '10 min',
    servings: 4,
    difficulty: 'facile',
    ingredients: [
      '2 bottes de brèdes mafana',
      '3 gousses d\'ail',
      '1 oignon',
      'Huile végétale',
      'Sel'
    ],
    instructions: [
      'Lavez soigneusement les brèdes et enlevez les tiges dures.',
      'Faites chauffer l\'huile et faites revenir l\'ail et l\'oignon.',
      'Ajoutez les brèdes et faites sauter à feu vif.',
      'Salez et servez immédiatement.',
      'Les feuilles doivent rester légèrement croquantes.'
    ],
    tips: 'Les brèdes mafana ont un goût unique qui picote la langue, c\'est normal!',
    imageKeyword: 'sauteed greens garlic'
  },

  // DESSERTS
  {
    id: 'mofo-gasy',
    name: 'Mofo gasy',
    nameMg: 'Mofo gasy',
    category: 'dessert',
    description: 'Petites crêpes malgaches sucrées, moelleuses et dorées, parfaites pour le petit-déjeuner.',
    prepTime: '15 min',
    cookTime: '20 min',
    servings: 6,
    difficulty: 'facile',
    ingredients: [
      '250g de farine de riz',
      '100g de sucre',
      '1 sachet de levure',
      '300ml de lait de coco',
      '1 oeuf',
      'Une pincée de sel',
      'Huile pour la cuisson'
    ],
    instructions: [
      'Mélangez la farine, le sucre, le sel et la levure.',
      'Ajoutez l\'oeuf et le lait de coco progressivement.',
      'Mélangez jusqu\'à obtenir une pâte lisse.',
      'Laissez reposer 30 minutes.',
      'Faites cuire dans des moules à mofo gasy huilés.',
      'Retournez quand des bulles apparaissent.',
      'Servez tiède.'
    ],
    tips: 'Traditionnellement cuits dans des moules en terre cuite appelés "vilany".',
    imageKeyword: 'rice pancakes sweet'
  },
  {
    id: 'koba',
    name: 'Koba',
    nameMg: 'Koba ravina',
    category: 'dessert',
    description: 'Gâteau traditionnel à base de cacahuètes, riz et sucre, enveloppé dans des feuilles de bananier.',
    prepTime: '30 min',
    cookTime: '3h',
    servings: 8,
    difficulty: 'difficile',
    ingredients: [
      '500g de cacahuètes grillées',
      '300g de farine de riz',
      '300g de sucre roux',
      '1 pincée de sel',
      'Feuilles de bananier pour envelopper'
    ],
    instructions: [
      'Mixez grossièrement les cacahuètes.',
      'Mélangez avec la farine de riz et le sucre.',
      'Ajoutez de l\'eau tiède pour obtenir une pâte.',
      'Étalez la pâte sur les feuilles de bananier.',
      'Roulez en forme de cylindre et fermez bien.',
      'Faites cuire à la vapeur pendant 3 heures.',
      'Laissez refroidir avant de trancher.'
    ],
    tips: 'Le koba se conserve plusieurs jours et se déguste en tranches.',
    imageKeyword: 'peanut rice cake'
  },
  {
    id: 'bonbon-coco',
    name: 'Bonbon coco',
    nameMg: 'Bonbon voanio',
    category: 'dessert',
    description: 'Délicieuses confiseries à la noix de coco râpée et au sucre caramélisé.',
    prepTime: '15 min',
    cookTime: '20 min',
    servings: 10,
    difficulty: 'moyen',
    ingredients: [
      '200g de noix de coco râpée',
      '150g de sucre',
      '100ml d\'eau',
      '1 gousse de vanille de Madagascar'
    ],
    instructions: [
      'Faites un caramel avec le sucre et l\'eau.',
      'Ajoutez les graines de vanille.',
      'Incorporez la noix de coco râpée.',
      'Mélangez bien jusqu\'à ce que le mélange s\'épaississe.',
      'Formez des petites boules avec les mains humides.',
      'Laissez refroidir sur une plaque.'
    ],
    tips: 'Utilisez de la vanille de Madagascar pour un goût authentique incomparable.',
    imageKeyword: 'coconut candy balls'
  },
  {
    id: 'godro-godro',
    name: 'Godro-godro',
    nameMg: 'Godro-godro',
    category: 'dessert',
    description: 'Crème dessert onctueuse à base de farine de riz et lait de coco.',
    prepTime: '10 min',
    cookTime: '15 min',
    servings: 4,
    difficulty: 'facile',
    ingredients: [
      '100g de farine de riz',
      '400ml de lait de coco',
      '100g de sucre',
      '1 gousse de vanille',
      '1 pincée de sel'
    ],
    instructions: [
      'Délayez la farine de riz dans un peu de lait de coco froid.',
      'Faites chauffer le reste du lait avec le sucre et la vanille.',
      'Versez le mélange de farine en remuant constamment.',
      'Continuez à remuer jusqu\'à épaississement.',
      'Versez dans des ramequins.',
      'Servez tiède ou froid.'
    ],
    tips: 'Vous pouvez ajouter de la cannelle ou du miel pour varier les saveurs.',
    imageKeyword: 'coconut pudding dessert'
  },

  // ACCOMPAGNEMENTS
  {
    id: 'vary-sosoa',
    name: 'Riz à la malgache',
    nameMg: 'Vary sosoa',
    category: 'accompagnement',
    description: 'Riz blanc cuit à la malgache, légèrement collant, base de tous les repas.',
    prepTime: '5 min',
    cookTime: '20 min',
    servings: 4,
    difficulty: 'facile',
    ingredients: [
      '300g de riz blanc',
      'Eau',
      'Sel'
    ],
    instructions: [
      'Lavez le riz plusieurs fois jusqu\'à ce que l\'eau soit claire.',
      'Mettez le riz dans une casserole avec 1,5 fois son volume d\'eau.',
      'Portez à ébullition.',
      'Baissez le feu, couvrez et laissez cuire 15-18 minutes.',
      'Laissez reposer 5 minutes avant de servir.'
    ],
    tips: 'À Madagascar, on garde l\'eau de cuisson du riz (ranon\'ampango) comme boisson!',
    imageKeyword: 'white rice bowl'
  },
  {
    id: 'achards-citron',
    name: 'Achards de citron',
    nameMg: 'Achards voasary',
    category: 'accompagnement',
    description: 'Condiment acidulé et épicé à base de citrons confits, accompagnement traditionnel.',
    prepTime: '20 min + repos',
    cookTime: '0 min',
    servings: 8,
    difficulty: 'facile',
    ingredients: [
      '4 citrons verts',
      '2 oignons',
      '1 morceau de gingembre',
      '1 piment',
      'Huile végétale',
      'Sel',
      'Curcuma'
    ],
    instructions: [
      'Coupez les citrons en quartiers puis en tranches fines.',
      'Émincez les oignons et le gingembre.',
      'Mélangez tous les ingrédients avec le sel et le curcuma.',
      'Ajoutez l\'huile pour couvrir.',
      'Laissez mariner au moins 24 heures.',
      'Conservez au réfrigérateur.'
    ],
    tips: 'Les achards se conservent plusieurs semaines au frais. Le goût s\'améliore avec le temps.',
    imageKeyword: 'pickled lemon condiment'
  },
];

// Fonction pour obtenir la recette du jour
export function getDailyRecipe(date: Date = new Date()): Recipe {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % malagasyRecipes.length;
  return malagasyRecipes[index];
}

// Fonction pour obtenir une recette par catégorie du jour
export function getDailyRecipeByCategory(category: Recipe['category'], date: Date = new Date()): Recipe | null {
  const recipesInCategory = malagasyRecipes.filter(r => r.category === category);
  if (recipesInCategory.length === 0) return null;

  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = dayOfYear % recipesInCategory.length;
  return recipesInCategory[index];
}

// Fonction pour obtenir le menu du jour (alternant les catégories)
export function getDailyMenu(date: Date = new Date()) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

  // Alterner les catégories principales selon le jour de la semaine
  const dayOfWeek = date.getDay();
  const mainCategories: Recipe['category'][] = ['viande', 'poisson', 'legumes', 'viande', 'poisson', 'legumes', 'viande'];
  const mainCategory = mainCategories[dayOfWeek];

  const mainDish = getDailyRecipeByCategory(mainCategory, date);
  const sideDish = getDailyRecipeByCategory('accompagnement', date);
  const dessert = getDailyRecipeByCategory('dessert', date);

  return {
    date: date.toISOString().split('T')[0],
    dayName: date.toLocaleDateString('fr-MG', { weekday: 'long' }),
    mainDish,
    sideDish,
    dessert,
  };
}
