// Free image search utilities - Pixabay, Pexels, Unsplash, AI Generation
// This module can be imported directly without HTTP calls

import { prisma } from '@/lib/db';

export interface ImageResult {
  url: string;
  thumbnailUrl: string;
  source: string;
  photographer?: string;
  sourceUrl?: string;
}

interface PixabayHit {
  webformatURL: string;
  largeImageURL: string;
  previewURL: string;
  user: string;
  pageURL: string;
}

interface PexelsPhoto {
  src: {
    large: string;
    medium: string;
    small: string;
  };
  photographer: string;
  url: string;
}

interface UnsplashResult {
  urls: {
    regular: string;
    small: string;
  };
  user: {
    name: string;
  };
  links: {
    html: string;
  };
}

// Mots à ignorer dans la recherche (stop words français)
const STOP_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'au', 'aux',
  'et', 'ou', 'mais', 'donc', 'car', 'ni', 'que', 'qui', 'quoi',
  'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'leur', 'leurs',
  'pour', 'par', 'sur', 'sous', 'dans', 'avec', 'sans', 'entre',
  'est', 'sont', 'être', 'avoir', 'fait', 'faire', 'dit', 'dire',
  'plus', 'moins', 'très', 'bien', 'mal', 'peu', 'trop', 'aussi',
  'comme', 'même', 'autre', 'tous', 'tout', 'toute', 'toutes',
  'après', 'avant', 'depuis', 'pendant', 'encore', 'déjà', 'alors'
]);

// Mots malgaches courants pour détecter si le texte est en malgache
const MALAGASY_INDICATORS = [
  // Mots courants malgaches (articles, conjonctions, prépositions)
  'ny', 'sy', 'ary', 'fa', 'izay', 'tsy', 'dia', 'ho', 'amin', 'tamin',
  'efa', 'mbola', 'misy', 'manana', 'mahazo', 'mahita', 'manao', 'miteny',
  'olona', 'trano', 'taona', 'andro', 'volana', 'herinandro', 'ora',
  'firenena', 'governemanta', 'minisitra', 'filoha', 'vahoaka',
  // Mots d'actualités fréquents
  'vaovao', 'tambatra', 'tetikasa', 'fampandrosoana', 'fisitrahana',
  'maimaimpoana', 'oniversite', 'mpiasa', 'mari-boninahitra', 'tetik',
  'manohana', 'fanabeazana', 'fahasalamana', 'fitaterana', 'toe-karena',
  'kolontsaina', 'fanatanjahantena', 'tontolo', 'iainana', 'fiarahamonina',
  // Mots spécifiques souvent dans les news
  'jiolahy', 'mpangalatra', 'heloka', 'vonjy', 'loza', 'afo', 'rano',
  'lalana', 'fiara', 'lozam-pifamoivoizana', 'hopitaly', 'dokotera',
  'fizaham-pahasalamana', 'fitsaboana', 'fanafody', 'aretina', 'maty',
  'naratra', 'maratra', 'voasambotra', 'gadra', 'fitsarana',
  'polisy', 'zandary', 'miaramila', 'sekoly', 'mpianatra', 'mpampianatra',
  'vola', 'ariary', 'vidiny', 'varotra', 'fivarotana', 'tsenam-bokatra',
  'mpanao politika', 'fifidianana', 'vato', 'solombavambahoaka',
  'vary', 'voankazo', 'legioma', 'omby', 'akoho', 'trondro',
  'toetr\'andro', 'orana', 'rivo-doza', 'tondra-drano', 'hain-tany',
  'tanimbary', 'tanimboly', 'ala', 'tontolo iainana',
  // Verbes et noms courants
  'nahazo', 'nomena', 'natao', 'hita', 'nisy', 'nanao', 'nilaza',
  'fivoriana', 'fankalazana', 'fitsidihana', 'fandaharana', 'fanambarana'
];

// Cache pour les traductions (évite les appels API répétés)
const translationCache = new Map<string, string>();

