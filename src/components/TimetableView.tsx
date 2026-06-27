import { useState, useCallback } from 'react'
import { Character, TimetableEvent } from '../types'
import { generateTimeSlots, isEventAtTime, timeToMinutes } from '../utils/time'

interface Props {
  characters: Character[]
  events: TimetableEvent[]
}

interface CellInfo {
  event: TimetableEvent
  character: Character
  isStart: boolean
  rowSpan: number
}

const SLOT_STEP = 10 // minutes per row

export default function TimetableView({ characters, events }: Props) {
  const [activeTime, setActiveTime] = useState<string | null>(null)

  // Compute overall time range from events
  const allTimes = events.flatMap(e => [e.startTime, e.endTime])
  const minTime = allTimes.length ? allTimes.reduce((a, b) => timeToMinutes(a) < timeToMinutes(b) ? a : b) : '15:00'
  const maxTime = allTimes.length ? allTimes.reduce((a, b) => timeToMinutes(a) > timeToMinutes(b) ? a : b) : '19:00'
  const slots = generateTimeSlots(minTime, maxTime)

  // Build a map: slot -> characterId -> CellInfo | 'continued' | null
  const cellMap = new Map<string, Map<string, CellInfo | 'continued'>>()
  for (const slot of slots) {
    const row = new Map<string, CellInfo | 'continued'>()
    for (const char of characters) {
      const event = events.find(
        e => e.characterId === char.id && isEventAtTime(e.startTime, e.endTime, slot)
      )
      if (event) {
        const isStart = event.startTime === slot
        if (isStart) {
          // compute rowspan
          const startMin = timeToMinutes(event.startTime)
          const endMin = timeToMinutes(event.endTime)
          const rowSpan = Math.ceil((endMin - startMin) / SLOT_STEP)
          row.set(char.id, { event, character: char, isStart: true, rowSpan })
        } else {
          row.set(char.id, 'continued')
        }
      } else {
        row.set(char.id, 'continued') // will render empty
      }
    }
    cellMap.set(slot, row)
  }

  const handleCellClick = useCallback((time: string) => {
    setActiveTime(prev => prev === time ? null : time)
  }, [])

  // Which slots have any active event
  const activeSlots = activeTime
    ? new Set(slots.filter(slot => {
        const row = cellMap.get(slot)
        if (!row) return false
        for (const cell of row.values()) {
          if (cell !== 'continued' && typeof cell === 'object') return true
        }
        return false
      }).filter(slot => {
        // find events active at activeTime and check if this slot is one of those events
        const activeEvents = events.filter(e => isEventAtTime(e.startTime, e.endTime, activeTime))
        return activeEvents.some(e => isEventAtTime(e.startTime, e.endTime, slot))
      }))
    : null

  const isSlotHighlighted = (slot: string) => !activeTime || (activeSlots?.has(slot) ?? false)

  return (
    <div className="overflow-x-auto">
      {activeTime && (
        <div className="mb-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center justify-between">
          <span>Showing all events active at <strong>{activeTime}</strong></span>
          <button
            onClick={() => setActiveTime(null)}
            className="text-blue-500 hover:text-blue-700 font-medium ml-4"
          >
            Clear ×
          </button>
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
                {char.role && (
                  <div className="text-gray-400 font-normal text-[10px] mt-0.5">{char.role}</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => {
            const row = cellMap.get(slot)!
            const highlighted = isSlotHighlighted(slot)
            const isActive = activeTime === slot

            return (
              <tr
                key={slot}
                className={highlighted ? '' : 'opacity-20'}
              >
                <td className="bg-gray-50 border border-gray-200 px-2 py-0.5 text-right text-gray-400 font-mono text-[10px] sticky left-0 z-10 whitespace-nowrap">
                  {slot}
                </td>
                {characters.map(char => {
                  const cell = row.get(char.id)
                  if (cell === 'continued') return null
                  if (!cell) {
                    return (
                      <td key={char.id} className="border border-gray-100 h-6" />
                    )
                  }
                  const { event, character, rowSpan } = cell
                  const isClickedEvent = activeTime ? isEventAtTime(event.startTime, event.endTime, activeTime) : false

                  return (
                    <td
                      key={char.id}
                      rowSpan={rowSpan}
                      onClick={() => handleCellClick(event.startTime)}
                      className="border border-white cursor-pointer transition-all duration-100 align-top p-1 leading-tight"
                      style={{
                        backgroundColor: character.color,
                        outline: isClickedEvent && activeTime ? `2px solid ${character.color}` : undefined,
                        outlineOffset: isClickedEvent && activeTime ? '-2px' : undefined,
                        filter: isClickedEvent && activeTime ? 'brightness(1.1)' : undefined,
                      }}
                    >
                      <span className="text-white text-[10px] font-medium drop-shadow-sm leading-snug block">
                        {event.label}
                      </span>
                      <span className="text-white/70 text-[9px] block mt-0.5">
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

      {!activeTime && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          Click any event to highlight all simultaneous events
        </p>
      )}
    </div>
  )
}
