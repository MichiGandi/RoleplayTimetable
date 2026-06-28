import { TimetableData } from '../types'

export const defaultData: TimetableData = {
  characters: [
    { id: 'c1',  name: 'Mr. Flowers',     role: 'Rezeptionist',       color: '#4CAF50' },
    { id: 'c2',  name: 'Page',            role: '',                   color: '#FF9800' },
    { id: 'c3',  name: 'Leonard/Leopold', role: '',                   color: '#9C27B0' },
    { id: 'c4',  name: 'Die Mönche',      role: '',                   color: '#F44336' },
    { id: 'c5',  name: 'Db Makula',       role: 'Wiss. Mitarb.',      color: '#2196F3' },
    { id: 'c6',  name: 'Prof. Quand',     role: 'Wiss. Lab.',         color: '#00BCD4' },
    { id: 'c7',  name: 'Adler',           role: 'Wissenschaftl.',     color: '#FF5722' },
    { id: 'c8',  name: 'Falke',           role: 'Seilakr.',           color: '#8BC34A' },
    { id: 'c9',  name: 'Stasi & Eher',    role: 'Zahnärztin',        color: '#E91E63' },
    { id: 'c10', name: 'Marina Ohlsson',  role: 'Hotel Rezidentin',   color: '#FF9800' },
    { id: 'c11', name: 'Henry & Penny',   role: 'Woodward',           color: '#3F51B5' },
    { id: 'c12', name: 'Ellen Korte',     role: 'Tucker',             color: '#009688' },
    { id: 'c13', name: 'Dogtie McCarthy', role: 'Baltimore/Mary',     color: '#4CAF50' },
  ],
  places: [
    { id: 'p1',  name: 'Hotel Lobby' },
    { id: 'p2',  name: 'Reception' },
    { id: 'p3',  name: 'Restaurant' },
    { id: 'p4',  name: 'Dorf' },
    { id: 'p5',  name: 'Bar im Dorf' },
    { id: 'p6',  name: 'Büro von Prof. Quand' },
    { id: 'p7',  name: 'Zimmer' },
    { id: 'p8',  name: 'Labor' },
    { id: 'p9',  name: 'Berge' },
    { id: 'p10', name: 'Café' },
  ],
  events: [
    // Mr. Flowers (c1)
    { id: 'e1',  characterId: 'c1',  placeId: 'p2',  startTime: '15:15', endTime: '16:50', label: 'Ankunft / Empfang' },
    { id: 'e2',  characterId: 'c1',  placeId: 'p2',  startTime: '16:50', endTime: '17:40', label: 'Reception' },
    { id: 'e3',  characterId: 'c1',  placeId: 'p5',  startTime: '17:40', endTime: '18:30', label: 'Geht in eine Bar im Dorf' },
    // Page (c2)
    { id: 'e4',  characterId: 'c2',  placeId: 'p2',  startTime: '15:20', endTime: '15:30', label: 'Gepäck-annahme' },
    { id: 'e5',  characterId: 'c2',  placeId: 'p7',  startTime: '15:50', endTime: '16:30', label: 'Wäsche waschen' },
    { id: 'e6',  characterId: 'c2',  placeId: 'p7',  startTime: '16:30', endTime: '16:50', label: 'Kaffee kochen' },
    { id: 'e7',  characterId: 'c2',  placeId: 'p2',  startTime: '16:50', endTime: '17:30', label: 'Kaffee kochen / Sucht nach Page' },
    { id: 'e8',  characterId: 'c2',  placeId: null,  startTime: '17:50', endTime: '18:30', label: 'Patrouille' },
    // Leonard/Leopold (c3)
    { id: 'e9',  characterId: 'c3',  placeId: 'p3',  startTime: '15:20', endTime: '15:50', label: 'Mittagessen' },
    { id: 'e10', characterId: 'c3',  placeId: 'p7',  startTime: '16:10', endTime: '16:30', label: 'Bei den Zimmermädchen' },
    { id: 'e11', characterId: 'c3',  placeId: null,  startTime: '16:40', endTime: '17:10', label: 'Leonard' },
    { id: 'e12', characterId: 'c3',  placeId: 'p5',  startTime: '17:50', endTime: '18:30', label: 'Geht in eine Bar im Dorf' },
    // Die Mönche (c4)
    { id: 'e13', characterId: 'c4',  placeId: 'p3',  startTime: '15:30', endTime: '15:50', label: 'Mittagessen' },
    { id: 'e14', characterId: 'c4',  placeId: 'p2',  startTime: '15:50', endTime: '16:10', label: 'Reception' },
    { id: 'e15', characterId: 'c4',  placeId: null,  startTime: '16:10', endTime: '16:50', label: 'Patrouille' },
    { id: 'e16', characterId: 'c4',  placeId: null,  startTime: '16:50', endTime: '17:10', label: 'Leopold' },
    { id: 'e17', characterId: 'c4',  placeId: null,  startTime: '17:10', endTime: '17:50', label: 'Patrouille' },
    { id: 'e18', characterId: 'c4',  placeId: 'p6',  startTime: '18:00', endTime: '18:30', label: 'Bespricht Phönix vor' },
    // Db Makula (c5)
    { id: 'e19', characterId: 'c5',  placeId: 'p3',  startTime: '15:15', endTime: '15:30', label: 'Mittagessen' },
    { id: 'e20', characterId: 'c5',  placeId: 'p7',  startTime: '15:30', endTime: '15:40', label: 'Hat Essen (Bm)' },
    { id: 'e21', characterId: 'c5',  placeId: null,  startTime: '16:10', endTime: '17:00', label: 'Meeting' },
    { id: 'e22', characterId: 'c5',  placeId: null,  startTime: '17:20', endTime: '17:40', label: 'Meeting' },
    { id: 'e23', characterId: 'c5',  placeId: 'p8',  startTime: '17:50', endTime: '18:30', label: 'Überwacht Experiment' },
    // Prof. Quand (c6)
    { id: 'e24', characterId: 'c6',  placeId: 'p7',  startTime: '16:00', endTime: '16:30', label: 'Auf Ihrem Zimmer' },
    { id: 'e25', characterId: 'c6',  placeId: 'p6',  startTime: '16:30', endTime: '17:00', label: 'Bespricht Phönix vor' },
    { id: 'e26', characterId: 'c6',  placeId: 'p1',  startTime: '17:10', endTime: '17:30', label: 'Wartet in der Lobby' },
    { id: 'e27', characterId: 'c6',  placeId: 'p6',  startTime: '17:30', endTime: '18:10', label: 'Bespricht Phönix vor' },
    // Adler (c7)
    { id: 'e28', characterId: 'c7',  placeId: 'p8',  startTime: '15:30', endTime: '17:00', label: 'Experiment Aufbau' },
    { id: 'e29', characterId: 'c7',  placeId: 'p8',  startTime: '17:00', endTime: '17:10', label: 'Überwacht Experiment Aufbau' },
    { id: 'e30', characterId: 'c7',  placeId: 'p8',  startTime: '17:10', endTime: '17:50', label: 'Überwacht Experiment Aufbau' },
    { id: 'e31', characterId: 'c7',  placeId: 'p8',  startTime: '17:50', endTime: '18:10', label: 'Überwacht Experiment' },
    { id: 'e32', characterId: 'c7',  placeId: 'p8',  startTime: '18:10', endTime: '18:30', label: 'Überwacht Experiment' },
    // Falke (c8)
    { id: 'e33', characterId: 'c8',  placeId: 'p3',  startTime: '15:15', endTime: '15:20', label: 'Mittagessen' },
    { id: 'e34', characterId: 'c8',  placeId: 'p1',  startTime: '15:50', endTime: '16:10', label: 'Gespräch mit Leonard/Leopold' },
    { id: 'e35', characterId: 'c8',  placeId: null,  startTime: '16:10', endTime: '16:30', label: 'Meeting' },
    // Stasi & Eher (c9)
    { id: 'e36', characterId: 'c9',  placeId: 'p7',  startTime: '16:00', endTime: '16:20', label: 'Kaffee kochen' },
    { id: 'e37', characterId: 'c9',  placeId: null,  startTime: '16:20', endTime: '16:40', label: 'Überwacht & wird gesucht' },
    { id: 'e38', characterId: 'c9',  placeId: 'p1',  startTime: '16:40', endTime: '17:00', label: 'Liest Magazin (Lobby)' },
    { id: 'e39', characterId: 'c9',  placeId: 'p7',  startTime: '17:50', endTime: '18:10', label: 'Arbeitszimmer' },
    // Marina Ohlsson (c10)
    { id: 'e40', characterId: 'c10', placeId: 'p3',  startTime: '15:50', endTime: '16:00', label: 'Mittagessen' },
    { id: 'e41', characterId: 'c10', placeId: 'p4',  startTime: '17:10', endTime: '17:30', label: 'Einkaufen (Dorf)' },
    { id: 'e42', characterId: 'c10', placeId: null,  startTime: '18:10', endTime: '18:30', label: 'Liest Magazin' },
    // Henry & Penny (c11)
    { id: 'e43', characterId: 'c11', placeId: 'p3',  startTime: '15:15', endTime: '15:20', label: 'Mittagessen' },
    { id: 'e44', characterId: 'c11', placeId: 'p4',  startTime: '16:00', endTime: '16:30', label: 'Einkaufen (Dorf)' },
    { id: 'e45', characterId: 'c11', placeId: 'p1',  startTime: '16:30', endTime: '17:10', label: 'Karten Lesen (Lobby)' },
    { id: 'e46', characterId: 'c11', placeId: 'p9',  startTime: '17:10', endTime: '17:30', label: 'Wandern in den Bergen' },
    { id: 'e47', characterId: 'c11', placeId: 'p10', startTime: '17:30', endTime: '17:50', label: 'Im Café mit den Eltern' },
    // Ellen Korte (c12)
    { id: 'e48', characterId: 'c12', placeId: 'p4',  startTime: '16:10', endTime: '16:30', label: 'Stadt erkunden' },
    { id: 'e49', characterId: 'c12', placeId: 'p5',  startTime: '17:50', endTime: '18:10', label: 'Date (Pub)' },
    // Dogtie McCarthy (c13)
    { id: 'e50', characterId: 'c13', placeId: 'p3',  startTime: '15:15', endTime: '15:20', label: 'Mittagessen' },
    { id: 'e51', characterId: 'c13', placeId: 'p4',  startTime: '16:10', endTime: '16:40', label: 'Stadt erkunden' },
    { id: 'e52', characterId: 'c13', placeId: null,  startTime: '17:40', endTime: '17:50', label: 'Trifft und begleitet Marina' },
    { id: 'e53', characterId: 'c13', placeId: 'p5',  startTime: '18:00', endTime: '18:30', label: 'Essen in der Bar' },
  ],
}
