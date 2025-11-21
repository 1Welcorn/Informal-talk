# 🔧 Fix: Unauthorized Domain Error

## What's Happening?

You're seeing this error:
```
auth/unauthorized-domain: This domain is not authorized for OAuth operations
```

**Good news:** Firebase is working! It just needs to know this domain is safe for sign-in.

**Your domain:** `app-checkout-1.preview.emergentagent.com`

---

## 🎯 How to Fix (2 minutes)

### Step 1: Go to Authorized Domains

Click this link (opens directly to the right page):
👉 https://console.firebase.google.com/project/informal-talk/authentication/settings

Or manually:
1. Go to Firebase Console
2. Select project: **informal-talk**
3. Click **Authentication** in left sidebar
4. Click **Settings** tab at the top
5. Scroll to **Authorized domains** section

### Step 2: Add Your Domain

1. Click **Add domain** button
2. Copy and paste this exactly:
   ```
   app-checkout-1.preview.emergentagent.com
   ```
3. Click **Add**

### Step 3: Verify

You should now see in the list:
- ✅ localhost
- ✅ informal-talk.firebaseapp.com
- ✅ app-checkout-1.preview.emergentagent.com (the one you just added)

---

## ✅ Test It Works

1. Go back to your app: https://app-checkout-1.preview.emergentagent.com
2. Refresh the page (Ctrl+R or Cmd+R)
3. Click "Sign in with Google"
4. Google popup should appear
5. Sign in with your account
6. Should see "Welcome, [Your Name]!" ✅

---

## 📝 Note About Domains

Firebase requires you to whitelist every domain where users can sign in from. This includes:

**Already authorized (by default):**
- `localhost` - for local development

**You need to add:**
- `app-checkout-1.preview.emergentagent.com` - your preview URL
- Any custom domain you deploy to later

**Optional to add now:**
- `*.emergentagent.com` - all Emergent subdomains
- `*.preview.emergentagent.com` - all preview URLs

---

## 🐛 Still Having Issues?

If after adding the domain, sign-in still doesn't work:

1. **Clear browser cache:**
   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear cached images and files
   - Close and reopen browser

2. **Try incognito/private mode:**
   - Open incognito window
   - Go to your app
   - Try signing in

3. **Check Google provider is enabled:**
   - Go to: https://console.firebase.google.com/project/informal-talk/authentication/providers
   - Google should show "Enabled" in green
   - If not, click on Google and enable it

4. **Check for popup blockers:**
   - Allow popups for your domain
   - Look for blocked popup icon in address bar

---

## 📊 What You Should See After Fix

### In Firebase Console:
✅ Authorized domains list includes your domain
✅ Google provider is enabled

### In Your App:
✅ "Sign in with Google" button works
✅ Google popup appears
✅ Can select account and sign in
✅ See welcome message with your name

### In Browser Console (F12):
✅ No red "unauthorized-domain" errors
✅ See successful Firebase initialization logs
✅ See user info after sign-in

---

That's it! Add the domain and you're good to go! 🚀
