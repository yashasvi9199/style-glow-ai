# Hugging Face Quick Start

## 🚀 5-Minute Setup

### 1. Get API Key

```
1. Visit: https://huggingface.co
2. Sign up (use GitHub for fastest)
3. Profile → Settings → Access Tokens
4. Create new token (Read permission)
5. Copy token: hf_xxxxxxxxxxxxx
```

### 2. Add to .env

```bash
HF_API_KEY=hf_your_token_here
```

### 3. Update App.tsx

```typescript
// Replace line 2:
import { editImageWithHF } from "./services/huggingFaceService";

// Replace in your edit function:
const result = await editImageWithHF(originalImage, edits);
```

### 4. Test

```bash
npm run dev
```

---

## 📊 Key Differences

| Feature              | Gemini           | Hugging Face                 |
| -------------------- | ---------------- | ---------------------------- |
| **Image Analysis**   | ✅ Yes           | ❌ No (needs separate model) |
| **Image Generation** | ✅ Yes           | ✅ Yes                       |
| **Image Editing**    | ✅ Smart editing | ⚠️ Text-to-image only        |
| **Free Tier**        | 25/month         | ~1000/hour                   |
| **Speed**            | Fast             | Slower (cold start)          |
| **Cost**             | Quota limited    | Free (with limits)           |

---

## 💡 Recommended Approach

**Hybrid Setup** (Best of both):

```typescript
// Use Gemini for analysis (better at understanding images)
import { analyzeImage } from "./services/geminiService";

// Use HF for generation (free tier)
import { editImageWithHF } from "./services/huggingFaceService";
```

---

## ⚠️ Important Notes

1. **Stable Diffusion generates NEW images** - it doesn't edit existing ones
2. **First request takes 20-30 seconds** (model loading)
3. **For true editing**, use `img2imgEditHF` function
4. **Keep Gemini for analysis** until you set up a vision model

---

## 🔧 Quick Fixes

**"Model is loading"** → Wait 30 seconds, retry

**"Rate limit"** → Wait a few minutes

**"Different person in result"** → Use `img2imgEditHF` instead

---

## 📚 Full Guide

See `HUGGINGFACE_MIGRATION_GUIDE.md` for complete details.
