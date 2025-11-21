# 🎓 Google Classroom Integration - Setup Guide

## Overview

Your app will integrate with Google Classroom to:
- ✅ Track total correct answers across all dialogues
- ✅ Submit grades automatically at end of session
- ✅ Show both percentage (0-100%) and points
- ✅ Allow 3 attempts per student
- ✅ Let teachers reset attempts
- ✅ Auto-submit grades to Google Classroom

---

## 🎯 How It Will Work

### Teacher Flow:
1. Teacher creates assignment in Google Classroom
2. Attaches your app link: `https://app-checkout-1.preview.emergentagent.com?classroomId=XXX&assignmentId=YYY`
3. Sets due date and instructions

### Student Flow:
1. Student clicks link from Google Classroom
2. Signs in with Google account
3. Completes dialogues (tracked automatically)
4. At end of session: "Submit to Classroom" button appears
5. Click button → Grade submitted automatically
6. Student can retry (up to 3 attempts)
7. Best score is kept

### Teacher Monitoring:
1. Sees grades appear in Google Classroom automatically
2. Can view attempt history in teacher dashboard
3. Can reset attempts if needed
4. Can see detailed progress per student

---

## 📋 What Will Be Tracked

### Per Student:
- **Total dialogues completed:** Count of finished dialogues
- **Total correct answers:** All correct words selected
- **Total possible answers:** Maximum possible correct answers
- **Percentage score:** (Correct / Total) × 100
- **Points:** Correct answers count
- **Attempt number:** 1, 2, or 3
- **Best score:** Highest score across all attempts

### Example:
```
Student: João Silva
Attempt 1: 45/60 correct = 75% (45 points)
Attempt 2: 52/60 correct = 87% (52 points)
Attempt 3: 58/60 correct = 97% (58 points)
Best Score: 97% (58 points) ← Submitted to Classroom
```

---

## 🔧 Setup Steps

### Step 1: Enable Google Classroom API

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/apis/library?project=informal-talk

2. **Search for "Google Classroom API"**

3. **Click "Enable"**

4. **Wait for activation** (takes 1-2 minutes)

### Step 2: Update OAuth Consent Screen

1. **Go to OAuth consent screen:**
   https://console.cloud.google.com/apis/credentials/consent?project=informal-talk

2. **Add these scopes:**
   - `https://www.googleapis.com/auth/classroom.coursework.me`
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.students`

3. **Save changes**

### Step 3: Update Firebase Auth Scopes

Your app needs additional permissions to access Google Classroom.

**I'll update the code to request these scopes when users sign in.**

### Step 4: Create Firestore Collections

**New collections:**

1. **`classroom_assignments`** - Stores assignment info
   ```javascript
   {
     assignmentId: "123",
     courseId: "456",
     courseName: "English 101",
     teacherId: "teacher_uid",
     dueDate: timestamp,
     maxAttempts: 3,
     totalPossiblePoints: 60
   }
   ```

2. **`student_attempts`** - Tracks student attempts
   ```javascript
   {
     studentId: "student_uid",
     assignmentId: "123",
     attemptNumber: 1,
     correctAnswers: 45,
     totalQuestions: 60,
     percentage: 75,
     completedAt: timestamp,
     submitted: false
   }
   ```

3. **`classroom_submissions`** - Submitted grades
   ```javascript
   {
     studentId: "student_uid",
     assignmentId: "123",
     bestScore: 87,
     bestAttempt: 2,
     submittedAt: timestamp,
     classroomSubmissionId: "xxx"
   }
   ```

---

## 💻 What I'll Implement

### Frontend Changes:

1. **Detect Google Classroom Parameters**
   - Parse `classroomId` and `assignmentId` from URL
   - Store in app state

2. **Track Progress in Real-Time**
   - Count correct answers per dialogue
   - Update Firestore after each dialogue
   - Show progress indicator

3. **End of Session Screen**
   - Show total score and percentage
   - "Submit to Google Classroom" button
   - Attempt counter (1/3, 2/3, 3/3)
   - Option to retry

4. **Teacher Dashboard** (new page)
   - View all students' progress
   - See attempt history
   - Reset attempts button
   - Export grades

### Backend Changes:

1. **New API Endpoint:** `/api/submit-to-classroom`
   - Receives student score
   - Verifies attempt limit (max 3)
   - Submits grade to Google Classroom API
   - Returns confirmation

2. **New API Endpoint:** `/api/reset-attempt`
   - Teacher can reset student attempts
   - Requires teacher authentication

3. **Grade Calculation Logic**
   - Total correct answers / Total possible
   - Percentage calculation
   - Best score tracking

---

## 🎨 New UI Components

### 1. Progress Tracker
Shows at top of screen during practice:
```
┌─────────────────────────────────────┐
│ 📊 Progress: 15/20 correct (75%)   │
│ Attempt: 1/3                        │
└─────────────────────────────────────┘
```

### 2. Submit Screen
Appears after completing all dialogues:
```
┌─────────────────────────────────────┐
│         🎉 Great Job!               │
│                                     │
│  Your Score: 45/60 (75%)           │
│  Attempt: 1 of 3                   │
│                                     │
│  [Submit to Google Classroom]      │
│  [Try Again]                       │
└─────────────────────────────────────┘
```

### 3. Teacher Dashboard
New page for teachers:
```
┌─────────────────────────────────────┐
│  📚 English 101 - Assignment        │
│                                     │
│  Student         Score    Attempts │
│  João Silva      97%      3/3      │
│  Maria Santos    85%      2/3      │
│  Pedro Costa     72%      1/3      │
│                                     │
│  [Reset All] [Export CSV]          │
└─────────────────────────────────────┘
```

---

## 🔒 Security & Permissions

### Student Permissions:
- Read their own progress
- Submit grades (max 3 times)
- View their attempt history

### Teacher Permissions:
- View all students in their class
- Reset student attempts
- Export grade data
- Cannot modify submitted grades (integrity)

### Firestore Security Rules:
```javascript
// Students can only read/write their own data
match /student_attempts/{attemptId} {
  allow read, write: if request.auth.uid == resource.data.studentId;
}

