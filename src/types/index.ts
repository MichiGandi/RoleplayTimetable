export interface Character {
  id: string
  name: string
  role: string
}

export interface Place {
  id: string
  name: string
  color: string
}

export interface TimetableEvent {
  id: string
  characterId: string
  placeIds: string[]
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
