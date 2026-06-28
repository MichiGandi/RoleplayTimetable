// Convert "HH:MM" to total minutes since midnight
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// Convert total minutes to "HH:MM"
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Generate time slots every 10 minutes, snapped to clean 10-minute boundaries
export function generateTimeSlots(startTime: string, endTime: string): string[] {
  const start = Math.floor(timeToMinutes(startTime) / 10) * 10
  const end = Math.ceil(timeToMinutes(endTime) / 10) * 10
  const slots: string[] = []
  for (let t = start; t <= end; t += 10) {
    slots.push(minutesToTime(t))
  }
  return slots
}

// Check if an event is active at a given time slot
export function isEventAtTime(eventStart: string, eventEnd: string, slot: string): boolean {
  const s = timeToMinutes(eventStart)
  const e = timeToMinutes(eventEnd)
  const t = timeToMinutes(slot)
  return t >= s && t < e
}

// Generate a random pleasant color
export function randomColor(): string {
  const colors = [
    '#4CAF50', '#2196F3', '#9C27B0', '#FF5722', '#00BCD4',
    '#FF9800', '#E91E63', '#3F51B5', '#009688', '#8BC34A',
    '#F44336', '#795548', '#607D8B', '#673AB7',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}