// Cache pour les images récemment utilisées (TTL: 5 minutes)
let recentlyUsedImagesCache: { data: Set<string>; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fonction pour détecter si le texte contient des mots malgaches
function containsMalagasyWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  const malagasyCount = MALAGASY_INDICATORS.filter(word =>
    lowerText.includes(word.toLowerCase())
  ).length;
  // Si au moins 2 mots malgaches sont détectés, considérer comme malgache
  return malagasyCount >= 2;
}

// Traduire le texte malgache en mots-clés anglais pour la recherche d'images avec Gemini
async function translateMalagasyWithGemini(title: string, summary: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.log('Gemini API key not configured for translation');
    return null;
  }

  // Vérifier le cache
  const cacheKey = `${title}_${summary.substring(0, 100)}`;
  if (translationCache.has(cacheKey)) {
    console.log('Using cached translation');
    return translationCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Tu es un expert en langue malgache et en recherche d'images. Analyse ce titre et résumé d'article de news de Madagascar et retourne UNIQUEMENT 3-5 mots-clés en anglais pour rechercher une image appropriée sur Pixabay/Pexels.

Titre: "${title}"
Résumé: "${summary}"

EXEMPLES DE MOTS-CLÉS PAR THÈME:

🏛️ POLITIQUE & GOUVERNANCE:
- Militaire/Colonel/Armée → "military leader beret, army commander, soldier uniform"
- Manifestation/Gen Z/Pirates → "protest crowd, youth activism, street demonstration"
- Président/Politique → "politician office, presidential palace, official ceremony"
- Union Africaine/SADC/Diplomatie → "diplomacy meeting, international summit Africa, handshake official"
- Église/FFKM/Religieux → "church cathedral, religious leaders, group prayer"
- Tribunal/Justice → "courthouse gavel, justice trial, legal court"

💰 ÉCONOMIE & FINANCES:
- Inflation/Ariary/Prix → "malagasy money, market prices, financial crisis, empty wallet"
- Mine/Nickel/Graphite → "mining excavator, industrial pit, heavy machinery"
- Vanille/SAVA → "vanilla beans, spice plantation, farmer harvest"
- Émeraudes/Pierres → "emerald gemstone, raw crystal, mineral treasure"
- Investissement/Dubaï → "skyscraper city, business deal, investor handshake"
- Exportation/Commerce → "shipping container, trade port, cargo export"

⚡ ÉNERGIE & INFRASTRUCTURES:
- Délestage/Jirama/Électricité → "blackout city night, candlelight, power outage, electric pylon"
- Eau/Bidons → "yellow jerrycan, water pump village, queue water Africa"
- Train/Transport → "train station, urban railway, commuter transport"
- Route/RN7/Potholes → "damaged road, mud road truck, potholes highway"
- Barrage/Hydroélectrique → "dam river, hydroelectric power, renewable electricity"

🆘 SOCIAL & SANTÉ:
- Kere/Sécheresse/Famine → "drought landscape, dry cracked earth, humanitarian aid"
- Numérique/Starlink/Internet → "laptop university, satellite dish, digital education"
- Insécurité/Kidnapping/Dahalo → "police patrol, security guard, rural safety, dark woods"
- Hôpital/Médecin/Santé → "doctor hospital, medical clinic, healthcare nurse"
- Vaccination/Institut Pasteur → "vaccination child, medical research, laboratory scientist"

🌴 ENVIRONNEMENT & TOURISME:
- Tourisme/ITM/Hôtel → "luxury resort beach, tourism tropical, paradise island"
- Lémuriens/Faune → "lemur eyes wildlife, rainforest animal, baobab forest"
- Plage/Nosy Be → "palm tree beach, turquoise ocean, white sand paradise"
- Cyclone/Tempête → "storm clouds, tropical rain, flood street, heavy wind"
- Reboisement/Forêt → "planting saplings, reforestation volunteers, green forest"
- Mangrove/Économie bleue → "mangrove forest, coastal conservation, marine ecosystem"

🏀 SPORT & CULTURE:
- Basketball/Ankoay → "basketball dunk, team victory, sports competition"
- Football/Barea → "soccer stadium, football fans, soccer goal"
- Musique/Festival → "traditional music, concert stage, cultural festival"
- Art/Exposition → "art gallery, painting canvas, museum exhibition"

🐄 AGRICULTURE:
- Zébu/Élevage → "zebu Madagascar, cattle farm, livestock agriculture"
- Riz/Tanimbary → "rice paddy field, farmer planting, agriculture harvest"
- Pêche/Poulpe → "octopus fishing, fisherman boat, seafood market"

🔒 SÉCURITÉ & CRIME:
- Vol/Jiolahy/Mpangalatra → "thief robbery crime, police arrest, handcuffs criminal"
- Police/Gendarmerie → "police officer uniform, law enforcement, security patrol"
- Prison/Gadra → "prison cell bars, correctional facility, jail"
- Accident/Loza → "car accident crash, traffic emergency, ambulance rescue"
- Incendie/Afo → "fire flames burning, firefighter emergency, smoke"
- Meurtre/Crime → "crime scene police, investigation, police tape"

Retourne UNIQUEMENT les mots-clés anglais les plus pertinents (3-5 mots), sans explication, sans guillemets, sans ponctuation finale.`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 60
          }
        })
      }
    );

    if (!response.ok) {
      console.error('Gemini translation API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      const translatedKeywords = data.candidates[0].content.parts[0].text
        .trim()
        .replace(/[."'\n]/g, '')
        .toLowerCase();

      console.log(`Malagasy translation: "${title.substring(0, 40)}..." → "${translatedKeywords}"`);

      // Mettre en cache
      translationCache.set(cacheKey, translatedKeywords);

      return translatedKeywords;
    }
  } catch (error) {
    console.error('Gemini translation error:', error);
  }

  return null;
}

// Mapping catégorie -> termes de recherche Pixabay optimisés
const CATEGORY_IMAGE_TERMS: Record<string, string[]> = {
  politique: ['government building', 'politics africa', 'parliament', 'meeting official'],
  economie: ['economy africa', 'business market', 'money currency', 'finance graph'],
  sport: ['football africa', 'soccer stadium', 'sports team', 'athletics'],
  culture: ['african culture', 'traditional dance', 'music festival', 'art africa'],
  societe: ['african community', 'people africa', 'social gathering', 'education africa'],
  international: ['world map', 'global diplomacy', 'international meeting', 'flags nations'],
  environnement: ['madagascar nature', 'tropical forest', 'wildlife lemur', 'baobab tree'],
  technologie: ['technology africa', 'digital innovation', 'smartphone africa', 'internet']
};

// Termes spécifiques Madagascar pour Pixabay
const MADAGASCAR_TERMS = [
  'madagascar', 'antananarivo', 'lemur', 'baobab', 'tropical island',
  'african landscape', 'indian ocean', 'rice field asia'
];

// Get recently used image URLs from database (last 30 days) - WITH CACHE
export async function getRecentlyUsedImages(): Promise<Set<string>> {
  // Check cache first
  if (recentlyUsedImagesCache && Date.now() - recentlyUsedImagesCache.timestamp < CACHE_TTL) {
    console.log(`Using cached recently used images (${recentlyUsedImagesCache.data.size} images)`);
    return recentlyUsedImagesCache.data;
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const articles = await prisma.article.findMany({
      where: {
        imageUrl: { not: null },
        publishedAt: { gte: thirtyDaysAgo }
      },
      select: { imageUrl: true }
    });

    const usedUrls = new Set<string>();
    for (const article of articles) {
      if (article.imageUrl && !article.imageUrl.includes('placeholder') && !article.imageUrl.startsWith('data:')) {
        usedUrls.add(article.imageUrl);
      }
    }

    // Update cache
    recentlyUsedImagesCache = { data: usedUrls, timestamp: Date.now() };

    console.log(`Found ${usedUrls.size} recently used images to avoid duplicates (cached)`);
    return usedUrls;
  } catch (error) {
    console.error('Error fetching recently used images:', error);
    return new Set();
  }
}

// Extract keywords from text for image search - Version améliorée avec traduction malgache
export async function extractKeywords(title: string, summary?: string, category?: string): Promise<string> {
  const text = `${title} ${summary || ''}`.toLowerCase();

  // 0. PRIORITÉ MAXIMALE: Si le texte contient des mots malgaches, utiliser Gemini pour traduire
  if (containsMalagasyWords(text)) {
    console.log('Malagasy content detected, using Gemini for translation...');
    const translatedKeywords = await translateMalagasyWithGemini(title, summary || '');
    if (translatedKeywords) {
      return translatedKeywords;
    }
    // Si la traduction échoue, continuer avec la détection de thèmes classique
  }

  // 1. PRIORITÉ: Détection de thèmes spécifiques dans le contenu de l'article
  // Ordre important: les thèmes les plus spécifiques en premier
  const themeKeywords: Record<string, string[]> = {
    // === ACCIDENTS & FAITS DIVERS ===
    'accident': ['car accident crash', 'traffic accident road', 'vehicle crash emergency'],
    'collision': ['car collision accident', 'vehicle crash road'],
    'renversé': ['car accident overturned', 'traffic accident'],
    'véhicule': ['vehicle car road', 'automobile traffic'],
    'voiture': ['car automobile vehicle', 'traffic road driving'],
    'moto': ['motorcycle accident', 'motorbike road'],
    'taxi': ['taxi cab car', 'transportation vehicle'],
    'bus': ['bus public transport', 'bus accident'],
    'camion': ['truck vehicle road', 'lorry transport'],
    'blessé': ['injured hospital emergency', 'medical emergency ambulance'],
    'mort': ['funeral mourning', 'cemetery memorial'],
    'décès': ['funeral memorial', 'mourning ceremony'],
    'victime': ['victim emergency help', 'rescue emergency'],
    'urgence': ['emergency ambulance hospital', 'emergency rescue'],
    'hôpital': ['hospital medical healthcare', 'medical building'],
    'ambulance': ['ambulance emergency medical', 'emergency vehicle'],

    // === SÉCURITÉ & CRIME ===
    'police': ['police officer security', 'police car law enforcement'],
    'gendarmerie': ['gendarme police military', 'law enforcement security'],
    'gendarme': ['gendarme military police', 'security officer'],
    'vol': ['theft robbery crime', 'stolen property police'],
    'voleur': ['thief burglar crime', 'criminal arrest'],
    'cambriolage': ['burglary theft crime', 'break in robbery'],
    'agression': ['assault attack crime', 'violence crime'],
    'arrestation': ['arrest police handcuffs', 'police detention'],
    'prison': ['prison jail cell', 'correctional facility'],
    'tribunal': ['court justice trial', 'courthouse law'],
    'justice': ['justice court gavel', 'courthouse trial'],
    'crime': ['crime scene police', 'criminal investigation'],
    'meurtre': ['crime scene investigation', 'police tape'],
    'drogue': ['drugs narcotics police', 'drug seizure'],
    'incendie': ['fire flames burning', 'firefighter emergency'],
    'feu': ['fire flames smoke', 'burning building'],
    'pompier': ['firefighter fire truck', 'fire emergency'],
    'noyade': ['drowning water rescue', 'water emergency'],
    'inondation': ['flood water disaster', 'flooding rain'],

    // === POLITIQUE ===
    'président': ['president government official', 'political leader speech'],
    'gouvernement': ['government building official', 'politics ministry'],
    'ministre': ['minister official meeting', 'government politician'],
    'premier ministre': ['prime minister government', 'political leader'],
    'élection': ['election voting ballot', 'democracy vote'],
    'vote': ['voting ballot election', 'democracy polling'],
    'assemblée': ['parliament assembly politics', 'national assembly'],
    'sénat': ['senate parliament politics', 'senate chamber'],
    'député': ['parliament politician assembly', 'deputy elected'],
    'maire': ['mayor city hall', 'municipal government'],
    'commune': ['town hall municipality', 'local government'],
    'manifestation': ['protest demonstration crowd', 'march rally'],
    'grève': ['strike protest workers', 'labor union'],

    // === ÉCONOMIE & FINANCE ===
    'économie': ['economy business graph', 'economic growth chart'],
    'ariary': ['currency money finance', 'madagascar money'],
    'banque': ['bank finance building', 'banking money'],
    'commerce': ['market trade business', 'shop store'],
    'marché': ['market trading commerce', 'marketplace vendor'],
    'investissement': ['investment business growth', 'finance money'],
    'entreprise': ['company business office', 'corporate building'],
    'emploi': ['job work employment', 'career workplace'],
    'chômage': ['unemployment job search', 'unemployed worker'],
    'prix': ['price tag market', 'shopping cost'],
    'inflation': ['money inflation economy', 'price increase'],
    'export': ['export shipping container', 'trade port'],
    'import': ['import shipping cargo', 'container port'],
    'riz': ['rice field agriculture', 'rice farming paddy'],
    'vanille': ['vanilla plantation spice', 'vanilla beans'],
    'café': ['coffee plantation beans', 'coffee harvest'],

    // === SPORT ===
    'barea': ['football team madagascar', 'soccer national team'],
    'football': ['soccer match stadium', 'football game'],
    'basket': ['basketball game sport', 'basketball court'],
    'rugby': ['rugby match sport', 'rugby game'],
    'athlétisme': ['athletics running track', 'olympic sport'],
    'boxe': ['boxing ring fight', 'boxer sport'],
    'judo': ['judo martial arts', 'judo competition'],
    'tennis': ['tennis court sport', 'tennis match'],
    'match': ['sports match game', 'competition stadium'],
    'champion': ['champion trophy winner', 'sports victory'],
    'médaille': ['medal winner sports', 'gold medal'],
    'olympique': ['olympic games sports', 'olympic rings'],

    // === ÉDUCATION ===
    'éducation': ['education school classroom', 'students learning'],
    'école': ['school classroom students', 'primary school'],
    'lycée': ['high school students', 'secondary school'],
    'université': ['university campus students', 'college education'],
    'étudiant': ['student university campus', 'young student'],
    'enseignant': ['teacher classroom education', 'teaching school'],
    'professeur': ['professor university teacher', 'education classroom'],
    'examen': ['exam test students', 'examination hall'],
    'baccalauréat': ['graduation exam students', 'high school diploma'],
    'diplôme': ['diploma graduation ceremony', 'graduate certificate'],

    // === SANTÉ ===
    'santé': ['health medical hospital', 'healthcare doctor'],
    'médecin': ['doctor medical hospital', 'physician healthcare'],
    'maladie': ['illness disease hospital', 'sick patient'],
    'covid': ['covid coronavirus vaccine', 'pandemic mask'],
    'vaccin': ['vaccine injection medical', 'vaccination syringe'],
    'épidémie': ['epidemic disease outbreak', 'health emergency'],
    'clinique': ['clinic medical healthcare', 'health center'],
    'pharmacie': ['pharmacy medicine drugs', 'drugstore'],
    'médicament': ['medicine pills pharmacy', 'medication'],

    // === ENVIRONNEMENT & MÉTÉO ===
    'cyclone': ['tropical storm hurricane', 'cyclone damage'],
    'tempête': ['storm weather disaster', 'severe weather'],
    'pluie': ['rain weather storm', 'rainy season'],
    'sécheresse': ['drought dry land', 'water shortage'],
    'environnement': ['environment nature green', 'ecology'],
    'climat': ['climate weather nature', 'climate change'],
    'forêt': ['forest trees jungle', 'tropical forest'],
    'déforestation': ['deforestation logging trees', 'forest destruction'],
    'pollution': ['pollution environment smog', 'air pollution'],
    'reboisement': ['reforestation planting trees', 'tree planting'],

    // === INFRASTRUCTURE & TRANSPORT ===
    'route': ['road highway infrastructure', 'road construction'],
    'pont': ['bridge infrastructure construction', 'bridge crossing'],
    'aéroport': ['airport airplane aviation', 'airport terminal'],
    'avion': ['airplane aircraft aviation', 'flight airplane'],
    'port': ['port harbor ships', 'maritime shipping'],
    'train': ['train railway station', 'railroad'],
    'électricité': ['electricity power grid', 'electrical tower'],
    'jirama': ['electricity power utility', 'power plant'],
    'eau': ['water supply tap', 'water treatment'],
    'construction': ['construction building site', 'construction workers'],

    // === CULTURE & RELIGION ===
    'culture': ['culture festival traditional', 'cultural event'],
    'musique': ['music concert performance', 'musical instrument'],
    'concert': ['concert music stage', 'live performance'],
    'artiste': ['artist performer musician', 'creative artist'],
    'cinéma': ['cinema movie film', 'movie theater'],
    'théâtre': ['theater stage performance', 'drama'],
    'église': ['church religion christian', 'church building'],
    'mosquée': ['mosque islam religion', 'islamic architecture'],
    'fête': ['celebration festival party', 'festive event'],
    'mariage': ['wedding marriage ceremony', 'bride groom'],
    'funérailles': ['funeral ceremony mourning', 'burial'],

    // === TOURISME ===
    'tourisme': ['tourism travel beach', 'tourist destination'],
    'touriste': ['tourist travel vacation', 'tourism'],
    'hôtel': ['hotel accommodation resort', 'hotel building'],
    'plage': ['beach ocean tropical', 'sandy beach'],
    'parc national': ['national park wildlife', 'nature reserve'],
    'lémuriens': ['lemur madagascar wildlife', 'ring tailed lemur'],
    'baobab': ['baobab tree madagascar', 'baobab avenue'],

    // === AGRICULTURE ===
    'agriculture': ['agriculture farming field', 'farm harvest'],
    'agriculteur': ['farmer agriculture farming', 'rural farmer'],
    'récolte': ['harvest farming agriculture', 'crop harvest'],
    'élevage': ['livestock cattle farm', 'animal farming'],
    'pêche': ['fishing boat fisherman', 'fish catch'],
    'zébu': ['zebu cattle madagascar', 'zebu ox'],

    // === SOCIAL ===
    'pauvreté': ['poverty poor homeless', 'poverty africa'],
    'aide': ['humanitarian aid help', 'charity assistance'],
    'ong': ['ngo humanitarian charity', 'aid organization'],
    'enfant': ['children kids school', 'child africa'],
    'femme': ['woman women empowerment', 'african woman'],
    'jeune': ['youth young people', 'teenagers africa']
  };

  // Chercher un thème correspondant dans le texte (titre + résumé)
  for (const [keyword, searchTerms] of Object.entries(themeKeywords)) {
    if (text.includes(keyword)) {
      // Sélectionner aléatoirement parmi les termes pour plus de variété
      const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      console.log(`Theme detected: "${keyword}" -> search: "${randomTerm}"`);
      return randomTerm;
    }
  }

  // 2. Si pas de thème trouvé mais catégorie disponible, utiliser les termes de catégorie
  if (category && CATEGORY_IMAGE_TERMS[category]) {
    const categoryTerms = CATEGORY_IMAGE_TERMS[category];
    const randomCategoryTerm = categoryTerms[Math.floor(Math.random() * categoryTerms.length)];
    console.log(`Category fallback: "${category}" -> search: "${randomCategoryTerm}"`);
    return randomCategoryTerm;
  }

  // 3. Fallback: extraire les mots significatifs du titre
  const words = title
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëïîôùûüÿçœæ-]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4 && !STOP_WORDS.has(w))
    .slice(0, 3);

  if (words.length > 0) {
    // Essayer de traduire en anglais si possible pour de meilleurs résultats
    const searchQuery = `${words.join(' ')} africa news`;
    console.log(`Word extraction fallback: "${searchQuery}"`);
    return searchQuery;
  }

  // 4. Dernier fallback: image générique de Madagascar
  const fallbackTerms = MADAGASCAR_TERMS[Math.floor(Math.random() * MADAGASCAR_TERMS.length)];
  console.log(`Final fallback: "${fallbackTerms}"`);
  return `${fallbackTerms} nature`;
}

// Générer des termes de recherche alternatifs si la première recherche échoue
export function getAlternativeSearchTerms(category?: string): string[] {
  const alternatives = [
    'madagascar landscape nature',
    'african cityscape urban',
    'tropical island paradise',
    'madagascar wildlife lemur',
    'african people community',
    'baobab tree sunset',
    'antananarivo city aerial'
  ];

  if (category && CATEGORY_IMAGE_TERMS[category]) {
    return [...CATEGORY_IMAGE_TERMS[category], ...alternatives.slice(0, 3)];
  }

  return alternatives;
}

// Search Pixabay (Free API - 100 requests/minute) - with duplicate avoidance
export async function searchPixabay(
  query: string,
  category?: string,
  excludeUrls?: Set<string>
): Promise<ImageResult | null> {
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey) {
    console.log('Pixabay API key not configured');
    return null;
  }

  // Liste des requêtes à essayer
  const queriesToTry = [query];

  // Ajouter des termes alternatifs si la catégorie est fournie
  if (category) {
    const alternatives = getAlternativeSearchTerms(category);
    queriesToTry.push(...alternatives.slice(0, 2));
  }

  for (const searchQuery of queriesToTry) {
    try {
      const encodedQuery = encodeURIComponent(searchQuery);
      // Fetch more results to have options for duplicate avoidance
      const response = await fetch(
        `https://pixabay.com/api/?key=${apiKey}&q=${encodedQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=20`
      );

      if (!response.ok) continue;

      const data = await response.json();

      if (data.hits && data.hits.length > 0) {
        // Filter out already used images
        const availableHits = excludeUrls
          ? data.hits.filter((hit: PixabayHit) => !excludeUrls.has(hit.largeImageURL))
          : data.hits;

        if (availableHits.length > 0) {
          // Prendre une image aléatoire parmi les résultats disponibles
          const maxIndex = Math.min(5, availableHits.length);
          const randomIndex = Math.floor(Math.random() * maxIndex);
          const hit: PixabayHit = availableHits[randomIndex];

          console.log(`Pixabay: Image unique trouvée pour "${searchQuery}" - ${hit.largeImageURL}`);

          return {
            url: hit.largeImageURL,
            thumbnailUrl: hit.previewURL,
            source: 'Pixabay',
            photographer: hit.user,
            sourceUrl: hit.pageURL
          };
        } else {
          console.log(`Pixabay: Tous les résultats pour "${searchQuery}" sont déjà utilisés, essai suivant...`);
        }
      }

      console.log(`Pixabay: Aucun résultat pour "${searchQuery}", essai suivant...`);
    } catch (error) {
      console.error(`Pixabay search error for "${searchQuery}":`, error);
    }
  }

  return null;
}

