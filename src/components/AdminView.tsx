import { useState, useRef } from 'react'
import { Character, Place, TimetableData } from '../types'
import { generateId, randomColor } from '../utils/time'

interface Props {
  data: TimetableData
  onChange: (data: TimetableData) => void
}

type AdminTab = 'characters' | 'places'

export default function AdminView({ data, onChange }: Props) {
  const [tab, setTab] = useState<AdminTab>('characters')

  const [editingChar, setEditingChar] = useState<Character | null>(null)
  const [newChar, setNewChar] = useState<Omit<Character, 'id'>>({ name: '', role: '' })

  const [editingPlace, setEditingPlace] = useState<Place | null>(null)
  const [newPlace, setNewPlace] = useState<Omit<Place, 'id'>>({ name: '', color: randomColor(), parentId: null })
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const addCharacter = () => {
    if (!newChar.name.trim()) return
    onChange({ ...data, characters: [...data.characters, { ...newChar, id: generateId() }] })
    setNewChar({ name: '', role: '' })
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

  const addPlace = () => {
    if (!newPlace.name.trim()) return
    onChange({ ...data, places: [...data.places, { ...newPlace, id: generateId() }] })
    setNewPlace({ name: '', color: randomColor() })
  }

  const savePlace = (place: Place) => {
    onChange({ ...data, places: data.places.map(p => p.id === place.id ? place : p) })
    setEditingPlace(null)
  }

  const deletePlace = (id: string) => {
    if (!confirm('Delete this place? It will be removed from any events using it.')) return
    onChange({
      ...data,
      places: data.places.filter(p => p.id !== id),
      events: data.events.map(e => ({ ...e, placeIds: e.placeIds.filter(pid => pid !== id) })),
    })
  }

  const deleteAll = () => {
    if (!confirm('Delete all characters, places, and events? This cannot be undone.')) return
    onChange({ characters: [], places: [], events: [] })
  }

  const exportData = () => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const date = new Date().toISOString().slice(0, 10)
    a.download = `timetable-${date}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const triggerImport = () => {
    setImportError(null)
    fileInputRef.current?.click()
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        if (
          !parsed ||
          !Array.isArray(parsed.characters) ||
          !Array.isArray(parsed.places) ||
          !Array.isArray(parsed.events)
        ) {
          throw new Error('File does not match the expected timetable format.')
        }
        if (!confirm('Import this file? It will replace all current characters, places, and events.')) {
          return
        }
        onChange(parsed as TimetableData)
        setImportError(null)
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Could not read this file.')
      }
    }
    reader.onerror = () => setImportError('Could not read this file.')
    reader.readAsText(file)

    // reset input so the same file can be re-selected later
    e.target.value = ''
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
          onClick={exportData}
          className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Export
        </button>
        <button
          onClick={triggerImport}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleImportFile}
          className="hidden"
        />
        <button
          onClick={deleteAll}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          Delete all
        </button>
      </div>

      {importError && (
        <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          Import failed: {importError}
        </div>
      )}

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
                  <button onClick={() => saveCharacter(editingChar)} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">Save</button>
                  <button onClick={() => setEditingChar(null)} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
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
            <div className="flex gap-2 flex-wrap">
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[160px]"
                placeholder="Place name"
                value={newPlace.name}
                onChange={e => setNewPlace({ ...newPlace, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addPlace()}
              />
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-[38px]">
                <input
                  type="color"
                  className="h-full w-9 cursor-pointer border-0 p-0.5 bg-transparent"
                  value={newPlace.color}
                  onChange={e => setNewPlace({ ...newPlace, color: e.target.value })}
                  title="Pick colour"
                />
                <input
                  type="text"
                  maxLength={7}
                  className="w-20 px-2 text-xs font-mono border-0 focus:outline-none"
                  value={newPlace.color}
                  onChange={e => {
                    const v = e.target.value
                    if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setNewPlace({ ...newPlace, color: v })
                  }}
                />
              </div>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={newPlace.parentId ?? ''}
                onChange={e => setNewPlace({ ...newPlace, parentId: e.target.value || null })}
              >
                <option value="">No parent</option>
                {data.places.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                onClick={addPlace}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {data.places.map(place => (
            <div
              key={place.id}
              draggable={!editingPlace}
              onDragStart={e => { e.dataTransfer.setData('placeId', place.id) }}
              onDragOver={e => { e.preventDefault(); setDragOverId(place.id) }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={e => {
                e.preventDefault()
                const fromId = e.dataTransfer.getData('placeId')
                if (fromId === place.id) { setDragOverId(null); return }
                const places = [...data.places]
                const fromIdx = places.findIndex(p => p.id === fromId)
                const toIdx = places.findIndex(p => p.id === place.id)
                const [moved] = places.splice(fromIdx, 1)
                places.splice(toIdx, 0, moved)
                onChange({ ...data, places })
                setDragOverId(null)
              }}
              onDragEnd={() => setDragOverId(null)}
              className={`border rounded-xl p-4 transition-colors ${
                dragOverId === place.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              }`}
            >
              {editingPlace?.id === place.id ? (
                <div className="flex gap-2 flex-wrap">
                  <input
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1"
                    value={editingPlace.name}
                    onChange={e => setEditingPlace({ ...editingPlace, name: e.target.value })}
                    onKeyDown={e => e.key === 'Enter' && savePlace(editingPlace)}
                  />
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-[38px]">
                    <input
                      type="color"
                      className="h-full w-9 cursor-pointer border-0 p-0.5 bg-transparent"
                      value={editingPlace.color}
                      onChange={e => setEditingPlace({ ...editingPlace, color: e.target.value })}
                      title="Pick colour"
                    />
                    <input
                      type="text"
                      maxLength={7}
                      className="w-20 px-2 text-xs font-mono border-0 focus:outline-none"
                      value={editingPlace.color}
                      onChange={e => {
                        const v = e.target.value
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setEditingPlace({ ...editingPlace, color: v })
                      }}
                    />
                  </div>
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={editingPlace.parentId ?? ''}
                    onChange={e => setEditingPlace({ ...editingPlace, parentId: e.target.value || null })}
                  >
                    <option value="">No parent</option>
                    {data.places.filter(p => p.id !== editingPlace.id).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <button onClick={() => savePlace(editingPlace)} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">Save</button>
                  <button onClick={() => setEditingPlace(null)} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 cursor-grab text-sm select-none">&#9776;</span>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: place.color }} />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800">{place.name}</span>
                    {place.parentId && (
                      <span className="text-xs text-gray-400 ml-2">
                        &rarr; {data.places.find(p => p.id === place.parentId)?.name}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{data.events.filter(e => e.placeIds.includes(place.id)).length} events</span>
                  <button
                    onClick={() => onChange({ ...data, places: data.places.map(p => p.id === place.id ? { ...p, hiddenInFilter: !p.hiddenInFilter } : p) })}
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors ${place.hiddenInFilter ? 'border-gray-200 text-gray-300' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
                    title={place.hiddenInFilter ? 'Show in filter' : 'Hide from filter'}
                  >
                    {place.hiddenInFilter ? 'hidden' : 'visible'}
                  </button>
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
