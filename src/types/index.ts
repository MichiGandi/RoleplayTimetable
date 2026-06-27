export interface Character {
  id: string
  name: string
  role: string
  color: string
}

export interface TimetableEvent {
  id: string
  characterId: string
  startTime: string  // "HH:MM"
  endTime: string    // "HH:MM"
  label: string
}

export interface TimetableData {
  characters: Character[]
  events: TimetableEvent[]
}

export type View = 'timetable' | 'admin'
