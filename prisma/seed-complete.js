const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// MADAGASCAR HISTORY - COMPLETE SEED DATA
// ============================================

async function seedComplete() {
  console.log('Starting complete Madagascar history seed...\n');

  // 1. SEED HISTORICAL ERAS
  console.log('Seeding Historical Eras...');
  const eras = [
    {
      name: "Peuplement et origines",
      nameMg: "Fipetrahan'ny mponina voalohany",
      nameEn: "Settlement and origins",
      slug: "peuplement-origines",
      description: "Arrivée des premiers habitants austronésiens et africains, établissement des premières communautés sur l'île. Cette période couvre les migrations depuis l'Indonésie et l'Afrique de l'Est.",
      startYear: 350,
      endYear: 1500,
      color: "#8B4513",
      imageUrl: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80",
      order: 1
    },
    {
      name: "Royaumes malgaches",
      nameMg: "Fanjakana Malagasy",
      nameEn: "Malagasy Kingdoms",
      slug: "royaumes-malgaches",
      description: "Émergence et développement des différents royaumes malgaches: Sakalava, Merina, Betsileo, Betsimisaraka et autres. Période de formation des identités régionales.",
      startYear: 1500,
      endYear: 1817,
      color: "#DAA520",
      imageUrl: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80",
      order: 2
    },
    {
      name: "Royaume de Madagascar",
      nameMg: "Fanjakan'i Madagasikara",
      nameEn: "Kingdom of Madagascar",
      slug: "royaume-madagascar",
      description: "Unification de l'île sous la royauté Merina. Règne des grands souverains: Andrianampoinimerina, Radama I, Ranavalona I, II, III. Modernisation et ouverture au monde.",
      startYear: 1817,
      endYear: 1896,
      color: "#B22222",
      imageUrl: "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=800&q=80",
      order: 3
    },
    {
      name: "Colonisation française",
      nameMg: "Fanjanahantany frantsay",
      nameEn: "French colonization",
      slug: "colonisation-francaise",
      description: "Madagascar sous domination coloniale française. Résistances, transformations sociales, première et deuxième guerres mondiales, émergence du nationalisme malgache.",
      startYear: 1896,
      endYear: 1960,
      color: "#0055A4",
      imageUrl: "https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=800&q=80",
      order: 4
    },
    {
      name: "Première République",
      nameMg: "Repoblika Voalohany",
      nameEn: "First Republic",
      slug: "premiere-republique",
      description: "Indépendance et présidence de Philibert Tsiranana. Politique de coopération avec la France, développement économique, crise de 1972.",
      startYear: 1960,
      endYear: 1972,
      color: "#228B22",
      imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
      order: 5
    },
    {
      name: "Transition et Deuxième République",
      nameMg: "Tetezamita sy Repoblika Faharoa",
      nameEn: "Transition and Second Republic",
      slug: "deuxieme-republique",
      description: "Période de transition sous le Général Ramanantsoa puis présidence de Didier Ratsiraka. Orientation socialiste, malgachisation, nationalisation.",
      startYear: 1972,
      endYear: 1991,
      color: "#DC143C",
      imageUrl: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=800&q=80",
      order: 6
    },
    {
      name: "Troisième République",
      nameMg: "Repoblika Fahatelo",
      nameEn: "Third Republic",
      slug: "troisieme-republique",
      description: "Démocratisation, alternances politiques avec Zafy, Ratsiraka, Ravalomanana. Crises politiques de 2002 et 2009.",
      startYear: 1991,
      endYear: 2010,
      color: "#FF6B35",
      imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
      order: 7
    },
    {
      name: "Quatrième République",
      nameMg: "Repoblika Fahefatra",
      nameEn: "Fourth Republic",
      slug: "quatrieme-republique",
      description: "Constitution de 2010, présidence de Rajaonarimampianina puis Rajoelina. Défis économiques, sociaux et environnementaux contemporains.",
      startYear: 2010,
      endYear: null,
      color: "#4CAF50",
      imageUrl: "https://images.unsplash.com/photo-1590424693420-68c2e36b4660?w=800&q=80",
      order: 8
    }
  ];

  for (const era of eras) {
    await prisma.historicalEra.upsert({
      where: { slug: era.slug },
      update: era,
      create: era
    });
    console.log(`  Added era: ${era.name}`);
  }

  // Get eras for reference
  const eraMap = {};
  const allEras = await prisma.historicalEra.findMany();
  for (const e of allEras) {
    eraMap[e.slug] = e.id;
  }

  // 2. SEED POLITICAL LEADERS
  console.log('\nSeeding Political Leaders...');
  const leaders = [
    // Monarchs
    {
      name: "Andrianampoinimerina",
      slug: "andrianampoinimerina",
      title: "Roi",
      startYear: 1787,
      endYear: 1810,
      biography: "Andrianampoinimerina (né Ramboasalama vers 1745-1810) est le roi qui a unifié le royaume Merina et posé les bases de l'unification de Madagascar. Son nom signifie 'Le Prince au coeur de l'Imerina'. Il a réformé l'administration, l'économie et l'armée, développé les rizières et le commerce.",
      shortBio: "Unificateur du royaume Merina, fondateur de l'État malgache moderne.",
      birthYear: 1745,
      deathYear: 1810,
      type: "monarch",
      dynasty: "Merina",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Andrianampoinimerina.jpg",
      majorEvents: JSON.stringify(["Unification de l'Imerina", "Conquête d'Antananarivo", "Réforme du Fokonolona", "Développement des rizières"]),
      achievements: "Unification de l'Imerina, création d'un système administratif efficace, développement agricole",
      order: 1
    },
    {
      name: "Radama I",
      slug: "radama-i",
      title: "Roi",
      startYear: 1810,
      endYear: 1828,
      biography: "Radama I (1793-1828), fils d'Andrianampoinimerina, a poursuivi l'unification de Madagascar. Il a ouvert le pays à l'influence européenne, introduit l'écriture latine, accueilli les missionnaires britanniques et modernisé l'armée.",
      shortBio: "Premier roi reconnu de Madagascar, modernisateur et diplomate.",
      birthYear: 1793,
      deathYear: 1828,
      type: "monarch",
      dynasty: "Merina",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Radama_I.jpg",
      majorEvents: JSON.stringify(["Conquête de l'Est", "Alliance avec l'Angleterre", "Introduction de l'écriture", "Modernisation de l'armée"]),
      achievements: "Extension du royaume, modernisation, alphabétisation, abolition de la traite des esclaves",
      order: 2
    },
    {
      name: "Ranavalona I",
      slug: "ranavalona-i",
      title: "Reine",
      startYear: 1828,
      endYear: 1861,
      biography: "Ranavalona I (1788-1861), épouse de Radama I, a régné pendant 33 ans. Elle a maintenu l'indépendance de Madagascar face aux puissances coloniales, expulsé les Européens et préservé les traditions malgaches. Son règne est controversé mais marque une période de résistance à l'impérialisme.",
      shortBio: "Reine guerrière qui a défendu l'indépendance de Madagascar pendant 33 ans.",
      birthYear: 1788,
      deathYear: 1861,
      type: "monarch",
      dynasty: "Merina",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/96/Ranavalona_I.jpg",
      majorEvents: JSON.stringify(["Expulsion des étrangers", "Persécution des chrétiens", "Développement de l'industrie locale", "Résistance aux invasions"]),
      achievements: "Préservation de l'indépendance, développement industriel local",
      order: 3
    },
    {
      name: "Radama II",
      slug: "radama-ii",
      title: "Roi",
      startYear: 1861,
      endYear: 1863,
      biography: "Radama II (1829-1863), fils de Ranavalona I, a régné brièvement. Il a ouvert le pays aux Européens et accordé de nombreuses libertés, mais son règne jugé trop libéral a conduit à son assassinat par des nobles conservateurs.",
      shortBio: "Roi réformateur au règne éphémère, assassiné pour ses réformes libérales.",
      birthYear: 1829,
      deathYear: 1863,
      type: "monarch",
      dynasty: "Merina",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Radama_II.jpg",
      majorEvents: JSON.stringify(["Ouverture aux Européens", "Liberté religieuse", "Charte Lambert"]),
      achievements: "Libéralisation du royaume, liberté religieuse",
      order: 4
    },
    {
      name: "Rasoherina",
      slug: "rasoherina",
      title: "Reine",
      startYear: 1863,
      endYear: 1868,
      biography: "Rasoherina (1814-1868), veuve de Radama II, fut placée sur le trône après l'assassinat de son mari. Elle épousa successivement deux Premiers ministres, Rainivoninahitriniony puis Rainilaiarivony, qui exercèrent le pouvoir réel.",
      shortBio: "Reine de transition, début du pouvoir des Premiers ministres.",
      birthYear: 1814,
      deathYear: 1868,
      type: "monarch",
      dynasty: "Merina",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Rasoherina.jpg",
      order: 5
    },
    {
      name: "Ranavalona II",
      slug: "ranavalona-ii",
      title: "Reine",
      startYear: 1868,
      endYear: 1883,
      biography: "Ranavalona II (1829-1883) a converti officiellement Madagascar au christianisme protestant en 1869, brûlant les sampy (idoles royales). Son Premier ministre et époux Rainilaiarivony modernisa l'administration et la justice.",
      shortBio: "Reine qui a christianisé officiellement Madagascar.",
      birthYear: 1829,
      deathYear: 1883,
      type: "monarch",
      dynasty: "Merina",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/67/Ranavalona_II.jpg",
      majorEvents: JSON.stringify(["Conversion au christianisme", "Brûlage des idoles", "Modernisation juridique"]),
      achievements: "Christianisation officielle, modernisation administrative",
      order: 6
    },
    {
      name: "Ranavalona III",
      slug: "ranavalona-iii",
      title: "Reine",
      startYear: 1883,
      endYear: 1896,
      biography: "Ranavalona III (1861-1917), dernière reine de Madagascar. Elle a résisté à la colonisation française mais fut exilée à la Réunion puis en Algérie après l'annexion de 1896. Elle resta un symbole de l'indépendance malgache jusqu'à sa mort.",
      shortBio: "Dernière reine de Madagascar, exilée après la colonisation française.",
      birthYear: 1861,
      deathYear: 1917,
      type: "monarch",
      dynasty: "Merina",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Ranavalona_III.jpg",
      majorEvents: JSON.stringify(["Guerres franco-malgaches", "Traité de 1885", "Colonisation 1896", "Exil"]),
      achievements: "Résistance à la colonisation, symbole de l'indépendance",
      order: 7
    },
    // Colonial Governor-General
    {
      name: "Joseph Gallieni",
      slug: "joseph-gallieni",
      title: "Gouverneur Général",
      startYear: 1896,
      endYear: 1905,
      biography: "Joseph Gallieni (1849-1916), général français, fut le premier Gouverneur général de Madagascar. Il a pacifié l'île, aboli la royauté, développé les infrastructures et mis en place l'administration coloniale.",
      shortBio: "Premier Gouverneur général, artisan de la colonisation de Madagascar.",
      birthYear: 1849,
      deathYear: 1916,
      type: "colonial",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Joseph_Gallieni.jpg",
      majorEvents: JSON.stringify(["Abolition de la monarchie", "Exil de Ranavalona III", "Construction de routes", "Politique des races"]),
      order: 8
    },
    // Presidents
    {
      name: "Philibert Tsiranana",
      slug: "philibert-tsiranana",
      title: "Président",
      startYear: 1959,
      endYear: 1972,
      biography: "Philibert Tsiranana (1912-1978), premier Président de la République malgache. Originaire de la côte Ouest (Tsimihety), il a conduit Madagascar vers l'indépendance tout en maintenant des liens étroits avec la France.",
      shortBio: "Premier Président de Madagascar, père de l'indépendance.",
      birthYear: 1912,
      deathYear: 1978,
      type: "president",
      party: "PSD (Parti Social Démocrate)",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Philibert_Tsiranana.jpg",
      majorEvents: JSON.stringify(["Proclamation de l'indépendance", "Politique de coopération", "Crise de 1972"]),
      achievements: "Indépendance de Madagascar, développement des infrastructures",
      order: 9
    },
    {
      name: "Gabriel Ramanantsoa",
      slug: "gabriel-ramanantsoa",
      title: "Chef de l'État",
      startYear: 1972,
      endYear: 1975,
      biography: "Gabriel Ramanantsoa (1906-1979), général qui a pris le pouvoir après la crise de 1972. Il a mené une politique de malgachisation et de révision des accords avec la France.",
      shortBio: "Général qui a mené la transition après 1972.",
      birthYear: 1906,
      deathYear: 1979,
      type: "president",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Gabriel_Ramanantsoa.jpg",
      majorEvents: JSON.stringify(["Référendum de 1972", "Malgachisation", "Renégociation des accords franco-malgaches"]),
      order: 10
    },
    {
      name: "Didier Ratsiraka",
      slug: "didier-ratsiraka",
      title: "Président",
      startYear: 1975,
      endYear: 1993,
      biography: "Didier Ratsiraka (1936-2021), capitaine de frégate devenu Président. Il a instauré la Deuxième République socialiste, nationalisé l'économie et créé la République Démocratique de Madagascar. Il revint au pouvoir de 1997 à 2002.",
      shortBio: "Président socialiste qui a dirigé Madagascar pendant près de 20 ans.",
      birthYear: 1936,
      deathYear: 2021,
      type: "president",
      party: "AREMA",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Didier_Ratsiraka_1.jpg",
      majorEvents: JSON.stringify(["Livre Rouge", "Nationalisation", "Investissement à outrance", "Ajustement structurel"]),
      achievements: "Malgachisation, industrialisation, indépendance économique",
      order: 11
    },
    {
      name: "Albert Zafy",
      slug: "albert-zafy",
      title: "Président",
      startYear: 1993,
      endYear: 1996,
      biography: "Albert Zafy (1927-2017), médecin et professeur, a mené l'opposition démocratique contre Ratsiraka. Premier Président de la Troisième République, il fut destitué par l'Assemblée nationale en 1996.",
      shortBio: "Premier Président de la Troisième République, destitué en 1996.",
      birthYear: 1927,
      deathYear: 2017,
      type: "president",
      party: "UNDD",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Albert_Zafy.jpg",
      majorEvents: JSON.stringify(["Démocratisation", "Constitution de 1992", "Destitution"]),
      order: 12
    },
    {
      name: "Marc Ravalomanana",
      slug: "marc-ravalomanana",
      title: "Président",
      startYear: 2002,
      endYear: 2009,
      biography: "Marc Ravalomanana (né en 1949), homme d'affaires fondateur de Tiko, est devenu Président après la crise de 2002. Il a modernisé l'économie et les infrastructures avant d'être renversé en 2009.",
      shortBio: "Homme d'affaires devenu Président, renversé en 2009.",
      birthYear: 1949,
      type: "president",
      party: "TIM",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Marc_Ravalomanana_-_World_Economic_Forum_on_Africa_2008.jpg",
      majorEvents: JSON.stringify(["Crise de 2002", "MAP Madagascar Action Plan", "Affaire Daewoo", "Crise de 2009"]),
      achievements: "Développement économique, infrastructures, lutte contre la corruption",
      order: 13
    },
    {
      name: "Andry Rajoelina",
      slug: "andry-rajoelina",
      title: "Président",
      startYear: 2009,
      endYear: null,
      biography: "Andry Rajoelina (né en 1974), ancien maire d'Antananarivo et DJ, a pris le pouvoir en 2009 lors d'une crise politique. Après une période de transition et un exil politique, il a été élu Président en 2018 et réélu en 2023.",
      shortBio: "Plus jeune chef d'État malgache, au pouvoir depuis 2009 avec interruption.",
      birthYear: 1974,
      type: "president",
      party: "TGV / IRD",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Andry_Rajoelina_2014.jpg",
      majorEvents: JSON.stringify(["Crise de 2009", "Transition", "Élection 2018", "Réélection 2023", "Covid-19"]),
      achievements: "Modernisation des infrastructures, digitalisation",
      order: 14
    },
    {
      name: "Hery Rajaonarimampianina",
      slug: "hery-rajaonarimampianina",
      title: "Président",
      startYear: 2014,
      endYear: 2018,
      biography: "Hery Rajaonarimampianina (né en 1958), économiste et expert-comptable, a été élu Président en 2013. Il a stabilisé l'économie après la crise mais a fait face à des défis politiques.",
      shortBio: "Économiste devenu Président pour sortir de la crise.",
      birthYear: 1958,
      type: "president",
      party: "HVM",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/84/Hery_Rajaonarimampianina_2014.jpg",
      majorEvents: JSON.stringify(["Fin de la transition", "Stabilisation économique", "Retour des bailleurs"]),
      order: 15
    }
  ];

  for (const leader of leaders) {
    await prisma.politicalLeader.upsert({
      where: { slug: leader.slug },
      update: leader,
      create: leader
    });
    console.log(`  Added leader: ${leader.name}`);
  }

  // 3. SEED MINING RESOURCES
  console.log('\nSeeding Mining Resources...');
  const miningResources = [
    {
      name: "Saphir",
      nameEn: "Sapphire",
      nameMg: "Safira",
      slug: "saphir",
      type: "precious_stone",
      subType: "sapphire",
      description: "Madagascar est l'un des plus grands producteurs de saphirs au monde. Les gisements d'Ilakaka, découverts en 1998, ont provoqué une ruée vers les pierres précieuses.",
      region: "Sud-Ouest (Ilakaka, Sakaraha)",
      locations: JSON.stringify([
        { name: "Ilakaka", coordinates: "-22.7333,45.0833" },
        { name: "Sakaraha", coordinates: "-22.9167,44.5333" },
        { name: "Ambondromifehy", coordinates: "-12.8,49.1" }
      ]),
      discoveryYear: 1998,
      worldRank: 2,
      percentWorld: 20,
      operators: JSON.stringify(["Artisans miniers", "SADEM", "Diverses compagnies étrangères"]),
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80",
      isFeatured: true
    },
    {
      name: "Nickel et Cobalt",
      nameEn: "Nickel and Cobalt",
      slug: "nickel-cobalt",
      type: "metal",
      subType: "nickel",
      description: "Le projet Ambatovy près de Moramanga est l'une des plus grandes mines de nickel latéritique au monde, produisant également du cobalt.",
      region: "Est (Moramanga)",
      locations: JSON.stringify([
        { name: "Ambatovy", coordinates: "-18.85,48.3" }
      ]),
      exploitationStart: 2012,
      productionVolume: "60 000 tonnes de nickel/an",
      operators: JSON.stringify(["Ambatovy (Sumitomo, Korea Resources)"]),
      worldRank: 5,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      isFeatured: true
    },
    {
      name: "Ilménite",
      nameEn: "Ilmenite",
      slug: "ilmenite",
      type: "mineral",
      subType: "ilmenite",
      description: "QMM (QIT Madagascar Minerals) exploite d'importants gisements d'ilménite dans le Sud-Est, utilisés pour produire du dioxyde de titane.",
      region: "Sud-Est (Fort-Dauphin)",
      locations: JSON.stringify([
        { name: "Fort-Dauphin", coordinates: "-25.0319,46.9856" }
      ]),
      exploitationStart: 2009,
      productionVolume: "750 000 tonnes/an",
      operators: JSON.stringify(["QIT Madagascar Minerals (Rio Tinto)"]),
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
      environmentalImpact: "Préoccupations concernant la forêt littorale et les communautés locales"
    },
    {
      name: "Graphite",
      nameEn: "Graphite",
      slug: "graphite",
      type: "mineral",
      subType: "graphite",
      description: "Madagascar possède d'importants gisements de graphite, matière première essentielle pour les batteries des véhicules électriques.",
      region: "Est et Sud-Est",
      locations: JSON.stringify([
        { name: "Manantenina", coordinates: "-24.3,47.0" },
        { name: "Mahela", coordinates: "-23.0,47.5" }
      ]),
      worldRank: 3,
      percentWorld: 6,
      productionVolume: "7 000 tonnes/an",
      operators: JSON.stringify(["Tirupati Graphite", "NextSource Materials"]),
      imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80"
    },
    {
      name: "Or",
      nameEn: "Gold",
      nameMg: "Volamena",
      slug: "or",
      type: "metal",
      subType: "gold",
      description: "L'exploitation aurifère artisanale est répandue à Madagascar, particulièrement dans le Sud-Ouest et l'Est. Plusieurs projets industriels sont en développement.",
      region: "Sud-Ouest, Est",
      locations: JSON.stringify([
        { name: "Betsiaka", coordinates: "-13.5,48.5" },
        { name: "Maevatanana", coordinates: "-16.95,46.8333" }
      ]),
      operators: JSON.stringify(["Artisans miniers", "Projet Maevatanana Gold"]),
      imageUrl: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80"
    },
    {
      name: "Rubis",
      nameEn: "Ruby",
      nameMg: "Robisy",
      slug: "rubis",
      type: "precious_stone",
      subType: "ruby",
      description: "Madagascar produit des rubis de qualité exceptionnelle, notamment dans la région d'Andilamena. Ces pierres sont prisées sur le marché international.",
      region: "Nord-Est (Andilamena, Vatomandry)",
      locations: JSON.stringify([
        { name: "Andilamena", coordinates: "-17.0,48.5" },
        { name: "Didy", coordinates: "-18.2,48.7" }
      ]),
      discoveryYear: 2000,
      imageUrl: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&q=80"
    },
    {
      name: "Mica",
      nameEn: "Mica",
      slug: "mica",
      type: "mineral",
      subType: "mica",
      description: "Madagascar est un producteur important de mica, utilisé dans l'industrie cosmétique et électronique. L'exploitation pose des problèmes de travail des enfants.",
      region: "Sud (Androy, Anosy)",
      locations: JSON.stringify([
        { name: "Région Androy", coordinates: "-24.5,45.5" }
      ]),
      imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
      environmentalImpact: "Préoccupations concernant le travail des enfants dans les mines artisanales"
    },
    {
      name: "Bauxite",
      nameEn: "Bauxite",
      slug: "bauxite",
      type: "mineral",
      subType: "bauxite",
      description: "D'importants gisements de bauxite existent dans le Nord de Madagascar, base de la production d'aluminium.",
      region: "Nord (Mananara)",
      locations: JSON.stringify([
        { name: "Mananara-Nord", coordinates: "-16.1667,49.7667" }
      ]),
      imageUrl: "https://images.unsplash.com/photo-1574263867128-a3d5c1b1decc?w=800&q=80"
    }
  ];

  for (const resource of miningResources) {
    await prisma.miningResource.upsert({
      where: { slug: resource.slug },
      update: resource,
      create: resource
    });
    console.log(`  Added mining resource: ${resource.name}`);
  }

  // 4. SEED EXPORT PRODUCTS
  console.log('\nSeeding Export Products...');
  const exportProducts = [
    {
      name: "Vanille",
      nameEn: "Vanilla",
      nameMg: "Lavanila",
      slug: "vanille",
      category: "agriculture",
      subCategory: "epices",
      description: "Madagascar est le premier producteur mondial de vanille, assurant environ 80% de la production mondiale. La vanille Bourbon de Madagascar est réputée pour sa qualité exceptionnelle.",
      annualExportValue: 600000000,
      percentOfExports: 25,
      mainDestinations: JSON.stringify(["France", "USA", "Allemagne", "Japon"]),
      worldRank: 1,
      productionRegions: JSON.stringify(["SAVA (Sambava, Antalaha, Vohemar, Andapa)"]),
      productionVolume: "2000 tonnes/an",
      harvestSeason: "Mai-Juillet",
      historyStart: 1880,
      historicalContext: "Introduite au 19ème siècle, la vanille est devenue le produit phare de Madagascar. La région SAVA concentre 80% de la production.",
      trend: "volatile",
      challenges: "Fluctuations des prix, qualité variable, concurrence synthétique",
      opportunities: "Premium quality, bio, traçabilité",
      imageUrl: "https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=800&q=80",
      isFeatured: true
    },
    {
      name: "Café",
      nameEn: "Coffee",
      nameMg: "Kafe",
      slug: "cafe",
      category: "agriculture",
      subCategory: "boissons",
      description: "Madagascar produit du café Arabica et Robusta de qualité. Le café malgache était autrefois l'un des meilleurs au monde avant le déclin de la production.",
      annualExportValue: 50000000,
      percentOfExports: 3,
      mainDestinations: JSON.stringify(["France", "Allemagne", "Italie"]),
      productionRegions: JSON.stringify(["Lac Alaotra", "Hautes Terres", "Est"]),
      productionVolume: "30 000 tonnes/an",
      harvestSeason: "Avril-Septembre",
      historyStart: 1830,
      historicalContext: "Introduit au 19ème siècle, le café a connu son âge d'or dans les années 1980 avant de décliner.",
      trend: "stable",
      challenges: "Vieillissement des plantations, maladies, prix bas",
      imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80"
    },
    {
      name: "Girofle",
      nameEn: "Cloves",
      nameMg: "Jirofo",
      slug: "girofle",
      category: "agriculture",
      subCategory: "epices",
      description: "Deuxième producteur mondial de girofle après l'Indonésie, Madagascar exporte clous et huile essentielle de girofle.",
      annualExportValue: 150000000,
      percentOfExports: 8,
      mainDestinations: JSON.stringify(["Indonésie", "Inde", "Singapour"]),
      worldRank: 2,
      productionRegions: JSON.stringify(["Analanjirofo", "Atsimo-Atsinanana"]),
      productionVolume: "15 000 tonnes/an",
      harvestSeason: "Octobre-Décembre",
      historyStart: 1920,
      imageUrl: "https://images.unsplash.com/photo-1599909533681-74042a9e9759?w=800&q=80",
      isFeatured: true
    },
    {
      name: "Litchi",
      nameEn: "Lychee",
      nameMg: "Letsy",
      slug: "litchi",
      category: "agriculture",
      subCategory: "fruits",
      description: "Le litchi de Madagascar est exporté principalement vers l'Europe pendant la période des fêtes de fin d'année.",
      annualExportValue: 30000000,
      percentOfExports: 2,
      mainDestinations: JSON.stringify(["France", "Allemagne", "Pays-Bas", "UK"]),
      productionRegions: JSON.stringify(["Toamasina", "Fenerive-Est"]),
      productionVolume: "100 000 tonnes/an",
      harvestSeason: "Novembre-Décembre",
      trend: "growing",
      imageUrl: "https://images.unsplash.com/photo-1558346648-9757f2fa4474?w=800&q=80"
    },
    {
      name: "Crevettes",
      nameEn: "Shrimp",
      nameMg: "Makamba",
      slug: "crevettes",
      category: "seafood",
      description: "Les crevettes de Madagascar (Penaeus monodon) sont réputées pour leur qualité. L'aquaculture s'est développée dans le Nord-Ouest.",
      annualExportValue: 80000000,
      percentOfExports: 5,
      mainDestinations: JSON.stringify(["France", "Espagne", "Japon"]),
      productionRegions: JSON.stringify(["Mahajanga", "Diana"]),
      productionVolume: "15 000 tonnes/an",
      trend: "stable",
      imageUrl: "https://images.unsplash.com/photo-1565680018093-ebb6b9e4d60a?w=800&q=80",
      isFeatured: true
    },
    {
      name: "Textile et Habillement",
      nameEn: "Textile and Clothing",
      slug: "textile",
      category: "textile",
      description: "Zone franche industrielle produisant pour l'exportation vers l'Europe et les USA (AGOA). Emploie des dizaines de milliers de personnes.",
      annualExportValue: 500000000,
      percentOfExports: 20,
      mainDestinations: JSON.stringify(["France", "USA", "Allemagne"]),
      productionRegions: JSON.stringify(["Antananarivo", "Antsirabe"]),
      trend: "growing",
      imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80"
    },
    {
      name: "Riz",
      nameEn: "Rice",
      nameMg: "Vary",
      slug: "riz",
      category: "agriculture",
      subCategory: "cereales",
      description: "Base de l'alimentation malgache, le riz est surtout produit pour la consommation locale. Madagascar importe du riz pour compléter sa production.",
      productionRegions: JSON.stringify(["Lac Alaotra", "Marovoay", "Sofia"]),
      productionVolume: "4 millions tonnes/an",
      harvestSeason: "Avril-Mai (principale), Novembre (contre-saison)",
      historyStart: 500,
      historicalContext: "Le riz est au coeur de la civilisation malgache depuis les premiers peuplements austronésiens.",
      challenges: "Rendements faibles, changement climatique, importations",
      imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&q=80"
    },
    {
      name: "Huiles Essentielles",
      nameEn: "Essential Oils",
      slug: "huiles-essentielles",
      category: "agriculture",
      subCategory: "aromatherapie",
      description: "Madagascar produit diverses huiles essentielles: ylang-ylang, ravintsara, niaouli, géranium. Le ravintsara est endémique et très prisé.",
      annualExportValue: 40000000,
      productionRegions: JSON.stringify(["Nosy Be (ylang)", "Hautes Terres (ravintsara)", "Est (girofle)"]),
      mainDestinations: JSON.stringify(["France", "USA", "Allemagne"]),
      trend: "growing",
      imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"
    }
  ];

  for (const product of exportProducts) {
    await prisma.exportProduct.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
    console.log(`  Added export product: ${product.name}`);
  }

  // 5. SEED FAMOUS THINGS
  console.log('\nSeeding Famous Things...');
  const famousThings = [
    {
      name: "Lémurien",
      nameEn: "Lemur",
      nameMg: "Gidro / Varika",
      slug: "lemurien",
      category: "fauna",
      description: "Les lémuriens sont des primates endémiques de Madagascar. Plus de 100 espèces existent, du minuscule microcèbe au grand indri. Ils sont devenus le symbole de la biodiversité unique de l'île.",
      shortDesc: "Primates emblématiques et endémiques de Madagascar.",
      scientificName: "Lemuriformes (infraordre)",
      endemic: true,
      conservationStatus: "De vulnérable à en danger critique",
      imageUrl: "https://images.unsplash.com/photo-1580855733764-084b90737008?w=800&q=80",
      funFacts: JSON.stringify([
        "Le nom 'lémurien' vient du latin 'lemures' (fantômes) à cause de leurs cris nocturnes",
        "Le plus petit est le microcèbe de Mme Berthe (30g)",
        "L'indri pousse des cris qui s'entendent à 2km"
      ]),
      isFeatured: true,
      order: 1
    },
    {
      name: "Baobab",
      nameEn: "Baobab",
      nameMg: "Renala / Fony",
      slug: "baobab",
      category: "flora",
      description: "Madagascar abrite 6 des 8 espèces de baobabs au monde. L'Allée des Baobabs à Morondava est l'un des sites les plus photographiés du pays.",
      shortDesc: "Arbre majestueux, symbole de Madagascar.",
      scientificName: "Adansonia (genre)",
      endemic: true,
      region: "Ouest",
      location: "Morondava, Tulear",
      imageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
      funFacts: JSON.stringify([
        "Peuvent vivre plus de 1000 ans",
        "Leur tronc peut stocker 120 000 litres d'eau",
        "6 espèces sur 8 au monde sont endémiques de Madagascar"
      ]),
      isFeatured: true,
      order: 2
    },
    {
      name: "Fossa",
      nameEn: "Fossa",
      nameMg: "Fosa",
      slug: "fossa",
      category: "fauna",
      description: "Le fossa est le plus grand carnivore de Madagascar. Ce félin primitif, cousin des mangoustes, est le prédateur principal des lémuriens.",
      scientificName: "Cryptoprocta ferox",
      endemic: true,
      conservationStatus: "Vulnérable",
      imageUrl: "https://images.unsplash.com/photo-1590692460906-8fef42e9e86d?w=800&q=80",
      funFacts: JSON.stringify([
        "Peut atteindre 2m de long avec la queue",
        "Seul prédateur capable de chasser l'indri",
        "Ressemble à un croisement entre chat et mangouste"
      ]),
      order: 3
    },
    {
      name: "Caméléon",
      nameEn: "Chameleon",
      nameMg: "Tana / Tanalahy",
      slug: "cameleon",
      category: "fauna",
      description: "Madagascar abrite environ la moitié des espèces de caméléons au monde, du minuscule Brookesia micra au grand caméléon de Parson.",
      scientificName: "Chamaeleonidae (famille)",
      endemic: true,
      conservationStatus: "Variable selon les espèces",
      imageUrl: "https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=800&q=80",
      funFacts: JSON.stringify([
        "Plus de 150 espèces à Madagascar",
        "Brookesia micra est le plus petit reptile au monde",
        "Leur langue peut s'étendre à 2x leur corps"
      ]),
      order: 4
    },
    {
      name: "Tsingy",
      nameEn: "Tsingy",
      slug: "tsingy",
      category: "landmark",
      description: "Les Tsingy sont des formations calcaires en aiguilles caractéristiques de Madagascar. Les plus célèbres sont à Bemaraha (UNESCO) et Ankarana.",
      region: "Ouest et Nord",
      location: "Bemaraha, Ankarana",
      worldRecognition: "Patrimoine mondial UNESCO (Bemaraha)",
      imageUrl: "https://images.unsplash.com/photo-1566296440512-2021f2c2b8e8?w=800&q=80",
      funFacts: JSON.stringify([
        "'Tsingy' signifie 'là où l'on ne peut marcher pieds nus'",
        "Formés par l'érosion depuis des millions d'années",
        "Abritent une faune et flore uniques"
      ]),
      isFeatured: true,
      order: 5
    },
    {
      name: "Ravinala",
      nameEn: "Traveller's Tree",
      nameMg: "Ravinala",
      slug: "ravinala",
      category: "flora",
      description: "L'arbre du voyageur est l'emblème national de Madagascar. Ses feuilles disposées en éventail accumulent l'eau de pluie, utile aux voyageurs.",
      scientificName: "Ravenala madagascariensis",
      endemic: true,
      imageUrl: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80",
      funFacts: JSON.stringify([
        "Symbole national sur le logo d'Air Madagascar",
        "Ses feuilles s'orientent Est-Ouest",
        "L'eau accumulée peut être bue en cas de nécessité"
      ]),
      isFeatured: true,
      order: 6
    },
    {
      name: "Zebu",
      nameEn: "Zebu",
      nameMg: "Omby",
      slug: "zebu",
      category: "culture",
      description: "Le zébu est central dans la culture malgache. Il symbolise la richesse, le prestige et est essentiel dans les cérémonies traditionnelles (funérailles, mariages).",
      imageUrl: "https://images.unsplash.com/photo-1589825743636-755c3d01f63d?w=800&q=80",
      funFacts: JSON.stringify([
        "La richesse se mesure traditionnellement en zébus",
        "Indispensable pour les cérémonies de retournement des morts",
        "La bosse est considérée comme la partie la plus noble"
      ]),
      order: 7
    },
    {
      name: "Hira Gasy",
      nameEn: "Hira Gasy",
      slug: "hira-gasy",
      category: "culture",
      description: "Art traditionnel malgache combinant musique, danse, théâtre et discours moraux. Les troupes de Hira Gasy perpétuent cette tradition depuis des siècles.",
      region: "Hautes Terres",
      worldRecognition: "Patrimoine culturel immatériel",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      funFacts: JSON.stringify([
        "Mélange unique d'opéra populaire et de théâtre moral",
        "Les costumes traditionnels sont caractéristiques",
        "Transmis de génération en génération"
      ]),
      order: 8
    },
    {
      name: "Famadihana",
      nameEn: "Turning of the Bones",
      nameMg: "Famadihana",
      slug: "famadihana",
      category: "tradition",
      description: "Cérémonie de retournement des morts pratiquée dans les Hautes Terres. Les corps des ancêtres sont exhumés, enveloppés de nouveaux linceuls et l'occasion de fêtes familiales.",
      region: "Hautes Terres",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
      funFacts: JSON.stringify([
        "Pratiquée tous les 5-7 ans",
        "Les Malgaches croient que les ancêtres protègent les vivants",
        "Grande fête familiale avec musique et festin"
      ]),
      order: 9
    },
    {
      name: "Pervenche de Madagascar",
      nameEn: "Madagascar Periwinkle",
      nameMg: "Vonenina",
      slug: "pervenche-madagascar",
      category: "flora",
      description: "Cette plante endémique a révolutionné le traitement de certains cancers (leucémie, lymphome de Hodgkin) grâce à ses alcaloïdes vincristine et vinblastine.",
      scientificName: "Catharanthus roseus",
      endemic: true,
      imageUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
      funFacts: JSON.stringify([
        "A sauvé des millions de vies grâce à ses propriétés anticancéreuses",
        "Taux de rémission de la leucémie infantile passé de 10% à 90%",
        "Madagascar n'a reçu que peu de bénéfices de cette découverte"
      ]),
      isFeatured: true,
      order: 10
    },
    // Additional famous things
    {
      name: "Aye-aye",
      nameEn: "Aye-aye",
      nameMg: "Hay hay",
      slug: "aye-aye",
      category: "fauna",
      description: "Le aye-aye est l'un des primates les plus uniques au monde. Ce lémurien nocturne possède un doigt squelettique allongé pour extraire les larves des arbres.",
      scientificName: "Daubentonia madagascariensis",
      endemic: true,
      conservationStatus: "En danger",
      imageUrl: "https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=800&q=80",
      funFacts: JSON.stringify([
        "Seul primate à utiliser l'écholocation pour trouver sa nourriture",
        "Considéré comme un mauvais présage dans la culture malgache",
        "Son doigt peut pivoter à 360 degrés"
      ]),
      order: 11
    },
    {
      name: "Allée des Baobabs",
      nameEn: "Avenue of the Baobabs",
      nameMg: "Lalan'ny Renala",
      slug: "allee-baobabs",
      category: "landmark",
      description: "Située près de Morondava, cette avenue bordée de baobabs géants de plus de 800 ans est l'un des sites les plus iconiques de Madagascar.",
      region: "Menabe",
      location: "Morondava",
      imageUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80",
      worldRecognition: "Site touristique majeur",
      funFacts: JSON.stringify([
        "Les baobabs peuvent avoir jusqu'à 800 ans",
        "Meilleur moment pour visiter: lever ou coucher du soleil",
        "Autrefois une forêt dense, maintenant seuls les baobabs subsistent"
      ]),
      isFeatured: true,
      order: 12
    },
    {
      name: "Indri",
      nameEn: "Indri",
      nameMg: "Babakoto",
      slug: "indri",
      category: "fauna",
      description: "Le plus grand des lémuriens vivants, l'indri est célèbre pour son chant mélodieux qui résonne dans la forêt tropicale. Il est considéré comme sacré par les Malgaches.",
      scientificName: "Indri indri",
      endemic: true,
      conservationStatus: "En danger critique",
      imageUrl: "https://images.unsplash.com/photo-1590692464256-5e6f8b7c8c73?w=800&q=80",
      funFacts: JSON.stringify([
        "Ne survit pas en captivité",
        "Son nom Babakoto signifie 'père de Koto' ou 'ancêtre'",
        "Ses chants peuvent s'entendre à 4 km"
      ]),
      order: 13
    },
    {
      name: "Nosy Be",
      nameEn: "Nosy Be Island",
      nameMg: "Nosy Be",
      slug: "nosy-be",
      category: "landmark",
      description: "La plus grande île touristique de Madagascar, connue pour ses plages paradisiaques, ses plantations d'ylang-ylang et sa vie nocturne animée.",
      region: "Diana",
      location: "Nord-Ouest de Madagascar",
      imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
      funFacts: JSON.stringify([
        "Son nom signifie 'Grande île' en malgache",
        "Principale destination balnéaire du pays",
        "Célèbre pour ses plantations d'ylang-ylang et de cacao"
      ]),
      isFeatured: true,
      order: 14
    },
    {
      name: "Romazava",
      nameEn: "Romazava",
      nameMg: "Romazava",
      slug: "romazava",
      category: "cuisine",
      description: "Le plat national malgache, un bouillon de viande de zébu (ou porc/poulet) avec des brèdes (feuilles vertes comestibles). Servi traditionnellement avec du riz.",
      imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80",
      funFacts: JSON.stringify([
        "Plat incontournable de la cuisine malgache",
        "Le mot signifie 'bouillon clair'",
        "Chaque région a sa propre variante"
      ]),
      order: 15
    }
  ];

  for (const thing of famousThings) {
    await prisma.famousThing.upsert({
      where: { slug: thing.slug },
      update: thing,
      create: thing
    });
    console.log(`  Added famous thing: ${thing.name}`);
  }

  // 6. SEED ECONOMIC INDICATORS
  console.log('\nSeeding Economic Indicators...');
  const economicIndicators = [
    {
      name: "Prix de la Vanille",
      nameEn: "Vanilla Price",
      slug: "prix-vanille",
      type: "price",
      currentValue: 450,
      unit: "USD/kg",
      category: "vanilla",
      description: "Prix indicatif de la vanille malgache sur le marché international",
      source: "Marché international des épices"
    },
    {
      name: "Taux de change USD/MGA",
      nameEn: "USD/MGA Exchange Rate",
      slug: "taux-usd-mga",
      type: "rate",
      currentValue: 4500,
      unit: "MGA",
      description: "Taux de change du dollar américain en Ariary malgache",
      source: "Banque Centrale de Madagascar"
    },
    {
      name: "Taux de change EUR/MGA",
      nameEn: "EUR/MGA Exchange Rate",
      slug: "taux-eur-mga",
      type: "rate",
      currentValue: 4900,
      unit: "MGA",
      description: "Taux de change de l'euro en Ariary malgache",
      source: "Banque Centrale de Madagascar"
    },
    {
      name: "PIB",
      nameEn: "GDP",
      slug: "pib",
      type: "gdp",
      currentValue: 14.6,
      unit: "milliards USD",
      description: "Produit Intérieur Brut de Madagascar",
      source: "Banque Mondiale"
    },
    {
      name: "Taux d'inflation",
      nameEn: "Inflation Rate",
      slug: "inflation",
      type: "inflation",
      currentValue: 8.5,
      unit: "%",
      description: "Taux d'inflation annuel",
      source: "INSTAT Madagascar"
    },
    {
      name: "Prix du Riz local",
      nameEn: "Local Rice Price",
      slug: "prix-riz",
      type: "price",
      currentValue: 2800,
      unit: "MGA/kg",
      category: "rice",
      description: "Prix moyen du riz local au détail",
      source: "Observatoire du Riz"
    },
    {
      name: "Exportations totales",
      nameEn: "Total Exports",
      slug: "exportations",
      type: "export",
      currentValue: 3.2,
      unit: "milliards USD",
      description: "Valeur totale des exportations annuelles",
      source: "Douanes malgaches"
    },
    {
      name: "Production de nickel",
      nameEn: "Nickel Production",
      slug: "production-nickel",
      type: "export",
      currentValue: 60000,
      unit: "tonnes/an",
      category: "mining",
      description: "Production annuelle de nickel (Ambatovy)",
      source: "Ambatovy"
    }
  ];

  for (const indicator of economicIndicators) {
    await prisma.economicIndicator.upsert({
      where: { slug: indicator.slug },
      update: indicator,
      create: indicator
    });
    console.log(`  Added indicator: ${indicator.name}`);
  }

  // 7. SEED EXTENDED HISTORICAL EVENTS
  console.log('\nSeeding Extended Historical Events...');
  const historicalEvents = [
    // Pre-colonial era
    {
      day: 1, month: 1, year: 350,
      title: "Premiers peuplements de Madagascar",
      description: "Arrivée des premiers habitants austronésiens venus d'Indonésie (Bornéo). Ces navigateurs ont traversé l'océan Indien en pirogues à balancier.",
      eventType: "discovery",
      importance: 5,
      eraId: eraMap["peuplement-origines"],
      isMadagascar: true,
      isVerified: true,
      isFeatured: true
    },
    {
      day: 1, month: 1, year: 1500,
      title: "Formation des premiers royaumes",
      description: "Émergence des royaumes Sakalava dans l'Ouest, Merina sur les Hautes Terres, et Betsimisaraka sur la côte Est.",
      eventType: "political",
      importance: 4,
      eraId: eraMap["royaumes-malgaches"],
      isMadagascar: true
    },
    {
      day: 10, month: 8, year: 1500,
      title: "Découverte européenne de Madagascar",
      description: "Le navigateur portugais Diogo Dias est le premier Européen à observer Madagascar, qu'il nomme São Lourenço.",
      eventType: "discovery",
      importance: 4,
      location: "Côte Est",
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1787,
      title: "Andrianampoinimerina devient roi d'Ambohimanga",
      description: "Début du règne d'Andrianampoinimerina qui unifiera l'Imerina et posera les bases du Royaume de Madagascar.",
      eventType: "political",
      importance: 5,
      location: "Ambohimanga",
      eraId: eraMap["royaumes-malgaches"],
      isMadagascar: true,
      isFeatured: true
    },
    {
      day: 1, month: 1, year: 1810,
      title: "Radama I succède à son père",
      description: "Radama I devient roi et continue l'œuvre d'unification. Il ouvrira Madagascar aux influences européennes.",
      eventType: "political",
      importance: 5,
      eraId: eraMap["royaume-madagascar"],
      isMadagascar: true
    },
    {
      day: 23, month: 10, year: 1817,
      title: "Traité anglo-merina",
      description: "Traité entre Radama I et l'Angleterre: reconnaissance du titre de 'Roi de Madagascar' et abolition de la traite des esclaves.",
      eventType: "political",
      importance: 4,
      eraId: eraMap["royaume-madagascar"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1820,
      title: "Introduction de l'écriture latine",
      description: "Les missionnaires britanniques David Jones et David Griffiths établissent l'alphabet malgache en caractères latins.",
      eventType: "cultural",
      importance: 5,
      location: "Antananarivo",
      eraId: eraMap["royaume-madagascar"],
      isMadagascar: true
    },
    {
      day: 27, month: 7, year: 1828,
      title: "Mort de Radama I",
      description: "Décès du roi Radama I. Son épouse Ranavalona I lui succède et changera radicalement la politique du royaume.",
      eventType: "political",
      importance: 4,
      eraId: eraMap["royaume-madagascar"],
      isMadagascar: true
    },
    {
      day: 1, month: 3, year: 1835,
      title: "Édit d'interdiction du christianisme",
      description: "Ranavalona I interdit le christianisme à Madagascar. Début des persécutions des chrétiens malgaches.",
      eventType: "social",
      importance: 4,
      eraId: eraMap["royaume-madagascar"],
      isMadagascar: true
    },
    {
      day: 8, month: 9, year: 1869,
      title: "Conversion officielle au christianisme",
      description: "La reine Ranavalona II se fait baptiser et Madagascar devient officiellement chrétien. Les idoles royales sont brûlées.",
      eventType: "cultural",
      importance: 5,
      location: "Antananarivo",
      eraId: eraMap["royaume-madagascar"],
      isMadagascar: true,
      isFeatured: true
    },
    {
      day: 17, month: 12, year: 1885,
      title: "Traité de protectorat",
      description: "Signature du traité établissant un protectorat français sur Madagascar après la première guerre franco-malgache.",
      eventType: "political",
      importance: 4,
      eraId: eraMap["royaume-madagascar"],
      isMadagascar: true
    },
    {
      day: 30, month: 9, year: 1895,
      title: "Prise d'Antananarivo",
      description: "Les troupes françaises du général Duchesne entrent dans Antananarivo après la seconde guerre franco-malgache.",
      eventType: "conflict",
      importance: 5,
      location: "Antananarivo",
      eraId: eraMap["royaume-madagascar"],
      isMadagascar: true
    },
    {
      day: 6, month: 8, year: 1896,
      title: "Annexion de Madagascar",
      description: "La France annexe officiellement Madagascar comme colonie. La monarchie est abolie. Début de la colonisation.",
      eventType: "political",
      importance: 5,
      eraId: eraMap["colonisation-francaise"],
      isMadagascar: true,
      isFeatured: true
    },
    {
      day: 28, month: 2, year: 1897,
      title: "Exil de Ranavalona III",
      description: "La dernière reine de Madagascar est exilée à la Réunion par le Gouverneur Gallieni.",
      eventType: "political",
      importance: 4,
      eraId: eraMap["colonisation-francaise"],
      isMadagascar: true
    },
    {
      day: 29, month: 3, year: 1947,
      title: "Insurrection malgache",
      description: "Début de l'insurrection pour l'indépendance. Violemment réprimée, elle fera des dizaines de milliers de morts.",
      eventType: "independence",
      importance: 5,
      eraId: eraMap["colonisation-francaise"],
      isMadagascar: true,
      isFeatured: true
    },
    {
      day: 14, month: 10, year: 1958,
      title: "Proclamation de la République",
      description: "Madagascar devient une République autonome au sein de la Communauté française.",
      eventType: "political",
      importance: 5,
      eraId: eraMap["premiere-republique"],
      isMadagascar: true
    },
    {
      day: 26, month: 6, year: 1960,
      title: "Indépendance de Madagascar",
      description: "Proclamation de l'indépendance totale de Madagascar. Philibert Tsiranana devient le premier Président.",
      eventType: "independence",
      importance: 5,
      location: "Antananarivo",
      eraId: eraMap["premiere-republique"],
      isMadagascar: true,
      isFeatured: true
    },
    {
      day: 13, month: 5, year: 1972,
      title: "Grève générale et chute de Tsiranana",
      description: "Après des mois de manifestations étudiantes, le général Ramanantsoa prend le pouvoir. Fin de la Première République.",
      eventType: "political",
      importance: 5,
      eraId: eraMap["deuxieme-republique"],
      isMadagascar: true
    },
    {
      day: 21, month: 12, year: 1975,
      title: "Charte de la Révolution Socialiste",
      description: "Didier Ratsiraka proclame la Deuxième République et la République Démocratique de Madagascar.",
      eventType: "political",
      importance: 4,
      eraId: eraMap["deuxieme-republique"],
      isMadagascar: true
    },
    {
      day: 10, month: 8, year: 1991,
      title: "Manifestations pro-démocratie",
      description: "Grandes manifestations à Antananarivo réclamant la démocratie. Début de la transition vers la Troisième République.",
      eventType: "political",
      importance: 4,
      eraId: eraMap["troisieme-republique"],
      isMadagascar: true
    },
    {
      day: 27, month: 3, year: 1993,
      title: "Albert Zafy élu Président",
      description: "Première élection présidentielle pluraliste. Albert Zafy devient le premier Président de la Troisième République.",
      eventType: "political",
      importance: 4,
      eraId: eraMap["troisieme-republique"],
      isMadagascar: true
    },
    {
      day: 22, month: 4, year: 2002,
      title: "Crise post-électorale",
      description: "Après des mois de crise entre Marc Ravalomanana et Didier Ratsiraka, Ravalomanana prend le pouvoir.",
      eventType: "political",
      importance: 4,
      eraId: eraMap["troisieme-republique"],
      isMadagascar: true
    },
    {
      day: 17, month: 3, year: 2009,
      title: "Coup d'État de 2009",
      description: "Andry Rajoelina prend le pouvoir avec le soutien de l'armée. Début d'une période de transition de 5 ans.",
      eventType: "political",
      importance: 4,
      eraId: eraMap["quatrieme-republique"],
      isMadagascar: true
    },
    {
      day: 25, month: 1, year: 2014,
      title: "Hery Rajaonarimampianina élu",
      description: "Élection présidentielle mettant fin à la transition. Retour à l'ordre constitutionnel.",
      eventType: "political",
      importance: 3,
      eraId: eraMap["quatrieme-republique"],
      isMadagascar: true
    },
    {
      day: 19, month: 1, year: 2019,
      title: "Investiture de Rajoelina",
      description: "Andry Rajoelina est investi Président après sa victoire à l'élection de 2018.",
      eventType: "political",
      importance: 3,
      eraId: eraMap["quatrieme-republique"],
      isMadagascar: true
    },
    {
      day: 16, month: 11, year: 2023,
      title: "Réélection de Rajoelina",
      description: "Andry Rajoelina est réélu pour un second mandat présidentiel.",
      eventType: "political",
      importance: 3,
      eraId: eraMap["quatrieme-republique"],
      isMadagascar: true
    },
    // Additional historical events
    {
      day: 1, month: 1, year: 800,
      title: "Développement des cités côtières",
      description: "Établissement de comptoirs commerciaux sur la côte Est par des marchands arabes et swahilis. Début des échanges maritimes avec l'Afrique et l'Asie.",
      eventType: "economic",
      importance: 3,
      eraId: eraMap["peuplement-origines"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1680,
      title: "Apogée du royaume Sakalava",
      description: "Le royaume Sakalava du Menabe et du Boina atteint son apogée, contrôlant une grande partie de l'ouest de Madagascar.",
      eventType: "political",
      importance: 4,
      location: "Ouest de Madagascar",
      eraId: eraMap["royaumes-malgaches"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1710,
      title: "Confédération Betsimisaraka",
      description: "Ratsimilaho unifie les clans de la côte Est pour former la confédération Betsimisaraka, rivalisant avec les Sakalava.",
      eventType: "political",
      importance: 4,
      location: "Côte Est",
      eraId: eraMap["royaumes-malgaches"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1800,
      title: "Conquête d'Antananarivo par Andrianampoinimerina",
      description: "Andrianampoinimerina prend le contrôle d'Antananarivo et en fait sa capitale, unifiant définitivement l'Imerina.",
      eventType: "political",
      importance: 5,
      location: "Antananarivo",
      eraId: eraMap["royaumes-malgaches"],
      isMadagascar: true,
      isFeatured: true
    },
    {
      day: 1, month: 1, year: 1824,
      title: "Première imprimerie à Madagascar",
      description: "Installation de la première imprimerie par les missionnaires de la London Missionary Society. Impression des premiers textes en malgache.",
      eventType: "cultural",
      importance: 4,
      location: "Antananarivo",
      eraId: eraMap["royaume-madagascar"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1826,
      title: "Conquête de la côte Est",
      description: "Les armées de Radama I achèvent la conquête de la côte Est, intégrant le territoire Betsimisaraka au royaume.",
      eventType: "conflict",
      importance: 4,
      location: "Tamatave",
      eraId: eraMap["royaume-madagascar"],
      isMadagascar: true
    },
    {
      day: 1, month: 6, year: 1857,
      title: "Construction du Palais de la Reine (Rova)",
      description: "Jean Laborde achève la construction du palais de pierre Manjakamiadana au sommet de la colline d'Analamanga à Antananarivo.",
      eventType: "cultural",
      importance: 4,
      location: "Antananarivo",
      eraId: eraMap["royaume-madagascar"],
      isMadagascar: true
    },
    {
      day: 15, month: 5, year: 1883,
      title: "Première guerre franco-malgache",
      description: "Bombardement français de Majunga et début de la première guerre entre la France et Madagascar.",
      eventType: "conflict",
      importance: 4,
      location: "Majunga",
      eraId: eraMap["royaume-madagascar"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1904,
      title: "Construction du chemin de fer TCE",
      description: "Début de la construction du chemin de fer Tananarive-Côte Est, un projet majeur de l'administration Gallieni.",
      eventType: "economic",
      importance: 3,
      eraId: eraMap["colonisation-francaise"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1913,
      title: "VVS - Vy Vato Sakelika",
      description: "Création de la société secrète VVS par des étudiants malgaches, première organisation nationaliste moderne.",
      eventType: "political",
      importance: 4,
      location: "Antananarivo",
      eraId: eraMap["colonisation-francaise"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1936,
      title: "Mouvement syndical malgache",
      description: "Le Front Populaire en France permet l'émergence d'un mouvement syndical à Madagascar et des premières revendications sociales.",
      eventType: "social",
      importance: 3,
      eraId: eraMap["colonisation-francaise"],
      isMadagascar: true
    },
    {
      day: 11, month: 5, year: 1946,
      title: "Création du MDRM",
      description: "Création du Mouvement Démocratique de la Rénovation Malgache, principal parti indépendantiste avant 1947.",
      eventType: "political",
      importance: 4,
      location: "Antananarivo",
      eraId: eraMap["colonisation-francaise"],
      isMadagascar: true
    },
    {
      day: 6, month: 5, year: 1946,
      title: "Madagascar Territoire d'Outre-Mer",
      description: "Madagascar devient un Territoire d'Outre-Mer de l'Union française avec une assemblée territoriale élue.",
      eventType: "political",
      importance: 3,
      eraId: eraMap["colonisation-francaise"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1956,
      title: "Loi-cadre Defferre",
      description: "La loi-cadre accorde une autonomie interne partielle à Madagascar et met fin au régime de l'indigénat.",
      eventType: "political",
      importance: 4,
      eraId: eraMap["colonisation-francaise"],
      isMadagascar: true
    },
    {
      day: 28, month: 9, year: 1958,
      title: "Référendum sur la Communauté française",
      description: "Madagascar vote 'oui' au référendum sur la Communauté française, premier pas vers l'indépendance.",
      eventType: "political",
      importance: 4,
      eraId: eraMap["premiere-republique"],
      isMadagascar: true
    },
    {
      day: 1, month: 5, year: 1963,
      title: "Accord de coopération franco-malgache",
      description: "Signature d'accords de coopération militaire, économique et culturelle avec la France.",
      eventType: "political",
      importance: 3,
      eraId: eraMap["premiere-republique"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1971,
      title: "Révolte paysanne dans le Sud",
      description: "Soulèvement du MONIMA dans le Sud malgache, violemment réprimé par l'armée.",
      eventType: "social",
      importance: 4,
      location: "Tuléar",
      eraId: eraMap["premiere-republique"],
      isMadagascar: true
    },
    {
      day: 5, month: 2, year: 1975,
      title: "Assassinat du Colonel Ratsimandrava",
      description: "Le Colonel Richard Ratsimandrava est assassiné 6 jours après avoir pris le pouvoir, plongeant le pays dans le chaos.",
      eventType: "political",
      importance: 4,
      location: "Antananarivo",
      eraId: eraMap["deuxieme-republique"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1978,
      title: "Nationalisation des entreprises",
      description: "Vague de nationalisations dans le cadre de la politique socialiste du 'Livre Rouge'.",
      eventType: "economic",
      importance: 4,
      eraId: eraMap["deuxieme-republique"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 1982,
      title: "Crise économique et ajustement structurel",
      description: "Début de la crise économique majeure. Madagascar accepte les programmes d'ajustement structurel du FMI.",
      eventType: "economic",
      importance: 4,
      eraId: eraMap["deuxieme-republique"],
      isMadagascar: true
    },
    {
      day: 6, month: 11, year: 1995,
      title: "Incendie du Rova d'Antananarivo",
      description: "Un incendie détruit le palais de la Reine (Rova), symbole de la monarchie malgache.",
      eventType: "cultural",
      importance: 5,
      location: "Antananarivo",
      eraId: eraMap["troisieme-republique"],
      isMadagascar: true,
      isFeatured: true
    },
    {
      day: 1, month: 1, year: 1998,
      title: "Découverte des saphirs d'Ilakaka",
      description: "Découverte de gisements de saphirs à Ilakaka, provoquant une ruée vers les pierres précieuses.",
      eventType: "economic",
      importance: 4,
      location: "Ilakaka",
      eraId: eraMap["troisieme-republique"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 2004,
      title: "Cyclone Gafilo",
      description: "Le cyclone Gafilo, l'un des plus puissants à frapper Madagascar, cause d'énormes dégâts dans le Nord.",
      eventType: "social",
      importance: 4,
      location: "Nord de Madagascar",
      eraId: eraMap["troisieme-republique"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 2012,
      title: "Début de la production d'Ambatovy",
      description: "La mine de nickel et cobalt d'Ambatovy commence sa production commerciale.",
      eventType: "economic",
      importance: 3,
      location: "Moramanga",
      eraId: eraMap["quatrieme-republique"],
      isMadagascar: true
    },
    {
      day: 1, month: 3, year: 2020,
      title: "Pandémie de COVID-19 à Madagascar",
      description: "Premiers cas de COVID-19 à Madagascar. État d'urgence sanitaire et confinement.",
      eventType: "social",
      importance: 4,
      eraId: eraMap["quatrieme-republique"],
      isMadagascar: true
    },
    {
      day: 1, month: 1, year: 2021,
      title: "Famine dans le Grand Sud",
      description: "Grave crise alimentaire dans le Grand Sud, première famine due au changement climatique selon l'ONU.",
      eventType: "social",
      importance: 5,
      location: "Grand Sud",
      eraId: eraMap["quatrieme-republique"],
      isMadagascar: true
    }
  ];

  for (const event of historicalEvents) {
    // Check if event already exists for this date and title
    const existing = await prisma.historicalEvent.findFirst({
      where: {
        day: event.day,
        month: event.month,
        year: event.year,
        title: event.title
      }
    });

    if (!existing) {
      await prisma.historicalEvent.create({ data: event });
      console.log(`  Added event: ${event.title}`);
    } else {
      await prisma.historicalEvent.update({
        where: { id: existing.id },
        data: event
      });
      console.log(`  Updated event: ${event.title}`);
    }
  }

  console.log('\n========================================');
  console.log('Madagascar History Seed Complete!');
  console.log('========================================');
  console.log(`Eras: ${eras.length}`);
  console.log(`Leaders: ${leaders.length}`);
  console.log(`Mining Resources: ${miningResources.length}`);
  console.log(`Export Products: ${exportProducts.length}`);
  console.log(`Famous Things: ${famousThings.length}`);
  console.log(`Economic Indicators: ${economicIndicators.length}`);
  console.log(`Historical Events: ${historicalEvents.length}`);
  console.log('========================================\n');

  await prisma.$disconnect();
}

seedComplete().catch((e) => {
  console.error(e);
  process.exit(1);
});
