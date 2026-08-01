# Style Glow AI

AI-powered image analysis application that provides personalized styling, skin care, and photography advice.

## 🌟 Features

- **AI Image Analysis**: Get detailed feedback on lighting, composition, skin tones, and more
- **Personalized Recommendations**: Receive actionable suggestions for improvement
- **Recapture Tips**: Learn how to take better photos naturally
- **Emotional Analysis**: Understand how your expression is perceived
- **Skin Wellness Advisor**: Get gentle, non-medical skincare advice
- **Rate Limiting**: Built-in spam protection (3-minute cooldown)
- **Multi-Platform**: Web app + Android APK support

## 🚀 Live Demo

- **Web App**: [https://yashasvi9199.github.io/style-glow-ai](https://yashasvi9199.github.io/style-glow-ai)
- **API**: Deployed on Cloudflare Pages Functions (`/functions/api`)

## 📋 Prerequisites

- Node.js 18+ and npm
- Java 21 OpenJDK (for Android builds)
- Android SDK (for Android builds)
- Cloudflare Account (for Pages and D1)
- Google Gemini API key
- Cloudinary account

## 🛠️ Setup Instructions

### 1. Fork & Clone the Repository

```bash
git clone https://github.com/yashasvi9199/style-glow-ai.git
cd style-glow-ai
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Setup Backend API & Database (Cloudflare Pages)

1. Create a D1 Database:
   ```bash
   npx wrangler d1 create style-glow-db
   ```

2. Initialize D1 Schema:
   ```bash
   npx wrangler d1 execute style-glow-db --local --file=docs/DATABASE.sql
   npx wrangler d1 execute style-glow-db --remote --file=docs/DATABASE.sql
   ```

3. Add environment variables in your Cloudflare Pages dashboard project settings under Environment Variables:
   ```
   GEMINI_API_KEY=your_google_gemini_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
   PRIMARY_DOMAIN=your_primary_domain
   LOCALHOST=true
   ```

4. Bind D1 database under Cloudflare Pages project settings -> Functions -> D1 Database bindings as `DB` pointing to `style-glow-db`.

### 4. Configure Frontend

1. Create `.env.local` or `.dev.vars` for local wrangler development:
   ```env
   VITE_API_URL=/api/analyze
   ```

## 📱 Development

### Run Development Server (Frontend + Functions)

```bash
npm run dev:wrangler
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deployment

### Deploy to GitHub Pages

```bash
npm run deploy
```

This will:

1. Build the project
2. Deploy to `gh-pages` branch
3. Make it available at `https://YOUR_USERNAME.github.io/style-glow-ai`

**Important**: Update the `homepage` field in `package.json` with your GitHub username.

## 📱 Android APK Build

### Prerequisites

- Java 21 OpenJDK installed
- Android SDK installed
- Gradle configured

### Create Keystore (First Time Only)

```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias YOUR_ALIAS
```

Follow the prompts to enter:

- Keystore password
- Key password
- Your name, organization, etc.

### Configure Keystore

Create `android/keystore.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=style-glow-ai
storeFile=../my-release-key.jks
```

### Build APK

```bash
npm run android
```

Or manually:

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Install APK on Device

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Debug logs
```bash
adb devices
adb logcat -v threadtime > device-logs.txt
# Or filter by your app packageID
adb logcat --pid=$(adb shell pidof -s com.styleandglow.ai) -v threadtime > app-logs.txt
```

## 🔧 Available Scripts

### Frontend (`style-glow-ai`)

- `npm run dev` - Start Vite development server
- `npm run dev:wrangler` - Start Wrangler local emulation with functions
- `npm run build` - Compile TypeScript and Vite production bundle
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages
- `npm run android` - Build Android APK
- `npm run cap:sync` - Sync Capacitor

## 🏗️ Project Structure

```
style-glow-ai/
├── src/
│   └── domains/            # Feature and shared boundaries
│       ├── analysis/       # Core AI analysis feature
│       │   ├── components/
│       │   ├── services/
│       │   └── types/
│       └── shared/         # Generic utilities and widgets
│           ├── components/
│           ├── services/
│           ├── types/
│           └── utils/
├── functions/              # Cloudflare Pages Functions
│   └── api/                # API handlers (analyze, config, models)
├── docs/                   # Documentation files (GUIDE.md, DATABASE.sql)
├── android/                # Capacitor Android project
├── dist/                   # Production build
└── public/                 # Static assets
```

## 🔑 Environment Variables

### Cloudflare Pages Settings

| Variable                   | Description                                          |
| -------------------------- | ---------------------------------------------------- |
| `GEMINI_API_KEY`           | Google Gemini API key for AI analysis                |
| `CLOUDINARY_CLOUD_NAME`    | Cloudinary cloud name                                |
| `CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset                             |
| `PRIMARY_DOMAIN`           | Your primary domain (e.g., `yashasvi9199.github.io`) |
| `LOCALHOST`                | Set to `true` to allow localhost access              |

### Local Dev Settings (`.env.local` / `.dev.vars`)

| Variable       | Description                  |
| -------------- | ---------------------------- |
| `VITE_API_URL` | Cloudflare Pages endpoint URL (e.g., `/api/analyze`) |

## 🎨 Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- TailwindCSS
- Lucide React (icons)
- Capacitor (mobile)

### Backend

- Cloudflare Pages Functions
- Cloudflare D1 Database (SQLite)
- Google Generative AI (Gemini)
- Cloudinary (image storage)

## 🔒 Security Features

- Rate limiting (3-minute cooldown)
- CORS protection
- Domain whitelisting
- Secure image upload
- No sensitive data in frontend

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Known Issues

- Lucide React has peer dependency conflicts with React 19 (use `--legacy-peer-deps`)
- First-time Android builds may take 5-10 minutes

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ by Yashasvi
