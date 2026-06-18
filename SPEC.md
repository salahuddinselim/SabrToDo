# SabrFlow - SabrWare Task Management System

## 1. Concept & Vision

**SabrFlow** - Where patience meets productivity. A to-do application that embodies the meaning of "Sabr" (Arabic for patience/inner strength) through its calm yet powerful interface. The app feels like a serene workspace where tasks flow naturally from creation to completion, with gentle notifications that guide rather than interrupt.

**Core Philosophy**: "Calm productivity, mindful completion"

## 2. Design Language

### Aesthetic Direction
**Neo-Brutalist Minimalism meets Soft Glassmorphism** - Bold typography with soft, glowing interfaces. Think: architectural blueprint precision with liquid glass overlays.

### Color Palette
```
Primary:        #6366F1 (Indigo-500 - Trust & Focus)
Secondary:      #8B5CF6 (Violet-500 - Creativity)
Accent:         #F59E0B (Amber-500 - Energy/Notifications)
Success:        #10B981 (Emerald-500 - Completion)
Danger:         #EF4444 (Red-500 - Deletion/Priority)
Background:     #0F172A (Slate-900 - Deep Focus)
Surface:        #1E293B (Slate-800 - Cards)
Surface-Light:  #334155 (Slate-700 - Hover states)
Text-Primary:   #F8FAFC (Slate-50)
Text-Secondary: #94A3B8 (Slate-400)
Glass:          rgba(255, 255, 255, 0.05)
```

### Typography
- **Headings**: Inter (700, 800) - Modern, geometric, highly readable
- **Body**: Inter (400, 500) - Consistent visual language
- **Accents/Labels**: JetBrains Mono (500) - For task counts, dates, metadata

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- Border radius: 8px (cards), 12px (buttons), 24px (modals), 9999px (pills)
- Max content width: 1200px

### Motion Philosophy
- **Entrance**: Fade up + scale (0.95 → 1), 300ms ease-out
- **Interactions**: Scale (1.02) + shadow lift on hover, 150ms
- **Completion**: Strikethrough animation + confetti burst for milestones
- **Notifications**: Slide in from right + gentle bounce, 400ms spring
- **Page transitions**: Cross-fade with slight y-translation, 200ms

### Visual Assets
- **Icons**: Lucide React (consistent 24px, 1.5px stroke)
- **Decorative**: Gradient orbs, subtle grid patterns, animated gradients
- **Empty states**: Custom SVG illustrations with brand colors

## 3. Layout & Structure

### Page Architecture

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (Fixed)                                         │
│  ┌─────────┐                    ┌──────┐ ┌─────────┐   │
│  │ Logo    │  Navigation        │Notif │ │Profile  │   │
│  └─────────┘                    └──────┘ └─────────┘   │
├─────────────────────────────────────────────────────────┤
│  MAIN CONTENT (Scrollable)                              │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  HERO SECTION - Quick Add Task Bar              │   │
│  │  [ ________________________________] [+ Add]     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌───────────────┐  ┌───────────────┐                  │
│  │ TODAY         │  │ UPCOMING      │                  │
│  │ ┌───────────┐ │  │ ┌───────────┐ │                  │
│  │ │ Task Card │ │  │ │ Task Card │ │                  │
│  │ └───────────┘ │  │ └───────────┘ │                  │
│  │ ┌───────────┐ │  │               │                  │
│  │ │ Task Card │ │  │               │                  │
│  │ └───────────┘ │  │               │                  │
│  └───────────────┘  └───────────────┘                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  COMPLETED (Collapsible)                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Responsive Strategy
- **Desktop (1024px+)**: Two-column task layout, expanded stats
- **Tablet (768px-1023px)**: Single column, sidebar collapses to icons
- **Mobile (<768px)**: Full-width cards, bottom navigation, swipe gestures

### Visual Pacing
- Hero section: Generous padding (64px), gradient background
- Task sections: Tighter spacing (24px), clear visual hierarchy
- Completed section: Muted colors, collapsed by default

## 4. Features & Interactions

### Authentication (NextAuth.js)
- **Sign Up / In**: Google OAuth (one-click)
- **Session**: JWT-based, persisted in cookies
- **Logout**: Clears session cookie, redirects to home

### Task Management
- **Create**: Quick add bar (hero), dedicated modal for full details
- **Read**: Grouped by Today, Upcoming, Completed
- **Update**: Inline editing, drag-to-reorder, priority toggle
- **Delete**: Swipe (mobile), hover reveal delete, confirmation modal

