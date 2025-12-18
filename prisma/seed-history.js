const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedHistory() {
  const events = [
    // MADAGASCAR - Dates importantes
    {
      day: 26, month: 6, year: 1960,
      title: "Indépendance de Madagascar",
      description: "Le 26 juin 1960, Madagascar proclame son indépendance après 64 ans de colonisation française. Philibert Tsiranana devient le premier Président de la République malgache. Cette date est célébrée chaque année comme fête nationale.",
      location: "Madagascar",
      isMadagascar: true,
      source: "Histoire de Madagascar"
    },
    {
      day: 29, month: 3, year: 1947,
      title: "Insurrection malgache de 1947",
      description: "Début de l'insurrection contre la colonisation française. Cette révolte, violemment réprimée, a fait des dizaines de milliers de victimes et reste une date mémorielle importante pour le peuple malgache.",
      location: "Madagascar",
      isMadagascar: true,
      source: "Histoire de Madagascar"
    },
    {
      day: 14, month: 10, year: 1958,
      title: "Proclamation de la République malgache",
      description: "Madagascar devient une république autonome au sein de la Communauté française, prélude à l'indépendance totale de 1960.",
      location: "Madagascar",
      isMadagascar: true,
      source: "Histoire de Madagascar"
    },
    {
      day: 6, month: 2, year: 1975,
      title: "Didier Ratsiraka prend le pouvoir",
      description: "Le capitaine de frégate Didier Ratsiraka prend le pouvoir et instaure la Deuxième République avec une orientation socialiste.",
      location: "Madagascar",
      isMadagascar: true,
      source: "Histoire politique de Madagascar"
    },
    {
      day: 17, month: 3, year: 2009,
      title: "Crise politique malgache",
      description: "Andry Rajoelina prend le pouvoir après plusieurs semaines de manifestations, marquant le début d une période de transition politique.",
      location: "Madagascar",
      isMadagascar: true,
      source: "Histoire contemporaine de Madagascar"
    },
    {
      day: 8, month: 5, year: 1883,
      title: "Première guerre franco-malgache",
      description: "Début de la première guerre entre la France et le Royaume de Madagascar, qui aboutira au traité de 1885.",
      location: "Madagascar",
      isMadagascar: true,
      source: "Histoire de Madagascar"
    },
    {
      day: 6, month: 8, year: 1896,
      title: "Madagascar devient colonie française",
      description: "La France annexe officiellement Madagascar, mettant fin à la monarchie Merina. La reine Ranavalona III sera exilée.",
      location: "Madagascar",
      isMadagascar: true,
      source: "Histoire coloniale"
    },
    {
      day: 18, month: 9, year: 1890,
      title: "Naissance de Jean Ralaimongo",
      description: "Naissance de Jean Ralaimongo, journaliste et homme politique, figure majeure du mouvement nationaliste malgache.",
      location: "Madagascar",
      isMadagascar: true,
      source: "Personnalités malgaches"
    },
    {
      day: 11, month: 12, year: 1895,
      title: "Prise de Tananarive par les Français",
      description: "Les troupes françaises du général Duchesne entrent dans la capitale malgache, marquant la fin de la résistance de la monarchie Merina.",
      location: "Antananarivo, Madagascar",
      isMadagascar: true,
      source: "Histoire coloniale"
    },
    {
      day: 1, month: 5, year: 1972,
      title: "Grève générale à Madagascar",
      description: "Début des manifestations étudiantes et de la grève générale qui mèneront à la chute de la Première République.",
      location: "Madagascar",
      isMadagascar: true,
      source: "Histoire de Madagascar"
    },
    {
      day: 30, month: 12, year: 1975,
      title: "Création de la République Démocratique de Madagascar",
      description: "Didier Ratsiraka proclame la République Démocratique de Madagascar avec une nouvelle constitution socialiste.",
      location: "Madagascar",
      isMadagascar: true,
      source: "Histoire politique"
    },
    {
      day: 25, month: 1, year: 2019,
      title: "Investiture de Andry Rajoelina",
      description: "Andry Rajoelina est investi Président de la République après sa victoire à l élection présidentielle de 2018.",
      location: "Antananarivo, Madagascar",
      isMadagascar: true,
      source: "Histoire contemporaine"
    },

    // ÉVÉNEMENTS MONDIAUX
    {
      day: 14, month: 7, year: 1789,
      title: "Prise de la Bastille",
      description: "La prise de la Bastille marque le début de la Révolution française. Cet événement symbolise la fin de l absolutisme royal et le début d une nouvelle ère pour la France.",
      location: "Paris, France",
      isMadagascar: false,
      source: "Histoire de France"
    },
    {
      day: 11, month: 11, year: 1918,
      title: "Armistice de la Première Guerre mondiale",
      description: "L armistice met fin aux combats de la Première Guerre mondiale. Ce conflit a fait plus de 18 millions de morts.",
      location: "France",
      isMadagascar: false,
      source: "Histoire mondiale"
    },
    {
      day: 8, month: 5, year: 1945,
      title: "Fin de la Seconde Guerre mondiale en Europe",
      description: "L Allemagne nazie capitule sans conditions, mettant fin à la guerre en Europe après 6 ans de conflit.",
      location: "Europe",
      isMadagascar: false,
      source: "Histoire mondiale"
    },
    {
      day: 20, month: 7, year: 1969,
      title: "Premier pas sur la Lune",
      description: "Neil Armstrong devient le premier homme à marcher sur la Lune lors de la mission Apollo 11, prononçant sa célèbre phrase: Un petit pas pour l homme, un bond de géant pour l humanité.",
      location: "Lune",
      isMadagascar: false,
      source: "NASA"
    },
    {
      day: 9, month: 11, year: 1989,
      title: "Chute du Mur de Berlin",
      description: "La chute du mur de Berlin marque symboliquement la fin de la Guerre froide et le début de la réunification allemande.",
      location: "Berlin, Allemagne",
      isMadagascar: false,
      source: "Histoire contemporaine"
    },
    {
      day: 28, month: 8, year: 1963,
      title: "Discours I Have a Dream",
      description: "Martin Luther King Jr. prononce son célèbre discours I Have a Dream devant 250 000 personnes à Washington, moment clé du mouvement des droits civiques.",
      location: "Washington D.C., USA",
      isMadagascar: false,
      source: "Histoire des droits civiques"
    },
    {
      day: 10, month: 12, year: 1948,
      title: "Déclaration universelle des droits de l homme",
      description: "L Assemblée générale des Nations Unies adopte la Déclaration universelle des droits de l homme à Paris.",
      location: "Paris, France",
      isMadagascar: false,
      source: "Nations Unies"
    },
    {
      day: 25, month: 12, year: 1,
      title: "Noël - Naissance de Jésus-Christ",
      description: "Fête chrétienne commémorant la naissance de Jésus-Christ, célébrée dans le monde entier.",
      location: "Bethléem",
      isMadagascar: false,
      source: "Tradition chrétienne"
    },
    {
      day: 1, month: 1, year: 2000,
      title: "Passage à l an 2000",
      description: "Le monde entier célèbre le passage au nouveau millénaire, malgré les craintes du bug de l an 2000.",
      location: "Monde",
      isMadagascar: false,
      source: "Histoire contemporaine"
    },
    {
      day: 17, month: 12, year: 1903,
      title: "Premier vol motorisé des frères Wright",
      description: "Orville et Wilbur Wright réalisent le premier vol motorisé contrôlé de l histoire à Kitty Hawk.",
      location: "Caroline du Nord, USA",
      isMadagascar: false,
      source: "Histoire de l aviation"
    },
    {
      day: 18, month: 12, year: 1958,
      title: "Lancement du premier satellite de communication",
      description: "Les États-Unis lancent SCORE, le premier satellite de communication qui diffuse un message de paix du président Eisenhower depuis l espace.",
      location: "USA",
      isMadagascar: false,
      source: "Histoire spatiale"
    },
    {
      day: 18, month: 12, year: 1865,
      title: "Abolition de l esclavage aux États-Unis",
      description: "Le 13e amendement de la Constitution américaine est ratifié, abolissant officiellement l esclavage sur tout le territoire des États-Unis.",
      location: "USA",
      isMadagascar: false,
      source: "Histoire américaine"
    },
    {
      day: 18, month: 12, year: 1973,
      title: "Reconnaissance de la RDA par l ONU",
      description: "L Allemagne de l Est (RDA) devient membre des Nations Unies, marquant une étape importante de la détente pendant la Guerre froide.",
      location: "New York, USA",
      isMadagascar: false,
      source: "Histoire mondiale"
    },
    {
      day: 18, month: 12, year: 1946,
      title: "Naissance de Steven Spielberg",
      description: "Naissance du réalisateur américain Steven Spielberg, créateur de films légendaires comme E.T., Jurassic Park, La Liste de Schindler.",
      location: "Cincinnati, USA",
      isMadagascar: false,
      source: "Cinéma"
    },
    {
      day: 16, month: 12, year: 1770,
      title: "Naissance de Beethoven",
      description: "Naissance de Ludwig van Beethoven, compositeur allemand considéré comme l un des plus grands musiciens de tous les temps.",
      location: "Bonn, Allemagne",
      isMadagascar: false,
      source: "Histoire de la musique"
    },
    {
      day: 15, month: 12, year: 1791,
      title: "Ratification du Bill of Rights américain",
      description: "Les dix premiers amendements de la Constitution américaine sont ratifiés, garantissant les libertés fondamentales.",
      location: "USA",
      isMadagascar: false,
      source: "Histoire américaine"
    },
    {
      day: 12, month: 4, year: 1961,
      title: "Youri Gagarine, premier homme dans l espace",
      description: "Le cosmonaute soviétique Youri Gagarine devient le premier homme à voyager dans l espace à bord de Vostok 1.",
      location: "URSS",
      isMadagascar: false,
      source: "Histoire spatiale"
    },
    {
      day: 18, month: 7, year: 1918,
      title: "Naissance de Nelson Mandela",
      description: "Naissance de Nelson Mandela, futur président sud-africain et icône de la lutte contre l apartheid.",
      location: "Afrique du Sud",
      isMadagascar: false,
      source: "Histoire africaine"
    },
    {
      day: 4, month: 7, year: 1776,
      title: "Déclaration d indépendance des États-Unis",
      description: "Les treize colonies américaines déclarent leur indépendance de la Grande-Bretagne.",
      location: "Philadelphie, USA",
      isMadagascar: false,
      source: "Histoire américaine"
    },
    {
      day: 6, month: 6, year: 1944,
      title: "Débarquement en Normandie (D-Day)",
      description: "Les forces alliées débarquent sur les plages de Normandie, marquant le début de la libération de l Europe occidentale.",
      location: "Normandie, France",
      isMadagascar: false,
      source: "Seconde Guerre mondiale"
    },
    {
      day: 22, month: 11, year: 1963,
      title: "Assassinat de John F. Kennedy",
      description: "Le président américain John F. Kennedy est assassiné à Dallas, Texas.",
      location: "Dallas, USA",
      isMadagascar: false,
      source: "Histoire américaine"
    },
    {
      day: 11, month: 9, year: 2001,
      title: "Attentats du 11 septembre",
      description: "Attentats terroristes contre le World Trade Center à New York et le Pentagone, faisant près de 3000 victimes.",
      location: "New York, USA",
      isMadagascar: false,
      source: "Histoire contemporaine"
    },
    {
      day: 2, month: 2, year: 1990,
      title: "Fin de l apartheid annoncée",
      description: "Le président sud-africain Frederik de Klerk annonce la libération de Nelson Mandela et la fin de l apartheid.",
      location: "Afrique du Sud",
      isMadagascar: false,
      source: "Histoire africaine"
    }
  ];

  console.log("Seeding historical events...");

  for (const event of events) {
    await prisma.historicalEvent.create({ data: event });
    console.log("Added:", event.title);
  }

  console.log("\nTotal events added:", events.length);
  await prisma.$disconnect();
}

seedHistory().catch((e) => {
  console.error(e);
  process.exit(1);
});
