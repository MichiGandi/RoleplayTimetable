# RoleplayTimetable

Interactive timetable for roleplay scenarios, built with React + TypeScript + Tailwind + Vite.

## Features

- **View mode** — browse the timetable, filter by place, click any event for details, drag the red time line to track progress
- **Edit mode** — drag to create events, click to edit, all changes saved instantly to localStorage
- **Settings** — manage characters and places (reorder by drag, assign parent places, hide from filter)
- **Import / Export** — backup and restore data as JSON

## Local development (Windows)

**Prerequisites:** [Node.js](https://nodejs.org/) v20 or later.

```powershell
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 in your browser.

## Build for production

```powershell
npm run build
```

Output goes to the `dist/` folder.

## Deploy to Synology NAS

**Prerequisites:** Docker Desktop on Windows, Container Manager on your Synology.

### Step 1 — Build the Docker image (on Windows)

```powershell
docker build -t username/roleplay-timetable .
```

### Step 2 — Save the image to a file

```powershell
docker save username/roleplay-timetable -o roleplay-timetable.tar
```

Note: `gzip` is not available in Windows PowerShell, so save as `.tar` (not `.tar.gz`).

