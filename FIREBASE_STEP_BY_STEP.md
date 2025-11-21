# 🔥 Firebase Setup - Step by Step Guide

## Your Mission: Enable 2 Things in Firebase Console

### ✅ What's Already Done
- Your Firebase project exists: **informal-talk**
- Your app has the correct configuration
- Firebase is connecting successfully
- Your app is ready to use Google sign-in and save progress

### 🎯 What You Need to Do
Just **2 main tasks** in the Firebase Console!

---

## 📍 TASK 1: Enable Google Sign-In (5 minutes)

### Why?
So users can click "Sign in with Google" and it actually works!

### Steps:

**1. Open Firebase Console**
- Go to: https://console.firebase.google.com/
- Click on your project: **informal-talk**

**2. Navigate to Authentication**
- In the left sidebar, click **Authentication**
- Click **Sign-in method** tab (at the top)

**3. Enable Google Provider**
- You'll see a list of providers (Google, Email/Password, etc.)
- Find **Google** and click on it
- Click the **Enable** toggle (should turn blue/on)
- You'll see two fields:
  - **Support email:** Select your email from dropdown
  - **Project public-facing name:** Should show "informal-talk" (leave as is)
- Click **Save** button at the bottom

**4. Verify it worked**
- Google provider should now show "Enabled" in green
- That's it! ✅

### Test It:
- Go to your app
- Click "Sign in with Google"
- Google popup should appear
- Select your account
- You should be signed in!

---

## 📍 TASK 2: Set Up Firestore Database (10 minutes)

### Why?
So the app can save user progress (which dialogues they completed)!

### Part A: Create Database (5 min)

**1. Navigate to Firestore**
- Still in Firebase Console
- In left sidebar, click **Firestore Database**
- (If you see "Cloud Firestore", skip to Part B)

**2. Create Database**
- Click **Create database** button
- A popup appears

**3. Choose Mode**
- Select **Start in test mode** (we'll secure it next)
- Click **Next**

**4. Choose Location**
- Select **us-central1** (or closest to you)
- Important: Can't change this later!
- Click **Enable**

**5. Wait**
- Database is being created (takes 1-2 minutes)
- You'll see "Provisioning Cloud Firestore..."
- When done, you'll see the Data tab

### Part B: Set Security Rules (5 min)

**Why?** Right now, ANYONE can read/write your database. We need to lock it down!

**1. Go to Rules Tab**
- Click **Rules** tab (next to Data, Indexes, Usage)
- You'll see a code editor with some default rules

**2. Replace ALL the code with this:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write only their own progress
    match /progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Block everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**3. Publish Rules**
- Click **Publish** button (top right)
- Rules are now active! ✅

**What these rules do:**
- ✅ Users MUST be signed in to access the database
- ✅ Users can ONLY see their own progress data
- ✅ Users CANNOT see other users' data
- ✅ All other collections are protected

### Test It:
1. Sign in to your app
2. Go to "02. Practicing"
3. Complete a dialogue
4. Go back to Firebase Console → Firestore → Data tab
5. You should see:
   - Collection: `progress`
   - Document: (your user ID - random string)
   - Field: `completed: [1]` (or whichever dialogue you did)

---

## 🎉 You're Done!

After completing both tasks:
- ✅ Users can sign in with Google
- ✅ Progress is saved automatically
- ✅ Progress loads when they come back
- ✅ Data is secure (users can't see each other's progress)

---

## 🧪 Full Test Checklist

Run through this to make sure everything works:

### Test 1: Sign In
- [ ] Open your app
- [ ] Click "Sign in with Google"
- [ ] Google popup appears
- [ ] Select account and sign in
- [ ] See "Welcome, [Your Name]!"
- [ ] See three section buttons

### Test 2: Save Progress
- [ ] Click "02. Practicing"
- [ ] Click "Cenários de Prática"
- [ ] Complete a dialogue (pick correct answers)
- [ ] See "Excelente trabalho!" (Excellent work!)
- [ ] Dialogue should have green checkmark ✓

### Test 3: Verify in Firestore
- [ ] Go to Firebase Console → Firestore → Data
- [ ] See `progress` collection
- [ ] See your user ID as a document
- [ ] See `completed` field with array: `[1]` or similar

### Test 4: Progress Persists
- [ ] Refresh your app page
- [ ] Sign in again if needed
- [ ] Go to "02. Practicing" → "Cenários de Prática"
- [ ] Previously completed dialogue has ✓ checkmark
- [ ] Your progress was saved! 🎉

---

## 📱 Bonus: Add Your Domain (Optional)

If your app is deployed on a custom domain:

1. Go to: https://console.firebase.google.com/project/informal-talk/authentication/settings
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Enter your domain (e.g., `myapp.com`)
5. Click **Add**

For Emergent preview, these should already work:
- ✅ `emergentagent.com`
- ✅ `*.preview.emergentagent.com`

---

## 🆘 Common Issues

### Issue: "Auth domain not authorized"
**Solution:** Add your domain in Authentication → Settings → Authorized domains

### Issue: "Permission denied" when saving
**Solution:** Make sure you published the Firestore security rules (Part B above)

### Issue: Google popup doesn't appear
**Solution:** 
- Check that Google provider is enabled (Task 1)
- Allow popups for this site in your browser
- Try in an incognito window

### Issue: Can't see data in Firestore
**Solution:**
- Make sure you're signed in to the app
- Complete a dialogue to trigger a save
- Refresh the Firestore console

---

## 📊 Check Your Setup Status

Quick way to verify:

### In Firebase Console:

**Authentication:**
- Go to: https://console.firebase.google.com/project/informal-talk/authentication/providers
- Google should show "Enabled" ✅

**Firestore:**
- Go to: https://console.firebase.google.com/project/informal-talk/firestore
- Should see "Cloud Firestore" (not "Get started") ✅
- Rules tab should have your custom rules ✅

### In Your App:

**Home Page:**
- See "Sign in with Google" button ✅
- NO yellow "Firebase not configured" warning ✅

**After Sign In:**
- See "Welcome, [Name]!" ✅
- See three section buttons ✅

---

## 🎯 Summary

You need to do **2 things** in Firebase Console:

1. **Enable Google Sign-In** (5 min)
   - Authentication → Sign-in method → Google → Enable

2. **Set Up Firestore** (10 min)
   - Create database in test mode
   - Add security rules

**Total time:** ~15 minutes
**Difficulty:** Easy - just follow the steps!

Once done, your app will have:
- ✅ Working Google authentication
- ✅ Progress saving and loading
- ✅ Secure user data

---

Let me know when you're done and I'll help you test! 🚀
