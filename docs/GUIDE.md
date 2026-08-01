# Style Glow AI - Setup & Deployment Guide

This guide explains how to set up the project locally, configure the Cloudflare Pages environment, configure the D1 database, and deploy the application.

## 🚀 Cloudflare Pages Setup

1. **Deploy to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
   - Create a new Pages project by linking your GitHub repository (`style-glow-ai`).
   - Set the build configuration:
     - **Framework preset**: `Vite`
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`

2. **Add Environment Variables**:
   In your Pages project, go to **Settings** -> **Environment Variables** (or **Configuration** -> **Environment Variables** depending on dashboard version) and add these under **Production** and **Preview**:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for uploads.
   - `CLOUDINARY_UPLOAD_PRESET`: Cloudinary upload preset.
   - `PRIMARY_DOMAIN`: The primary production domain.
   - `LOCALHOST`: `true` to allow requests from local host.

---

## 🗄️ Cloudflare D1 Database Integration

1. **Create a D1 Database**:
   ```bash
   npx wrangler d1 create style-glow-db
   ```

2. **Initialize Schema**:
   Run the migration using the provided `docs/DATABASE.sql` schema file:
   - For local development:
     ```bash
     npx wrangler d1 execute style-glow-db --local --file=docs/DATABASE.sql
     ```
   - For production:
     ```bash
     npx wrangler d1 execute style-glow-db --remote --file=docs/DATABASE.sql
     ```

3. **Bind D1 to your Pages Project**:
   - In the Cloudflare Pages dashboard under **Settings** -> **Functions** -> **D1 database bindings**.
   - Add a binding named `DB` and link it to your `style-glow-db` database.

---

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Run dev server**:
   - Frontend only:
     ```bash
     npm run dev
     ```
   - Frontend + Functions (Wrangler emulation):
     ```bash
     npm run dev:wrangler
     ```
