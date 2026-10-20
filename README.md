# IELTS Speaking Part 2 Prep & AI Examiner

React + Vite frontend with three Netlify Functions that call the Gemini API.

## Deploy to Netlify
1. Push this folder to GitHub/GitLab (or use Netlify's "Deploy manually" with the CLI — see note below).
2. In Netlify: **Add new site -> Import an existing project**. Build settings are read from `netlify.toml`
   (build: `npm run build`, publish: `dist`, functions: `netlify/functions`).
3. Before the first deploy, add the environment variable **`GEMINI_API_KEY`**
   (Site configuration -> Environment variables). Optional: `GEMINI_MODEL`.
4. Deploy. Open the site and run a practice session.

> Dragging the zip/folder into Netlify Drop publishes static files only and does **not** build or deploy functions.
> Use Git-based deploys or `npx netlify deploy --build --prod`.

## Run locally
```
npm install
cp .env.example .env     # add your GEMINI_API_KEY
npm run dev:netlify      # runs Vite + the functions together
```

## API routes (Netlify Functions)
- `POST /api/evaluate-speech`
- `POST /api/generate-cue-card`
- `POST /api/evaluate-followup`
