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

  const updateData = (partial: Partial<TimetableData>) => {
    setData(prev => ({ ...prev, ...partial }))
  }

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
        <span className="ml-auto text-xs text-gray-400">
          {data.characters.length} characters · {data.places.length} places · {data.events.length} events
        </span>
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
            onChange={updateData}
          />
        )}
      </main>
    </div>
  )
}
