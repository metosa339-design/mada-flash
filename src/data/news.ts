import { NewsArticle, NewsCategory } from '@/types';
import { newsSources } from './sources';

const categories: NewsCategory[] = [
  'politique',
  'economie',
  'sport',
  'culture',
  'societe',
  'international',
  'environnement',
  'technologie'
];

const categoryLabels: Record<NewsCategory, string> = {
  politique: 'Politique',
  economie: 'Économie',
  sport: 'Sport',
  culture: 'Culture',
  societe: 'Société',
  international: 'International',
  environnement: 'Environnement',
  technologie: 'Technologie'
};

export { categories, categoryLabels };

// News data with rich content - In production, this would be fetched from RSS/APIs
export const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: "Le Président annonce un plan majeur de développement des infrastructures pour 2025",
    summary: "Un investissement de 500 milliards Ariary prévu pour la réhabilitation des routes nationales et la construction de nouveaux ponts dans les régions enclavées.",
    content: `Le Chef de l'État a dévoilé ce matin un **programme ambitieux de développement infrastructurel** qui transformera le réseau routier national d'ici 2030.

**Les chiffres clés du plan :**
• **500 milliards Ariary** d'investissement total
• **2 000 km** de nouvelles routes bitumées
• **5 000 km** de routes existantes réhabilitées
• **150 ponts** à construire ou rénover

**Régions prioritaires :** Les zones les plus enclavées du **Sud** (Anosy, Androy) et de l'**Est** (Vatovavy-Fitovinany) seront traitées en priorité dès le premier semestre 2025.

**Financement :** Le projet sera financé à **60%** par des prêts de la **Banque Mondiale** et de la **BAD**, et à **40%** par le budget national.

**Emplois créés :** Le gouvernement prévoit la création de **25 000 emplois directs** dans le secteur du BTP.

Le Premier Ministre a précisé que les appels d'offres seront lancés dès **janvier 2025** pour les premiers tronçons.`,
    imageUrl: "https://picsum.photos/seed/politics1/800/600",
    imageCredit: "24h Mada",
    category: 'politique',
    source: newsSources[0],
    sourceUrl: "https://www.24hmada.com",
    publishedAt: new Date(Date.now() - 15 * 60000),
    isBreaking: true,
    isLive: true,
    isFeatured: false,
    readTime: 4,
    views: 12500,
    tags: ['infrastructure', 'développement', 'investissement', 'routes']
  },
  {
    id: '2',
    title: "L'Ariary se stabilise face au Dollar après les mesures de la Banque Centrale",
    summary: "La monnaie nationale montre des signes de reprise suite aux interventions récentes sur le marché des changes.",
    content: `Après plusieurs semaines de volatilité, l'Ariary affiche une **stabilité relative** face au dollar américain grâce aux interventions de la Banque Centrale.

**Taux de change actuel :**
• **1 USD = 4 520 Ariary** (stable depuis 5 jours)
• **1 EUR = 4 890 Ariary**

**Mesures prises par la Banque Centrale :**
• Injection de **50 millions USD** sur le marché des changes
• Relèvement du **taux directeur à 11%** (+0,5 point)
• Renforcement des **réserves de change** à 1,8 milliard USD

**Impact sur l'économie :**
Le **prix des carburants** devrait rester stable ce mois-ci. Les importateurs saluent cette stabilisation qui leur permet de **mieux planifier leurs achats**.

**Prévisions :** Les analystes tablent sur un maintien de cette stabilité jusqu'à **fin janvier 2025**, sauf choc externe majeur.

Le Gouverneur de la Banque Centrale tiendra une **conférence de presse vendredi** pour détailler les perspectives monétaires.`,
    imageUrl: "https://picsum.photos/seed/economy2/800/600",
    imageCredit: "Midi Madagascar",
    category: 'economie',
    source: newsSources[2],
    sourceUrl: "https://www.midi-madagasikara.mg",
    publishedAt: new Date(Date.now() - 45 * 60000),
    isBreaking: false,
    isLive: true,
    isFeatured: false,
    readTime: 4,
    views: 8900,
    tags: ['ariary', 'économie', 'banque centrale', 'devises']
  },
  {
    id: '3',
    title: "Les Barea qualifiés pour la phase finale de la CAN 2025",
    summary: "Victoire historique 2-1 contre le Sénégal ! Madagascar décroche son ticket pour la Coupe d'Afrique des Nations.",
    content: `Une soirée **magique** au Stade Barea où l'équipe nationale a réalisé l'exploit de battre le Sénégal **2-1** !

**Résultat du match :**
• **Madagascar 2 - 1 Sénégal**
• Buts : **Carolus (34')** et **Amada (78')**
• But sénégalais : Sarr (56')

**Statistiques clés :**
• Possession : Madagascar **42%** - Sénégal 58%
• Tirs cadrés : **7** - 5
• Corners : 3 - **8**
• **25 000 supporters** présents au stade

**Ce que ça signifie :**
Madagascar participera à la **CAN 2025 au Maroc** (21 décembre 2025 - 18 janvier 2026). C'est la **2ème qualification** de l'histoire après 2019.

**Réactions :**
Le sélectionneur Romuald Rakotondrabe : *"C'est un moment historique. Les joueurs ont donné leur cœur."*

**Prochaine étape :** Le tirage au sort des groupes aura lieu le **27 janvier 2025** au Maroc.

Une **prime de 50 millions Ariary** par joueur a été annoncée par la Fédération.`,
    imageUrl: "https://picsum.photos/seed/sport3/800/600",
    imageCredit: "TVM / FMF",
    category: 'sport',
    source: newsSources[4],
    sourceUrl: "https://www.tvm.mg",
    publishedAt: new Date(Date.now() - 2 * 3600000),
    isBreaking: true,
    isLive: false,
    isFeatured: false,
    readTime: 5,
    views: 45000,
    tags: ['barea', 'football', 'CAN 2025', 'qualification']
  },
  {
    id: '4',
    title: "Nouvelle saison cyclonique : La météo appelle à la vigilance",
    summary: "Les autorités météorologiques prévoient une saison cyclonique plus active que la normale cette année.",
    content: `La Direction Générale de la Météorologie a présenté ses **prévisions alarmantes** pour la saison cyclonique 2024-2025.

**Prévisions officielles :**
• **8 à 12 systèmes cycloniques** attendus (moyenne : 7)
• **3 à 5 cyclones** pourraient affecter directement Madagascar
• Saison : **novembre 2024 à avril 2025**

**Régions les plus exposées :**
• **Côte Est** : Analanjirofo, Atsinanana, Vatovavy-Fitovinany
• **Nord-Est** : SAVA, Diana
• **Sud-Est** : Atsimo-Atsinanana

**Recommandations urgentes :**
• Constituer des **stocks de nourriture** pour 2 semaines
• Vérifier la **solidité des toitures**
• Identifier les **abris anticycloniques** les plus proches
• Charger les **téléphones** et avoir des lampes torches

**Numéros d'urgence :**
• BNGRC : **119** (gratuit)
• Météo Madagascar : **020 22 405 81**

Le BNGRC a pré-positionné **2 500 tonnes d'aide humanitaire** dans les régions à risque.`,
    imageUrl: "https://picsum.photos/seed/weather4/800/600",
    imageCredit: "Orange Actu / Météo Madagascar",
    category: 'environnement',
    source: newsSources[1],
    sourceUrl: "https://actu.orange.mg",
    publishedAt: new Date(Date.now() - 3 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 4,
    views: 15600,
    tags: ['cyclone', 'météo', 'prévention', 'urgence']
  },
  {
    id: '5',
    title: "Festival Madajazzcar : Une édition 2025 sous le signe de la diversité",
    summary: "Le plus grand festival de jazz de l'océan Indien revient avec une programmation exceptionnelle.",
    content: `Le comité d'organisation du Madajazzcar a dévoilé une **programmation exceptionnelle** pour l'édition 2025.

**Dates et lieux :**
• **15 au 22 octobre 2025**
• Lieux : IFM Analakely, Hôtel Colbert, Alliance Française, Espace Kudeta

**Têtes d'affiche internationales :**
• **Marcus Miller** (USA) - Bassiste légendaire
• **Manu Dibango Jr** (Cameroun) - Afro-jazz
• **Ibrahim Maalouf** (France/Liban) - Trompettiste

**Artistes malgaches :**
• **Rajery** - Valiha virtuose
• **Toko Telo** - Jazz fusion
• **Erick Manana** - Guitare acoustique

**Informations pratiques :**
• **Pass festival : 150 000 Ar** (8 jours)
• **Soirée unique : 25 000 Ar**
• Vente sur **mvola** et points de vente physiques

**Nouveauté 2025 :** Un **village jazz gratuit** à Analakely avec scène ouverte pour les jeunes talents.

Réservations ouvertes dès le **1er mars 2025**.`,
    imageUrl: "https://picsum.photos/seed/culture5/800/600",
    imageCredit: "Viva Madagascar",
    category: 'culture',
    source: newsSources[6],
    sourceUrl: "https://www.vfrancophone-viva.com",
    publishedAt: new Date(Date.now() - 4 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 4,
    views: 7800,
    tags: ['jazz', 'festival', 'musique', 'Madajazzcar']
  },
  {
    id: '6',
    title: "Lancement de la fibre optique dans 5 nouvelles régions",
    summary: "Le projet de connectivité nationale franchit une étape majeure avec l'extension du réseau haut débit.",
    content: `Le Ministère des Télécommunications et Orange Madagascar inaugurent l'extension du **réseau fibre optique** vers 5 nouvelles régions.

**Régions concernées :**
• **Vakinankaratra** (Antsirabe)
• **Haute Matsiatra** (Fianarantsoa)
• **Atsimo-Andrefana** (Toliara)
• **Diana** (Antsiranana)
• **Boeny** (Mahajanga)

**Bénéfices attendus :**
• **2 millions de personnes** auront accès au haut débit
• Vitesse : jusqu'à **100 Mbps** (contre 10 Mbps en 4G)
• **Réduction de 40%** des tarifs internet

**Tarifs annoncés :**
• Offre **Fibre Basique** : 45 000 Ar/mois (20 Mbps)
• Offre **Fibre Plus** : 75 000 Ar/mois (50 Mbps)
• Offre **Fibre Pro** : 150 000 Ar/mois (100 Mbps)

**Calendrier de déploiement :**
• Antsirabe : **mars 2025**
• Fianarantsoa : **mai 2025**
• Autres villes : **2ème semestre 2025**

**Investissement total : 45 milliards Ariary** cofinancé par Orange et l'État.`,
    imageUrl: "https://picsum.photos/seed/tech6/800/600",
    imageCredit: "Orange Madagascar",
    category: 'technologie',
    source: newsSources[1],
    sourceUrl: "https://actu.orange.mg",
    publishedAt: new Date(Date.now() - 5 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 4,
    views: 6200,
    tags: ['internet', 'fibre optique', 'connectivité', 'Orange']
  },
  {
    id: '7',
    title: "Hausse des prix du riz : Le gouvernement annonce des mesures d'urgence",
    summary: "Face à la flambée des prix, des subventions et des importations exceptionnelles sont prévues.",
    content: `Le Ministre du Commerce a annoncé des **mesures d'urgence** pour contenir la hausse des prix du riz qui frappe les ménages malgaches.

**Situation actuelle des prix :**
• Riz local : **2 800 Ar/kg** (+25% en 3 mois)
• Riz importé : **2 400 Ar/kg** (+15%)
• Kapoaka : **650-700 Ar** (contre 500 Ar il y a 6 mois)

**Mesures gouvernementales :**
• Importation exceptionnelle de **100 000 tonnes** de riz
• **Subvention directe** : 500 Ar/kg sur le riz subventionné
• Prix plafonné à **2 000 Ar/kg** dans les épiceries agréées

**Points de vente subventionnés :**
• **Fokontany** : distribution 2x par semaine
• **Marchés municipaux** : stands identifiés
• **Épiceries agréées** : liste sur mfrp.gov.mg

**Quota par ménage :** Maximum **25 kg par mois** par carte de rationnement.

**Calendrier :**
• Riz importé disponible dès **le 20 décembre**
• Subventions effectives jusqu'à **fin mars 2025**

Les contrevenants aux prix plafonnés risquent des **amendes de 5 à 50 millions Ariary**.`,
    imageUrl: "https://picsum.photos/seed/rice7/800/600",
    imageCredit: "La Gazette de la Grande Île",
    category: 'economie',
    source: newsSources[9],
    sourceUrl: "https://lagazette-dgi.com",
    publishedAt: new Date(Date.now() - 6 * 3600000),
    isBreaking: true,
    isLive: false,
    isFeatured: false,
    readTime: 5,
    views: 23400,
    tags: ['riz', 'prix', 'gouvernement', 'subvention']
  },
  {
    id: '8',
    title: "Découverte d'une nouvelle espèce de lémurien dans le parc de Ranomafana",
    summary: "Des chercheurs malgaches et internationaux identifient une espèce jusqu'alors inconnue de la science.",
    content: `Une équipe de primatologues a fait une **découverte extraordinaire** dans le parc national de Ranomafana.

**L'espèce découverte :**
• Nom scientifique : **Microcebus ranomafana**
• Famille : Microcèbe (lémurien souris)
• Taille : **12 cm** de corps + queue
• Poids : environ **50 grammes**
• Mode de vie : **nocturne**

**Équipe de recherche :**
• **GERP** (Groupe d'Étude et de Recherche sur les Primates)
• **Université de Duke** (USA)
• **Université d'Antananarivo**

**Particularités :**
• Pelage **roux-orangé** distinct des autres microcèbes
• Cri unique jamais enregistré auparavant
• ADN confirmant une **nouvelle espèce** (analyse génétique)

**Importance de la découverte :**
C'est la **25ème espèce de lémurien** découverte depuis 2000, portant le total à **112 espèces** connues.

**Statut de conservation :** Probablement **En danger critique** en raison de son habitat très restreint (moins de 50 km²).

Publication dans la revue **Nature** prévue en **février 2025**.`,
    imageUrl: "https://picsum.photos/seed/lemur8/800/600",
    imageCredit: "Tia Tanindrazana / Parc National Ranomafana",
    category: 'environnement',
    source: newsSources[3],
    sourceUrl: "https://www.tfrancophone-tia.com",
    publishedAt: new Date(Date.now() - 7 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 5,
    views: 18700,
    tags: ['lémurien', 'biodiversité', 'recherche', 'Ranomafana']
  },
  {
    id: '9',
    title: "Sommet de l'Union Africaine : Madagascar plaide pour une coopération renforcée",
    summary: "La délégation malgache présente ses propositions pour le développement économique régional.",
    content: `Au Sommet de l'Union Africaine à Addis-Abeba, Madagascar a présenté un **plan ambitieux** de coopération régionale.

**Propositions malgaches :**
• Création d'une **zone de libre-échange** océan Indien
• Renforcement des **liaisons maritimes** régionales
• Projet de **câble sous-marin** Mada-Afrique de l'Est

**Partenaires ciblés :**
• **Maurice** - commerce et tourisme
• **Comores** - sécurité maritime
• **Seychelles** - pêche durable
• **Mozambique** - énergie et mines

**Engagements obtenus :**
• **150 millions USD** de la BAD pour les infrastructures portuaires
• Accord de **visa facilité** avec 5 pays africains
• Siège d'une **agence régionale de l'UA** à Madagascar

**Déclaration du Président :**
*"Madagascar veut être le hub de l'océan Indien, un pont entre l'Afrique et l'Asie."*

**Prochaines étapes :**
• Signature formelle des accords : **mars 2025**
• Première réunion technique : **avril 2025** à Antananarivo`,
    imageUrl: "https://picsum.photos/seed/diplo9/800/600",
    imageCredit: "TVM",
    category: 'international',
    source: newsSources[4],
    sourceUrl: "https://www.tvm.mg",
    publishedAt: new Date(Date.now() - 8 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 4,
    views: 9500,
    tags: ['UA', 'diplomatie', 'coopération', 'Afrique']
  },
  {
    id: '10',
    title: "Santé : Campagne nationale de vaccination contre la rougeole",
    summary: "Plus de 2 millions d'enfants ciblés par cette campagne de prévention dans tout le pays.",
    content: `Le Ministère de la Santé Publique lance une **vaste campagne de vaccination** contre la rougeole sur tout le territoire.

**Population cible :**
• Enfants de **9 mois à 5 ans**
• Objectif : **2,3 millions d'enfants** vaccinés
• Couverture visée : **95%**

**Calendrier de la campagne :**
• **Phase 1** (16-22 déc) : Analamanga, Vakinankaratra
• **Phase 2** (6-12 jan) : Régions côtières
• **Phase 3** (20-26 jan) : Régions enclavées

**Points de vaccination :**
• **CSB** (Centres de Santé de Base)
• **Écoles primaires**
• **Équipes mobiles** pour les zones rurales

**Gratuit et obligatoire :**
Le vaccin est **100% gratuit**. Les parents doivent présenter le carnet de santé de l'enfant.

**Partenaires :**
• **UNICEF** : fourniture des vaccins
• **OMS** : supervision technique
• **Croix-Rouge** : logistique terrain

**Important :** Aucun effet secondaire grave rapporté. Légère fièvre possible pendant 24-48h.

Hotline santé : **910** (gratuit)`,
    imageUrl: "https://picsum.photos/seed/health10/800/600",
    imageCredit: "Real TV",
    category: 'societe',
    source: newsSources[5],
    sourceUrl: "https://www.realtv.mg",
    publishedAt: new Date(Date.now() - 9 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 4,
    views: 11200,
    tags: ['santé', 'vaccination', 'enfants', 'rougeole']
  },
  {
    id: '11',
    title: "Assemblée Nationale : Adoption du nouveau code électoral",
    summary: "Les députés ont voté à une large majorité les nouvelles dispositions pour les élections à venir.",
    content: `L'Assemblée Nationale a adopté le **nouveau code électoral** après des débats intenses de 3 jours.

**Résultat du vote :**
• **Pour : 102 voix**
• Contre : 45 voix
• Abstentions : 12

**Principales innovations :**
• **Vote électronique** dans les grandes villes (Tana, Toamasina, Antsirabe)
• **Biométrie obligatoire** pour l'inscription électorale
• Réduction du **délai de contentieux** à 72h
• **Parité homme/femme** obligatoire sur les listes

**Nouvelles règles de financement :**
• Plafond de campagne : **500 millions Ar** (présidentielle)
• **Transparence obligatoire** des comptes
• Interdiction des **dons étrangers**

**Calendrier électoral 2025 :**
• **Communales** : mai 2025
• **Régionales** : novembre 2025

**Opposition :**
Les députés de l'opposition dénoncent des *"dispositions taillées sur mesure"* et annoncent un **recours à la HCC**.

La loi entre en vigueur dès **publication au Journal Officiel** (prévu cette semaine).`,
    imageUrl: "https://picsum.photos/seed/assembly11/800/600",
    imageCredit: "Midi Madagascar",
    category: 'politique',
    source: newsSources[2],
    sourceUrl: "https://www.midi-madagasikara.mg",
    publishedAt: new Date(Date.now() - 10 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 5,
    views: 14300,
    tags: ['élections', 'loi', 'assemblée', 'code électoral']
  },
  {
    id: '12',
    title: "Basketball : Le CNaPS champion de Madagascar pour la 5ème fois consécutive",
    summary: "Finale spectaculaire remportée 78-72 face à l'AS Adema devant 8000 spectateurs.",
    content: `Le CNaPS Sports confirme sa **domination historique** sur le basketball malgache avec un 5ème titre consécutif !

**Score final :**
• **CNaPS 78 - 72 AS Adema**

**Statistiques du match :**
• MVP : **Rado Andrianasolo** - 28 points, 8 rebonds
• Meilleur marqueur Adema : Hery - 22 points
• Affluence : **8 000 spectateurs** (Palais des Sports Mahamasina)

**Quart-temps par quart-temps :**
• Q1 : CNaPS 18 - 15 Adema
• Q2 : CNaPS 20 - 22 Adema (mi-temps : 38-37)
• Q3 : CNaPS 22 - 18 Adema
• Q4 : CNaPS 18 - 17 Adema

**Palmarès CNaPS :**
• **5 titres consécutifs** (2021-2025)
• **12 titres** au total dans l'histoire

**Récompenses :**
• Prime de victoire : **20 millions Ar** par joueur
• Trophée remis par le Ministre des Sports

**Prochaine compétition :**
Le CNaPS représentera Madagascar au **Basketball Africa League** (BAL) en **mars 2025** au Rwanda.`,
    imageUrl: "https://picsum.photos/seed/basket12/800/600",
    imageCredit: "Kolo TV",
    category: 'sport',
    source: newsSources[7],
    sourceUrl: "https://www.kolotv.mg",
    publishedAt: new Date(Date.now() - 11 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 4,
    views: 8900,
    tags: ['basketball', 'CNaPS', 'championnat', 'finale']
  },
  {
    id: '13',
    title: "Éducation : Réforme des programmes scolaires annoncée pour 2026",
    summary: "Le Ministère de l'Éducation prépare une refonte majeure intégrant le numérique et les compétences du 21ème siècle.",
    content: `Le Ministère de l'Éducation Nationale annonce une **réforme majeure** des programmes scolaires pour la rentrée 2026.

**Nouvelles matières introduites :**
• **Initiation au codage** dès le CE1
• **Éducation financière** au collège
• **Anglais renforcé** (passage de 2h à 4h/semaine)
• **Développement durable** - matière obligatoire

**Changements structurels :**
• Réduction des **matières à par cœur**
• Introduction de **projets pratiques** (30% du temps)
• Évaluation par **compétences** (pas seulement notes)

**Équipements prévus :**
• **5 000 tablettes** pour les écoles pilotes
• **Connexion internet** dans 500 établissements
• **Laboratoires informatiques** dans tous les lycées

**Formation des enseignants :**
• **45 000 enseignants** formés d'ici 2026
• Partenariat avec **l'ENS** et universités
• Modules en ligne disponibles dès **juin 2025**

**Budget :** **120 milliards Ariary** sur 3 ans (Banque Mondiale + État)

**Écoles pilotes :** 50 établissements en **2025** avant généralisation.`,
    imageUrl: "https://picsum.photos/seed/education13/800/600",
    imageCredit: "L'Express de Madagascar",
    category: 'societe',
    source: newsSources[10],
    sourceUrl: "https://lexpress.mg",
    publishedAt: new Date(Date.now() - 12 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 5,
    views: 16800,
    tags: ['éducation', 'réforme', 'numérique', 'programmes']
  },
  {
    id: '14',
    title: "Tourisme : Record de visiteurs attendu pour la saison 2025",
    summary: "Les réservations sont en hausse de 35% par rapport à l'année précédente.",
    content: `L'Office National du Tourisme annonce des **perspectives exceptionnelles** pour la saison touristique 2025.

**Prévisions de fréquentation :**
• **500 000 touristes** attendus (+35% vs 2024)
• Recettes estimées : **800 millions USD**
• Durée moyenne de séjour : **12 jours**

**Principaux marchés émetteurs :**
• **France** : 35% des visiteurs
• **États-Unis** : 15% (+50% de croissance)
• **Chine** : 12% (reprise post-COVID)
• **Allemagne/Italie** : 10%

**Destinations les plus demandées :**
• **Nosy Be** - plages et détente
• **Parc de l'Isalo** - randonnée
• **Allée des Baobabs** - incontournable
• **Île Sainte-Marie** - baleines (juillet-septembre)

**Nouveautés 2025 :**
• **Vol direct Paris-Nosy Be** (Air France, 3x/semaine)
• **E-visa** généralisé (48h de délai)
• **Carte touristique** avec réductions

**Emplois :** **150 000 emplois** directs et indirects dans le secteur.

L'ONT prévoit des **campagnes promotionnelles** sur CNN et France 24 début 2025.`,
    imageUrl: "https://picsum.photos/seed/tourism14/800/600",
    imageCredit: "News Mada",
    category: 'economie',
    source: newsSources[11],
    sourceUrl: "https://www.newsmada.com",
    publishedAt: new Date(Date.now() - 13 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 4,
    views: 7600,
    tags: ['tourisme', 'économie', 'croissance', 'visiteurs']
  },
  {
    id: '15',
    title: "Cinéma malgache : 'Ady Gasy' sélectionné au Festival de Cannes",
    summary: "Le film du réalisateur Laza remporte une sélection prestigieuse pour la section Un Certain Regard.",
    content: `**Historique !** Le long métrage malgache 'Ady Gasy' sera présenté au **Festival de Cannes 2025**.

**Le film :**
• Titre : **"Ady Gasy"** (Combat Malgache)
• Réalisateur : **Laza** (Nantenaina Laza)
• Durée : **1h52**
• Genre : Drame social

**Synopsis :**
L'histoire d'une famille de Tananarive confrontée aux défis de la modernité. Entre traditions ancestrales et pressions économiques, trois générations cherchent leur place.

**Section Cannes :**
• **Un Certain Regard** - sélection officielle
• Projection : **mai 2025**
• Première mondiale

**Parcours du film :**
• Tournage : **Antananarivo et Antsirabe**
• Budget : **2 milliards Ariary** (coproduction France-Madagascar)
• Équipe : **90% malgache**

**Acteurs principaux :**
• **Rajakoba** - rôle principal
• **Rasoamahenina** - la grand-mère
• **15 acteurs non-professionnels**

**Réaction du réalisateur :**
*"C'est un rêve. Madagascar mérite sa place sur la scène mondiale du cinéma."*

Sortie en salles à Madagascar prévue pour **octobre 2025**.`,
    imageUrl: "https://picsum.photos/seed/cinema15/800/600",
    imageCredit: "Viva Madagascar",
    category: 'culture',
    source: newsSources[6],
    sourceUrl: "https://www.viva.mg",
    publishedAt: new Date(Date.now() - 14 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 4,
    views: 21500,
    tags: ['cinéma', 'Cannes', 'culture', 'Ady Gasy']
  },
  {
    id: '16',
    title: "Agriculture : Nouvelle variété de riz résistante à la sécheresse développée",
    summary: "Des chercheurs du FOFIFA présentent une avancée majeure pour la sécurité alimentaire.",
    content: `Le FOFIFA présente **"Vary Kinga"**, une nouvelle variété de riz révolutionnaire pour Madagascar.

**Caractéristiques de Vary Kinga :**
• Résistance à la sécheresse : **jusqu'à 3 semaines** sans pluie
• Rendement : **+20%** vs variétés traditionnelles
• Cycle de culture : **90 jours** (vs 120 jours habituels)
• Goût : similaire au vary gasy traditionnel

**Avantages pour les paysans :**
• **Moins de risques** liés aux aléas climatiques
• **Économie d'eau** : -30% de besoins en irrigation
• **2 récoltes par an** possibles

**Zones recommandées :**
• **Hauts Plateaux** (Vakinankaratra, Haute Matsiatra)
• **Moyen-Ouest** (Bongolava)
• Régions à **pluviométrie irrégulière**

**Disponibilité des semences :**
• Phase pilote : **1 000 paysans** sélectionnés
• Distribution élargie : **saison 2025-2026**
• Prix : **5 000 Ar/kg** de semences

**Recherche :**
• **10 ans** de développement
• Financement : **USAID** et Union Européenne
• Équipe : 15 chercheurs malgaches

Contact FOFIFA : **020 22 401 30**`,
    imageUrl: "https://picsum.photos/seed/agri16/800/600",
    imageCredit: "Tia Tanindrazana",
    category: 'technologie',
    source: newsSources[3],
    sourceUrl: "https://www.tfrancophone-tia.com",
    publishedAt: new Date(Date.now() - 15 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 5,
    views: 9800,
    tags: ['agriculture', 'recherche', 'innovation', 'riz']
  },
  {
    id: '17',
    title: "Transport : Inauguration de la nouvelle gare routière d'Analakely",
    summary: "Un investissement de 15 milliards Ariary pour moderniser le transport urbain de la capitale.",
    content: `La Commune Urbaine d'Antananarivo inaugure une **gare routière moderne** à Analakely.

**Caractéristiques de l'infrastructure :**
• Capacité : **200 taxi-brousse** simultanément
• Superficie : **15 000 m²**
• Quais : **24 quais** couverts
• Parkings : **500 places** véhicules particuliers

**Services disponibles :**
• **Toilettes modernes** (payantes 200 Ar)
• **Restauration** : 12 échoppes
• **Distributeurs automatiques** (BNI, BOA)
• **WiFi gratuit**
• Salle d'attente **climatisée**

**Billetterie électronique :**
• Paiement par **MVola, Orange Money, Airtel Money**
• **QR code** sur smartphone
• Fin des longues files d'attente

**Destinations desservies :**
• **Antsirabe** : départ toutes les 30 min
• **Fianarantsoa** : 8 départs/jour
• **Toamasina** : 10 départs/jour
• **Mahajanga** : 6 départs/jour

**Investissement :** **15 milliards Ariary** (CUA + partenaires privés)

**Sécurité :** Caméras de surveillance, agents de sécurité 24h/24.

Ouverture officielle : **20 décembre 2024**.`,
    imageUrl: "https://picsum.photos/seed/transport17/800/600",
    imageCredit: "MA TV",
    category: 'societe',
    source: newsSources[12],
    sourceUrl: "https://www.matv.mg",
    publishedAt: new Date(Date.now() - 16 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 4,
    views: 12400,
    tags: ['transport', 'infrastructure', 'Antananarivo', 'taxi-brousse']
  },
  {
    id: '18',
    title: "Environnement : 10 millions d'arbres plantés dans le cadre du reboisement national",
    summary: "L'objectif de 50 millions d'arbres d'ici 2027 progresse selon le Ministère de l'Environnement.",
    content: `Le programme national de reboisement atteint une **étape historique** avec 10 millions d'arbres plantés.

**Bilan du programme :**
• **10 millions d'arbres** plantés depuis 2022
• **50 000 hectares** reboisés
• **22 régions** concernées
• Taux de survie : **75%** (objectif : 80%)

**Espèces plantées :**
• **Eucalyptus** : 40% (croissance rapide)
• **Pin** : 25% (bois d'œuvre)
• **Essences endémiques** : 35% (palissandre, ébène, ravinala)

**Régions prioritaires :**
• **Analamanga** : 2 millions d'arbres
• **Haute Matsiatra** : 1,5 million
• **Vakinankaratra** : 1,2 million

**Objectifs 2025-2027 :**
• **50 millions d'arbres** au total
• Création de **pépinières communautaires** (200 prévues)
• **40 000 emplois verts** créés

**Participation citoyenne :**
• **500 000 volontaires** mobilisés
• Campagne **#Mitsabo** sur les réseaux sociaux
• Applications scolaires obligatoires

**Financement :**
• État : 60%
• Union Européenne : 25%
• Secteur privé : 15%

**Prochain événement :** Journée nationale du reboisement le **25 janvier 2025**.`,
    imageUrl: "https://picsum.photos/seed/forest18/800/600",
    imageCredit: "Kolo FM",
    category: 'environnement',
    source: newsSources[8],
    sourceUrl: "https://www.kolofm.mg",
    publishedAt: new Date(Date.now() - 17 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 5,
    views: 8700,
    tags: ['reboisement', 'environnement', 'écologie', 'arbres']
  },
  {
    id: '19',
    title: "Coopération : Signature d'un accord commercial avec l'Inde",
    summary: "Un partenariat stratégique pour développer les échanges dans les secteurs textile et pharmaceutique.",
    content: `Madagascar et l'Inde signent un **accord commercial historique** à New Delhi.

**Secteurs couverts :**
• **Textile** : exportations malgaches vers l'Inde
• **Pharmaceutique** : importation de génériques indiens
• **Épices** : vanille et girofle malgaches
• **Technologies** : transfert de compétences

**Avantages pour Madagascar :**
• **Réduction tarifaire de 40%** sur le textile malgache
• **Médicaments génériques** 50% moins chers
• **1 000 bourses d'études** en Inde par an
• Ligne de crédit de **100 millions USD**

**Objectifs commerciaux :**
• Volume d'échanges actuel : **150 millions USD**
• Objectif 2030 : **450 millions USD** (x3)

**Projets concrets :**
• **Usine pharmaceutique** à Moramanga (2026)
• **Centre de formation IT** à Antananarivo
• **Hub textile** en zone franche

**Calendrier :**
• Accord-cadre : signé le **12 décembre 2024**
• Ratification : **février 2025**
• Mise en œuvre : **juillet 2025**

**Déclaration :**
L'ambassadeur indien : *"Madagascar est un partenaire stratégique pour l'Inde dans l'océan Indien."*`,
    imageUrl: "https://picsum.photos/seed/india19/800/600",
    imageCredit: "RTA",
    category: 'international',
    source: newsSources[13],
    sourceUrl: "https://www.rfrancophone-rta.com",
    publishedAt: new Date(Date.now() - 18 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 4,
    views: 6500,
    tags: ['commerce', 'Inde', 'coopération', 'textile']
  },
  {
    id: '20',
    title: "Justice : Procès retentissant dans l'affaire de détournement à la JIRAMA",
    summary: "L'ancien directeur financier comparaît devant le tribunal pour des malversations estimées à 8 milliards Ariary.",
    content: `Le Pôle Anti-Corruption ouvre le **procès très attendu** de l'affaire JIRAMA.

**L'accusé :**
• **Ancien directeur financier** de la JIRAMA (2019-2023)
• Âge : 52 ans
• En détention préventive depuis **8 mois**

**Charges retenues :**
• **Détournement de fonds publics** : 8 milliards Ariary
• **Faux et usage de faux**
• **Blanchiment d'argent**
• **Association de malfaiteurs**

**Mécanisme de fraude allégué :**
• Surfacturation de **marchés de carburant**
• Fausses factures de **maintenance**
• Virements vers des comptes offshore

**Autres personnes impliquées :**
• **5 cadres** de la JIRAMA (en fuite)
• **3 fournisseurs** (assignés à résidence)
• **2 banquiers** (témoins assistés)

**Calendrier du procès :**
• Durée estimée : **4 à 6 semaines**
• Verdict attendu : **fin janvier 2025**

**Peines encourues :**
• Jusqu'à **20 ans de prison**
• Confiscation des biens
• Interdiction de fonction publique

**Réaction JIRAMA :** La direction actuelle se constitue **partie civile** et réclame 10 milliards Ar de dommages.`,
    imageUrl: "https://picsum.photos/seed/justice20/800/600",
    imageCredit: "La Gazette de la Grande Île",
    category: 'politique',
    source: newsSources[9],
    sourceUrl: "https://lagazette-dgi.com",
    publishedAt: new Date(Date.now() - 19 * 3600000),
    isBreaking: false,
    isLive: false,
    isFeatured: false,
    readTime: 5,
    views: 28900,
    tags: ['justice', 'corruption', 'JIRAMA', 'procès']
  }
];

export const getLatestNews = (limit: number = 10): NewsArticle[] => {
  return [...mockNews]
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
};

export const getBreakingNews = (): NewsArticle[] => {
  return mockNews.filter(article => article.isBreaking);
};

export const getLiveNews = (): NewsArticle[] => {
  return mockNews.filter(article => article.isLive);
};

export const getNewsByCategory = (category: NewsCategory): NewsArticle[] => {
  return mockNews.filter(article => article.category === category);
};

export const getNewsBySource = (sourceId: string): NewsArticle[] => {
  return mockNews.filter(article => article.source.id === sourceId);
};

export const searchNews = (query: string): NewsArticle[] => {
  const lowerQuery = query.toLowerCase();
  return mockNews.filter(
    article =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.summary.toLowerCase().includes(lowerQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getBriefMatinal = (): NewsArticle[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return mockNews
    .filter(article => {
      const articleDate = new Date(article.publishedAt);
      articleDate.setHours(0, 0, 0, 0);
      return articleDate.getTime() === today.getTime() ||
             (Date.now() - article.publishedAt.getTime()) < 24 * 3600000;
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
};
