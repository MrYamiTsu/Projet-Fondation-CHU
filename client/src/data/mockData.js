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

export const keyStats = [
  { label: 'Hôpitaux', value: '5', icon: 'fa-solid fa-hospital', colorClass: 'bg-blue-100 text-blue-700' },
  { label: 'Espaces', value: '150+', icon: 'fa-solid fa-vector-square', colorClass: 'bg-sky-100 text-sky-700' },
  { label: 'Secteurs de soins', value: '50+', icon: 'fa-solid fa-heart-pulse', colorClass: 'bg-teal-100 text-teal-700' },
  { label: 'Visiteurs/An', value: '1M+', icon: 'fa-solid fa-users', colorClass: 'bg-indigo-100 text-indigo-700' }
];

export const mockSpaces = [
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
  }
];