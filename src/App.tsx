import { useState } from 'react'
import { TimetableData } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { defaultData } from './utils/defaultData'
import TimetableView from './components/TimetableView'
import AdminView from './components/AdminView'
import { generateId } from './utils/time'

type AppView = 'edit' | 'admin'

interface Tracker {
  id: string
  name: string
  activePlace: string | null
  timeLineY: number
}

const defaultTracker = (): Tracker => ({
  id: generateId(),
  name: 'View 1',
  activePlace: null,
  timeLineY: 0,
})

export default function App() {
  const [appView, setAppView] = useState<AppView | null>(null) // null = tracker view
  const [data, setData] = useLocalStorage<TimetableData>('timetable-data', defaultData)
  const [trackers, setTrackers] = useLocalStorage<Tracker[]>('rpt-trackers', [defaultTracker()])
  const [activeTrackerId, setActiveTrackerId] = useLocalStorage<string>('rpt-active-tracker', '')
  const [colWidth, setColWidth] = useState(60)
  const [showSlider, setShowSlider] = useState(false)
  const [editingTrackerId, setEditingTrackerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')

  const updateData = (partial: Partial<TimetableData>) => {
    setData(prev => ({ ...prev, ...partial }))
  }

  const activeTracker = trackers.find(t => t.id === activeTrackerId) ?? trackers[0]

  const updateTracker = (patch: Partial<Tracker>) => {
    setTrackers(prev => prev.map(t => t.id === activeTracker.id ? { ...t, ...patch } : t))
  }

  const addTracker = () => {
    const n = trackers.length + 1
    const t = { ...defaultTracker(), name: `View ${n}` }
    setTrackers(prev => [...prev, t])
    setActiveTrackerId(t.id)
    setAppView(null)
  }

  const removeTracker = (id: string) => {
    if (trackers.length === 1) return
    const tracker = trackers.find(t => t.id === id)
    if (!confirm(`Delete "${tracker?.name}"?`)) return
    const remaining = trackers.filter(t => t.id !== id)
    setTrackers(remaining)
    if (activeTracker.id === id) setActiveTrackerId(remaining[0].id)
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <header className="border-b border-gray-200 px-3 py-1.5 flex items-center gap-2 flex-shrink-0">
        {editingTitle ? (
          <input
            autoFocus
            className="text-sm font-semibold text-gray-900 bg-transparent border-b border-gray-400 outline-none mr-1 w-40"
            value={titleDraft}
            onChange={e => setTitleDraft(e.target.value)}
            onBlur={() => { if (titleDraft.trim()) setData(prev => ({ ...prev, title: titleDraft.trim() })); setEditingTitle(false) }}
            onKeyDown={e => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              if (e.key === 'Escape') setEditingTitle(false)
            }}
          />
        ) : (
          <h1
            className="text-sm font-semibold text-gray-900 mr-1 cursor-default select-none"
            onDoubleClick={() => { setTitleDraft(data.title ?? 'RoleplayTimetable'); setEditingTitle(true) }}
            title="Double-click to rename"
          >
            {data.title ?? 'RoleplayTimetable'}
          </h1>
        )}

        {/* Tracker tabs */}
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {trackers.map(tracker => (
            <div
              key={tracker.id}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0 group ${
                activeTracker.id === tracker.id && appView === null
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {editingTrackerId === tracker.id ? (
                <input
                  autoFocus
                  className="bg-transparent outline-none w-20 text-xs"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onBlur={() => {
                    if (editingName.trim()) updateTracker({ name: editingName.trim() })
                    setEditingTrackerId(null)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                    if (e.key === 'Escape') setEditingTrackerId(null)
                  }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span
                  className="cursor-pointer select-none"
                  onClick={() => { setActiveTrackerId(tracker.id); setAppView(null) }}
                  onDoubleClick={() => { setEditingTrackerId(tracker.id); setEditingName(tracker.name) }}
                >
                  {tracker.name}
                </span>
              )}
              {trackers.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); removeTracker(tracker.id) }}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-current leading-none ml-0.5"
                >×</button>
              )}
            </div>
          ))}
          <button
            onClick={addTracker}
            className="px-2 py-1 rounded-lg text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
            title="Add view"
          >+</button>
        </div>

        {/* Mode buttons */}
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => setAppView(appView === 'edit' ? null : 'edit')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              appView === 'edit' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >Edit</button>
          <button
            onClick={() => setAppView(appView === 'admin' ? null : 'admin')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              appView === 'admin' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >Settings</button>
        </div>

        {/* Width slider */}
        <div className="ml-auto flex items-center gap-2">
          {appView !== 'admin' && showSlider && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">Column width</span>
              <input
                type="range" min={30} max={200} value={colWidth}
                onChange={e => setColWidth(Number(e.target.value))}
                className="w-28 accent-gray-500"
              />
              <span className="text-xs text-gray-400 w-8 tabular-nums">{colWidth}px</span>
            </div>
          )}
          {appView !== 'admin' && (
            <button
              onClick={() => setShowSlider(p => !p)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                showSlider ? 'border-gray-300 text-gray-600 bg-gray-50' : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'
              }`}
            >Width</button>
          )}
          {appView === 'admin' && (
            <span className="text-xs text-gray-400">
              {data.characters.length} characters · {data.places.length} places · {data.events.length} events
            </span>
          )}
        </div>
      </header>

      <main className={appView === 'admin' ? 'flex-1 overflow-auto' : 'flex-1 overflow-hidden flex flex-col'}>
        {appView === 'admin' ? (
          <AdminView data={data} onChange={setData} />
        ) : (
          <TimetableView
            characters={data.characters}
            events={data.events}
            places={data.places}
            isEditMode={appView === 'edit'}
            colWidth={colWidth}
            activePlace={activeTracker?.activePlace ?? null}
            onActivePlaceChange={place => updateTracker({ activePlace: place })}
            timeLineY={activeTracker?.timeLineY ?? 0}
            onTimeLineYChange={y => updateTracker({ timeLineY: y })}
            onChange={updateData}
          />
        )}
      </main>
    </div>
  )
}
