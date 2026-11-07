export const hospitals = [
  {
    code: 'CHUL',
    name: "Centre hospitalier de l'Université Laval",
    shortName: 'CHUL',
    specialty: 'Pédiatrie & Mère-Enfant',
    city: 'Sainte-Foy',
    icon: 'fa-solid fa-child-reaching',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop',
  },
  {
    code: 'NCH',
    name: 'Nouveau complexe hospitalier',
    shortName: 'Nouveau Complexe',
    specialty: 'Complexe de soins avancés & Recherche',
    city: 'Limoilou',
    icon: 'fa-solid fa-hospital-user',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop',
  },
  {
    code: 'HSFA',
    name: "Hôpital Saint-François d'Assise",
    shortName: 'Saint-François',
    specialty: 'Obstétrique & Santé vasculaire',
    city: 'La Cité-Limoilou',
    icon: 'fa-solid fa-baby',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop',
  },
  {
    code: 'HSS',
    name: 'Hôpital du Saint-Sacrement',
    shortName: 'Saint-Sacrement',
    specialty: 'Ophtalmologie & Santé du sein',
    city: 'Montcalm',
    icon: 'fa-solid fa-eye',
    image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=800&auto=format&fit=crop',
  },
]

export const hospitalPins = [
  { code: 'CHUL', top: '35%', left: '25%' },
  { code: 'NCH',  top: '25%', left: '65%' },
  { code: 'HSFA', top: '50%', left: '50%' },
  { code: 'HSS',  top: '70%', left: '30%' },
]

export const mockPlots = [
  { 
    id: 1, 
    name: 'Hall principal', 
    hospital: 'CHUL', 
    sector: 'Espace public', 
    price: 50000, 
    formattedPrice: '50 000 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop' 
  },
  { 
    id: 2, 
    name: 'Cliniques externes', 
    hospital: 'CHUL', 
    sector: 'Salle d\'attente', 
    price: 20000, 
    formattedPrice: '20 000 $ CAD', 
    available: false, 
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop' 
  },
  { 
    id: 3, 
    name: 'Salle d\'examen 210', 
    hospital: 'CHUL', 
    sector: 'Salle d\'examen', 
    price: 3000, 
    formattedPrice: '3 000 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop' 
  },
  { 
    id: 4, 
    name: 'Atrium central', 
    hospital: 'NCH', 
    sector: 'Espace public', 
    price: 80000, 
    formattedPrice: '80 000 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop' 
  },
  { 
    id: 5, 
    name: 'Urgence', 
    hospital: 'NCH', 
    sector: 'Salle d\'attente', 
    price: 45000, 
    formattedPrice: '45 000 $ CAD', 
    available: false, 
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop' 
  },
  { 
    id: 6, 
    name: 'Hémodialyse', 
    hospital: 'NCH', 
    sector: 'Salle de traitement', 
    price: 4000, 
    formattedPrice: '4 000 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&auto=format&fit=crop' 
  },
  { 
    id: 7, 
    name: 'Hall d\'entrée', 
    hospital: 'HSFA', 
    sector: 'Espace public', 
    price: 30000, 
    formattedPrice: '30 000 $ CAD', 
    available: false, 
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop' 
  },
  { 
    id: 8, 
    name: 'Enseignement 050', 
    hospital: 'HSFA', 
    sector: 'Salle d\'enseignement', 
    price: 1500, 
    formattedPrice: '1 500 $ CAD', 
    available: true, 
    image: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=600&auto=format&fit=crop' 
  },
  { 
    id: 9, 
    name: 'Hall du Saint-Sacrement', 
    hospital: 'HSS', 
    sector: 'Espace public', 
    price: 25000, 
    formattedPrice: '25 000 $ CAD', 
    available: false, 
    image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?w=600&auto=format&fit=crop' 
  },
  { 
    id: 10, 
    name: 'Salle de repos du personnel', 
    hospital: 'HSS', 
    sector: 'Salle du personnel', 
    price: 500, 
    formattedPrice: '500 $ CAD', 
    available: false, 
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop' 
  }
]
