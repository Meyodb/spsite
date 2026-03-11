export const RESTAURANTS = [
  {
    id: 1,
    name: "SOUP & JUICE ST LAZARE",
    slug: "st-lazare",
    address: "4 Rue de Londres, 75008 Paris",
    coordinates: [2.33046, 48.87678],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX",
    quartier: "Quartier Saint-Lazare – 8ème arrondissement",
    metro: [
      { name: "Saint-Lazare", lines: ["3", "12", "13", "14"] },
      { name: "Europe", lines: ["3"] },
    ],
    description:
      "Au cœur du quartier Saint-Lazare, à deux pas de la gare et des grands magasins du boulevard Haussmann, notre restaurant vous accueille dans un cadre lumineux et apaisant. Idéal pour une pause déjeuner healthy entre deux rendez-vous ou avant de reprendre le train.",
    nearbyLandmarks: ["Gare Saint-Lazare", "Grands magasins Haussmann", "Église de la Trinité"],
  },
  {
    id: 2,
    name: "SOUP & JUICE BOURSE",
    slug: "bourse",
    address: "135 Rue Montmartre, 75002 Paris",
    coordinates: [2.34470, 48.86575],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX",
    quartier: "Quartier de la Bourse – 2ème arrondissement",
    metro: [
      { name: "Grands Boulevards", lines: ["8", "9"] },
      { name: "Bourse", lines: ["3"] },
    ],
    description:
      "Installé rue Montmartre au cœur du 2ème arrondissement, entre la Bourse et les Grands Boulevards, ce restaurant est le repaire idéal des travailleurs du quartier. Savourez nos soupes maison et jus pressés dans un quartier vivant, mêlant patrimoine historique et vie de bureau animée.",
    nearbyLandmarks: ["Palais Brongniart", "Passage des Panoramas", "Bibliothèque nationale de France"],
  },
  {
    id: 3,
    name: "SOUP & JUICE HAUSSMANN",
    slug: "haussmann",
    address: "23 Rue Taitbout, 75009 Paris",
    coordinates: [2.33527, 48.87312],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX",
    quartier: "Quartier Haussmann – 9ème arrondissement",
    metro: [
      { name: "Chaussée d'Antin – La Fayette", lines: ["7", "9"] },
      { name: "Richelieu – Drouot", lines: ["8", "9"] },
    ],
    description:
      "Niché rue Taitbout dans le 9ème arrondissement, à quelques pas de l'Opéra et des Galeries Lafayette, ce restaurant offre une oasis de fraîcheur dans l'un des quartiers d'affaires les plus dynamiques de Paris. Parfait pour un déjeuner sain entre shopping et travail.",
    nearbyLandmarks: ["Galeries Lafayette", "Opéra Garnier", "Hôtel Drouot"],
  },
  {
    id: 4,
    name: "SOUP & JUICE ÉCURIES",
    slug: "ecuries",
    address: "7 Rue des Petites Écuries, 75010 Paris",
    coordinates: [2.35344, 48.87306],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX",
    quartier: "Quartier des Petites Écuries – 10ème arrondissement",
    metro: [
      { name: "Château d'Eau", lines: ["4"] },
      { name: "Bonne Nouvelle", lines: ["8", "9"] },
    ],
    description:
      "Dans la charmante rue des Petites Écuries, au cœur du 10ème arrondissement, ce restaurant allie l'énergie créative du quartier à notre cuisine healthy. Un lieu apprécié des professionnels et artistes du voisinage, entre le Faubourg Saint-Denis et les Grands Boulevards.",
    nearbyLandmarks: ["Porte Saint-Denis", "Théâtre de la Renaissance", "Marché Saint-Quentin"],
  },
  {
    id: 5,
    name: "SOUP & JUICE ÉTOILE",
    slug: "etoile",
    address: "54 Avenue Kléber, 75016 Paris",
    coordinates: [2.29115, 48.86880],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX",
    quartier: "Quartier de l'Étoile – 16ème arrondissement",
    metro: [
      { name: "Boissière", lines: ["6"] },
      { name: "Kléber", lines: ["6"] },
      { name: "Charles de Gaulle – Étoile", lines: ["1", "2", "6"] },
    ],
    description:
      "Avenue Kléber, à quelques pas de l'Arc de Triomphe et de la place de l'Étoile, notre restaurant vous propose une expérience culinaire healthy dans l'un des quartiers les plus prestigieux de Paris. Profitez de la quiétude du 16ème arrondissement pour une pause déjeuner rafraîchissante.",
    nearbyLandmarks: ["Arc de Triomphe", "Palais de Chaillot", "Musée Guimet"],
  },
  {
    id: 6,
    name: "SOUP & JUICE OPÉRA",
    slug: "opera",
    address: "24 Rue du 4 septembre, 75002 Paris",
    coordinates: [2.33515, 48.86994],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX",
    quartier: "Quartier de l'Opéra – 2ème arrondissement",
    metro: [
      { name: "Opéra", lines: ["3", "7", "8"] },
      { name: "Quatre-Septembre", lines: ["3"] },
    ],
    description:
      "Rue du 4 Septembre, en plein cœur du quartier de l'Opéra, ce restaurant est le point de rendez-vous des actifs du 2ème arrondissement. À l'ombre de l'Opéra Garnier et à proximité de la place Vendôme, offrez-vous une pause gourmande et équilibrée dans un quartier effervescent.",
    nearbyLandmarks: ["Opéra Garnier", "Place Vendôme", "Bibliothèque nationale Richelieu"],
  },
  {
    id: 7,
    name: "SOUP & JUICE NEUILLY",
    slug: "neuilly",
    address: "38 Rue Ybry, 92200 Neuilly-sur-Seine",
    coordinates: [2.26032, 48.88753],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "06 37 79 03 01",
    deliverooUrl: "https://deliveroo.fr/fr/menu/paris/neuilly-sur-seine/soup-and-juice-neuilly",
    quartier: "Neuilly-sur-Seine – Hauts-de-Seine",
    metro: [
      { name: "Pont de Neuilly", lines: ["1"] },
      { name: "Les Sablons", lines: ["1"] },
    ],
    description:
      "Notre restaurant de Neuilly-sur-Seine, rue Ybry, est idéalement situé entre le Bois de Boulogne et la Seine. Dans cette ville résidentielle prisée aux portes de Paris, retrouvez nos soupes, jus frais et salades pour un déjeuner sain. Livraison possible via Deliveroo !",
    nearbyLandmarks: ["Bois de Boulogne", "Île de la Jatte", "Jardin d'Acclimatation"],
  },
  {
    id: 8,
    name: "SOUP & JUICE HONORÉ",
    slug: "honore",
    address: "38 Rue de Berri, 75008 Paris",
    coordinates: [2.30700, 48.87390],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX",
    quartier: "Quartier des Champs-Élysées – 8ème arrondissement",
    metro: [
      { name: "George V", lines: ["1"] },
      { name: "Charles de Gaulle – Étoile", lines: ["1", "2", "6"] },
    ],
    description:
      "Rue de Berri, à deux pas des Champs-Élysées et de l'avenue George V, ce restaurant se trouve dans l'un des quartiers d'affaires les plus prestigieux de la capitale. Venez y déguster soupes gourmandes et jus vitaminés dans un cadre élégant, entre réunions et shopping de luxe.",
    nearbyLandmarks: ["Champs-Élysées", "Avenue George V", "Grand Palais"],
  },
  {
    id: 9,
    name: "SOUP & JUICE MADELEINE",
    slug: "madeleine",
    address: "24 Rue d'Anjou, 75008 Paris",
    coordinates: [2.32175, 48.87125],
    hours: "Lundi - Vendredi: 9h00 - 15h00",
    phone: "+33 1 XX XX XX XX",
    quartier: "Quartier de la Madeleine – 8ème arrondissement",
    metro: [
      { name: "Madeleine", lines: ["8", "12", "14"] },
      { name: "Saint-Augustin", lines: ["9"] },
    ],
    description:
      "Rue d'Anjou, dans le prestigieux quartier de la Madeleine, notre restaurant est niché entre la place de la Madeleine et le boulevard Haussmann. Un lieu prisé des gourmets et professionnels du 8ème arrondissement, où il fait bon savourer une soupe chaude ou un jus frais pressé.",
    nearbyLandmarks: ["Église de la Madeleine", "Place de la Concorde", "Fauchon & épiceries fines"],
  },
];

export const RESTAURANT_COUNT = RESTAURANTS.length;

export const RESTAURANT_NAMES_LIST = RESTAURANTS.map((r) =>
  r.name.replace("SOUP & JUICE ", "")
).join(", ");