// Teachers can read all data for their assignments
match /student_attempts/{attemptId} {
  allow read: if get(/databases/$(database)/documents/classroom_assignments/$(resource.data.assignmentId)).data.teacherId == request.auth.uid;
}
```

---

## 📊 Grading Logic

### Total Possible Points:
Each dialogue has multiple correct words. Example:
- "'Gotta' at the Mall": 3 correct words
- "'Gonna' Watch a Movie": 2 correct words
- "'Wanna' Get Coffee": 2 correct words
- **Total:** 60 correct answers across all dialogues

### Score Calculation:
```javascript
const correctAnswers = 45; // Student got 45 correct
const totalPossible = 60;   // Total correct answers available
const percentage = (45 / 60) * 100; // 75%
const points = 45; // Points equal correct answers
```

### Best Score Logic:
```javascript
Attempt 1: 75% (45 points)
Attempt 2: 87% (52 points) ← Better, update best score
Attempt 3: 80% (48 points)   Not better, keep attempt 2

Final submission: 87% (52 points)
```

---

## 🧪 Testing the Integration

### Test as Student:

1. **Create test assignment in Google Classroom**
2. **Add URL parameters:**
   ```
   https://app-checkout-1.preview.emergentagent.com?courseId=123&assignmentId=456
   ```
3. **Complete some dialogues**
4. **Check Firestore:** See progress being tracked
5. **Click "Submit to Classroom"**
6. **Check Google Classroom:** Grade appears!

### Test as Teacher:

1. **Open teacher dashboard:**
   ```
   https://app-checkout-1.preview.emergentagent.com/teacher
   ```
2. **View student progress**
3. **Reset a student's attempts**
4. **Verify student can retry**

---

## 🚀 Implementation Timeline

**Phase 1: Backend Setup (1-2 hours)**
- Enable Classroom API
- Create backend endpoints
- Set up Firestore collections

**Phase 2: Frontend Integration (2-3 hours)**
- Add URL parameter detection
- Create progress tracker
- Build submit screen
- Add attempt limiting

**Phase 3: Teacher Dashboard (2-3 hours)**
- Create teacher view
- Add reset functionality
- Build export feature

**Phase 4: Testing (1 hour)**
- Test student flow
- Test teacher flow
- Verify grade submission

**Total: 6-9 hours of development**

---

## 💰 Costs

### Google Classroom API:
- **Free!** No usage limits
- No additional costs

### Existing Costs:
- Firebase (already using)
- Gemini API (already using)

**No new costs for Classroom integration!** 🎉

---

## 📝 Next Steps

**Ready to start? I need:**

1. **Confirmation:** Are you ready to enable Google Classroom API?
2. **Assignment setup:** Do you have a Google Classroom class to test with?
3. **Teacher account:** Do you want teacher features accessible to specific email addresses?

Let me know and I'll start implementing! 🚀
