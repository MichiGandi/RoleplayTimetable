import { useState, useCallback, useRef, useEffect } from 'react'
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

interface ModalState {
  character: Character
  event: TimetableEvent | null
  prefillStart: string
  prefillEnd: string
}

interface DragState {
  character: Character
  startSlot: string
  currentSlot: string
}

const SLOT_STEP = 5
const ROW_H = 14 // px per 5-min slot row

function getDragRange(d: DragState) {
  const a = timeToMinutes(d.startSlot)
  const b = timeToMinutes(d.currentSlot)
  return {
    start: minutesToTime(Math.min(a, b)),
    end: minutesToTime(Math.max(a, b) + SLOT_STEP),
  }
}

// Clamp proposed currentSlot so drag never overlaps an existing event
function clampDragSlot(
  startSlot: string,
  proposedSlot: string,
  charEvents: TimetableEvent[]
): string {
  const startMin = timeToMinutes(startSlot)
  const proposedMin = timeToMinutes(proposedSlot)
  const draggingDown = proposedMin >= startMin

  if (draggingDown) {
    const obstacle = charEvents
      .filter(e => timeToMinutes(e.startTime) > startMin)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))[0]
    if (obstacle) {
      const limit = timeToMinutes(obstacle.startTime) - SLOT_STEP
      return minutesToTime(Math.min(proposedMin, limit))
    }
  } else {
    const obstacle = charEvents
      .filter(e => timeToMinutes(e.endTime) <= startMin)
      .sort((a, b) => timeToMinutes(b.endTime) - timeToMinutes(a.endTime))[0]
    if (obstacle) {
      const limit = timeToMinutes(obstacle.endTime)
      return minutesToTime(Math.max(proposedMin, limit))
    }
  }
  return proposedSlot
}

