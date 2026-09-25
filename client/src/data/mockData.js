export const hospitals = [
  { code: 'CHUL', name: 'Centre hospitalier de l\'Université Laval', icon: 'fa-solid fa-child' },
  { code: 'HEJ', name: 'Hôpital de l\'Enfant-Jésus', icon: 'fa-solid fa-brain' },
  { code: 'HDQ', name: 'L\'Hôtel-Dieu de Québec', icon: 'fa-solid fa-dna' },
  { code: 'HSFA', name: 'Hôpital Saint-François d\'Assise', icon: 'fa-solid fa-baby' },
  { code: 'HSS', name: 'Hôpital du Sacré-Cœur de Saint-Sulpice', icon: 'fa-solid fa-heart' }
];

export const hospitalPins = [
  { code: 'CHUL', top: '35%', left: '25%' },
  { code: 'HEJ', top: '20%', left: '60%' },
  { code: 'HDQ', top: '65%', left: '70%' },
  { code: 'HSFA', top: '45%', left: '50%' },
  { code: 'HSS', top: '75%', left: '30%' }
];

export const mockPlots = [
  { 
    id: 1, 
    name: 'Atrium Central & Hall Principal', 
    hospital: 'CHUL', 
    sector: 'Pédiatrie', 
    price: 350000, 
    formattedPrice: '350 000 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop' 
  },
  { 
    id: 2, 
    name: 'Salle d\'Attente Oncologie', 
    hospital: 'HDQ', 
    sector: 'Oncologie', 
    price: 200000, 
    formattedPrice: '200 000 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop' 
  },
  { 
    id: 3, 
    name: 'Corridor d\'Innovations Cardiologie', 
    hospital: 'HEJ', 
    sector: 'Cardiologie', 
    price: 150000, 
    formattedPrice: '150 000 $ CAD', 
    available: false, 
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop' 
  },
  { 
    id: 4, 
    name: 'Espace Famille & Détente', 
    hospital: 'HSFA', 
    sector: 'Maternité', 
    price: 180000, 
    formattedPrice: '180 000 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop' 
  },
  { 
    id: 5, 
    name: 'Pavillon de Recherche & Innovation', 
    hospital: 'CRCE', 
    sector: 'Recherche', 
    price: 400000, 
    formattedPrice: '400 000 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop' 
  },
  { 
    id: 6, 
    name: 'Aire d\'Attente Traumatologie', 
    hospital: 'HEJ', 
    sector: 'Neurologie', 
    price: 220000, 
    formattedPrice: '220 000 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1519494080410-f9ab7d1970b2?w=600&auto=format&fit=crop' 
  },
  { 
    id: 7, 
    name: 'Hall d\'Accueil des Consultations', 
    hospital: 'HSS', 
    sector: 'Ophtalmologie', 
    price: 120000, 
    formattedPrice: '120 000 $ CAD', 
    available: false, 
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop' 
  },
  { 
    id: 8, 
    name: 'Zone d\'Accueil Urgence & Tri', 
    hospital: 'CHUL', 
    sector: 'Urgence', 
    price: 280000, 
    formattedPrice: '280 000 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=600&auto=format&fit=crop' 
  },
  { 
    id: 9, 
    name: 'Galerie d\'Exposition Médicale', 
    hospital: 'HDQ', 
    sector: 'Néphrologie', 
    price: 175000, 
    formattedPrice: '175 000 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop' 
  },
  { 
    id: 10, 
    name: 'Salon des Donateurs', 
    hospital: 'HSFA', 
    sector: 'Chirurgie', 
    price: 310000, 
    formattedPrice: '310 000 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop' 
  }
];