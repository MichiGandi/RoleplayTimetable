import { useState } from 'react'
import { View, TimetableData } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { defaultData } from './utils/defaultData'
import TimetableView from './components/TimetableView'
import AdminView from './components/AdminView'

export default function App() {
  const [view, setView] = useState<View>('timetable')
  const [data, setData] = useLocalStorage<TimetableData>('timetable-data', defaultData)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <h1 className="text-base font-semibold text-gray-900">Timetable</h1>
        <nav className="flex gap-1 ml-2">
          <button
            onClick={() => setView('timetable')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'timetable'
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            View
          </button>
          <button
            onClick={() => setView('admin')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === 'admin'
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Edit
          </button>
        </nav>
        <span className="ml-auto text-xs text-gray-400">
          {data.characters.length} characters · {data.events.length} events
        </span>
      </header>

      {/* Content */}
      <main className={view === 'timetable' ? 'p-4' : ''}>
        {view === 'timetable' ? (
          <TimetableView characters={data.characters} events={data.events} />
        ) : (
          <AdminView data={data} onChange={setData} />
        )}
      </main>
    </div>
  )
}