// Search Pexels (Free API - 200 requests/month) - with duplicate avoidance
export async function searchPexels(query: string, excludeUrls?: Set<string>): Promise<ImageResult | null> {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    console.log('Pexels API key not configured');
    return null;
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    // Fetch more results for duplicate avoidance
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodedQuery}&per_page=15&orientation=landscape`,
      {
        headers: { Authorization: apiKey }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      // Filter out already used images
      const availablePhotos = excludeUrls
        ? data.photos.filter((photo: PexelsPhoto) => !excludeUrls.has(photo.src.large))
        : data.photos;

      if (availablePhotos.length > 0) {
        // Pick a random one from available
        const randomIndex = Math.floor(Math.random() * Math.min(5, availablePhotos.length));
        const photo: PexelsPhoto = availablePhotos[randomIndex];

        console.log(`Pexels: Image unique trouvée - ${photo.src.large}`);

        return {
          url: photo.src.large,
          thumbnailUrl: photo.src.small,
          source: 'Pexels',
          photographer: photo.photographer,
          sourceUrl: photo.url
        };
      }
    }
  } catch (error) {
    console.error('Pexels search error:', error);
  }

  return null;
}

// Search Unsplash (Free API - 50 requests/hour) - with duplicate avoidance
export async function searchUnsplash(query: string, excludeUrls?: Set<string>): Promise<ImageResult | null> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!apiKey) {
    console.log('Unsplash API key not configured');
    return null;
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    // Fetch more results for duplicate avoidance
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodedQuery}&per_page=15&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${apiKey}` }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Filter out already used images
      const availableResults = excludeUrls
        ? data.results.filter((result: UnsplashResult) => !excludeUrls.has(result.urls.regular))
        : data.results;

      if (availableResults.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(5, availableResults.length));
        const result: UnsplashResult = availableResults[randomIndex];

        console.log(`Unsplash: Image unique trouvée - ${result.urls.regular}`);

        return {
          url: result.urls.regular,
          thumbnailUrl: result.urls.small,
          source: 'Unsplash',
          photographer: result.user.name,
          sourceUrl: result.links.html
        };
      }
    }
  } catch (error) {
    console.error('Unsplash search error:', error);
  }

  return null;
}