export default function TimetableView({ characters, events, places, isEditMode, onChange }: Props) {
  const [activePlace, setActivePlace] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const dragRef = useRef<DragState | null>(null)

  const allTimes = events.flatMap(e => [e.startTime, e.endTime])
  const minTime = allTimes.length ? allTimes.reduce((a, b) => timeToMinutes(a) < timeToMinutes(b) ? a : b) : '15:00'
  const maxTime = allTimes.length ? allTimes.reduce((a, b) => timeToMinutes(a) > timeToMinutes(b) ? a : b) : '19:00'
  const slots = generateTimeSlots(minTime, maxTime)

  // View mode highlight — by place
  const highlightedEventIds = activePlace
    ? new Set(events.filter(e => e.placeId === activePlace).map(e => e.id))
    : new Set<string>()
  const isEventHighlighted = (event: TimetableEvent) =>
    !activePlace || highlightedEventIds.has(event.id)

  const isInDrag = (charId: string, slot: string): boolean => {
    if (!drag || drag.character.id !== charId) return false
    const { start, end } = getDragRange(drag)
    const t = timeToMinutes(slot)
    return t >= timeToMinutes(start) && t < timeToMinutes(end)
  }

  // Global mouseup
  useEffect(() => {
    if (!isEditMode) return
    const handleGlobalMouseUp = () => {
      const d = dragRef.current
      if (!d) return
      const isRealDrag = d.startSlot !== d.currentSlot
      const { start, end } = getDragRange(d)
      dragRef.current = null
      setDrag(null)
      setModal({
        character: d.character,
        event: null,
        prefillStart: isRealDrag ? start : d.startSlot,
        prefillEnd: isRealDrag ? end : minutesToTime(timeToMinutes(d.startSlot) + SLOT_STEP),
      })
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [isEditMode])

  const handleCellMouseDown = useCallback((char: Character, slot: string) => {
    if (!isEditMode) return
    const state = { character: char, startSlot: slot, currentSlot: slot }
    dragRef.current = state
    setDrag(state)
  }, [isEditMode])

  const handleCellMouseEnter = useCallback((char: Character, slot: string) => {
    const d = dragRef.current
    if (!d || d.character.id !== char.id) return
    const charEvents = events.filter(e => e.characterId === char.id)
    const clamped = clampDragSlot(d.startSlot, slot, charEvents)
    const updated = { ...d, currentSlot: clamped }
    dragRef.current = updated
    setDrag(updated)
  }, [events])

  const handleEventClick = useCallback((e: React.MouseEvent, event: TimetableEvent, character: Character) => {
    if (isEditMode) {
      e.stopPropagation()
      setModal({ character, event, prefillStart: event.startTime, prefillEnd: event.endTime })
    }
  }, [isEditMode])

  const handleSave = (event: TimetableEvent) => {
    const exists = events.find(e => e.id === event.id)
    const updated = exists ? events.map(e => e.id === event.id ? event : e) : [...events, event]
    onChange({ events: updated })
  }

  const handleDelete = (id: string) => {
    onChange({ events: events.filter(e => e.id !== id) })
  }

  const placeById = (id: string | null) => places.find(p => p.id === id)
  const eventColor = (event: TimetableEvent) => {
    const place = placeById(event.placeId)
    return place?.color ?? '#9E9E9E'
  }

  const totalHeight = slots.length * ROW_H

  return (
    <div className="overflow-x-auto">
      {!isEditMode && places.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 mr-1">Filter by place:</span>
          {places.map(place => (
            <button
              key={place.id}
              onClick={() => setActivePlace(prev => prev === place.id ? null : place.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all"
              style={{
                backgroundColor: activePlace === place.id ? place.color : 'transparent',
                borderColor: place.color,
                color: activePlace === place.id ? 'white' : place.color,
              }}
            >
              {place.name}
            </button>
          ))}
          {activePlace && (
            <button
              onClick={() => setActivePlace(null)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
            >
              Clear ×
            </button>
          )}
        </div>
      )}
      {isEditMode && (
        <div className="mb-3 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Click an event to edit · Drag over empty cells to create a new event
        </div>
      )}

      {/* Layout: fixed time column on the left, then one column per character */}
      <div className="flex select-none">

        {/* Time column */}
        <div className="flex-shrink-0 w-14 border-r border-gray-200">
          {/* Header */}
          <div className="h-14 bg-gray-100 border-b border-gray-200 flex items-center justify-end pr-2">
            <span className="text-[10px] text-gray-500 font-medium">Zeit</span>
          </div>
          {/* Slots */}
          {slots.map(slot => (
            <div
              key={slot}
              className="border-b border-gray-100 flex items-center justify-end pr-2 transition-opacity"
              style={{ height: ROW_H, borderBottomColor: parseInt(slot.split(':')[1]) % 10 === 0 ? '#e5e7eb' : '#f3f4f6' }}
            >
              {parseInt(slot.split(':')[1]) % 10 === 0 && (
                <span className="text-[9px] font-mono text-gray-400">{slot}</span>
              )}
            </div>
          ))}
        </div>

        {/* Character columns */}
        {characters.map(char => {
          // Events for this character, sorted by start
          const charEvents = events
            .filter(e => e.characterId === char.id)
            .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

          return (
            <div
              key={char.id}
              className="flex-shrink-0 border-r border-gray-200"
              style={{ width: 60 }}
            >
              {/* Header */}
              <div
                className="h-14 border-b border-gray-200 flex flex-col items-center justify-center px-0.5 text-center overflow-hidden"
                style={{ borderTop: '3px solid #e5e7eb' }}
              >
                <span className="text-[11px] font-semibold text-gray-800 leading-tight">{char.name}</span>
                {char.role && <span className="text-[10px] text-gray-400 mt-0.5">{char.role}</span>}
              </div>

              {/* Body — relative container, slots as background grid, events absolutely placed */}
              <div className="relative" style={{ height: totalHeight }}>

                {/* Background grid — one div per slot for hover/drag */}
                {slots.map((slot, slotIdx) => {
                  const inDrag = isInDrag(char.id, slot)
                  // Is this slot occupied by an event?
                  const occupied = events.some(e => e.characterId === char.id && isEventAtTime(e.startTime, e.endTime, slot))

                  return (
                    <div
                      key={slot}
                      className={`absolute left-0 right-0 border-b transition-colors ${
                        isEditMode && !occupied ? 'cursor-ns-resize' : ''
                      }`}
                      style={{
                        top: slotIdx * ROW_H,
                        height: ROW_H,
                        borderColor: parseInt(slot.split(':')[1]) % 10 === 0 ? '#e5e7eb' : '#f3f4f6',
                        backgroundColor: inDrag ? '#9E9E9E35' : undefined,
                        borderBottomColor: inDrag ? '#9E9E9E' : undefined,
                        zIndex: 0,
                      }}
                      onMouseDown={() => !occupied && handleCellMouseDown(char, slot)}
                      onMouseEnter={() => !occupied && handleCellMouseEnter(char, slot)}
                    />
                  )
                })}

                {/* Event blocks — absolutely positioned */}
                {charEvents.map(event => {
                  const startMin = timeToMinutes(event.startTime)
                  const endMin = timeToMinutes(event.endTime)
                  const gridStart = timeToMinutes(slots[0])
                  const topPx = (startMin - gridStart) / SLOT_STEP * ROW_H
                  const heightPx = (endMin - startMin) / SLOT_STEP * ROW_H



                  return (
                    <div
                      key={event.id}
                      onClick={e => handleEventClick(e, event, char)}
                      className="absolute left-0 right-0 cursor-pointer overflow-hidden flex items-center justify-center"
                      style={{
                        top: topPx + 1,
                        height: heightPx - 2,
                        backgroundColor: eventColor(event),
                        opacity: isEditMode ? 0.9 : (!activePlace || isEventHighlighted(event) ? 1 : 0.15),
                        zIndex: 10,
                        outline: activePlace && isEventHighlighted(event) ? `2px solid ${eventColor(event)}` : undefined,
                        outlineOffset: '-2px',
                        filter: activePlace && isEventHighlighted(event) ? 'brightness(1.1)' : undefined,
                      }}
                    >
                      <span
                        className="text-white font-medium drop-shadow-sm block whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{
                          fontSize: 10,
                          writingMode: 'vertical-rl',
                          textOrientation: 'mixed',
                          transform: 'rotate(180deg)',
                          maxHeight: heightPx - 4,
                        }}
                      >
                        {event.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>



      {modal && (
        <EventModal
          event={modal.event}
          character={modal.character}
          places={places}
          prefillStart={modal.prefillStart}
          prefillEnd={modal.prefillEnd}
          allEvents={events}
          onSave={handleSave}
          onDelete={modal.event ? handleDelete : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
