# Changelog v1.3

## [Released] - 2025-12-01

### 🚀 Features & Enhancements

#### ⚡ Performance & Stability
- **Image Compression**: Implemented client-side image compression (to ~1024x1024, 80% quality) before Cloudinary upload and AI analysis, drastically reducing payload size (~70-90% reduction) and upload times.
- **Timeout Protection**: Added 30s timeout for uploads and 60s timeout for AI analysis to prevent application hangs.
- **Performance Logging**: Added console logging for upload/analysis duration and token usage.

#### 🧠 AI & Prompt Engineering
- **Model Upgrade**: Switched to `gemini-2.5-flash` for improved speed and response quality.
- **Frontend Prompt Generation**: Moved prompt construction from backend to frontend to enable dynamic updates without server redeployment.
- **Enhanced Wellness Advisor**:
    - Restricted remedies to **Skin Care Only** (removed hair/digestion suggestions).
    - Implemented **Issue-Based Remedies** (e.g., "Acne Control", "Glow Boost") based on visual diagnosis.
    - Added **Category Rotation** (Ayurvedic, Hydration, Detox, etc.) to ensure variety across sessions.
    - Enforced strict rules against ingredient repetition.
- **Prompt Optimization**: Structured the prompt to return strict JSON with rich, specific details for Summary, Suggestions, Detailed Analysis, Recapture, and Emotional Perception.
- **Creativity Boost**: Increased AI temperature to 1.0 and topP to 0.95 for more diverse and creative outputs.

#### 🎨 Frontend UI/UX
- **Card Grid Layout**: Converted the "Detailed Analysis" section from collapsible accordions to a modern card grid layout for better readability.
- **Visual Improvements**: Updated icons and styling for a cleaner look.
- **Sticky Actions**: Added a sticky "Retake" button footer for easier navigation.

### 🐛 Bug Fixes
- **CORS Resolution**: Fixed Cross-Origin Resource Sharing (CORS) issues in the Vercel API by correcting header order and handling OPTIONS preflight requests.
- **Cache Control**: Added `cache: 'no-store'` to configuration fetching to prevent stale CORS headers.
- **Deployment Config**: Fixed `vite.config.ts` base path logic to correctly handle GitHub Pages deployment (`/style-glow-ai/`) vs local development.
- **Linting**: Fixed TypeScript lint errors related to unused variables and state.

### ⚙️ Infrastructure
- **Deployment Scripts**: Updated `package.json` scripts to set `VITE_GITHUB_PAGES=true` during build.
