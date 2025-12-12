# Creator Brain Inbox

A single-page Next.js 14 + TypeScript + Tailwind app for creators to capture, filter, and organize ideas in a calm "brain inbox." Data lives entirely in localStorage—no backend required.

## Getting started

1. Install dependencies
   ```bash
   npm install
   ```
2. Run the dev server
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) to use the app.

## Features
- Add multi-platform ideas with content type, energy, status, and next action metadata.
- Drag-and-drop ideas across Inbox → Ready → Drafting → Posted.
- Flexible filters for platform, status, and timeframe (today/this week/someday).
- “Today’s Focus” surface top Ready/Drafting ideas by energy and recency.
- Idea streak tracking for consecutive days of new idea creation.
- Responsive layout with mobile-first stacking and desktop three-column view.
- All state persisted under a single localStorage key.
