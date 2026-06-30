import { useState, useEffect } from 'react'
import { TimetableEvent, Character, Place } from '../types'
import { generateId, timeToMinutes, minutesToTime } from '../utils/time'

interface Props {
  event: TimetableEvent | null        // null = create new
  character: Character
  places: Place[]
  allEvents: TimetableEvent[]         // all events for overlap detection
  prefillStart?: string
  prefillEnd?: string
  onSave: (event: TimetableEvent) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

const SLOT_STEP = 10

function hasOverlap(
  start: string,
  end: string,
  characterId: string,
  allEvents: TimetableEvent[],
  excludeId?: string
): TimetableEvent | null {
  const s = timeToMinutes(start)
  const e = timeToMinutes(end)
  if (e <= s) return null
  return allEvents.find(ev => {
    if (ev.characterId !== characterId) return false
    if (ev.id === excludeId) return false
    const es = timeToMinutes(ev.startTime)
    const ee = timeToMinutes(ev.endTime)
    return s < ee && e > es
  }) ?? null
}

export default function EventModal({
  event,
  character,
  places,
  allEvents,
  prefillStart = '15:00',
  prefillEnd,
  onSave,
  onDelete,
  onClose,
}: Props) {
  // Default end = start + 1 slot (10 min)
  const defaultEnd = prefillEnd ?? minutesToTime(timeToMinutes(prefillStart) + SLOT_STEP)

  const [label, setLabel] = useState(event?.label ?? '')
  const [startTime, setStartTime] = useState(event?.startTime ?? prefillStart)
  const [endTime, setEndTime] = useState(event?.endTime ?? defaultEnd)
  const [placeIds, setPlaceIds] = useState<string[]>(event?.placeIds ?? [])

  // Recompute overlap whenever times change
  const overlap = hasOverlap(startTime, endTime, character.id, allEvents, event?.id)
  const endBeforeStart = timeToMinutes(endTime) <= timeToMinutes(startTime)
  const canSave = !endBeforeStart

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const togglePlace = (id: string) => {
    setPlaceIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const handleSave = () => {
    if (!canSave) return
    onSave({
      id: event?.id ?? generateId(),
      characterId: character.id,
      placeIds,
      startTime,
      endTime,
      label: label.trim(),
    })
    onClose()
  }

  const handleDelete = () => {
    if (event && onDelete) {
      if (confirm('Delete this event?')) {
        onDelete(event.id)
        onClose()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{character.name}</p>
            {character.role && <p className="text-xs text-gray-400">{character.role}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1" aria-label="Close">×</button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Activity</label>
            <input
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              placeholder="What are they doing?"
              value={label}
              onChange={e => setLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Start</label>
              <input
                type="time"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  endBeforeStart ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                }`}
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">End</label>
              <input
                type="time"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                  endBeforeStart ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-blue-400'
                }`}
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Warnings */}
          {endBeforeStart && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              <span>⚠️</span>
              <span>End time must be after start time.</span>
            </div>
          )}
          {!endBeforeStart && overlap && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <span>⚠️</span>
              <span>Overlaps with <strong>{overlap.label}</strong> ({overlap.startTime}–{overlap.endTime})</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Places</label>
            {places.length === 0 ? (
              <p className="text-xs text-gray-400">No places defined yet — add some in Settings.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {places.map(p => {
                  const selected = placeIds.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlace(p.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                      style={{
                        backgroundColor: selected ? p.color : 'transparent',
                        borderColor: p.color,
                        color: selected ? 'white' : p.color,
                      }}
                    >
                      {p.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2">
          {event && onDelete && (
            <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {event ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
