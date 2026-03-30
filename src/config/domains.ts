// Configuration complète des domaines/métiers

export interface DomainConfig {
  id: string
  name: string
  icon: string
  category: 'popular' | 'services' | 'commerce' | 'food' | 'health' | 'construction' | 'tech' | 'other'
  color: { primary: string; secondary: string; gradient: string }
  slogan: string[]
  services: { icon: string; name: string; desc: string }[]
  testimonials: { name: string; text: string }[]
  specificQuestions: { id: string; label: string; placeholder: string; type: 'text' | 'select' | 'textarea' }[]
  galleryPlaceholders: string[]
  hours?: string
}

// Domaines les plus populaires (affichés en premier)
export const popularDomains = [
  'restaurant',
  'maison-hotes', 
  'commerce',
  'coiffure',
  'electricien',
  'plombier'
]

export const domains: Record<string, DomainConfig> = {
  // === RESTAURATION ===
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant / Fast-food',
    icon: '🍽️',
    category: 'food',
    color: { primary: '#d97706', secondary: '#fbbf24', gradient: 'linear-gradient(135deg, #d97706, #fbbf24)' },
    slogan: [
      'Une expérience culinaire inoubliable',
      'Les saveurs authentiques',
      'Goût et tradition réunis'
    ],
    services: [
      { icon: '🍽️', name: 'Cuisine Traditionnelle', desc: 'Plats authentiques préparés avec passion' },
      { icon: '🥗', name: 'Cuisine Internationale', desc: 'Saveurs du monde entier' },
      { icon: '🎂', name: 'Pâtisserie', desc: 'Desserts faits maison' },
      { icon: '🚚', name: 'Livraison', desc: 'Service rapide à domicile' },
      { icon: '🎉', name: 'Événements', desc: 'Réceptions et fêtes' },
      { icon: '📱', name: 'Commande en ligne', desc: 'Réservation facile' }
    ],
    testimonials: [
      { name: 'Fatou D.', text: 'Meilleur restaurant de la ville ! Les plats sont délicieux et le service impeccable.' },
      { name: 'Moussa S.', text: 'Je recommande vivement, qualité au rendez-vous à chaque visite.' },
      { name: 'Awa N.', text: 'Ambiance chaleureuse et cuisine exquise. Mon adresse préférée !' }
    ],
    specificQuestions: [
      { id: 'cuisine_type', label: 'Type de cuisine', placeholder: 'Ex: Sénégalaise, Italienne, Libanaise...', type: 'text' },
      { id: 'capacity', label: 'Nombre de places', placeholder: 'Ex: 50 couverts', type: 'text' },
      { id: 'specialty', label: 'Spécialité maison', placeholder: 'Ex: Thiebou dienne, Yassa...', type: 'text' }
    ],
    galleryPlaceholders: ['📸 Plats', '📸 Intérieur', '📸 Équipe', '📸 Cuisine', '📸 Desserts', '📸 Événements'],
    hours: 'Lun-Dim: 11h - 23h'
  },

  fastfood: {
    id: 'fastfood',
    name: 'Fast-food / Snack',
    icon: '🍔',
    category: 'food',
    color: { primary: '#ef4444', secondary: '#f87171', gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
    slogan: [
      'Rapide, bon, pas cher',
      'Le goût de la rapidité',
      'Vos snacks préférés'
    ],
    services: [
      { icon: '🍔', name: 'Burgers', desc: 'Burgers frais et gourmands' },
      { icon: '🍟', name: 'Frites & Accompagnements', desc: 'Frites maison croustillantes' },
      { icon: '🥤', name: 'Boissons', desc: 'Fraîcheur garantie' },
      { icon: '🚚', name: 'Livraison Express', desc: 'En moins de 30 minutes' },
      { icon: '🎉', name: 'Menus Enfants', desc: 'Pour les petits gourmands' },
      { icon: '📱', name: 'Commande en ligne', desc: 'Click & Collect' }
    ],
    testimonials: [
      { name: 'Ibrahima D.', text: 'Les meilleurs burgers du quartier ! Livraison ultra rapide.' },
      { name: 'Mariama T.', text: 'Rapide et délicieux, je recommande !' },
      { name: 'Oumar B.', text: 'Qualité/prix imbattable dans le quartier.' }
    ],
    specificQuestions: [
      { id: 'specialty', label: 'Spécialité', placeholder: 'Ex: Burgers, Tacos, Shawarma...', type: 'text' },
      { id: 'delivery', label: 'Zone de livraison', placeholder: 'Ex: Dakar Plateau, Médina...', type: 'text' }
    ],
    galleryPlaceholders: ['🍔 Burgers', '🍟 Frites', '🥤 Boissons', '📸 Équipe', '🎉 Ambiance', '📱 Commandes'],
    hours: 'Lun-Dim: 10h - 23h'
  },

  boulangerie: {
    id: 'boulangerie',
    name: 'Boulangerie / Pâtisserie',
    icon: '🥖',
    category: 'food',
    color: { primary: '#a16207', secondary: '#ca8a04', gradient: 'linear-gradient(135deg, #92400e, #b45309)' },
    slogan: [
      'Le pain frais chaque matin',
      'L\'art de la boulangerie',
      'Tradition et gourmandise'
    ],
    services: [
      { icon: '🥖', name: 'Pains Artisanaux', desc: 'Pains frais chaque jour' },
      { icon: '🥐', name: 'Viennoiseries', desc: 'Croissants, pains au chocolat' },
      { icon: '🎂', name: 'Pâtisseries', desc: 'Gâteaux et entremets' },
      { icon: '🥪', name: 'Sandwichs', desc: 'Sur place ou à emporter' },
      { icon: '☕', name: 'Petit-déjeuner', desc: 'Formules complètes' },
      { icon: '🎂', name: 'Gâteaux sur commande', desc: 'Anniversaires, fêtes' }
    ],
    testimonials: [
      { name: 'Sophie M.', text: 'Les meilleurs croissants de la ville ! Tendre et croustillant.' },
      { name: 'Amadou K.', text: 'Pain frais tous les matins, qualité constante.' },
      { name: 'Coumba F.', text: 'Mes gâteaux d\'anniversaire viennent toujours d\'ici.' }
    ],
    specificQuestions: [
      { id: 'specialty', label: 'Spécialité', placeholder: 'Ex: Baguette, Croissants, Pastels...', type: 'text' }
    ],
    galleryPlaceholders: ['🥖 Pains', '🥐 Viennoiseries', '🎂 Pâtisseries', '☕ Café', '📸 Équipe', '🥪 Sandwichs'],
    hours: 'Tous les jours: 6h - 20h'
  },

  // === HÉBERGEMENT ===
  'maison-hotes': {
    id: 'maison-hotes',
    name: 'Maison d\'hôtes / Auberge',
    icon: '🏠',
    category: 'popular',
    color: { primary: '#059669', secondary: '#34d399', gradient: 'linear-gradient(135deg, #047857, #059669)' },
    slogan: [
      'Votre maison loin de chez vous',
      'Accueil chaleureux et authentique',
      'Un séjour inoubliable'
    ],
    services: [
      { icon: '🛏️', name: 'Chambres Confortables', desc: 'Équipées et climatisées' },
      { icon: '🍳', name: 'Petit-déjeuner', desc: 'Inclus dans chaque séjour' },
      { icon: '🍽️', name: 'Repas Traditionnels', desc: 'Cuisine locale sur commande' },
      { icon: '🚗', name: 'Parking', desc: 'Sécurisé et gratuit' },
      { icon: '📶', name: 'Wi-Fi Gratuit', desc: 'Connexion haut débit' },
      { icon: '🧹', name: 'Ménage Quotidien', desc: 'Service inclus' }
    ],
    testimonials: [
      { name: 'Jean-Pierre L.', text: 'Accueil formidable, on se sent comme à la maison. Je recommande !' },
      { name: 'Aminata D.', text: 'Cadre paisible et équipe aux petits soins. Excellent rapport qualité/prix.' },
      { name: 'Thomas B.', text: 'Séjour parfait pour découvrir la région. Hôtes très disponibles.' }
    ],
    specificQuestions: [
      { id: 'rooms', label: 'Nombre de chambres', placeholder: 'Ex: 5 chambres', type: 'text' },
      { id: 'amenities', label: 'Équipements', placeholder: 'Ex: Piscine, Jardin, Terrasse...', type: 'text' },
      { id: 'price_range', label: 'Gamme de prix', placeholder: 'Ex: 25 000 - 50 000 FCFA/nuit', type: 'text' }
    ],
    galleryPlaceholders: ['🛏️ Chambres', '🍽️ Salle à manger', '🌳 Jardin', '🍳 Petit-déj', '📸 Terrasse', '🚗 Parking'],
    hours: 'Réception 24h/24'
  },

  hotel: {
    id: 'hotel',
    name: 'Hôtel',
    icon: '🏨',
    category: 'popular',
    color: { primary: '#1d4ed8', secondary: '#60a5fa', gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)' },
    slogan: [
      'Le confort à portée de main',
      'Votre séjour de rêve commence ici',
      'Excellence et élégance'
    ],
    services: [
      { icon: '🛏️', name: 'Chambres & Suites', desc: 'Confort et élégance' },
      { icon: '🏊', name: 'Piscine', desc: 'Espace détente' },
      { icon: '🍽️', name: 'Restaurant', desc: 'Cuisine raffinée' },
      { icon: '💼', name: 'Salles de Réunion', desc: 'Séminaires et conférences' },
      { icon: '💆', name: 'Spa & Bien-être', desc: 'Détente absolue' },
      { icon: '🚗', name: 'Service Voiture', desc: 'Transfert aéroport' }
    ],
    testimonials: [
      { name: 'Marie C.', text: 'Service impeccable, chambres spacieuses. Hôtel de qualité !' },
      { name: 'Seydou K.', text: 'Petit déjeuner excellent, personnel très professionnel.' },
      { name: 'Claire D.', text: 'Séjour fantastique, rapport qualité/prix imbattable.' }
    ],
    specificQuestions: [
      { id: 'stars', label: 'Classification', placeholder: 'Ex: 3 étoiles, 4 étoiles...', type: 'text' },
      { id: 'rooms', label: 'Nombre de chambres', placeholder: 'Ex: 30 chambres', type: 'text' },
      { id: 'amenities', label: 'Équipements', placeholder: 'Ex: Piscine, Spa, Gym...', type: 'text' }
    ],
    galleryPlaceholders: ['🛏️ Chambres', '🏊 Piscine', '🍽️ Restaurant', '💆 Spa', '💼 Réunion', '🏨 Réception'],
    hours: 'Réception 24h/24'
  },

  // === BEAUTÉ & BIEN-ÊTRE ===
  coiffure: {
    id: 'coiffure',
    name: 'Salon de Coiffure',
    icon: '💇',
    category: 'popular',
    color: { primary: '#ec4899', secondary: '#f472b6', gradient: 'linear-gradient(135deg, #db2777, #ec4899)' },
    slogan: [
      'Votre beauté, notre passion',
      'Sublimez votre style',
      'L\'excellence de la coiffure'
    ],
    services: [
      { icon: '✂️', name: 'Coupe Homme', desc: 'Styles modernes et classiques' },
      { icon: '💇‍♀️', name: 'Coiffure Femme', desc: 'Tresses, tissages, plaques' },
      { icon: '💅', name: 'Manucure & Pédicure', desc: 'Ongles élégants' },
      { icon: '✨', name: 'Soins Capillaires', desc: 'Traitements professionnels' },
      { icon: '💈', name: 'Barbier', desc: 'Taille de barbe' },
      { icon: '🎨', name: 'Coloration', desc: 'Teintures naturelles' }
    ],
    testimonials: [
      { name: 'Aissatou B.', text: 'Meilleur coiffeur du quartier ! Toujours satisfaite de mes tresses.' },
      { name: 'Modou N.', text: 'Coupe impeccable et prix abordables. Je recommande !' },
      { name: 'Fatou G.', text: 'Équipe professionnelle et accueillante. Mon salon préféré.' }
    ],
    specificQuestions: [
      { id: 'specialty', label: 'Spécialité', placeholder: 'Ex: Tresses, Tissages, Coupe homme...', type: 'text' },
      { id: 'stylists', label: 'Nombre de coiffeurs', placeholder: 'Ex: 3 coiffeurs', type: 'text' }
    ],
    galleryPlaceholders: ['💇 Coiffures', '💅 Manucure', '✨ Soins', '💈 Barbe', '📸 Réalisations', '🎭 Avant/Après'],
    hours: 'Lun-Sam: 8h - 20h'
  },

  beaute: {
    id: 'beaute',
    name: 'Institut de Beauté / Spa',
    icon: '💆',
    category: 'health',
    color: { primary: '#8b5cf6', secondary: '#a78bfa', gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
    slogan: [
      'Prenez soin de vous',
      'Détente et beauté',
      'Votre bien-être nous importe'
    ],
    services: [
      { icon: '💆', name: 'Soins Visage', desc: 'Nettoyage, hydratation' },
      { icon: '💅', name: 'Manucure & Pédicure', desc: 'Beauté des ongles' },
      { icon: '🧖', name: 'Soins Corps', desc: 'Massages, gommages' },
      { icon: '💄', name: 'Maquillage', desc: 'Mariages, événements' },
      { icon: '🌟', name: 'Soins Anti-âge', desc: 'Traitement avancé' },
      { icon: '🌿', name: 'Soins Naturels', desc: 'Produits bio' }
    ],
    testimonials: [
      { name: 'Mariama S.', text: 'Massage incroyable, je suis détendue comme jamais !' },
      { name: 'Khady D.', text: 'Maquillage parfait pour mon mariage. Merci infiniment !' },
      { name: 'Ndeye F.', text: 'Institut propre et soigné. Personnel très professionnel.' }
    ],
    specificQuestions: [
      { id: 'treatments', label: 'Soins proposés', placeholder: 'Ex: Massages, Soins visage, Épilation...', type: 'text' }
    ],
    galleryPlaceholders: ['💆 Soins', '💅 Ongles', '💄 Maquillage', '🧖 Massage', '🌟 Résultats', '🌿 Produits'],
    hours: 'Lun-Sam: 9h - 19h'
  },

  // === COMMERCE ===
  commerce: {
    id: 'commerce',
    name: 'Commerce / Boutique',
    icon: '🛍️',
    category: 'popular',
    color: { primary: '#8b5cf6', secondary: '#a78bfa', gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
    slogan: [
      'Mode et élégance au meilleur prix',
      'Style et qualité réunis',
      'Votre nouvelle destination shopping'
    ],
    services: [
      { icon: '👕', name: 'Vêtements Homme', desc: 'Styles tendance' },
      { icon: '👗', name: 'Vêtements Femme', desc: 'Mode élégante' },
      { icon: '👟', name: 'Chaussures', desc: 'Sneakers et classiques' },
      { icon: '👜', name: 'Accessoires', desc: 'Sacs et bijoux' },
      { icon: '🎁', name: 'Idées Cadeaux', desc: 'Articles originaux' },
      { icon: '🛒', name: 'Vente en gros', desc: 'Prix compétitifs' }
    ],
    testimonials: [
      { name: 'Awa D.', text: 'Belle sélection de vêtements, prix abordables !' },
      { name: 'Cheikh M.', text: 'Service client au top, je recommande.' },
      { name: 'Rokhaya S.', text: 'Ma boutique préférée, toujours du choix.' }
    ],
    specificQuestions: [
      { id: 'products', label: 'Types de produits', placeholder: 'Ex: Vêtements, Chaussures, Électronique...', type: 'text' },
      { id: 'brands', label: 'Marques vendues', placeholder: 'Ex: Adidas, Nike, Marques locales...', type: 'text' }
    ],
    galleryPlaceholders: ['👕 Vêtements', '👟 Chaussures', '👜 Sacs', '🎁 Accessoires', '📸 Boutique', '🛍️ Nouveautés'],
    hours: 'Lun-Sam: 9h - 20h'
  },

  electronique: {
    id: 'electronique',
    name: 'Boutique Électronique',
    icon: '📱',
    category: 'commerce',
    color: { primary: '#0ea5e9', secondary: '#38bdf8', gradient: 'linear-gradient(135deg, #0284c7, #0ea5e9)' },
    slogan: [
      'La technologie à portée de main',
      'Innovation et qualité',
      'Tous vos appareils électroniques'
    ],
    services: [
      { icon: '📱', name: 'Téléphones', desc: 'Smartphones neufs et occasions' },
      { icon: '💻', name: 'Ordinateurs', desc: 'PC portables et bureautique' },
      { icon: '📺', name: 'Téléviseurs', desc: 'TV LED et Smart TV' },
      { icon: '🎧', name: 'Accessoires', desc: 'Casques, enceintes, chargeurs' },
      { icon: '🔧', name: 'Réparation', desc: 'Service technique' },
      { icon: '💰', name: 'Achat/Vente', desc: 'Échange et reprise' }
    ],
    testimonials: [
      { name: 'Papa D.', text: 'Excellent service, téléphone livré rapidement.' },
      { name: 'Sokhna B.', text: 'Prix imbattables et garantie effective.' },
      { name: 'Lamine T.', text: 'Réparation faite en un temps record !' }
    ],
    specificQuestions: [
      { id: 'products', label: 'Produits vendus', placeholder: 'Ex: Téléphones, PC, TV...', type: 'text' },
      { id: 'repair', label: 'Service réparation', placeholder: 'Ex: Oui, sur place', type: 'text' }
    ],
    galleryPlaceholders: ['📱 Téléphones', '💻 PC', '📺 TV', '🎧 Accessoires', '🔧 Réparation', '💰 Promos'],
    hours: 'Lun-Sam: 9h - 20h'
  },

  // === SERVICES TECHNIQUES ===
  electricien: {
    id: 'electricien',
    name: 'Électricien',
    icon: '⚡',
    category: 'popular',
    color: { primary: '#eab308', secondary: '#facc15', gradient: 'linear-gradient(135deg, #ca8a04, #eab308)' },
    slogan: [
      'L\'énergie à votre service',
      'Installation et dépannage électrique',
      'Professionnalisme et sécurité'
    ],
    services: [
      { icon: '🔌', name: 'Installation Électrique', desc: 'Neuf et rénovation' },
      { icon: '💡', name: 'Éclairage', desc: 'Intérieur et extérieur' },
      { icon: '🔧', name: 'Dépannage', desc: 'Intervention rapide' },
      { icon: '🏠', name: 'Domotique', desc: 'Maison connectée' },
      { icon: '⚡', name: 'Mise aux Normes', desc: 'Conformité et sécurité' },
      { icon: '📞', name: 'Urgences 24h/24', desc: 'Service disponible' }
    ],
    testimonials: [
      { name: 'Mamadou S.', text: 'Intervention rapide, travail soigné. Très professionnel !' },
      { name: 'Coumba N.', text: 'Installation complète de ma maison, je recommande.' },
      { name: 'Ibrahima D.', text: 'Dépannage en urgence, disponible même le dimanche.' }
    ],
    specificQuestions: [
      { id: 'zone', label: 'Zone d\'intervention', placeholder: 'Ex: Dakar et banlieue', type: 'text' },
      { id: 'emergency', label: 'Service d\'urgence', placeholder: 'Ex: Oui, 24h/24', type: 'text' }
    ],
    galleryPlaceholders: ['⚡ Installation', '💡 Éclairage', '🔌 Tableau', '🔧 Dépannage', '🏠 Domotique', '📞 Urgences'],
    hours: 'Lun-Sam: 8h - 18h | Urgences 24h/24'
  },

  plombier: {
    id: 'plombier',
    name: 'Plombier / Sanitaire',
    icon: '🔧',
    category: 'popular',
    color: { primary: '#0891b2', secondary: '#22d3ee', gradient: 'linear-gradient(135deg, #0e7490, #0891b2)' },
    slogan: [
      'Toutes vos solutions sanitaires',
      'Plomberie professionnelle',
      'Intervention rapide et soignée'
    ],
    services: [
      { icon: '🚿', name: 'Plomberie', desc: 'Installation et réparation' },
      { icon: '🚽', name: 'Sanitaires', desc: 'WC, lavabos, douches' },
      { icon: '🔥', name: 'Chauffe-eau', desc: 'Installation et entretien' },
      { icon: '💧', name: 'Fuites d\'eau', desc: 'Détection et réparation' },
      { icon: '🧹', name: 'Débouchage', desc: 'Canalisations et éviers' },
      { icon: '📞', name: 'Urgences', desc: 'Intervention rapide' }
    ],
    testimonials: [
      { name: 'Ousmane B.', text: 'Fuite réparée en moins d\'une heure. Excellent service !' },
      { name: 'Adama T.', text: 'Installation salle de bain impeccable, travail soigné.' },
      { name: 'Mame D.', text: 'Intervention rapide et prix correct. Je recommande.' }
    ],
    specificQuestions: [
      { id: 'zone', label: 'Zone d\'intervention', placeholder: 'Ex: Dakar et banlieue', type: 'text' },
      { id: 'emergency', label: 'Service d\'urgence', placeholder: 'Ex: Oui, disponible 7j/7', type: 'text' }
    ],
    galleryPlaceholders: ['🚿 Douche', '🚽 WC', '🔥 Chauffe-eau', '💧 Plomberie', '🔧 Outils', '🏠 Installation'],
    hours: 'Lun-Sam: 8h - 18h | Urgences 7j/7'
  },

  menuisier: {
    id: 'menuisier',
    name: 'Menuisier / Ébéniste',
    icon: '🪚',
    category: 'construction',
    color: { primary: '#92400e', secondary: '#d97706', gradient: 'linear-gradient(135deg, #78350f, #92400e)' },
    slogan: [
      'L\'art du bois à votre service',
      'Création sur mesure',
      'Tradition et modernité'
    ],
    services: [
      { icon: '🚪', name: 'Portes', desc: 'Intérieur et extérieur' },
      { icon: '🪟', name: 'Fenêtres', desc: 'Bois et aluminium' },
      { icon: '🛋️', name: 'Meubles Sur Mesure', desc: 'Salon, chambre, bureau' },
      { icon: '🪑', name: 'Mobilier', desc: 'Tables, chaises, armoires' },
      { icon: '🏠', name: 'Agencement', desc: 'Placards, cuisines' },
      { icon: '🔧', name: 'Réparation', desc: 'Restauration de meubles' }
    ],
    testimonials: [
      { name: 'Serigne M.', text: 'Meuble TV sur mesure, exactement ce que je voulais !' },
      { name: 'Khady S.', text: 'Placards de qualité, finition impeccable.' },
      { name: 'Abdou N.', text: 'Travail soigné et délais respectés.' }
    ],
    specificQuestions: [
      { id: 'materials', label: 'Matériaux travaillés', placeholder: 'Ex: Bois massif, Contreplaqué...', type: 'text' },
      { id: 'creations', label: 'Réalisations', placeholder: 'Ex: Meubles, Portes, Fenêtres...', type: 'text' }
    ],
    galleryPlaceholders: ['🚪 Portes', '🪟 Fenêtres', '🛋️ Meubles', '🪑 Mobilier', '🏠 Agencement', '🎨 Finitions'],
    hours: 'Lun-Sam: 8h - 18h'
  },

  peintre: {
    id: 'peintre',
    name: 'Peintre en Bâtiment',
    icon: '🎨',
    category: 'construction',
    color: { primary: '#dc2626', secondary: '#f87171', gradient: 'linear-gradient(135deg, #b91c1c, #dc2626)' },
    slogan: [
      'Donnez vie à vos murs',
      'Couleurs et finitions professionnelles',
      'Transformez votre espace'
    ],
    services: [
      { icon: '🏠', name: 'Peinture Intérieure', desc: 'Murs, plafonds, boiseries' },
      { icon: '🏢', name: 'Peinture Extérieure', desc: 'Façades, clôtures' },
      { icon: '✨', name: 'Finitions Spéciales', desc: 'Effets décoratifs' },
      { icon: '🧱', name: 'Revêtements', desc: 'Papiers peints, enduits' },
      { icon: '🛡️', name: 'Protection', desc: 'Traitement anti-humidité' },
      { icon: '🔧', name: 'Petits Travaux', desc: 'Réparations et retouches' }
    ],
    testimonials: [
      { name: 'Aminata D.', text: 'Travail impeccable, appartement transformé !' },
      { name: 'Moussa K.', text: 'Très professionnel, site propre après travaux.' },
      { name: 'Fatou B.', text: 'Couleurs magnifiques, finition parfaite.' }
    ],
    specificQuestions: [
      { id: 'specialty', label: 'Spécialité', placeholder: 'Ex: Intérieur, Extérieur, Décoratif...', type: 'text' }
    ],
    galleryPlaceholders: ['🎨 Peinture', '🏠 Intérieur', '🏢 Extérieur', '✨ Finitions', '🧱 Revêtements', '📸 Réalisations'],
    hours: 'Lun-Sam: 8h - 18h'
  },

  // === TRANSPORT ===
  transport: {
    id: 'transport',
    name: 'Transport / Taxi',
    icon: '🚕',
    category: 'services',
    color: { primary: '#f59e0b', secondary: '#fbbf24', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
    slogan: [
      'Votre déplacement, notre priorité',
      'Roulez en toute sécurité',
      'Service de transport fiable'
    ],
    services: [
      { icon: '🚕', name: 'Taxi', desc: 'Courses en ville' },
      { icon: '✈️', name: 'Transfert Aéroport', desc: 'Arrivée et départ' },
      { icon: '🚌', name: 'Transport Groupe', desc: 'Familles et entreprises' },
      { icon: '📦', name: 'Livraison', desc: 'Colis et documents' },
      { icon: '🌅', name: 'Excursions', desc: 'Visites touristiques' },
      { icon: '🌙', name: 'Service Nuit', desc: 'Disponible 24h/24' }
    ],
    testimonials: [
      { name: 'Sophie L.', text: 'Chauffeur ponctuel et très professionnel. Parfait pour l\'aéroport !' },
      { name: 'Ibrahima D.', text: 'Service impeccable, voiture propre et confortable.' },
      { name: 'Marie K.', text: 'Disponible même tard la nuit, très fiable.' }
    ],
    specificQuestions: [
      { id: 'vehicles', label: 'Type de véhicules', placeholder: 'Ex: Berline, 4x4, Minibus...', type: 'text' },
      { id: 'zone', label: 'Zone couverte', placeholder: 'Ex: Dakar, Thiès, Saly...', type: 'text' }
    ],
    galleryPlaceholders: ['🚕 Véhicules', '✈️ Aéroport', '🚌 Groupe', '📦 Livraison', '🌅 Excursions', '📞 Réservation'],
    hours: 'Service 24h/24'
  },

  // === SANTÉ ===
  pharmacie: {
    id: 'pharmacie',
    name: 'Pharmacie',
    icon: '💊',
    category: 'health',
    color: { primary: '#16a34a', secondary: '#4ade80', gradient: 'linear-gradient(135deg, #15803d, #16a34a)' },
    slogan: [
      'Votre santé, notre priorité',
      'Conseils et médicaments de qualité',
      'Au service de votre bien-être'
    ],
    services: [
      { icon: '💊', name: 'Médicaments', desc: 'Ordonnance et conseil' },
      { icon: '💉', name: 'Vaccination', desc: 'Vaccins disponibles' },
      { icon: '🩺', name: 'Conseil Santé', desc: 'Écoute et orientation' },
      { icon: '🌿', name: 'Phytothérapie', desc: 'Médecine naturelle' },
      { icon: '🧴', name: 'Para-pharmacie', desc: 'Produits de soin' },
      { icon: '🌙', name: 'Garde de Nuit', desc: 'Service disponible' }
    ],
    testimonials: [
      { name: 'Fatou D.', text: 'Pharmacie bien achalandée, personnel très à l\'écoute.' },
      { name: 'Moussa N.', text: 'Garde de nuit très pratique, merci pour le service !' },
      { name: 'Awa S.', text: 'Conseils avisés et prix corrects.' }
    ],
    specificQuestions: [
      { id: 'hours', label: 'Horaires d\'ouverture', placeholder: 'Ex: 8h-20h, garde de nuit', type: 'text' }
    ],
    galleryPlaceholders: ['💊 Médicaments', '💉 Vaccins', '🩺 Conseil', '🌿 Naturel', '🧴 Soins', '🌙 Garde'],
    hours: 'Lun-Sam: 8h - 20h | Garde de nuit'
  },

  clinique: {
    id: 'clinique',
    name: 'Clinique / Cabinet Médical',
    icon: '🏥',
    category: 'health',
    color: { primary: '#0891b2', secondary: '#22d3ee', gradient: 'linear-gradient(135deg, #0e7490, #0891b2)' },
    slogan: [
      'Des soins de qualité pour tous',
      'Votre santé entre de bonnes mains',
      'Excellence médicale'
    ],
    services: [
      { icon: '👨‍⚕️', name: 'Consultations', desc: 'Médecine générale' },
      { icon: '🔬', name: 'Analyses', desc: 'Laboratoire sur place' },
      { icon: '💉', name: 'Soins Infirmiers', desc: 'Pansements, injections' },
      { icon: '🩺', name: 'Spécialités', desc: 'Consultations spécialisées' },
      { icon: '🚑', name: 'Urgences', desc: 'Service disponible' },
      { icon: '📊', name: 'Bilan Santé', desc: 'Check-up complet' }
    ],
    testimonials: [
      { name: 'Coumba M.', text: 'Équipe médicale compétente, prise en charge rapide.' },
      { name: 'Amadou D.', text: 'Clinique propre et bien équipée. Je recommande.' },
      { name: 'Rokhaya N.', text: 'Bilan santé complet, très satisfaite du service.' }
    ],
    specificQuestions: [
      { id: 'specialties', label: 'Spécialités', placeholder: 'Ex: Médecine générale, Pédiatrie...', type: 'text' },
      { id: 'equipment', label: 'Équipements', placeholder: 'Ex: Laboratoire, Échographie...', type: 'text' }
    ],
    galleryPlaceholders: ['🏥 Accueil', '👨‍⚕️ Consultation', '🔬 Laboratoire', '🩺 Soins', '🚑 Urgences', '📊 Bilan'],
    hours: 'Lun-Sam: 8h - 20h | Urgences 24h/24'
  },

  // === ÉDUCATION ===
  ecole: {
    id: 'ecole',
    name: 'École / Centre de Formation',
    icon: '📚',
    category: 'services',
    color: { primary: '#7c3aed', secondary: '#a78bfa', gradient: 'linear-gradient(135deg, #6d28d9, #7c3aed)' },
    slogan: [
      'L\'éducation, c\'est l\'avenir',
      'Former les talents de demain',
      'Excellence académique'
    ],
    services: [
      { icon: '📖', name: 'Cours', desc: 'Tous niveaux' },
      { icon: '👨‍🏫', name: 'Soutien Scolaire', desc: 'Aide personnalisée' },
      { icon: '💻', name: 'Formation Pro', desc: 'Compétences pratiques' },
      { icon: '🌍', name: 'Langues', desc: 'Anglais, Français...' },
      { icon: '🎯', name: 'Préparation Examens', desc: 'BFEM, Bac, Concours' },
      { icon: '📱', name: 'Cours en Ligne', desc: 'E-learning' }
    ],
    testimonials: [
      { name: 'Aminata T.', text: 'Mes enfants ont progressé rapidement. Excellente équipe !' },
      { name: 'Oumar S.', text: 'Formation professionnelle de qualité, débouchés assurés.' },
      { name: 'Fatou D.', text: 'Cours de soutien efficaces, mon fils a réussi son Bac.' }
    ],
    specificQuestions: [
      { id: 'levels', label: 'Niveaux proposés', placeholder: 'Ex: Primaire, Secondaire, Supérieur...', type: 'text' },
      { id: 'subjects', label: 'Matières enseignées', placeholder: 'Ex: Maths, Français, Anglais...', type: 'text' }
    ],
    galleryPlaceholders: ['📚 Bibliothèque', '👨‍🏫 Cours', '💻 Formation', '🎯 Examens', '🌍 Langues', '📱 E-learning'],
    hours: 'Lun-Sam: 8h - 18h'
  },

  // === SERVICES INFORMATIQUE ===
  informatique: {
    id: 'informatique',
    name: 'Services Informatique',
    icon: '💻',
    category: 'tech',
    color: { primary: '#0ea5e9', secondary: '#38bdf8', gradient: 'linear-gradient(135deg, #0284c7, #0ea5e9)' },
    slogan: [
      'Solutions numériques sur mesure',
      'Votre partenaire technologique',
      'Innovation et performance'
    ],
    services: [
      { icon: '🌐', name: 'Création de Sites Web', desc: 'Sites vitrines et e-commerce' },
      { icon: '📱', name: 'Applications Mobiles', desc: 'Android et iOS' },
      { icon: '🔧', name: 'Maintenance', desc: 'Dépannage et support' },
      { icon: '🛡️', name: 'Sécurité', desc: 'Protection des données' },
      { icon: '☁️', name: 'Cloud', desc: 'Hébergement et stockage' },
      { icon: '📊', name: 'Conseil IT', desc: 'Audit et stratégie' }
    ],
    testimonials: [
      { name: 'Seydou K.', text: 'Site web professionnel livré rapidement. Top !' },
      { name: 'Mariama D.', text: 'Dépannage efficace, équipe compétente.' },
      { name: 'Ibrahima T.', text: 'Application mobile exactement comme je voulais.' }
    ],
    specificQuestions: [
      { id: 'services', label: 'Services proposés', placeholder: 'Ex: Sites web, Apps, Maintenance...', type: 'text' }
    ],
    galleryPlaceholders: ['🌐 Sites web', '📱 Apps', '🔧 Dépannage', '🛡️ Sécurité', '☁️ Cloud', '📊 Conseil'],
    hours: 'Lun-Sam: 9h - 18h'
  },

  // === PHOTOGRAPHIE ===
  photographe: {
    id: 'photographe',
    name: 'Photographe / Vidéaste',
    icon: '📸',
    category: 'services',
    color: { primary: '#6366f1', secondary: '#818cf8', gradient: 'linear-gradient(135deg, #4f46e5, #6366f1)' },
    slogan: [
      'Immortalisez vos moments',
      'L\'art de capturer l\'instant',
      'Souvenirs inoubliables'
    ],
    services: [
      { icon: '💒', name: 'Mariages', desc: 'Reportage complet' },
      { icon: '🎉', name: 'Événements', desc: 'Anniversaires, fêtes' },
      { icon: '👤', name: 'Portraits', desc: 'Studio et extérieur' },
      { icon: '🎬', name: 'Vidéo', desc: 'Tournage et montage' },
      { icon: '🏢', name: 'Corporate', desc: 'Entreprises, produits' },
      { icon: '📷', name: 'Drone', desc: 'Vues aériennes' }
    ],
    testimonials: [
      { name: 'Fatou & Modou', text: 'Photos de mariage magnifiques ! Moments précieux capturés.' },
      { name: 'Awa D.', text: 'Portrait professionnel parfait, très satisfaite.' },
      { name: 'Entreprise XYZ', text: 'Shooting produit impeccable, qualité au rendez-vous.' }
    ],
    specificQuestions: [
      { id: 'specialty', label: 'Spécialité', placeholder: 'Ex: Mariages, Portraits, Corporate...', type: 'text' },
      { id: 'equipment', label: 'Équipement', placeholder: 'Ex: Studio, Drone, Éclairage...', type: 'text' }
    ],
    galleryPlaceholders: ['💒 Mariages', '🎉 Événements', '👤 Portraits', '🎬 Vidéo', '🏢 Corporate', '📷 Drone'],
    hours: 'Sur rendez-vous'
  },

  // === AUTRES ===
  autre: {
    id: 'autre',
    name: 'Autre Activité',
    icon: '✨',
    category: 'other',
    color: { primary: '#059669', secondary: '#34d399', gradient: 'linear-gradient(135deg, #047857, #059669)' },
    slogan: [
      'L\'excellence à votre service',
      'Qualité et professionnalisme',
      'Votre satisfaction, notre priorité'
    ],
    services: [
      { icon: '⭐', name: 'Service Premium', desc: 'Qualité exceptionnelle' },
      { icon: '✨', name: 'Expertise', desc: 'Professionnels qualifiés' },
      { icon: '🚀', name: 'Rapidité', desc: 'Délais respectés' },
      { icon: '💼', name: 'Professionnalisme', desc: 'Service sérieux' },
      { icon: '🤝', name: 'Accompagnement', desc: 'Conseils personnalisés' },
      { icon: '💎', name: 'Qualité', desc: 'Excellence garantie' }
    ],
    testimonials: [
      { name: 'Client Satisfait', text: 'Service impeccable, je recommande vivement !' },
      { name: 'Marie D.', text: 'Travail soigné et équipe professionnelle.' },
      { name: 'Amadou K.', text: 'Excellent rapport qualité/prix.' }
    ],
    specificQuestions: [
      { id: 'activity_desc', label: 'Décrivez votre activité', placeholder: 'Expliquez ce que vous faites...', type: 'textarea' }
    ],
    galleryPlaceholders: ['📸 Photo 1', '📸 Photo 2', '📸 Photo 3', '📸 Photo 4', '📸 Photo 5', '📸 Photo 6'],
    hours: 'Nous consulter'
  }
}

// Liste groupée par catégorie
export const domainsByCategory = {
  popular: {
    title: '🔥 Les plus demandés',
    domains: popularDomains.map(id => domains[id]).filter(Boolean)
  },
  food: {
    title: '🍽️ Restauration',
    domains: Object.values(domains).filter(d => d.category === 'food')
  },
  health: {
    title: '💊 Santé & Bien-être',
    domains: Object.values(domains).filter(d => d.category === 'health')
  },
  commerce: {
    title: '🛍️ Commerce',
    domains: Object.values(domains).filter(d => d.category === 'commerce')
  },
  construction: {
    title: '🏗️ BTP & Artisanat',
    domains: Object.values(domains).filter(d => d.category === 'construction')
  },
  services: {
    title: '🛠️ Services',
    domains: Object.values(domains).filter(d => d.category === 'services')
  },
  tech: {
    title: '💻 Technologie',
    domains: Object.values(domains).filter(d => d.category === 'tech')
  }
}

// Tous les domaines en liste plate
export const allDomains = Object.values(domains)

// Fonction de recherche
export function searchDomains(query: string): DomainConfig[] {
  const q = query.toLowerCase().trim()
  if (!q) return allDomains
  
  return allDomains.filter(d => 
    d.name.toLowerCase().includes(q) ||
    d.id.toLowerCase().includes(q) ||
    d.services.some(s => s.name.toLowerCase().includes(q))
  )
}
