// Horoscope du jour - Données générées quotidiennement

export interface ZodiacSign {
  id: string;
  name: string;
  nameMg: string; // Nom en malgache
  symbol: string;
  dateRange: string;
  element: 'feu' | 'terre' | 'air' | 'eau';
}

export const zodiacSigns: ZodiacSign[] = [
  { id: 'belier', name: 'Bélier', nameMg: 'Ondrilahy', symbol: '♈', dateRange: '21 mars - 19 avril', element: 'feu' },
  { id: 'taureau', name: 'Taureau', nameMg: 'Omby', symbol: '♉', dateRange: '20 avril - 20 mai', element: 'terre' },
  { id: 'gemeaux', name: 'Gémeaux', nameMg: 'Kambana', symbol: '♊', dateRange: '21 mai - 20 juin', element: 'air' },
  { id: 'cancer', name: 'Cancer', nameMg: 'Foza', symbol: '♋', dateRange: '21 juin - 22 juillet', element: 'eau' },
  { id: 'lion', name: 'Lion', nameMg: 'Liona', symbol: '♌', dateRange: '23 juillet - 22 août', element: 'feu' },
  { id: 'vierge', name: 'Vierge', nameMg: 'Virjiny', symbol: '♍', dateRange: '23 août - 22 septembre', element: 'terre' },
  { id: 'balance', name: 'Balance', nameMg: 'Mizana', symbol: '♎', dateRange: '23 septembre - 22 octobre', element: 'air' },
  { id: 'scorpion', name: 'Scorpion', nameMg: 'Maingoka', symbol: '♏', dateRange: '23 octobre - 21 novembre', element: 'eau' },
  { id: 'sagittaire', name: 'Sagittaire', nameMg: 'Mpitifitra', symbol: '♐', dateRange: '22 novembre - 21 décembre', element: 'feu' },
  { id: 'capricorne', name: 'Capricorne', nameMg: 'Osy', symbol: '♑', dateRange: '22 décembre - 19 janvier', element: 'terre' },
  { id: 'verseau', name: 'Verseau', nameMg: 'Mpanondra-drano', symbol: '♒', dateRange: '20 janvier - 18 février', element: 'air' },
  { id: 'poissons', name: 'Poissons', nameMg: 'Trondro', symbol: '♓', dateRange: '19 février - 20 mars', element: 'eau' },
];

// Messages pour générer l'horoscope du jour
const loveMessages = [
  "L'amour frappe à votre porte aujourd'hui. Ouvrez votre coeur.",
  "Une rencontre inattendue pourrait changer votre vie sentimentale.",
  "Prenez le temps de chérir vos proches aujourd'hui.",
  "Votre charme naturel attire tous les regards.",
  "La communication avec votre partenaire sera harmonieuse.",
  "Les célibataires pourraient faire une belle rencontre.",
  "Montrez votre affection sans retenue à ceux que vous aimez.",
  "Une surprise romantique vous attend.",
  "Laissez parler votre coeur, il sait ce qu'il veut.",
  "L'harmonie règne dans votre vie amoureuse.",
];

const workMessages = [
  "Une opportunité professionnelle se présente. Saisissez-la!",
  "Votre travail acharné sera enfin reconnu.",
  "C'est le bon moment pour proposer vos idées innovantes.",
  "La collaboration avec vos collègues sera fructueuse.",
  "Un projet important avance dans la bonne direction.",
  "Restez concentré sur vos objectifs, le succès approche.",
  "Votre créativité sera votre meilleur atout aujourd'hui.",
  "Les négociations se dérouleront en votre faveur.",
  "Un mentor pourrait vous guider vers de nouveaux horizons.",
  "Votre persévérance portera ses fruits très bientôt.",
];

const healthMessages = [
  "Prenez soin de votre corps, il vous le rendra.",
  "Une activité physique légère vous fera le plus grand bien.",
  "Écoutez les signaux de votre corps.",
  "L'énergie positive circule en vous aujourd'hui.",
  "Accordez-vous des moments de détente et de méditation.",
  "Votre vitalité est au plus haut.",
  "Une alimentation équilibrée renforcera votre bien-être.",
  "Le repos sera votre meilleur allié ce jour.",
  "Hydratez-vous bien et restez actif.",
  "Votre santé mentale mérite autant d'attention que votre physique.",
];

const luckMessages = [
  "Les astres vous sourient! La chance est de votre côté.",
  "Un événement inattendu apportera de la joie.",
  "Les chiffres 3, 7 et 12 vous seront favorables.",
  "Une bonne nouvelle arrive bientôt.",
  "Faites confiance à votre intuition aujourd'hui.",
  "Les opportunités se multiplient autour de vous.",
  "C'est un excellent jour pour prendre des décisions.",
  "La fortune sourit aux audacieux, osez!",
  "Un cadeau ou une récompense vous attend.",
  "Les énergies cosmiques jouent en votre faveur.",
];

// Fonction pour générer un horoscope basé sur la date et le signe
export function generateDailyHoroscope(signId: string, date: Date = new Date()) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const signIndex = zodiacSigns.findIndex(s => s.id === signId);

  // Utiliser le jour et le signe pour créer un seed unique
  const seed = dayOfYear * 12 + signIndex;

  const getMessageIndex = (messages: string[], offset: number) => {
    return Math.abs((seed + offset) % messages.length);
  };

  // Score de 1 à 5 étoiles basé sur le seed
  const loveScore = (seed % 5) + 1;
  const workScore = ((seed + 3) % 5) + 1;
  const healthScore = ((seed + 7) % 5) + 1;
  const luckScore = ((seed + 11) % 5) + 1;

  return {
    signId,
    date: date.toISOString().split('T')[0],
    love: {
      message: loveMessages[getMessageIndex(loveMessages, 0)],
      score: loveScore,
    },
    work: {
      message: workMessages[getMessageIndex(workMessages, 100)],
      score: workScore,
    },
    health: {
      message: healthMessages[getMessageIndex(healthMessages, 200)],
      score: healthScore,
    },
    luck: {
      message: luckMessages[getMessageIndex(luckMessages, 300)],
      score: luckScore,
    },
    luckyNumbers: [
      ((seed % 49) + 1),
      (((seed * 3) % 49) + 1),
      (((seed * 7) % 49) + 1),
    ].sort((a, b) => a - b),
    luckyColor: ['rouge', 'bleu', 'vert', 'jaune', 'violet', 'orange', 'rose'][seed % 7],
  };
}

export type DailyHoroscope = ReturnType<typeof generateDailyHoroscope>;
