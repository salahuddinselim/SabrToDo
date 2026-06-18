# SabrFlow - SabrWare Task Management System

Where patience meets productivity. A serene workspace where tasks flow naturally from creation to completion.

## Features

- **Smart Task Management**: Create, organize, and complete tasks with intuitive controls
- **Real-time Notifications**: Never miss a deadline with smart reminders
- **Google Authentication**: One-click sign-in with NextAuth.js + Google OAuth
- **Google Sheets Storage**: Data stored in Google Sheets via API
- **Modern UI**: Built with Next.js, Tailwind CSS, and Framer Motion
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: NextAuth.js (Google OAuth)
- **Database**: Google Sheets
- **Deployment**: Netlify (Frontend)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Cloud project (with OAuth consent + Sheets API)
- A Google Sheet (shared with your service account)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/salahuddinselim/SabrToDo.git
cd sabrflow
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

4. Fill in your credentials in `.env.local`

### Google OAuth Setup (NextAuth.js)

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Set **Application type** → **Web application**
4. Add **Authorized redirect URI**: `http://localhost:3000/api/auth/callback/google`
5. Copy the **Client ID** → set as `AUTH_GOOGLE_ID`
6. Copy the **Client Secret** → set as `AUTH_GOOGLE_SECRET`
7. Generate an auth secret: run `npx auth secret` and set as `AUTH_SECRET`

### Google Sheets Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google Sheets API** for your project
4. Go to **Credentials** → **Create Credentials** → **Service Account**
5. Name your service account, click Create
6. Skip granting permissions, click Done
7. Click on your new service account, go to **Keys** tab → **Add Key** → **Create New Key**
8. Choose **JSON**, download the key file
9. Open the key file - you'll need `client_email` and `private_key` values
10. Create a new Google Sheet (or use existing)
11. Share the sheet with the service account email (from step 9) as **Editor**
12. Copy the **Sheet ID** from the URL: `https://docs.google.com/spreadsheets/d/<THIS_IS_YOUR_SHEET_ID>/edit`

The app will automatically create three sheets/tabs: `users`, `tasks`, and `notifications` with the correct headers on first run.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set the build command: `npm run build`
3. Set the publish directory: `.next`
4. Add your environment variables in Netlify's dashboard
5. Deploy!

## Project Structure

```
sabrflow/
├── public/              # Static files
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── auth/       # Authentication pages
│   │   ├── dashboard/  # Dashboard page
│   │   ├── layout.tsx  # Root layout
│   │   ├── page.tsx    # Landing page
│   │   └── globals.css # Global styles
│   ├── components/     # React components
│   │   ├── ui/         # Base UI components
│   │   ├── layout/     # Layout components
│   │   └── tasks/      # Task-related components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configs
│   │   ├── auth.ts     # NextAuth.js configuration
│   │   ├── sheets.ts   # Google Sheets server client
│   │   ├── db.ts       # Client-side API wrapper
│   │   └── utils.ts
│   ├── app/api/        # Next.js API routes (Google Sheets backend)
│   └── types/          # TypeScript types
├── .env.example        # Environment variables template
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## License

© 2024 SabrWare. All rights reserved.
