# 🔥 Firebase Setup Checklist

## ✅ Current Status
Your app's Firebase configuration is **working correctly**!

**Verified:**
- ✅ Firebase credentials configured
- ✅ Firebase initializing successfully
- ✅ Firestore service connected
- ✅ Auth service connected
- ✅ "Sign in with Google" button showing

## 📋 Required Steps in Firebase Console

### 🔐 Step 1: Enable Google Authentication

**Priority: HIGH** - Without this, sign-in won't work!

1. Go to: https://console.firebase.google.com/project/informal-talk/authentication/providers
2. Click on **Google** in the Sign-in providers list
3. Toggle **Enable** to ON
4. Add your **support email** (required by Google)
5. Click **Save**

**How to verify:** Try clicking "Sign in with Google" on your app

---

### 🗄️ Step 2: Create Firestore Database

**Priority: HIGH** - Without this, progress won't save!

1. Go to: https://console.firebase.google.com/project/informal-talk/firestore
2. Click **Create database**
3. Select **Start in test mode** (we'll secure it next)
4. Choose region: **us-central** (or closest to your users)
5. Click **Enable**

**How to verify:** Database should show "Cloud Firestore" active

---

### 🔒 Step 3: Set Firestore Security Rules

**Priority: HIGH** - Protects your data!

1. Go to: https://console.firebase.google.com/project/informal-talk/firestore/rules
2. Replace the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Progress collection - users can only read/write their own progress
    match /progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

**What this does:**
- ✅ Users can only access their own progress data
- ✅ Must be signed in to read/write
- ✅ No one can access other users' data
- ✅ All other collections are protected

---

### 🌐 Step 4: Add Authorized Domains

**Priority: MEDIUM** - Needed for deployed app

1. Go to: https://console.firebase.google.com/project/informal-talk/authentication/settings
2. Scroll to **Authorized domains**
3. Make sure these are added:
   - ✅ `localhost` (should be there already)
   - ✅ Add: `emergentagent.com`
   - ✅ Add: `preview.emergentagent.com`
   - ✅ Add your custom domain if you have one

**Why:** Google sign-in only works on authorized domains

---

### 🧪 Step 5: Test Everything

#### Test 1: Authentication
1. Open your app: https://e2d15393-e3e4-4022-ba60-c4035a3f3d0e.preview.emergentagent.com
2. Click **"Sign in with Google"**
3. Select your Google account
4. Should see: "Welcome, [Your Name]!"

**Expected result:** Three section buttons appear

#### Test 2: Progress Saving
1. After signing in, click **"02. Practicing"**
2. Complete a dialogue (click correct answers)
3. Go to Firebase Console → Firestore Data
4. Look for collection `progress` → document with your User ID
5. Should see: `completed: [dialogue_id]`

**Expected result:** Your progress is saved!

#### Test 3: Progress Loading
1. Refresh the page
2. Sign in again
3. Go to "02. Practicing"
4. Completed dialogues should have ✓ checkmark

**Expected result:** Your progress persists across sessions!

---

## 🎯 Quick Links

| Resource | Link |
|----------|------|
| **Firebase Dashboard** | https://console.firebase.google.com/project/informal-talk |
| **Authentication** | https://console.firebase.google.com/project/informal-talk/authentication/providers |
| **Firestore Database** | https://console.firebase.google.com/project/informal-talk/firestore |
| **Security Rules** | https://console.firebase.google.com/project/informal-talk/firestore/rules |
| **Authorized Domains** | https://console.firebase.google.com/project/informal-talk/authentication/settings |
| **Your App** | https://e2d15393-e3e4-4022-ba60-c4035a3f3d0e.preview.emergentagent.com |

---

## 🐛 Troubleshooting

### Problem: "Sign in with Google" doesn't work

**Possible causes:**
1. Google provider not enabled → Do Step 1
2. Domain not authorized → Do Step 4
3. Browser blocking popups → Allow popups for this site

**Check:** Open browser console (F12) and look for red error messages

---

### Problem: Progress not saving

**Possible causes:**
1. Firestore not created → Do Step 2
2. Security rules blocking → Do Step 3
3. Not signed in → Make sure you're logged in

**Check:** 
- Go to Firestore console and look for `progress` collection
- Check browser console for "permission denied" errors

---

### Problem: "Firebase Not Configured" warning

**This should NOT happen** as your config is correct. But if you see it:
1. Check `/app/frontend/src/firebaseConfig.ts` has correct credentials
2. Restart frontend: `sudo supervisorctl restart frontend`

---

## 📊 Understanding Your Firebase Usage

### Free Tier Limits (Spark Plan)
- **Authentication:** 50,000 monthly active users ✅ More than enough
- **Firestore:** 
  - 50,000 reads/day ✅
  - 20,000 writes/day ✅
  - 1 GB storage ✅

### What Your App Uses:
- **Per user sign-in:** 1 read (checking auth state)
- **Per dialogue completion:** 1 write (saving progress)
- **Per page load:** 1 read (loading progress)

**Estimate:** For 100 daily active users = ~300 reads + 200 writes per day
**Status:** Well within free tier limits! 🎉

---

## ✨ After Setup

Once you complete steps 1-4:

1. **Test thoroughly** (Step 5)
2. Your app will:
   - ✅ Allow Google sign-in
   - ✅ Save user progress
   - ✅ Load progress on return
   - ✅ Protect user data

3. **Monitor usage:**
   - Go to Firebase Console → Usage tab
   - Check Authentication → Users to see who signed in
   - Check Firestore → Data to see saved progress

---

## 🆘 Need Help?

If you run into issues:

1. **Check console logs:**
   - Open your app
   - Press F12
   - Go to Console tab
   - Look for red errors

2. **Check Firebase Console:**
   - Go to each service (Auth, Firestore)
   - Look for error messages

3. **Share the error with me and I'll help you fix it!**

---

Good luck! Let me know when you've completed these steps and we can test together! 🚀
