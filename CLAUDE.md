# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (root)
```bash
npm run dev       # Start Vite dev server on :5173
npm run build     # Production build
npm run preview   # Preview production build
```

### Backend (server/)
```bash
cd server
npm run dev       # Whitelist IP + start nodemon on :5000
npm start         # Production start (node server.js)
```

Run both concurrently in separate terminals. The Vite config proxies `/api/*` to `http://localhost:5000`.

No test framework is configured.

## Architecture

This is a neighborhood-based community platform ("Hello Neighbour") — a MERN stack monorepo where the React frontend lives at the root and the Express backend lives in `server/`.

### Frontend

- **Entry**: `src/main.jsx` → `src/App.jsx` (React Router v6)
- **Auth guard**: `ProtectedRoute` in App.jsx checks `user`, `onboardingComplete`, and optional `requiredRole`
- **Global state**: A single large React Context in `src/context/AppContext.jsx` (~552 lines) holds all auth state, content (posts/jobs/businesses), notifications, chat, and 55+ action functions. All API calls go through here.
- **API layer**: `src/services/api.js` — thin fetch wrapper that injects the JWT token from localStorage and throws on non-2xx responses
- **Styling**: Tailwind CSS with dark mode support; dark mode toggled via context and persisted to `localStorage` as `"hn-dark"`

### Backend

- **Entry**: `server/server.js` — Express app, CORS configured for `CLIENT_URL` + localhost:5173
- **Auth middleware**: `server/src/middleware/auth.js` — `auth` (JWT verify) and `requireRole(role)` decorators used on protected routes
- **DB connection**: `server/src/config/db.js` — connects to MongoDB Atlas; drops legacy `email_1` index on startup if it exists
- **IP whitelisting**: `server/scripts/whitelist-ip.js` runs before nodemon in dev to add the current IP to MongoDB Atlas access list (requires Atlas API keys)

### Data Models (server/src/models/)

| Model | Key fields / notes |
|---|---|
| `User` | `role` enum: `normal/worker/business`; `geoLocation` GeoJSON Point; `neighborhood`, `connectionList`, `blockedUsers`, `mutedUsers` |
| `Post` | `type` enum: `general/warning/help/offer`; `responses` array for service-request replies; `orderCategories`, `orderBudget` for ordering |
| `Job` | `status` enum: `open/ongoing/completed`; `applicants`, `assignedTo` |
| `Business` | `coordinates` for geospatial queries; `members`, `rating` |
| `Order` | Links a `Post` (service request) to a `Business` response; tracks order `status` |
| `Message` / `Conversation` | DM system; messages optionally reference an `orderId` |
| `Notification` | `type` + `targetId` + `relatedUser`; `isRead` flag |
| `Report` | Moderation reports on posts, users, or businesses |
| `Neighborhood` | GeoJSON coordinates, `memberCount` |

### API Routes (all under `/api/`)

`auth`, `users`, `posts`, `jobs`, `businesses`, `notifications`, `neighborhoods`, `messages`, `orders`, `reports`, `search`

### Key Patterns

**Neighborhood filtering**: Most content queries filter by `neighborhood` string. There's a fallback path for legacy string-name matching alongside ObjectId references.

**Geospatial**: User location is stored as GeoJSON Point. The context auto-attaches `lat`/`lng`/`radius` query params when the user's coordinates are known. Businesses and neighborhoods support `$near` queries.

**Role system**: Users can switch between `normal`, `worker`, and `business` roles. The `/business` route is role-gated to `business` only.

**Service request flow**: A `Post` of type `offer` or `help` can receive `responses` from businesses → user places an `Order` → business updates order `status`.

**OTP auth**: Signup triggers an OTP email via Nodemailer (`server/src/services/otp.js`). Login does not require OTP.

## Environment Variables

Create `server/.env` from `server/.env.example`:

```
MONGO_URI=          # MongoDB Atlas connection string
JWT_SECRET=         # JWT signing secret
PORT=5000
CLIENT_URL=http://localhost:5173

# Optional — only needed for Atlas IP auto-whitelisting in dev
ATLAS_PUBLIC_KEY=
ATLAS_PRIVATE_KEY=
ATLAS_PROJECT_ID=
```
