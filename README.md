# TaskMaster ⚔️

A gamified task-management app built with **Spring Boot 3** (backend) and **Vite + React 19 + TypeScript** (frontend). Complete quests to earn XP, level up, collect gold, and contribute resources to a shared city civilization.

---

## Features

- **RPG progression** — XP, levels, HP, gold
- **Task types** — Habits, Dailies, Todos
- **Civilization builder** — Found or join a city; complete tasks to contribute Food / Wood / Stone / Gold to city resource pools and auto-level buildings (Farm, Lumbermill, Quarry, Treasury) up to level 5
- **Invite codes** — Share a 12-character code to let friends join your city
- **JWT auth** — Stateless, token-based authentication

---

## Requirements

| Tool | Version |
|------|---------|
| Java | 21+ |
| Maven | 3.9+ |
| Node.js | 20+ |
| npm | 10+ |

---

## Quick Start (single machine)

### 1 — Start the backend

```bash
cd backend
mvn spring-boot:run
# API is available at http://localhost:8080
```

### 2 — Start the frontend

```bash
cd frontend
npm install          # first time only
npm run dev
# UI is available at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Local Network Access (any device on your LAN)

The Vite dev server is configured to listen on **all network interfaces**, and all `/api` requests are proxied through Vite to the backend, so **no hardcoded IP address is needed**.

1. Start both services as above on the host machine.
2. Find the host machine's local IP address:
   - **macOS/Linux**: `ip route get 1 | awk '{print $7}'` or `hostname -I`
   - **Windows**: `ipconfig` → look for the IPv4 address (e.g. `192.168.1.100`)
3. On any other device on the same network, open:
   ```
   http://<host-ip>:5173
   ```
   For example: `http://192.168.1.100:5173`

The backend API (`http://<host-ip>:8080`) is also reachable directly if you need it.

### Production build

To serve the built frontend (e.g. via `npm run preview`):

```bash
cd frontend
VITE_API_URL=http://<host-ip>:8080/api npm run build
npm run preview      # serves on http://<host-ip>:5173
```

Or set `VITE_API_URL` in a `.env.local` file:

```
VITE_API_URL=http://192.168.1.100:8080/api
```

---

## Project Structure

```
task-master/
├── backend/          # Spring Boot 3 + H2 (in-memory) + JWT
│   └── src/main/java/com/taskmaster/
│       ├── controller/   # REST endpoints (/api/auth, /api/tasks, /api/cities, ...)
│       ├── service/      # Business logic (TaskService, CityService, ...)
│       ├── model/        # JPA entities (User, Task, City, Building, ...)
│       ├── dto/          # Request/response DTOs
│       ├── repository/   # Spring Data JPA repositories
│       └── config/       # Security, CORS
└── frontend/         # Vite + React 19 + TypeScript + Tailwind
    └── src/
        ├── api/          # fetch client + per-resource API modules
        ├── components/   # Reusable UI components
        ├── hooks/        # React Query hooks
        ├── pages/        # Route-level pages
        ├── store/        # Zustand auth store
        └── types/        # Shared TypeScript types
```

---

## API Reference (highlights)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | — | Register a new user |
| `POST` | `/api/auth/login` | — | Log in, returns JWT |
| `GET` | `/api/tasks` | ✓ | List my tasks |
| `POST` | `/api/tasks` | ✓ | Create a task |
| `POST` | `/api/tasks/{id}/complete` | ✓ | Complete task → earn XP, gold & city resources |
| `GET` | `/api/cities/me` | ✓ | Get my city |
| `POST` | `/api/cities` | ✓ | Found a new city |
| `POST` | `/api/cities/join` | ✓ | Join a city via invite code |
| `DELETE` | `/api/cities/me` | ✓ | Leave city (founders cannot leave) |
