# Dual AI System Setup Guide

## 🎯 Overview

Your app now has **automatic fallback** between Gemini and Hugging Face:

- **Primary**: Google Gemini (fast, smart editing)
- **Backup**: Hugging Face Stable Diffusion (free, unlimited)

If Gemini fails or times out (15 seconds), the system **automatically switches** to Hugging Face and notifies the user.

---

## 🚀 Quick Setup

### 1. Add Both API Keys to `.env`

```bash
# Google Gemini (Primary)
API_KEY=AIzaSyApdnUhEyhIcCpjoFOpHaIUPe5SbHbbcss

# Hugging Face (Backup)
HF_API_KEY=hf_your_token_here

# Cloudinary (Storage)
CLOUDINARY_CLOUD_NAME=dxek9g0wn
CLOUDINARY_UPLOAD_PRESET=style_glow_upload
```

### 2. Update `App.tsx`

Replace the import at the top:

```typescript
// OLD:
import { analyzeImage, editImageWithAI } from "./services/geminiService";

// NEW:
import { analyzeImage, editImageWithAI } from "./services/aiService";
```

### 3. Add Notification Handler

Add this to your `App.tsx` component:

```typescript
const [notification, setNotification] = useState<{
  message: string;
  type: "info" | "warning" | "error";
} | null>(null);

const handleNotification = (
  message: string,
  type: "info" | "warning" | "error"
) => {
  setNotification({ message, type });

  // Auto-dismiss after 5 seconds
  setTimeout(() => setNotification(null), 5000);
};
```

### 4. Update Your API Calls

```typescript
// For image analysis
const analysis = await analyzeImage(imageBase64, handleNotification);

// For image editing
const edited = await editImageWithAI(
  originalImage,
  editState,
  handleNotification
);
```

### 5. Add Notification UI

Add this component to display notifications:

```tsx
{
  notification && (
    <div
      className={`
    fixed top-20 left-1/2 transform -translate-x-1/2 
    px-6 py-3 rounded-lg shadow-lg z-50 
    animate-in slide-in-from-top duration-300
    ${
      notification.type === "error"
        ? "bg-red-500"
        : notification.type === "warning"
        ? "bg-amber-500"
        : "bg-blue-500"
    }
    text-white font-medium
  `}
    >
      {notification.message}
    </div>
  );
}
```

---

## 🔄 How the Fallback Works

### Automatic Flow

```
User clicks "Generate"
        ↓
Try Gemini (15 second timeout)
        ↓
   Success? ────→ Return result ✅
        ↓ No
Show alert: "Switching to backup model..."
        ↓
Try Hugging Face (60 second timeout)
        ↓
   Success? ────→ Return result ✅
        ↓ No
Show error: "Please try again"
```

### User Experience

1. **Gemini works** (90% of time):

   - Fast response (2-5 seconds)
   - No notification shown
   - User sees edited image

2. **Gemini slow/fails** (10% of time):

   - After 15 seconds: "⏱️ Switching to backup model..."
   - Switches to Hugging Face automatically
   - After success: "✅ Successfully switched to backup AI"
   - User sees edited image (may look different)

3. **Both fail** (rare):
   - "❌ Image generation failed. Please try again."
   - User can retry

---

## ⚙️ Configuration

### Timeout Settings

Edit `services/aiService.ts`:

```typescript
// Adjust these values based on your needs
const GEMINI_TIMEOUT = 15000; // 15 seconds (default)
const HF_TIMEOUT = 60000; // 60 seconds (default)
```

**Recommendations:**

- **Fast internet**: 10s for Gemini, 30s for HF
- **Slow internet**: 20s for Gemini, 90s for HF
- **Production**: 15s for Gemini, 60s for HF ✅

---

## 📊 Comparison

| Feature            | Gemini           | Hugging Face          |
| ------------------ | ---------------- | --------------------- |
| **Speed**          | ⚡ 2-5 seconds   | 🐌 20-60 seconds      |
| **Quality**        | 🎨 Smart editing | 🎨 New generation     |
| **Free Tier**      | 25/month         | ~1000/hour            |
| **Preserves Face** | ✅ Yes           | ⚠️ No (generates new) |
| **Reliability**    | 95%              | 90%                   |

---

## 🎨 Advanced: Choose Editing Strategy

### Option 1: Smart Fallback (Recommended)

```typescript
import { editImageWithAI } from "./services/aiService";

// Automatically tries Gemini → HF
const result = await editImageWithAI(image, edits, handleNotification);
```

