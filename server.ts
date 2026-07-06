import express from 'express'
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()

const app = express()
const PORT = process.env.PORT ?? 3000
const DATA_FILE = process.env.DATA_FILE ?? path.join(ROOT, 'data', 'data.json')

app.use(express.json({ limit: '10mb' }))

// Serve React build
app.use(express.static(path.join(ROOT, 'dist')))

// GET /api/data — return saved data or empty object
app.get('/api/data', (_req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json({})
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    res.json(JSON.parse(raw))
  } catch (err) {
    console.error('Failed to read data:', err)
    res.status(500).json({ error: 'Failed to read data' })
  }
})

// POST /api/data — save data
app.post('/api/data', (req, res) => {
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf-8')
    res.json({ ok: true })
  } catch (err) {
    console.error('Failed to write data:', err)
    res.status(500).json({ error: 'Failed to write data' })
  }
})

// Fallback — serve index.html for client-side routing
app.get('*path', (_req, res) => {
  res.sendFile(path.join(ROOT, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`RoleplayTimetable running on http://localhost:${PORT}`)
  console.log(`Data file: ${DATA_FILE}`)
})
