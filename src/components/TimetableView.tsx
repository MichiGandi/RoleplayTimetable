import { useState, useCallback, useRef, useEffect } from 'react'
import { Character, TimetableEvent, Place, TimetableData } from '../types'
import { generateTimeSlots, isEventAtTime, timeToMinutes, minutesToTime } from '../utils/time'
import EventModal from './EventModal'

interface Props {
  characters: Character[]
  events: TimetableEvent[]
  places: Place[]
  isEditMode: boolean
  colWidth: number
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

export default function TimetableView({ characters, events, places, isEditMode, colWidth, onChange }: Props) {
  const [activePlace, setActivePlace] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const [timeLineY, setTimeLineY] = useState<number>(0)
  const timeLineDragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRowRef = useRef<HTMLDivElement>(null)

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

  const handleTimeLineMouseDown = (e: React.MouseEvent) => {
    if (isEditMode) return
    e.preventDefault()
    timeLineDragging.current = true

    const moveHandler = (ev: MouseEvent) => {
      if (!timeLineDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const raw = ev.clientY - rect.top
      const rowIndex = Math.floor((raw + ROW_H / 2) / ROW_H)
      setTimeLineY(Math.max(0, Math.min(rowIndex, slots.length - 1)))
    }
    const upHandler = () => {
      timeLineDragging.current = false
      window.removeEventListener('mousemove', moveHandler)
      window.removeEventListener('mouseup', upHandler)
    }
    window.addEventListener('mousemove', moveHandler)
    window.addEventListener('mouseup', upHandler)
  }

  const placeById = (id: string | null) => places.find(p => p.id === id)
  const eventColor = (event: TimetableEvent) => {
    const place = placeById(event.placeId)
    return place?.color ?? '#9E9E9E'
  }

  const totalHeight = slots.length * ROW_H

  return (
    <div className="flex flex-col h-full min-h-0">
      {!isEditMode && places.length > 0 && (
        <div className="mb-3 mx-4 mt-2 flex flex-wrap gap-2 items-center flex-shrink-0">
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
        <div className="mb-3 mx-4 mt-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex-shrink-0">
          Click an event to edit · Drag over empty cells to create a new event
        </div>
      )}

      {/* Scroll container — fills remaining height, only this scrolls. Header stays put via CSS sticky. */}
      <div className="overflow-auto flex-1 min-h-0">

        {/* Sticky header */}
        <div className="flex select-none bg-white border-b border-gray-200 sticky top-0 z-20">
          <div ref={headerRowRef} className="flex-shrink-0 w-14 border-r border-gray-200 bg-gray-100 flex items-center justify-end pr-2" style={{ minHeight: 56 }}>
            <span className="text-[10px] text-gray-500 font-medium">Zeit</span>
          </div>
          {characters.map(char => (
            <div
              key={char.id}
              className="flex-shrink-0 border-r border-gray-200 flex flex-col items-center justify-center px-0.5 text-center overflow-hidden bg-white"
              style={{ width: colWidth, minHeight: 56, borderTop: '3px solid #e5e7eb' }}
            >
              <span className="text-[11px] font-semibold text-gray-800 leading-tight">{char.name}</span>
              {char.role && <span className="text-[10px] text-gray-400 mt-0.5">{char.role}</span>}
            </div>
          ))}
        </div>

      {/* Scrollable body */}
      <div ref={containerRef} className="relative">
        <div className="flex select-none">

          {/* Time column body */}
          <div className="flex-shrink-0 w-14 border-r border-gray-200 relative">
            {slots.map(slot => (
              <div
                key={slot}
                style={{ height: ROW_H, borderBottom: `1px solid ${parseInt(slot.split(':')[1]) % 10 === 0 ? '#f3f4f6' : '#e5e7eb'}` }}
              />
            ))}
            {/* Time labels on 10-min borders */}
            {slots.map((slot, i) => parseInt(slot.split(':')[1]) % 10 === 0 && (
              <div
                key={slot + '-label'}
                className="absolute right-2 pointer-events-none flex items-center justify-end"
                style={{ top: i * ROW_H + 4, height: 0 }}
              >
                <span
                  className="text-[9px] font-mono text-gray-400 bg-white px-0.5"
                  style={{ lineHeight: 1, transform: 'translateY(-50%)' }}
                >
                  {slot}
                </span>
              </div>
            ))}
          </div>

          {/* Character columns */}
          {characters.map(char => {
            const charEvents = events
              .filter(e => e.characterId === char.id)
              .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

            return (
              <div
                key={char.id}
                className="flex-shrink-0 border-r border-gray-200"
                style={{ width: colWidth }}
              >
                <div className="relative" style={{ height: totalHeight }}>
                  {slots.map((slot, slotIdx) => {
                    const inDrag = isInDrag(char.id, slot)
                    const occupied = events.some(e => e.characterId === char.id && isEventAtTime(e.startTime, e.endTime, slot))
                    return (
                      <div
                        key={slot}
                        className={`absolute left-0 right-0 border-b transition-colors ${isEditMode && !occupied ? 'cursor-ns-resize' : ''}`}
                        style={{
                          top: slotIdx * ROW_H,
                          height: ROW_H,
                          borderColor: parseInt(slot.split(':')[1]) % 10 === 0 ? '#f3f4f6' : '#e5e7eb',
                          backgroundColor: inDrag ? '#9E9E9E35' : undefined,
                          borderBottomColor: inDrag ? '#9E9E9E' : undefined,
                          zIndex: 0,
                        }}
                        onMouseDown={() => !occupied && handleCellMouseDown(char, slot)}
                        onMouseEnter={() => !occupied && handleCellMouseEnter(char, slot)}
                      />
                    )
                  })}
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

        {/* Draggable time line — view mode only */}
        {!isEditMode && (
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{ top: timeLineY * ROW_H - 1, zIndex: 15 }}
          >
            <div className="absolute left-0 right-0 h-0.5 bg-red-500 opacity-80" />
            <div
              className="absolute pointer-events-auto cursor-ns-resize select-none bg-red-500 opacity-80 hover:opacity-100 transition-opacity rounded-full"
              style={{ left: -8, top: -5, width: 16, height: 10 }}
              onMouseDown={handleTimeLineMouseDown}
            />
          </div>
        )}
      </div>
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
