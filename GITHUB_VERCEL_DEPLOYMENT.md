# 🚀 Deploy to Vercel from GitHub - Complete Guide

## Issue: App Works Locally but Not on Vercel

Your app works perfectly on Emergent (localhost) but fails when deployed to Vercel because of configuration differences.

---

## 🎯 Root Causes Identified

### 1. **Backend URL Issue** ⚠️
**Problem:** `.env` has hardcoded Emergent backend URL:
```
REACT_APP_BACKEND_URL=https://app-checkout-1.preview.emergentagent.com
```

**Solution:** This needs to be set in Vercel's environment variables, NOT in the `.env` file.

### 2. **Environment Variables Not Set in Vercel** ⚠️
Your `.env.local` with Gemini API key won't be deployed (it's in `.gitignore`).

---

## ✅ Step-by-Step Deployment Guide

### Step 1: Clean Up .env Files

**Update `/app/frontend/.env`:**

Remove the hardcoded backend URL. The file should look like this:

```env
# Local development settings only
WDS_SOCKET_PORT=443
REACT_APP_ENABLE_VISUAL_EDITS=false
ENABLE_HEALTH_CHECK=false

# NOTE: REACT_APP_BACKEND_URL and REACT_APP_GEMINI_API_KEY 
# should be set in Vercel Dashboard, not here!
```

**Why?** 
- `.env` gets committed to Git
- Backend URL is different for Vercel deployment
- Environment variables should be set in Vercel Dashboard

---

### Step 2: Update .gitignore

Make sure these are in your `.gitignore`:

```
# Environment variables
.env.local
.env.production.local
.env.development.local
.env.test.local

# But .env CAN be committed (no secrets in it)
```

---

### Step 3: Deploy to Vercel

#### A. Connect GitHub to Vercel

1. **Go to:** https://vercel.com/new
2. **Click:** "Import Git Repository"
3. **Select:** Your GitHub repository `1Welcorn/Informal-talk`
4. **Click:** "Import"

#### B. Configure Project Settings

**Framework Preset:** Create React App

**Root Directory:** `frontend` ⚠️ **IMPORTANT!**
- Since your frontend is in the `frontend` folder, set this!
- Click "Edit" next to Root Directory
- Type: `frontend`

**Build Settings:**
- **Build Command:** `yarn build` (auto-detected)
- **Output Directory:** `build` (auto-detected)
- **Install Command:** `yarn install` (auto-detected)

---

### Step 4: Add Environment Variables in Vercel

**CRITICAL:** You must add these in Vercel Dashboard!

1. **In Vercel project settings**, go to: **Settings** → **Environment Variables**

2. **Add these variables:**

#### Variable 1: Backend URL
```
Name: REACT_APP_BACKEND_URL
Value: https://your-backend-url.com
Environment: Production, Preview, Development
```