### Option 2: Preserve Original Better

```typescript
import { editImageAdvanced } from "./services/aiService";

// Uses img2img for HF fallback (better preservation)
const result = await editImageAdvanced(image, edits, handleNotification);
```

### Option 3: Manual Control

```typescript
import { analyzeImage as geminiAnalyze } from "./services/geminiService";
import { editImageWithHF } from "./services/huggingFaceService";

try {
  const result = await geminiAnalyze(image);
} catch (error) {
  // You control when to switch
  const result = await editImageWithHF(image, edits);
}
```

---

## 🧪 Testing the Fallback

### Test Scenario 1: Normal Operation

```bash
1. npm run dev
2. Upload image
3. Add edits
4. Click "Generate"
5. Should complete in 2-5 seconds (Gemini)
```

### Test Scenario 2: Force Fallback

```bash
1. Temporarily remove API_KEY from .env
2. Upload image
3. Add edits
4. Click "Generate"
5. Should show "Switching to backup model..."
6. Should complete in 20-60 seconds (HF)
```

### Test Scenario 3: Both Fail

```bash
1. Remove both API_KEY and HF_API_KEY
2. Upload image
3. Should show error message
```

---

## 🐛 Troubleshooting

### "Switching to backup model" appears too often

**Cause**: Gemini timeout too short or API quota exhausted

**Fix**:

```typescript
// Increase timeout in aiService.ts
const GEMINI_TIMEOUT = 20000; // 20 seconds instead of 15
```

### Backup model generates completely different images

**Cause**: Stable Diffusion creates new images, doesn't edit

**Fix**: Use `editImageAdvanced` instead:

```typescript
import { editImageAdvanced } from "./services/aiService";
const result = await editImageAdvanced(image, edits, handleNotification);
```

### Both models failing frequently

**Cause**: Network issues or API keys invalid

**Fix**:

1. Check internet connection
2. Verify both API keys in `.env`
3. Check API quotas:
   - Gemini: [https://aistudio.google.com](https://aistudio.google.com)
   - HF: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

---

## 📈 Monitoring

### Check AI Availability

Add this to your app for health monitoring:

```typescript
import { checkAIAvailability } from "./services/aiService";

useEffect(() => {
  const checkHealth = async () => {
    const status = await checkAIAvailability();
    console.log("AI Status:", status);
    // { gemini: true, huggingface: true }
  };

  checkHealth();
}, []);
```

### Log Fallback Events

The system automatically logs to console:

```
✅ Success: No logs (Gemini worked)
⚠️ Warning: "Gemini analysis failed, attempting fallback"
❌ Error: "Both Gemini and HF analysis failed"
```

---

## 🚀 Production Deployment

### Vercel Environment Variables

Add both keys:

1. **Gemini**: `API_KEY` = `AIzaSy...`
2. **Hugging Face**: `HF_API_KEY` = `hf_...`

### Recommended Settings

```typescript
// Production config in aiService.ts
const GEMINI_TIMEOUT = 15000; // 15s
const HF_TIMEOUT = 60000; // 60s

// Enable user notifications
const result = await editImageWithAI(
  image,
  edits,
  handleNotification // Always pass this in production
);
```

---

## 💡 Best Practices

### 1. Always Pass Notification Callback

```typescript
// ✅ Good
await editImageWithAI(image, edits, handleNotification);

// ❌ Bad (user won't know about fallback)
await editImageWithAI(image, edits);
```

### 2. Show Loading States

```typescript
const [isGenerating, setIsGenerating] = useState(false);
const [status, setStatus] = useState("");

const handleNotification = (message, type) => {
  setStatus(message);
  // ... show notification
};

// In UI:
{
  isGenerating && <div>{status || "Generating..."}</div>;
}
```

### 3. Handle Errors Gracefully

```typescript
try {
  const result = await editImageWithAI(image, edits, handleNotification);
  setEditedImage(result);
} catch (error) {
  alert("Could not generate image. Please try again.");
}
```

---

## 🎯 Summary

✅ **Setup**: Add both API keys to `.env`

✅ **Import**: Use `import { ... } from './services/aiService'`

✅ **Notifications**: Pass `handleNotification` callback

✅ **Testing**: Test both success and fallback scenarios

✅ **Deploy**: Add both keys to Vercel environment variables

---

**🎉 You now have a robust dual-AI system with automatic fallback!**
