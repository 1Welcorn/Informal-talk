# Firebase Setup Guide for Your App

## ✅ Current Status
Your app is configured with Firebase project: **informal-talk**

## Required Firebase Console Setup

### Step 1: Enable Google Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **informal-talk**
3. Navigate to: **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Click **Enable** toggle
6. Add your support email
7. Click **Save**

**Important:** Add authorized domains:
- `localhost` (for local development)
- `emergentagent.com` (for your deployed app)
- Your custom domain (if any)

### Step 2: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll add security rules later)
4. Select your preferred location (e.g., `us-central`)
5. Click **Enable**

### Step 3: Configure Firestore Security Rules

Once Firestore is created, go to **Rules** tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Progress collection - users can only read/write their own progress
    match /progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click **Publish** to save the rules.

### Step 4: Update Authorized Domains (if needed)

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Make sure these are added:
   - `localhost`
   - `*.emergentagent.com`
   - Any custom domain you're using

### Step 5: Verify Your Configuration

Your current Firebase config in the app:
```
Project ID: informal-talk
Auth Domain: informal-talk.firebaseapp.com
```

This should match your Firebase Console project settings.

## What Your App Does with Firebase

### 1. **Google Sign-In**
- Users click "Sign in with Google"
- Google popup appears for authentication
- User info (name, email, photo) is stored in the app
- User can sign out anytime

### 2. **Progress Tracking**
- When signed in, completed dialogues are saved to Firestore
- Collection: `progress`
- Document ID: User's UID
- Data structure:
```javascript
{
  completed: [1, 2, 3, ...] // Array of completed dialogue IDs
}
```

### 3. **Offline Mode**
- If Firebase is not configured or user not signed in
- App still works but progress is NOT saved
- Yellow warning banner appears on home screen

## Testing Your Setup

### Test 1: Check Firebase Connection
1. Open your app in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Look for these logs:
   - `[DEBUG] firebase.ts loaded.`
   - `[DEBUG] isFirebaseConfigured: true`
   - `[DEBUG] firebase.initializeApp() called successfully.`
   - `[DEBUG] firebase.firestore() service obtained.`
   - `[DEBUG] firebase.auth() service obtained.`

### Test 2: Test Google Sign-In
1. Click "Sign in with Google" button
2. Google popup should appear
3. Select your Google account
4. You should see: "Welcome, [Your Name]!"
5. You should see the three section buttons

### Test 3: Test Progress Saving
1. Sign in with Google
2. Go to "02. Practicing"
3. Complete a dialogue scenario
4. In Firebase Console → Firestore Database
5. You should see: `progress` collection → Your User ID → `completed: [...]`

## Common Issues & Solutions

### Issue 1: "Firebase not configured" warning
**Solution:** Check that your Firebase credentials in `firebaseConfig.ts` are correct

### Issue 2: Google Sign-in popup blocked
**Solution:** Allow popups for this site in your browser settings

### Issue 3: "Permission denied" errors in Firestore
**Solution:** Make sure you published the security rules from Step 3

### Issue 4: Sign-in works but progress not saving
**Solution:** 
- Check Firestore is enabled
- Check security rules are published
- Check browser console for errors

### Issue 5: "Auth domain not authorized"
**Solution:** Add your domain to authorized domains in Firebase Console

## Firebase Console Quick Links

- Dashboard: https://console.firebase.google.com/project/informal-talk
- Authentication: https://console.firebase.google.com/project/informal-talk/authentication/users
- Firestore: https://console.firebase.google.com/project/informal-talk/firestore
- Project Settings: https://console.firebase.google.com/project/informal-talk/settings/general

## Need Help?

If you see any errors:
1. Open browser Developer Tools (F12)
2. Check Console tab for red errors
3. Share the error message and I'll help you fix it!
