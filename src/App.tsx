import { useState } from 'react'
import { TimetableData } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { defaultData } from './utils/defaultData'
import TimetableView from './components/TimetableView'
import AdminView from './components/AdminView'

type AppView = 'view' | 'edit' | 'admin'

export default function App() {
  const [view, setView] = useState<AppView>('view')
  const [data, setData] = useLocalStorage<TimetableData>('timetable-data', defaultData)
  const [colWidth, setColWidth] = useState(60)
  const [showSlider, setShowSlider] = useState(false)

  const updateData = (partial: Partial<TimetableData>) => {
    setData(prev => ({ ...prev, ...partial }))
  }

  const showWidthControl = view === 'view' || view === 'edit'

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <h1 className="text-base font-semibold text-gray-900">Timetable</h1>
        <nav className="flex gap-1 ml-2">
          <button
            onClick={() => setView('view')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'view' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            View
          </button>
          <button
            onClick={() => setView('edit')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'edit' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setView('admin')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'admin' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Column width control — top right, replaces the stats text */}
        <div className="ml-auto flex items-center gap-3">
          {showWidthControl && showSlider && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">Column width</span>
              <input
                type="range"
                min={30}
                max={200}
                value={colWidth}
                onChange={e => setColWidth(Number(e.target.value))}
                className="w-28 accent-gray-500"
              />
              <span className="text-xs text-gray-400 w-8 tabular-nums">{colWidth}px</span>
            </div>
          )}
          {showWidthControl && (
            <button
              onClick={() => setShowSlider(p => !p)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                showSlider
                  ? 'border-gray-300 text-gray-600 bg-gray-50'
                  : 'border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              Width
            </button>
          )}
          {!showWidthControl && (
            <span className="text-xs text-gray-400">
              {data.characters.length} characters · {data.places.length} places · {data.events.length} events
            </span>
          )}
        </div>
      </header>

      <main className={view === 'admin' ? '' : 'p-4'}>
        {view === 'admin' ? (
          <AdminView data={data} onChange={setData} />
        ) : (
          <TimetableView
            characters={data.characters}
            events={data.events}
            places={data.places}
            isEditMode={view === 'edit'}
            colWidth={colWidth}
            onChange={updateData}
          />
        )}
      </main>
    </div>
  )
}
