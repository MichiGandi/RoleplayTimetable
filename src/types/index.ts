export interface Character {
  id: string
  name: string
  role: string
  color: string
}

export interface Place {
  id: string
  name: string
}

export interface TimetableEvent {
  id: string
  characterId: string
  placeId: string | null
  startTime: string  // "HH:MM"
  endTime: string    // "HH:MM"
  label: string
}

export interface TimetableData {
  characters: Character[]
  places: Place[]
  events: TimetableEvent[]
}

export type View = 'timetable' | 'admin'
