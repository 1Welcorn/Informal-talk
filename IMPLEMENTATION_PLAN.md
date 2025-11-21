# 🔧 Google Classroom Integration - Implementation Plan

## What We'll Build

### Core Features:
1. ✅ Track correct answers across all dialogues
2. ✅ Submit grades to Google Classroom (percentage + points)
3. ✅ Limit to 3 attempts per student
4. ✅ Teacher can reset attempts
5. ✅ Automatic grade submission at session end

---

## 📊 Technical Architecture

### Data Flow:

```
Student clicks Classroom link
    ↓
App detects courseId & assignmentId
    ↓
Student signs in with Google
    ↓
App loads student's attempt history
    ↓
Student completes dialogues → Progress tracked in real-time
    ↓
All dialogues completed → Show "Submit" screen
    ↓
Student clicks "Submit to Classroom"
    ↓
Backend validates attempt limit (1/3, 2/3, 3/3)
    ↓
Backend submits grade to Google Classroom API
    ↓
Grade appears in Google Classroom
    ↓
Student can retry (if attempts remaining)
```

---

## 🗄️ Database Schema

### Firestore Collections:

#### 1. `progress` (existing - enhanced)
```javascript
{
  userId: "student123",
  completed: [1, 2, 3, 4], // Dialogue IDs
  correctAnswers: {
    1: 3,  // Dialogue 1: 3 correct
    2: 2,  // Dialogue 2: 2 correct
    3: 2,  // Dialogue 3: 2 correct
    4: 3   // Dialogue 4: 3 correct
  },
  totalCorrect: 10,  // NEW
  totalPossible: 60, // NEW
  lastUpdated: timestamp
}
```

#### 2. `classroom_attempts` (new)
```javascript
{
  studentId: "student123",
  assignmentId: "classroom_assignment_456",
  courseId: "course_789",
  attemptNumber: 1,
  correctAnswers: 45,
  totalQuestions: 60,
  percentage: 75,
  points: 45,
  startedAt: timestamp,
  completedAt: timestamp,
  submitted: false
}
```

#### 3. `classroom_submissions` (new)
```javascript
{
  studentId: "student123",
  assignmentId: "classroom_assignment_456",
  courseId: "course_789",
  attempts: [
    { attempt: 1, score: 75, points: 45, date: timestamp },
    { attempt: 2, score: 87, points: 52, date: timestamp }
  ],
  bestScore: 87,
  bestPoints: 52,
  bestAttempt: 2,
  submittedToClassroom: true,
  classroomSubmissionId: "submission_xxx",
  submittedAt: timestamp
}
```

---

## 🔌 Backend API Endpoints

### 1. Submit Grade to Classroom
```
POST /api/submit-to-classroom

Request:
{
  "studentId": "student123",
  "assignmentId": "classroom_assignment_456",
  "courseId": "course_789",
  "correctAnswers": 45,
  "totalQuestions": 60
}

Response:
{
  "success": true,
  "percentage": 75,
  "points": 45,
  "attemptNumber": 1,
  "remainingAttempts": 2,
  "submittedToClassroom": true
}
```

### 2. Get Student Attempts
```
GET /api/student-attempts?studentId=xxx&assignmentId=yyy

Response:
{
  "attempts": [
    { "attempt": 1, "score": 75, "points": 45 },
    { "attempt": 2, "score": 87, "points": 52 }
  ],
  "remainingAttempts": 1,
  "bestScore": 87
}
```

### 3. Reset Student Attempts (Teacher Only)
```
POST /api/reset-attempts

Request:
{
  "teacherId": "teacher_uid",
  "studentId": "student123",
  "assignmentId": "classroom_assignment_456"
}

Response:
{
  "success": true,
  "message": "Attempts reset. Student can retry."
}
```

---

## 🎨 Frontend Components

### 1. Progress Tracker Component
**Location:** Top of practice screen

**Props:**
- totalCorrect: number
- totalPossible: number
- attemptNumber: number

**Display:**
```jsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <div className="flex justify-between items-center">
    <div>
      <p className="text-lg font-semibold">
        📊 Progress: {totalCorrect}/{totalPossible} correct ({percentage}%)
      </p>
    </div>
    <div>
      <p className="text-sm text-gray-600">
        Attempt: {attemptNumber}/3
      </p>
    </div>
  </div>
</div>
```

### 2. Submit to Classroom Screen
**Location:** Shows after all dialogues completed

**Props:**
- totalCorrect: number
- totalPossible: number
- percentage: number
- attemptNumber: number
- onSubmit: function
- onRetry: function

**Display:**
```jsx
<div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
  <h1 className="text-4xl font-bold text-center mb-4">
    🎉 Great Job!
  </h1>
  
  <div className="bg-green-50 p-6 rounded-lg mb-6">
    <p className="text-3xl font-bold text-center text-green-700">
      {totalCorrect}/{totalPossible} correct
    </p>
    <p className="text-2xl font-semibold text-center text-green-600">
      {percentage}% ({totalCorrect} points)
    </p>
  </div>
  
  <p className="text-center text-gray-600 mb-6">
    Attempt {attemptNumber} of 3
  </p>
  
  <div className="space-y-3">
    <button onClick={onSubmit} className="w-full bg-blue-600 text-white py-4 rounded-lg">
      Submit to Google Classroom
    </button>
    
    {attemptNumber < 3 && (
      <button onClick={onRetry} className="w-full bg-gray-200 text-gray-700 py-4 rounded-lg">
        Try Again (Improve Your Score)
      </button>
    )}
  </div>
</div>
```

