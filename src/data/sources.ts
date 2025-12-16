import { NewsSource } from '@/types';

export const newsSources: NewsSource[] = [
  {
    id: '24h-mada',
    name: '24h Mada',
    shortName: '24h',
    logo: '/sources/24h-mada.png',
    color: '#e63946',
    url: 'https://www.24hmada.com',
    type: 'web'
  },
  {
    id: 'orange-actu',
    name: 'Orange Actu Madagascar',
    shortName: 'Orange',
    logo: '/sources/orange-actu.png',
    color: '#ff6b00',
    url: 'https://actu.orange.mg',
    type: 'web'
  },
  {
    id: 'midi-madagascar',
    name: 'Midi Madagasikara',
    shortName: 'Midi',
    logo: '/sources/midi.png',
    color: '#1e3a8a',
    url: 'https://www.midi-madagasikara.mg',
    type: 'journal'
  },
  {
    id: 'tia-tanindrazana',
    name: 'Tia Tanindrazana',
    shortName: 'Tia',
    logo: '/sources/tia.png',
    color: '#047857',
    url: 'https://tiatanindrazana.com',
    type: 'journal'
  },
  {
    id: 'tvm',
    name: 'TVM Madagascar',
    shortName: 'TVM',
    logo: '/sources/tvm.png',
    color: '#7c3aed',
    url: 'https://www.tvm.mg',
    type: 'tv'
  },
  {
    id: 'real-tv',
    name: 'Real TV Madagascar',
    shortName: 'Real',
    logo: '/sources/real-tv.png',
    color: '#dc2626',
    url: 'https://www.realtv.mg',
    type: 'tv'
  },
  {
    id: 'viva',
    name: 'Viva Madagascar',
    shortName: 'Viva',
    logo: '/sources/viva.png',
    color: '#0891b2',
    url: 'https://www.viva.mg',
    type: 'tv'
  },
  {
    id: 'kolo-tv',
    name: 'Kolo TV',
    shortName: 'Kolo TV',
    logo: '/sources/kolo-tv.png',
    color: '#059669',
    url: 'https://www.kolotv.mg',
    type: 'tv'
  },
  {
    id: 'kolo-fm',
    name: 'Kolo FM',
    shortName: 'Kolo FM',
    logo: '/sources/kolo-fm.png',
    color: '#16a34a',
    url: 'https://www.kolofm.mg',
    type: 'radio'
  },
  {
    id: 'la-gazette',
    name: 'La Gazette de la Grande Île',
    shortName: 'Gazette',
    logo: '/sources/gazette.png',
    color: '#9333ea',
    url: 'https://www.lagazette-dgi.com',
    type: 'journal'
  },
  {
    id: 'lexpress',
    name: "L'Express de Madagascar",
    shortName: 'Express',
    logo: '/sources/express.png',
    color: '#be123c',
    url: 'https://lexpress.mg',
    type: 'journal'
  },
  {
    id: 'newsmada',
    name: 'News Mada',
    shortName: 'News',
    logo: '/sources/newsmada.png',
    color: '#ea580c',
    url: 'https://www.newsmada.com',
    type: 'web'
  },
  {
    id: 'matv',
    name: 'MA TV Madagascar',
    shortName: 'MA TV',
    logo: '/sources/matv.png',
    color: '#4f46e5',
    url: 'https://www.matv.mg',
    type: 'tv'
  },
  {
    id: 'rta',
    name: 'RTA Madagascar',
    shortName: 'RTA',
    logo: '/sources/rta.png',
    color: '#0d9488',
    url: 'https://www.rta.mg',
    type: 'tv'
  }
];

export const getSourceById = (id: string): NewsSource | undefined => {
  return newsSources.find(source => source.id === id);
};

export const getSourcesByType = (type: NewsSource['type']): NewsSource[] => {
  return newsSources.filter(source => source.type === type);
};
