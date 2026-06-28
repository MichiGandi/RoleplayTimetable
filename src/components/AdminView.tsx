import { useState } from 'react'
import { Character, Place, TimetableData } from '../types'
import { generateId, randomColor } from '../utils/time'
import { defaultData } from '../utils/defaultData'

interface Props {
  data: TimetableData
  onChange: (data: TimetableData) => void
}

type AdminTab = 'characters' | 'places'

export default function AdminView({ data, onChange }: Props) {
  const [tab, setTab] = useState<AdminTab>('characters')

  // Character state
  const [editingChar, setEditingChar] = useState<Character | null>(null)
  const [newChar, setNewChar] = useState<Omit<Character, 'id'>>({ name: '', role: '', color: randomColor() })

  // Place state
  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [newPlaceName, setNewPlaceName] = useState('')

  // --- Characters ---
  const addCharacter = () => {
    if (!newChar.name.trim()) return
    onChange({ ...data, characters: [...data.characters, { ...newChar, id: generateId() }] })
    setNewChar({ name: '', role: '', color: randomColor() })
  }

  const saveCharacter = (char: Character) => {
    onChange({ ...data, characters: data.characters.map(c => c.id === char.id ? char : c) })
    setEditingChar(null)
  }

  const deleteCharacter = (id: string) => {
    if (!confirm('Delete this character and all their events?')) return
    onChange({
      ...data,
      characters: data.characters.filter(c => c.id !== id),
      events: data.events.filter(e => e.characterId !== id),
    })
  }

  // --- Places ---
  const addPlace = () => {
    if (!newPlaceName.trim()) return
    onChange({ ...data, places: [...data.places, { id: generateId(), name: newPlaceName.trim() }] })
    setNewPlaceName('')
  }

  const savePlace = (place: Place) => {
    onChange({ ...data, places: data.places.map(p => p.id === place.id ? place : p) })
    setEditingPlace(null)
  }

  const deletePlace = (id: string) => {
    if (!confirm('Delete this place? Events using it will have no place assigned.')) return
    onChange({
      ...data,
      places: data.places.filter(p => p.id !== id),
      events: data.events.map(e => e.placeId === id ? { ...e, placeId: null } : e),
    })
  }

  const resetToDefault = () => {
    if (!confirm('Reset everything to the default timetable? This cannot be undone.')) return
    onChange(defaultData)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
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
          onClick={() => setTab('places')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'places' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Places ({data.places.length})
        </button>
        <button
          onClick={resetToDefault}
          className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          Reset to default
        </button>
      </div>

      {/* Characters tab */}
      {tab === 'characters' && (
        <div className="space-y-3">
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

      {/* Places tab */}
      {tab === 'places' && (
        <div className="space-y-3">
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add place</p>
            <div className="flex gap-2">
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1"
                placeholder="Place name"
                value={newPlaceName}
                onChange={e => setNewPlaceName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPlace()}
              />
              <button
                onClick={addPlace}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {data.places.map(place => (
            <div key={place.id} className="border border-gray-200 rounded-xl p-4">
              {editingPlace?.id === place.id ? (
                <div className="flex gap-2">
                  <input
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1"
                    value={editingPlace.name}
                    onChange={e => setEditingPlace({ ...editingPlace, name: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && savePlace(editingPlace)}
                  />
                  <button onClick={() => savePlace(editingPlace)} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">Save</button>
                  <button onClick={() => setEditingPlace(null)} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">📍</span>
                  <span className="flex-1 text-sm font-medium text-gray-800">{place.name}</span>
                  <span className="text-xs text-gray-400">
                    {data.events.filter(e => e.placeId === place.id).length} events
                  </span>
                  <button onClick={() => setEditingPlace(place)} className="text-xs text-blue-500 hover:text-blue-700 px-2 py-1">Edit</button>
                  <button onClick={() => deletePlace(place.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
