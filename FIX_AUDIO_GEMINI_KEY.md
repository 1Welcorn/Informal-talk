# 🔊 Fix Audio: Get Gemini API Key

## Why Audio Isn't Working

Your app uses **Google's Gemini API** for text-to-speech (audio pronunciation of English phrases). The API key is currently set to `PLACEHOLDER_API_KEY`, which is why audio isn't working.

---

## 🎯 Solution: Get a Free Gemini API Key

### Step 1: Go to Google AI Studio

**Click this link:** https://aistudio.google.com/app/apikey

### Step 2: Sign In

Sign in with your Google account (the same one you use for Firebase, or any Google account)

### Step 3: Create API Key

1. You'll see the API Key management page
2. Click **"Create API Key"** button
3. Select a project:
   - You can use "informal-talk" (your existing Firebase project)
   - Or create a new project
4. Click **"Create API key in existing project"** or **"Create API key in new project"**
5. Your API key will be generated!
6. **Copy the API key** (looks like: `AIzaSy...`)

### Step 4: Important - Keep It Safe

⚠️ **Don't share this key publicly!** It's linked to your Google account.

---

## 📝 Step 5: Add Key to Your App

### Option A: Tell Me the Key (I'll Add It)

Share the Gemini API key with me, and I'll add it to your app configuration.

### Option B: Add It Yourself

1. Open `/app/frontend/.env.local`
2. Replace:
   ```
   REACT_APP_GEMINI_API_KEY=PLACEHOLDER_API_KEY
   ```
   With:
   ```
   REACT_APP_GEMINI_API_KEY=your-actual-api-key-here
   ```
3. Save the file
4. Restart frontend:
   ```bash
   sudo supervisorctl restart frontend
   ```

---

## 🎯 Alternative: Use Emergent LLM Key

If you don't want to create a Gemini API key, you can use the **Emergent Universal Key**:

### What is Emergent Universal Key?

- **Built-in feature** for Emergent users
- Works with OpenAI, Anthropic (Claude), and **Google Gemini**
- No need to manage your own API keys
- Pay-as-you-go billing through Emergent

### How to Use It:

Tell me you want to use the Emergent Universal Key, and I'll:
1. Fetch the key from the environment
2. Update your app to use it
3. Configure it properly

**Note:** The Universal Key works with:
- ✅ Text generation (GPT, Claude, Gemini)
- ✅ **Gemini text-to-speech (what your app needs!)**
- ❌ Not for other services (Stripe, SendGrid, etc.)

---

## 🧪 How to Test Audio After Setup

### Test 1: Understanding Section

1. Sign in to your app
2. Click **"01. Understanding"**
3. Click the **speaker icon** (🔊) next to any phrase
4. Should hear audio pronunciation!

### Test 2: Dialogue Practice

1. Click **"02. Practicing"**
2. Click **"Cenários de Prática"**
3. Select a dialogue
4. Click correct answers
5. Should hear audio when you select correct words!

### Test 3: Check Console

Open browser console (F12):
- Should **NOT** see errors about API key
- Should **NOT** see "Failed to generate audio" errors

---

## 💰 Gemini API Pricing (Free Tier)

**Good news:** Gemini has a generous free tier!

### Free Tier:
- **15 requests per minute** (RPM)
- **1 million tokens per day**
- **1,500 requests per day**

### For Your App:
- Each audio generation ≈ 1 request
- Typical user session ≈ 10-20 audio requests
- **Free tier is MORE than enough for development and moderate use!**

### If You Exceed Free Tier:
- Gemini API is very affordable
- Text-to-speech: ~$0.001 per request
- For 1,000 users/day ≈ $10-20/month

---

## 🔍 Common Issues After Adding Key

### Issue 1: Audio Still Not Working

**Check:**
1. Did you restart the frontend? (`sudo supervisorctl restart frontend`)
2. Is the API key correct? (no extra spaces, complete key)
3. Check browser console for errors

**Solution:**
- Hard refresh the page (Ctrl+Shift+R)
- Try in incognito mode
- Check console logs for specific errors

### Issue 2: "API key not valid" Error

**Check:**
1. Did you copy the entire key?
2. Is the key enabled? (Check Google AI Studio)
3. Did you select the right project?

**Solution:**
- Regenerate the key in Google AI Studio
- Make sure Gemini API is enabled for your project

### Issue 3: "Quota exceeded" Error

**Check:**
- Are you hitting the rate limit? (15 req/min)

**Solution:**
- Wait a minute and try again
- Consider using Emergent Universal Key for higher limits

---

## 📊 Which Option to Choose?

### Option 1: Free Gemini API Key
**Best for:**
- ✅ You want full control
- ✅ Personal projects
- ✅ Low to moderate traffic
- ✅ Free tier is enough

**Pros:**
- Completely free (with generous limits)
- Direct access to Google AI
- Full control over billing

**Cons:**
- Need to manage your own key
- Need to monitor usage
- Limited to free tier quotas

---

### Option 2: Emergent Universal Key
**Best for:**
- ✅ Quick setup (no API key needed)
- ✅ Production apps
- ✅ Higher traffic expected
- ✅ Don't want to manage keys

**Pros:**
- No API key management
- Works immediately
- Higher rate limits
- Unified billing with Emergent

**Cons:**
- Costs money (pay-as-you-go through Emergent)
- Less control over individual API settings

---

## 🎯 Quick Decision

**For your learning app, I recommend:**

1. **Start with Free Gemini API Key**
   - Perfect for development and testing
   - Free tier is generous enough
   - Takes 2 minutes to set up

2. **Upgrade to Emergent Key later** (if needed)
   - When you launch publicly
   - When you need higher limits
   - When you want simplified billing

---

## 🚀 Next Steps

**Choose one:**

### Path A: I'll Get a Gemini API Key
1. Go to: https://aistudio.google.com/app/apikey
2. Create API key
3. Share with me (or add it yourself)
4. I'll configure your app

### Path B: Use Emergent Universal Key
1. Tell me you want to use Emergent Universal Key
2. I'll fetch it from environment
3. I'll update your app configuration
4. Audio will work immediately

---

Which option do you prefer? 🎯
