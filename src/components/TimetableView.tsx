import { useState, useCallback } from 'react'
import { Character, TimetableEvent, Place, TimetableData } from '../types'
import { generateTimeSlots, isEventAtTime, timeToMinutes, minutesToTime } from '../utils/time'
import EventModal from './EventModal'

interface Props {
  characters: Character[]
  events: TimetableEvent[]
  places: Place[]
  isEditMode: boolean
  onChange: (data: Partial<TimetableData>) => void
}

interface CellInfo {
  event: TimetableEvent
  character: Character
  rowSpan: number
}

interface ModalState {
  character: Character
  event: TimetableEvent | null
  prefillStart: string
  prefillEnd: string
}

const SLOT_STEP = 10

export default function TimetableView({ characters, events, places, isEditMode, onChange }: Props) {
  const [activeTime, setActiveTime] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)

  const allTimes = events.flatMap(e => [e.startTime, e.endTime])
  const minTime = allTimes.length ? allTimes.reduce((a, b) => timeToMinutes(a) < timeToMinutes(b) ? a : b) : '15:00'
  const maxTime = allTimes.length ? allTimes.reduce((a, b) => timeToMinutes(a) > timeToMinutes(b) ? a : b) : '19:00'
  const slots = generateTimeSlots(minTime, maxTime)

  // Build cell map: slot -> characterId -> CellInfo | 'continued'
  const cellMap = new Map<string, Map<string, CellInfo | 'continued'>>()
  for (const slot of slots) {
    const row = new Map<string, CellInfo | 'continued'>()
    for (const char of characters) {
      const event = events.find(e => e.characterId === char.id && isEventAtTime(e.startTime, e.endTime, slot))
      if (event) {
        if (event.startTime === slot) {
          const rowSpan = Math.ceil((timeToMinutes(event.endTime) - timeToMinutes(event.startTime)) / SLOT_STEP)
          row.set(char.id, { event, character: char, rowSpan })
        } else {
          row.set(char.id, 'continued')
        }
      }
      // if nothing: cell is absent → render empty td
    }
    cellMap.set(slot, row)
  }

  // Highlight logic
  const activeEvents = activeTime ? events.filter(e => isEventAtTime(e.startTime, e.endTime, activeTime)) : []
  const highlightedEventIds = new Set(activeEvents.map(e => e.id))
  const highlightedSlots = activeTime
    ? new Set(slots.filter(slot => activeEvents.some(e => isEventAtTime(e.startTime, e.endTime, slot))))
    : null

  const isSlotHighlighted = (slot: string) => !activeTime || (highlightedSlots?.has(slot) ?? false)

  // Click on an existing event cell
  const handleEventClick = useCallback((e: React.MouseEvent, event: TimetableEvent, character: Character) => {
    if (isEditMode) {
      e.stopPropagation()
      setModal({ character, event, prefillStart: event.startTime, prefillEnd: event.endTime })
    } else {
      setActiveTime(prev => prev === event.startTime ? null : event.startTime)
    }
  }, [isEditMode])

  // Click on an empty cell
  const handleEmptyClick = useCallback((character: Character, slot: string) => {
    if (!isEditMode) return
    const prefillEnd = minutesToTime(timeToMinutes(slot) + 30)
    setModal({ character, event: null, prefillStart: slot, prefillEnd })
  }, [isEditMode])

  const handleSave = (event: TimetableEvent) => {
    const exists = events.find(e => e.id === event.id)
    const updated = exists
      ? events.map(e => e.id === event.id ? event : e)
      : [...events, event]
    onChange({ events: updated })
  }

  const handleDelete = (id: string) => {
    onChange({ events: events.filter(e => e.id !== id) })
  }

  const placeById = (id: string | null) => places.find(p => p.id === id)

  return (
    <div className="overflow-x-auto">
      {/* Highlight banner (view mode) */}
      {activeTime && !isEditMode && (
        <div className="mb-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center justify-between">
          <span>Showing all events active at <strong>{activeTime}</strong></span>
          <button onClick={() => setActiveTime(null)} className="text-blue-500 hover:text-blue-700 font-medium ml-4">
            Clear ×
          </button>
        </div>
      )}

      {/* Edit mode hint */}
      {isEditMode && (
        <div className="mb-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Click any event to edit it, or click an empty cell to create a new event.
        </div>
      )}

      <table className="border-collapse text-xs w-full min-w-max">
        <thead>
          <tr>
            <th className="bg-gray-100 border border-gray-200 px-2 py-2 text-gray-500 font-medium text-right w-14 sticky left-0 z-10">
              Zeit
            </th>
            {characters.map(char => (
              <th
                key={char.id}
                className="border border-gray-200 px-2 py-2 text-center font-medium text-gray-700 min-w-[80px] max-w-[110px]"
                style={{ borderTop: `3px solid ${char.color}` }}
              >
                <div className="font-semibold leading-tight">{char.name}</div>
                {char.role && <div className="text-gray-400 font-normal text-[10px] mt-0.5">{char.role}</div>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => {
            const row = cellMap.get(slot)!
            const highlighted = isSlotHighlighted(slot)

            return (
              <tr key={slot} className={highlighted ? '' : 'opacity-20'}>
                <td className="bg-gray-50 border border-gray-200 px-2 py-0.5 text-right text-gray-400 font-mono text-[10px] sticky left-0 z-10 whitespace-nowrap">
                  {slot}
                </td>
                {characters.map(char => {
                  const cell = row?.get(char.id)

                  // Continued (covered by a rowspan above) — skip rendering
                  if (cell === 'continued') return null

                  // Empty cell
                  if (!cell) {
                    return (
                      <td
                        key={char.id}
                        className={`border border-gray-100 h-6 ${isEditMode ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                        onClick={() => handleEmptyClick(char, slot)}
                      />
                    )
                  }

                  // Event cell
                  const { event, character, rowSpan } = cell
                  const isHighlighted = highlightedEventIds.has(event.id)
                  const place = placeById(event.placeId)

                  return (
                    <td
                      key={char.id}
                      rowSpan={rowSpan}
                      onClick={e => handleEventClick(e, event, character)}
                      className="border border-white cursor-pointer transition-all duration-100 align-top p-1 leading-tight"
                      style={{
                        backgroundColor: character.color,
                        filter: isHighlighted && activeTime ? 'brightness(1.1)' : undefined,
                        outline: isHighlighted && activeTime ? `2px solid ${character.color}` : undefined,
                        outlineOffset: '-2px',
                        opacity: isEditMode ? 0.9 : undefined,
                      }}
                    >
                      <span className="text-white text-[10px] font-medium drop-shadow-sm leading-snug block">
                        {event.label}
                      </span>
                      {place && (
                        <span className="text-white/70 text-[9px] block mt-0.5 leading-tight">
                          📍 {place.name}
                        </span>
                      )}
                      <span className="text-white/60 text-[9px] block mt-0.5">
                        {event.startTime}–{event.endTime}
                      </span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      {!activeTime && !isEditMode && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Click any event to highlight all simultaneous events
        </p>
      )}

      {modal && (
        <EventModal
          event={modal.event}
          character={modal.character}
          places={places}
          prefillStart={modal.prefillStart}
          prefillEnd={modal.prefillEnd}
          onSave={handleSave}
          onDelete={modal.event ? handleDelete : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