### Task Properties
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  notifyBefore: number; // minutes before due
  userId: string;
}
```

### Notifications System
- **Browser Notifications**: Request permission on first login
- **In-App Notifications**: Toast messages + notification bell
- **Triggers**:
  - Task due in 15 minutes (configurable)
  - Task overdue
  - Daily summary at user-set time
  - Task completed celebration
- **Notification Bell**: Dropdown with recent notifications, mark as read

### Search & Filter
- **Search**: Real-time filtering by title/description
- **Filters**: Priority, date range, completion status
- **Sort**: Due date, priority, created date, alphabetical

### Statistics Dashboard (Desktop)
- Tasks completed this week/month
- Current streak (consecutive days with completed tasks)
- Productivity chart (tasks over time)
- Category breakdown

## 5. Component Inventory

### Header
- **Default**: Logo left, nav center (optional), notifications + profile right
- **Scrolled**: Slight shadow, background blur increases
- **Mobile**: Hamburger menu, logo center

### Task Card
- **Default**: White/dark surface, left border color = priority, shadow-sm
- **Hover**: Shadow-lg, scale 1.01, reveal action buttons
- **Dragging**: Shadow-xl, opacity 0.8, rotation 2deg
- **Completed**: Strikethrough title, muted colors, checkmark animation
- **Overdue**: Red accent, pulsing border

### Quick Add Input
- **Default**: Glass background, placeholder text, subtle border
- **Focused**: Border glow (primary color), expanded height
- **Submitting**: Loading spinner, disabled state

### Button
- **Primary**: Gradient background (indigo → violet), white text
- **Secondary**: Transparent, border, text color
- **Danger**: Red background on hover
- **Disabled**: Opacity 0.5, no pointer events
- **Loading**: Spinner replaces text/icon

### Modal
- **Backdrop**: Black 60% opacity, blur
- **Container**: Glass surface, scale animation from 0.95
- **Close**: X button top-right, click outside to close

### Notification Toast
- **Success**: Green left border, checkmark icon
- **Warning**: Amber left border, alert icon
- **Error**: Red left border, X icon
- **Info**: Blue left border, info icon
- **Animation**: Slide in from right, auto-dismiss after 5s

### Empty State
- **Tasks**: Illustration + "No tasks yet" + CTA to create
- **Search**: "No results found" + clear filters button
- **Completed**: "All caught up!" celebration

### Skeleton Loaders
- Pulsing animation for cards, buttons, text
- Match exact dimensions of loaded content

## 6. Technical Approach

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **State**: React Context + useReducer (simple) / Zustand (complex)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend/Database (Google Sheets)
- **Storage**: Google Sheets (3 tabs: `users`, `tasks`, `notifications`)
- **API Layer**: Next.js API routes handle CRUD via googleapis
- **Auth Integration**: NextAuth.js (Google OAuth), user Google ID stored in `users` sheet

### API Design

```typescript
// Tasks
GET    /api/tasks          // List user's tasks
POST   /api/tasks          // Create task
GET    /api/tasks/:id      // Get single task
PATCH  /api/tasks/:id      // Update task
DELETE /api/tasks/:id      // Delete task

// Notifications
GET    /api/notifications  // User's notifications
PATCH  /api/notifications/:id // Mark as read
```

### Data Model (Google Sheets)

Data is stored in a single Google Spreadsheet with three tabs:

**Sheet: `users`**
| Column | Description |
|--------|-------------|
| id | UUID (generated via `crypto.randomUUID()`) |
| firebase_uid | Firebase Auth UID (unique) |
| email | User email address |
| display_name | User display name |
| created_at | ISO timestamp |
| updated_at | ISO timestamp |

**Sheet: `tasks`**
| Column | Description |
|--------|-------------|
| id | UUID |
| user_id | References user UUID |
| title | Task title (required) |
| description | Task description |
| due_date | Due date ISO string |
| priority | `low`, `medium`, or `high` |
| status | `pending` or `completed` |
| notify_before | Minutes before due to notify (default: 15) |
| created_at | ISO timestamp |
| completed_at | ISO timestamp (empty if not completed) |
| order_index | Integer for custom ordering |

**Sheet: `notifications`**
| Column | Description |
|--------|-------------|
| id | UUID |
| user_id | References user UUID |
| type | `due_soon`, `overdue`, `completed`, `daily_summary` |
| title | Notification title |
| message | Optional message body |
| task_id | Optional reference to task UUID |
| is_read | `'true'` or `'false'` (string) |
| created_at | ISO timestamp |

### Deployment
- **Frontend**: Netlify (auto-deploy from Git)
- **Backend**: Google Sheets API
- **Auth**: Firebase hosting

### Security Measures
- Service account credentials stored server-side only
- Firebase ID token verification on API routes
- HTTPS everywhere
- Input sanitization
- Rate limiting on auth endpoints
- CSRF protection

## 7. Project Structure

```
sabrflow/
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (landing/dashboard)
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── api/
│   │       └── tasks/route.ts
│   ├── components/
│   │   ├── ui/ (buttons, inputs, cards)
│   │   ├── layout/ (header, sidebar)
│   │   ├── tasks/ (task-card, task-form)
│   │   └── notifications/ (toast, bell)
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   └── useNotifications.ts
│   ├── types/
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── .env.local
├── tailwind.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```
