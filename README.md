# Timetable

Interactive timetable with admin UI. Built with React + TypeScript + Tailwind + Vite.

## Local development (Windows)

**Prerequisites:** Install [Node.js](https://nodejs.org/) (v20 or later).

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open http://localhost:5173 in your browser.

## Build for production

```bash
npm run build
```

Output goes to the `dist/` folder.

## Deploy to Synology NAS (Docker)

**Prerequisites:** Docker Desktop installed on Windows, Docker / Container Manager on your Synology.

### Option A — Build on Windows, copy to NAS

```bash
# Build the image
docker build -t timetable .

# Save to a file
docker save timetable | gzip > timetable.tar.gz
```

Then in Synology Container Manager → Image → Add → From File → upload `timetable.tar.gz`.
Create a container from that image, map port 8080 → 80.

### Option B — Build directly on NAS via SSH

```bash
ssh your-nas-user@your-nas-ip
# Upload this project folder to the NAS first, then:
cd /path/to/timetable
docker build -t timetable .
docker run -d -p 8080:80 --name timetable --restart unless-stopped timetable
```

Access at: http://your-nas-ip:8080

## Data

All timetable data is stored in the browser's localStorage.
Use the **Edit** tab in the app to add, edit, or delete characters and events.
