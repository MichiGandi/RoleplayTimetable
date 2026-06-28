import { useState, useEffect } from 'react'
import { TimetableEvent, Character, Place } from '../types'
import { generateId } from '../utils/time'

interface Props {
  event: TimetableEvent | null        // null = create new
  character: Character
  places: Place[]
  prefillStart?: string
  prefillEnd?: string
  onSave: (event: TimetableEvent) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

export default function EventModal({
  event,
  character,
  places,
  prefillStart = '15:00',
  prefillEnd = '15:30',
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [label, setLabel] = useState(event?.label ?? '')
  const [startTime, setStartTime] = useState(event?.startTime ?? prefillStart)
  const [endTime, setEndTime] = useState(event?.endTime ?? prefillEnd)
  const [placeId, setPlaceId] = useState<string>(event?.placeId ?? '')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSave = () => {
    if (!label.trim()) return
    onSave({
      id: event?.id ?? generateId(),
      characterId: character.id,
      placeId: placeId || null,
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
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: character.color }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{character.name}</p>
            {character.role && (
              <p className="text-xs text-gray-400">{character.role}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
            aria-label="Close"
          >
            ×
          </button>
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">End</label>
              <input
                type="time"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Place</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              value={placeId}
              onChange={e => setPlaceId(e.target.value)}
            >
              <option value="">— no place —</option>
              {places.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2">
          {event && onDelete && (
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {event ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
