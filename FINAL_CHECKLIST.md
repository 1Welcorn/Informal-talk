# ✅ Final Firebase Setup Checklist

## Current Status from Your Screenshot

✅ **Domain is added correctly:**
- `app-checkout-1.preview.emergentagent.com` is in the authorized domains list

❓ **Need to verify:**
- Is Google sign-in provider enabled?
- Are there any cache issues?

---

## 🎯 Complete This Checklist

### Step 1: Verify Google Provider is Enabled

**Link:** https://console.firebase.google.com/project/informal-talk/authentication/providers

**What to check:**
- [ ] Look for "Google" in the Sign-in providers list
- [ ] Status should show "Enabled" (green indicator)
- [ ] If it shows "Disabled" or no indicator:
  - Click on "Google"
  - Toggle "Enable" to ON
  - Add your support email
  - Click "Save"

**Screenshot of what "Enabled" looks like:**
```
Sign-in providers:
Email/Password        Disabled
Google               ✓ Enabled    ← Should look like this
Phone                Disabled
Anonymous            Disabled
```

---

### Step 2: Verify Domain is Listed

**Link:** https://console.firebase.google.com/project/informal-talk/authentication/settings

**What to check:**
- [ ] Scroll to "Authorized domains" section
- [ ] `app-checkout-1.preview.emergentagent.com` should be listed as "Custom"
- [ ] It should look exactly like in your screenshot

✅ **You already did this!** (I saw it in your screenshot)

---

### Step 3: Create Firestore Database (If Not Done Yet)

**Link:** https://console.firebase.google.com/project/informal-talk/firestore

**What to do:**

1. **If you see "Create database" button:**
   - [ ] Click "Create database"
   - [ ] Select "Start in test mode"
   - [ ] Choose region: "us-central1"
   - [ ] Click "Enable"
   - [ ] Wait for provisioning (1-2 minutes)

2. **If you see "Data" tab and database already exists:**
   - [ ] Skip this step - already done!

3. **Set security rules:**
   - [ ] Go to "Rules" tab
   - [ ] Replace all code with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

   - [ ] Click "Publish"

---

### Step 4: Clear Cache & Test

**Choose ONE method:**

#### Method A: Incognito Window (Fastest)
- [ ] Open incognito/private window
- [ ] Go to: https://app-checkout-1.preview.emergentagent.com
- [ ] Click "Sign in with Google"
- [ ] Should work!

#### Method B: Hard Refresh
- [ ] Go to your app
- [ ] Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- [ ] Click "Sign in with Google"

#### Method C: Clear Cache
- [ ] Press `Ctrl + Shift + Delete`
- [ ] Select "Cached images and files"
- [ ] Select "Last hour"
- [ ] Click "Clear data"
- [ ] Restart browser
- [ ] Go to your app
- [ ] Click "Sign in with Google"

---

## 🧪 Testing After Setup

### Test 1: Sign In
- [ ] Click "Sign in with Google"
- [ ] Google popup appears (not blocked)
- [ ] Select your account
- [ ] Successfully signs in
- [ ] See "Welcome, [Your Name]!"
- [ ] See three section buttons

**If this doesn't work, check Step 1 again!**

### Test 2: Save Progress
- [ ] After signing in, click "02. Practicing"
- [ ] Click "Cenários de Prática"
- [ ] Complete a dialogue scenario
- [ ] See "Excelente trabalho!"
- [ ] Dialogue has checkmark ✓

### Test 3: Verify in Firestore
- [ ] Go to: https://console.firebase.google.com/project/informal-talk/firestore/data
- [ ] See collection: `progress`
- [ ] See document with your user ID
- [ ] See field: `completed: [1]` (or similar)

### Test 4: Progress Persists
- [ ] Refresh the page
- [ ] Sign in again
- [ ] Go to "02. Practicing"
- [ ] Completed dialogue still has ✓

**If all tests pass: SUCCESS! 🎉**

---

## 📊 Quick Troubleshooting

### Issue: Google popup doesn't appear

**Likely cause:** Google provider not enabled

**Fix:**
1. Go to: https://console.firebase.google.com/project/informal-talk/authentication/providers
2. Enable Google provider
3. Try again

---

### Issue: Still getting "unauthorized-domain" error

**Likely cause:** Browser cache

**Fix:**
1. Try incognito mode
2. Or clear browser cache
3. Or wait 5-10 minutes and try again

---

### Issue: Sign-in works but progress not saving

**Likely cause:** Firestore not set up or wrong security rules

**Fix:**
1. Check Firestore is created
2. Check security rules are published
3. Check browser console for errors

---

### Issue: "Permission denied" in Firestore

**Likely cause:** Security rules not published or wrong

**Fix:**
1. Go to Firestore → Rules
2. Make sure the rules from Step 3 are there
3. Click "Publish"
4. Try saving progress again

---

## 🎯 Priority Order

Do these in order for fastest results:

1. **FIRST:** Enable Google provider (Step 1)
2. **SECOND:** Test in incognito mode (Step 4, Method A)
3. **THIRD:** Set up Firestore (Step 3)
4. **FINALLY:** Run all tests

---

## 📞 Status Check

After completing this checklist, you should have:

✅ Google sign-in provider enabled
✅ Domain authorized
✅ Firestore database created
✅ Security rules published
✅ Users can sign in
✅ Progress is saved
✅ App is fully functional

---

## 🆘 Still Need Help?

If something isn't working after completing this entire checklist:

1. **Open browser console (F12)**
2. **Take a screenshot of any red errors**
3. **Share the screenshot with me**
4. **Tell me which step failed**

I'll help you fix it! 🚀

---

Good luck! You're almost there! 🎉