### 3. Teacher Dashboard
**Location:** `/teacher` route

**Features:**
- View all students in assignment
- See attempt history per student
- Reset attempts
- Export grades to CSV

---

## 🔐 Security Implementation

### Authentication:
```javascript
// Check if user is teacher
const isTeacher = async (userId, courseId) => {
  const course = await classroom.courses.get({ id: courseId });
  return course.ownerId === userId;
};

// Verify student belongs to course
const isEnrolled = async (userId, courseId) => {
  const students = await classroom.courses.students.list({ courseId });
  return students.some(s => s.userId === userId);
};
```

### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Students can read/write their own attempts
    match /classroom_attempts/{attemptId} {
      allow read, write: if request.auth.uid == resource.data.studentId;
    }
    
    // Students can read their own submissions
    match /classroom_submissions/{submissionId} {
      allow read: if request.auth.uid == resource.data.studentId;
    }
    
    // Teachers can read all data for their courses
    match /classroom_attempts/{attemptId} {
      allow read: if isTeacher(request.auth.uid, resource.data.courseId);
    }
    
    match /classroom_submissions/{submissionId} {
      allow read: if isTeacher(request.auth.uid, resource.data.courseId);
    }
  }
}
```

---

## 📝 Implementation Checklist

### Phase 1: Google Cloud Setup
- [ ] Enable Google Classroom API
- [ ] Add OAuth scopes to consent screen
- [ ] Test API access

### Phase 2: Backend Development
- [ ] Create `/api/submit-to-classroom` endpoint
- [ ] Create `/api/student-attempts` endpoint
- [ ] Create `/api/reset-attempts` endpoint
- [ ] Add grade calculation logic
- [ ] Add attempt validation (max 3)
- [ ] Integrate with Google Classroom API

### Phase 3: Frontend - Progress Tracking
- [ ] Parse URL parameters (courseId, assignmentId)
- [ ] Create ProgressTracker component
- [ ] Track correct answers per dialogue
- [ ] Update Firestore in real-time
- [ ] Show progress at top of screen

### Phase 4: Frontend - Submission Screen
- [ ] Create SubmitScreen component
- [ ] Calculate final score
- [ ] Show percentage and points
- [ ] Add "Submit to Classroom" button
- [ ] Add "Try Again" button
- [ ] Handle submission success/error

### Phase 5: Teacher Dashboard
- [ ] Create TeacherDashboard component
- [ ] Fetch all students for assignment
- [ ] Display attempt history
- [ ] Add reset attempts functionality
- [ ] Add CSV export

### Phase 6: Testing
- [ ] Test student flow (all 3 attempts)
- [ ] Test grade submission to Classroom
- [ ] Test teacher dashboard
- [ ] Test reset functionality
- [ ] Test error handling

---

## 🧪 Test Scenarios

### Scenario 1: First Attempt
1. Student opens link with courseId & assignmentId
2. Signs in with Google
3. Completes 45/60 dialogues correctly
4. Clicks "Submit to Classroom"
5. Grade (75%, 45 points) appears in Classroom
6. Can click "Try Again"

### Scenario 2: Second Attempt (Better Score)
1. Student retries
2. Completes 52/60 correctly (87%)
3. Submits again
4. Grade updates in Classroom to 87% (52 points)
5. Best score is now 87%

### Scenario 3: Third Attempt (Worse Score)
1. Student retries third time
2. Completes 48/60 correctly (80%)
3. Submits
4. Grade stays at 87% (best score kept)
5. No more attempts allowed

### Scenario 4: Teacher Reset
1. Teacher opens dashboard
2. Sees student has used 3/3 attempts
3. Clicks "Reset Attempts"
4. Student can now retry
5. Best score is preserved

---

## 🚀 Deployment Steps

1. **Enable APIs in Google Cloud**
2. **Deploy backend changes**
3. **Deploy frontend changes**
4. **Update Firestore security rules**
5. **Test with real Google Classroom**
6. **Share integration guide with teachers**

---

## 📚 Teacher Instructions (What I'll Create)

### How to Use the App in Google Classroom:

1. **Create Assignment:**
   - Go to Google Classroom
   - Click "Create" → "Assignment"
   - Add title and instructions

2. **Add App Link:**
   - Click "Add" → "Link"
   - Paste: `https://app-checkout-1.preview.emergentagent.com?courseId=YOUR_COURSE_ID&assignmentId=YOUR_ASSIGNMENT_ID`
   - (I'll create a tool to generate this link automatically)

3. **Set Grading:**
   - Points: 60 (max possible)
   - Due date: As needed
   - Assign to students

4. **Monitor Progress:**
   - Grades appear automatically when students submit
   - View detailed progress in teacher dashboard

---

Ready to start implementation? Let me know and I'll begin! 🚀
