import { useState } from 'react'
import { Character, TimetableEvent, TimetableData } from '../types'
import { generateId, randomColor } from '../utils/time'
import { defaultData } from '../utils/defaultData'

interface Props {
  data: TimetableData
  onChange: (data: TimetableData) => void
}

type AdminTab = 'characters' | 'events'

export default function AdminView({ data, onChange }: Props) {
  const [tab, setTab] = useState<AdminTab>('characters')
  const [editingChar, setEditingChar] = useState<Character | null>(null)
  const [editingEvent, setEditingEvent] = useState<TimetableEvent | null>(null)
  const [newChar, setNewChar] = useState<Omit<Character, 'id'>>({ name: '', role: '', color: randomColor() })
  const [newEvent, setNewEvent] = useState<Omit<TimetableEvent, 'id'>>({
    characterId: data.characters[0]?.id ?? '',
    startTime: '15:00',
    endTime: '16:00',
    label: '',
  })

  // --- Characters ---
  const addCharacter = () => {
    if (!newChar.name.trim()) return
    const char: Character = { ...newChar, id: generateId() }
    onChange({ ...data, characters: [...data.characters, char] })
    setNewChar({ name: '', role: '', color: randomColor() })
  }

  const saveCharacter = (char: Character) => {
    onChange({ ...data, characters: data.characters.map(c => c.id === char.id ? char : c) })
    setEditingChar(null)
  }

  const deleteCharacter = (id: string) => {
    if (!confirm('Delete this character and all their events?')) return
    onChange({
      characters: data.characters.filter(c => c.id !== id),
      events: data.events.filter(e => e.characterId !== id),
    })
  }

  // --- Events ---
  const addEvent = () => {
    if (!newEvent.label.trim() || !newEvent.characterId) return
    const event: TimetableEvent = { ...newEvent, id: generateId() }
    onChange({ ...data, events: [...data.events, event] })
    setNewEvent({ characterId: data.characters[0]?.id ?? '', startTime: '15:00', endTime: '16:00', label: '' })
  }

  const saveEvent = (event: TimetableEvent) => {
    onChange({ ...data, events: data.events.map(e => e.id === event.id ? event : e) })
    setEditingEvent(null)
  }

  const deleteEvent = (id: string) => {
    if (!confirm('Delete this event?')) return
    onChange({ ...data, events: data.events.filter(e => e.id !== id) })
  }

  const resetToDefault = () => {
    if (!confirm('Reset everything to the default timetable data? This cannot be undone.')) return
    onChange(defaultData)
  }

  const charById = (id: string) => data.characters.find(c => c.id === id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('characters')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'characters' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Characters ({data.characters.length})
        </button>
        <button
          onClick={() => setTab('events')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'events' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Events ({data.events.length})
        </button>
        <button
          onClick={resetToDefault}
          className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          Reset to default
        </button>
      </div>

      {tab === 'characters' && (
        <div className="space-y-3">
          {/* Add new character */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add character</p>
            <div className="flex gap-2 flex-wrap">
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
                placeholder="Name"
                value={newChar.name}
                onChange={e => setNewChar({ ...newChar, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addCharacter()}
              />
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[120px]"
                placeholder="Role (optional)"
                value={newChar.role}
                onChange={e => setNewChar({ ...newChar, role: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addCharacter()}
              />
              <input
                type="color"
                className="border border-gray-200 rounded-lg h-[38px] w-12 cursor-pointer"
                value={newChar.color}
                onChange={e => setNewChar({ ...newChar, color: e.target.value })}
              />
              <button
                onClick={addCharacter}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Character list */}
          {data.characters.map(char => (
            <div key={char.id} className="border border-gray-200 rounded-xl p-4">
              {editingChar?.id === char.id ? (
                <div className="flex gap-2 flex-wrap">
                  <input
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
                    value={editingChar.name}
                    onChange={e => setEditingChar({ ...editingChar, name: e.target.value })}
                  />
                  <input
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[120px]"
                    value={editingChar.role}
                    onChange={e => setEditingChar({ ...editingChar, role: e.target.value })}
                  />
                  <input
                    type="color"
                    className="border border-gray-200 rounded-lg h-[38px] w-12 cursor-pointer"
                    value={editingChar.color}
                    onChange={e => setEditingChar({ ...editingChar, color: e.target.value })}
                  />
                  <button onClick={() => saveCharacter(editingChar)} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">Save</button>
                  <button onClick={() => setEditingChar(null)} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: char.color }} />
                  <div className="flex-1">
                    <span className="font-medium text-sm text-gray-800">{char.name}</span>
                    {char.role && <span className="text-gray-400 text-sm ml-2">— {char.role}</span>}
                  </div>
                  <span className="text-xs text-gray-400">{data.events.filter(e => e.characterId === char.id).length} events</span>
                  <button onClick={() => setEditingChar(char)} className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1">Edit</button>
                  <button onClick={() => deleteCharacter(char.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'events' && (
        <div className="space-y-3">
          {/* Add new event */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add event</p>
            <div className="flex gap-2 flex-wrap">
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={newEvent.characterId}
                onChange={e => setNewEvent({ ...newEvent, characterId: e.target.value })}
              >
                {data.characters.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="time"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={newEvent.startTime}
                onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
              />
              <input
                type="time"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={newEvent.endTime}
                onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
              />
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[160px]"
                placeholder="Activity label"
                value={newEvent.label}
                onChange={e => setNewEvent({ ...newEvent, label: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addEvent()}
              />
              <button
                onClick={addEvent}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Event list */}
          {[...data.events]
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map(event => {
              const char = charById(event.characterId)
              return (
                <div key={event.id} className="border border-gray-200 rounded-xl p-4">
                  {editingEvent?.id === event.id ? (
                    <div className="flex gap-2 flex-wrap">
                      <select
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        value={editingEvent.characterId}
                        onChange={e => setEditingEvent({ ...editingEvent, characterId: e.target.value })}
                      >
                        {data.characters.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <input type="time" className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        value={editingEvent.startTime} onChange={e => setEditingEvent({ ...editingEvent, startTime: e.target.value })} />
                      <input type="time" className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        value={editingEvent.endTime} onChange={e => setEditingEvent({ ...editingEvent, endTime: e.target.value })} />
                      <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[160px]"
                        value={editingEvent.label} onChange={e => setEditingEvent({ ...editingEvent, label: e.target.value })} />
                      <button onClick={() => saveEvent(editingEvent)} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">Save</button>
                      <button onClick={() => setEditingEvent(null)} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {char && <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: char.color }} />}
                      <span className="text-xs font-mono text-gray-500 whitespace-nowrap">{event.startTime}–{event.endTime}</span>
                      <span className="text-sm font-medium text-gray-800 flex-1">{event.label}</span>
                      <span className="text-xs text-gray-400">{char?.name}</span>
                      <button onClick={() => setEditingEvent(event)} className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1">Edit</button>
                      <button onClick={() => deleteEvent(event.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1">Delete</button>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