**Options for backend:**
- **Option A:** If you have no backend, remove backend calls from code
- **Option B:** Deploy backend separately (Railway, Render, Fly.io)
- **Option C:** For testing, use: `http://localhost:8001` (won't work but app will load)

#### Variable 2: Gemini API Key
```
Name: REACT_APP_GEMINI_API_KEY
Value: AIzaSyADpG6s_jUPgZVHkrMZQ_Lq8I81WB8VrGc
Environment: Production, Preview, Development
```

3. **Click "Save"**

---

### Step 5: Deploy!

After adding environment variables:

1. **Click:** "Deploy" button in Vercel
2. **Wait** for build to complete (1-2 minutes)
3. **Visit** your deployment URL: `https://your-project.vercel.app`
4. **Should work!** ✅

---

## 🔍 What Happens During Deployment

```
1. Vercel pulls code from GitHub
   ↓
2. Vercel goes to /frontend directory (root directory setting)
   ↓
3. Vercel runs: yarn install
   ↓
4. Vercel loads environment variables from dashboard
   ↓
5. Vercel runs: yarn build
   ↓
6. Build creates /build folder with optimized files
   ↓
7. vercel.json tells Vercel to serve index.html for all routes
   ↓
8. Your app is live! ✅
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Module not found" during build

**Cause:** Missing dependency in `package.json`

**Solution:**
```bash
# On your local machine in /app/frontend:
yarn install
yarn build  # Test if it works
# If it works, commit package.json and push
```

---

### Issue 2: Blank white page after deployment

**Causes:**
1. Missing environment variables
2. JavaScript errors
3. Wrong root directory

**Debug steps:**
1. Open deployed site in browser
2. Press **F12** → **Console** tab
3. Look for red errors
4. Common errors:
   - `REACT_APP_BACKEND_URL is not defined` → Add to Vercel env vars
   - `Failed to load resource: 404` → Check root directory setting
   - `Unexpected token '<'` → Usually routing issue (check vercel.json)

---

### Issue 3: Firebase authentication not working

**Cause:** Vercel domain not authorized in Firebase

**Solution:**
1. Go to: https://console.firebase.google.com/project/informal-talk/authentication/settings
2. Add your Vercel domain to **Authorized domains**:
   - `your-project.vercel.app`
   - `your-project-*.vercel.app` (for preview deployments)
3. Save and try again

---

### Issue 4: Backend API calls failing (CORS errors)

**Cause:** Backend doesn't allow requests from Vercel domain

**Solution:**

If you have a backend, update CORS settings:

```python
# backend/server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-project.vercel.app",
        "https://*.vercel.app"  # For preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Issue 5: Environment variables not working

**Check:**
1. Are they prefixed with `REACT_APP_`? (Required for Create React App!)
2. Did you redeploy after adding them?
3. Did you select "Production" environment when adding?

**Solution:** 
- In Vercel → Settings → Environment Variables
- Make sure each variable is added to **ALL** environments:
  - ✅ Production
  - ✅ Preview
  - ✅ Development
- After adding/changing: **Redeploy** (Deployments → ... → Redeploy)

---

## 🧪 Testing Your Deployment

### Checklist:

1. **Homepage loads** ✅
   - Visit: `https://your-project.vercel.app`
   - Should see welcome screen

2. **Sign in works** ✅
   - Click "Sign in with Google"
   - Should open Google popup
   - Should sign in successfully

3. **Navigation works** ✅
   - Click through different sections
   - Should navigate without errors

4. **Refresh works** ✅
   - Navigate to a section
   - Press Ctrl+R (refresh)
   - Should stay on same section (not 404)

5. **Audio works** ✅
   - Go to practice section
   - Click speaker icons
   - Should hear audio (if Gemini key is set)

6. **Direct links work** ✅
   - Try: `https://your-project.vercel.app/section-2`
   - Should load that section directly

---

## 📦 What Gets Deployed

### Included (in build):
- ✅ All React components
- ✅ All JavaScript/TypeScript (compiled)
- ✅ All CSS styles
- ✅ Images and assets
- ✅ index.html
- ✅ vercel.json (routing config)
- ✅ Environment variables (from Vercel dashboard)

### NOT Included:
- ❌ .env.local (in .gitignore)
- ❌ node_modules (rebuilt on Vercel)
- ❌ .git folder
- ❌ Source TypeScript files (compiled to JS)

---

## 🎯 Quick Deploy Checklist

Before deploying, make sure:

- [ ] `vercel.json` exists in `/app/frontend/`
- [ ] Root directory set to `frontend` in Vercel
- [ ] Environment variables added in Vercel dashboard:
  - [ ] `REACT_APP_BACKEND_URL`
  - [ ] `REACT_APP_GEMINI_API_KEY`
- [ ] `.env` doesn't have hardcoded backend URL
- [ ] Firebase domain authorized (if using auth)
- [ ] Backend CORS configured (if using backend)
- [ ] Local build works: `yarn build` succeeds

---

## 🔐 Security Best Practices

### DO:
- ✅ Use Vercel environment variables for secrets
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use `REACT_APP_` prefix for env vars
- ✅ Set different URLs for production vs. development

### DON'T:
- ❌ Commit API keys to Git
- ❌ Hardcode URLs in code
- ❌ Use development URLs in production
- ❌ Expose sensitive data in client-side code

---

## 🚨 Emergency Rollback

If deployment breaks your app:

1. **Go to:** Vercel Dashboard → Deployments
2. **Find:** Previous working deployment
3. **Click:** ... menu → "Promote to Production"
4. **Done!** Old version is live again

---

## 📊 Monitoring After Deployment

### Check these regularly:

1. **Vercel Analytics** - See traffic and errors
2. **Vercel Logs** - Runtime logs and errors
3. **Browser Console** - Client-side errors
4. **Firebase Console** - Usage and errors

---

## ✨ Pro Tips

### Tip 1: Preview Deployments
Every Git branch gets its own preview URL on Vercel!
- Push to branch → Auto-deploys → Get preview link
- Test before merging to main

### Tip 2: Automatic Deployments
Connect GitHub → Every push auto-deploys
- Push to `main` → Production deployment
- Push to other branches → Preview deployment

### Tip 3: Custom Domains
- Add custom domain in Vercel settings
- Point DNS to Vercel
- Get SSL certificate automatically

### Tip 4: Build Speed
- Use `yarn.lock` (commit it!)
- Vercel caches node_modules
- Faster subsequent builds

---

## 🆘 Still Not Working?

If after following all steps it still doesn't work:

1. **Check Vercel build logs:**
   - Dashboard → Deployments → Click failed deployment
   - Look for error messages

2. **Check browser console:**
   - Open your deployed site
   - Press F12
   - Look for red errors

3. **Common error patterns:**
   - "Cannot find module" → Missing dependency
   - "Unexpected token" → Routing issue (check vercel.json)
   - "Network Error" → Backend issue (CORS or URL)
   - "Firebase: unauthorized domain" → Add domain to Firebase

4. **Share with me:**
   - Deployment URL
   - Error screenshots
   - Build logs (if failed)
   - Browser console errors

I'll help you debug! 🔍

---

## 🎉 Success!

Once deployed:
- Your app is live at: `https://your-project.vercel.app`
- Auto-deploys on every Git push
- Free SSL certificate
- CDN for fast loading worldwide
- Analytics included

**Congratulations on deploying your English learning app!** 🚀
