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

## AI / Groq configuration

Creator Brain Inbox uses an OpenAI-compatible API (tested with [Groq](https://console.groq.com/)) for the Content Helper.

Set the following environment variables in Vercel:

- `OPENAI_API_KEY` – **required**. Your Groq API key (from the Groq console). This key is only used on the server in `/api/helper`.
- `OPENAI_MODEL` – optional. Model ID to use for completions. Defaults to `llama-3.1-8b-instant` if not set.

Example model values:
- `llama-3.1-8b-instant` – fast and cheap, good default for social content.
- `openai/gpt-oss-120b` – larger open-source model served by Groq if you prefer maximum quality.

After updating env vars on Vercel, redeploy the project so the API route picks them up.

## Features
- Add multi-platform ideas with content type, energy, status, and next action metadata.
- Drag-and-drop ideas across Inbox → Ready → Drafting → Posted.
- Flexible filters for platform, status, and timeframe (today/this week/someday).
- “Today’s Focus” surface top Ready/Drafting ideas by energy and recency.
- Idea streak tracking for consecutive days of new idea creation.
- Responsive layout with mobile-first stacking and desktop three-column view.
- All state persisted under a single localStorage key.
