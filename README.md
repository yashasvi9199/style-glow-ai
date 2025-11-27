# Style Glow AI

A React application for personalized style and grooming advice using AI.

## Setup

1.  Install dependencies:
    \`\`\`bash
    npm install
    \`\`\`

2.  Run development server:
    \`\`\`bash
    npm run dev
    \`\`\`

## Configuration

This frontend connects to a separate backend API.
You can configure the API URL in your Vercel deployment settings using the environment variable:

- \`VITE_API_URL\`: URL of your deployed `style-glow-api` (e.g., `https://your-api-project.vercel.app/api/analyze`).
- If not set, it defaults to `/api/analyze`.

## Features

- Image upload and camera capture.
- AI analysis of style, grooming, and photography.
- Recapture suggestions.