// Generate image with AI (Gemini) as fallback - always unique
export async function generateAIImage(query: string, title: string): Promise<ImageResult | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.log('Gemini API key not configured');
    return null;
  }

  try {
    // Use Gemini's image generation endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a professional news article illustration image for this headline: "${title}".
                     The image should be appropriate for a news website, photorealistic style,
                     landscape orientation, suitable for Madagascar news context.
                     Keywords: ${query}`
            }]
          }],
          generationConfig: {
            responseModalities: ["image", "text"],
            responseMimeType: "image/jpeg"
          }
        })
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return null;
    }

    const data = await response.json();

    // Check if image was generated
    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          // Return base64 image - always unique since AI generates it
          return {
            url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            thumbnailUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            source: 'AI Generated (Gemini)',
            photographer: 'Intelligence Artificielle'
          };
        }
      }
    }
  } catch (error) {
    console.error('AI image generation error:', error);
  }

  return null;
}

// Main search function - PARALLELIZED searches for maximum performance
export async function searchImage(
  title: string,
  summary?: string,
  category?: string,
  forceAI: boolean = false,
  excludeUrls?: Set<string>
): Promise<ImageResult | null> {
  const startTime = Date.now();

  // Extract search keywords (now async to support Malagasy translation)
  const searchQuery = await extractKeywords(title, summary, category);

  console.log(`Image search: title="${title.substring(0, 50)}...", category="${category}", query="${searchQuery}"`);

  // Get recently used images if not provided
  const usedImages = excludeUrls || await getRecentlyUsedImages();

  let image: ImageResult | null = null;

  // If not forcing AI, try free image sources in PARALLEL
  if (!forceAI) {
    // Launch all searches in parallel for maximum speed
    const searchPromises = [
      searchPixabay(searchQuery, category, usedImages).catch(() => null),
      searchPexels(searchQuery, usedImages).catch(() => null),
      searchUnsplash(searchQuery, usedImages).catch(() => null),
    ];

    // Use Promise.allSettled to get all results, even if some fail
    const results = await Promise.allSettled(searchPromises);

    // Priority order: Pixabay > Pexels > Unsplash
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        image = result.value;
        break;
      }
    }
  }

  // Fall back to AI generation if no free image found (AI always generates unique images)
  if (!image) {
    console.log('No unique free image found, falling back to AI generation...');
    image = await generateAIImage(searchQuery, title);
  }

  const duration = Date.now() - startTime;
  console.log(`Image search completed in ${duration}ms`);

  return image;
}
