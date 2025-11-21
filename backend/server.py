from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from classroom_service import ClassroomService, create_credentials_from_token


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# Google Classroom Integration Models
class SubmitToClassroomRequest(BaseModel):
    student_id: str
    course_id: str
    coursework_id: str
    correct_answers: int
    total_questions: int

class StudentAttemptsResponse(BaseModel):
    attempts: List[dict]
    remaining_attempts: int
    best_score: Optional[float]

class ResetAttemptsRequest(BaseModel):
    teacher_id: str
    student_id: str
    course_id: str
    coursework_id: str


# Google Classroom API Endpoints
@api_router.post("/submit-to-classroom")
async def submit_to_classroom(
    request: SubmitToClassroomRequest,
    authorization: str = Header(None)
):
    """Submit student grade to Google Classroom"""
    
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    access_token = authorization.split(' ')[1]
    
    try:
        # Create classroom service
        credentials = create_credentials_from_token(access_token)
        classroom_service = ClassroomService(credentials)
        
        # Verify student is enrolled
        is_enrolled = await classroom_service.is_student_enrolled(
            request.course_id, 
            request.student_id
        )
        
        if not is_enrolled:
            raise HTTPException(status_code=403, detail="Student not enrolled in this course")
        
        # Check existing attempts
        attempts_key = f"{request.student_id}_{request.coursework_id}"
        existing_attempts = await db.classroom_attempts.find(
            {"key": attempts_key}
        ).sort("attempt_number", -1).to_list(None)
        
        attempt_number = len(existing_attempts) + 1
        
        if attempt_number > 3:
            raise HTTPException(status_code=400, detail="Maximum 3 attempts allowed")
        
        # Calculate score
        percentage = (request.correct_answers / request.total_questions) * 100
        points = request.correct_answers
        
        # Save attempt to database
        attempt_doc = {
            "key": attempts_key,
            "student_id": request.student_id,
            "course_id": request.course_id,
            "coursework_id": request.coursework_id,
            "attempt_number": attempt_number,
            "correct_answers": request.correct_answers,
            "total_questions": request.total_questions,
            "percentage": round(percentage, 2),
            "points": points,
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "submitted": False
        }
        
        await db.classroom_attempts.insert_one(attempt_doc)
        
        # Get or create submission record
        submission_doc = await db.classroom_submissions.find_one({
            "student_id": request.student_id,
            "coursework_id": request.coursework_id
        })
        
        # Calculate best score
        all_attempts = existing_attempts + [attempt_doc]
        best_attempt = max(all_attempts, key=lambda x: x['percentage'])
        best_score = best_attempt['percentage']
        best_points = best_attempt['points']
        
        # Get coursework info to get max points
        coursework_info = await classroom_service.get_coursework_info(
            request.course_id,
            request.coursework_id
        )
        
        max_points = coursework_info.get('max_points', request.total_questions) if coursework_info else request.total_questions
        
        # Calculate grade out of max points
        assigned_grade = (best_points / request.total_questions) * max_points
        
        # Submit to Google Classroom
        result = await classroom_service.submit_grade(
            course_id=request.course_id,
            coursework_id=request.coursework_id,
            student_user_id=request.student_id,
            assigned_grade=assigned_grade
        )
        
        if result['success']:
            # Update submission record
            if submission_doc:
                await db.classroom_submissions.update_one(
                    {"_id": submission_doc['_id']},
                    {"$set": {
                        "best_score": best_score,
                        "best_points": best_points,
                        "best_attempt": best_attempt['attempt_number'],
                        "submitted_to_classroom": True,
                        "last_submitted_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
            else:
                await db.classroom_submissions.insert_one({
                    "student_id": request.student_id,
                    "course_id": request.course_id,
                    "coursework_id": request.coursework_id,
                    "best_score": best_score,
                    "best_points": best_points,
                    "best_attempt": best_attempt['attempt_number'],
                    "submitted_to_classroom": True,
                    "last_submitted_at": datetime.now(timezone.utc).isoformat()
                })
            
            # Mark attempt as submitted
            await db.classroom_attempts.update_one(
                {"_id": attempt_doc['_id']},
                {"$set": {"submitted": True}}
            )
        
        return {
            "success": result['success'],
            "percentage": round(percentage, 2),
            "points": points,
            "attempt_number": attempt_number,
            "remaining_attempts": 3 - attempt_number,
            "submitted_to_classroom": result['success'],
            "best_score": best_score,
            "best_points": best_points
        }
        
    except Exception as e:
        logger.error(f"Error submitting to classroom: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/student-attempts")
async def get_student_attempts(
    student_id: str,
    coursework_id: str,
    authorization: str = Header(None)
):
    """Get student's attempt history"""
    
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    try:
        attempts_key = f"{student_id}_{coursework_id}"
        attempts = await db.classroom_attempts.find(
            {"key": attempts_key}
        ).sort("attempt_number", 1).to_list(None)
        
        # Remove MongoDB _id field
        for attempt in attempts:
            attempt.pop('_id', None)
        
        remaining = 3 - len(attempts)
        best_score = max([a['percentage'] for a in attempts]) if attempts else None
        
        return {
            "attempts": attempts,
            "remaining_attempts": remaining,
            "best_score": best_score
        }
        
    except Exception as e:
        logger.error(f"Error getting attempts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/reset-attempts")
async def reset_attempts(
    request: ResetAttemptsRequest,
    authorization: str = Header(None)
):
    """Reset student attempts (teacher only)"""
    
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    access_token = authorization.split(' ')[1]
    
    try:
        # Create classroom service
        credentials = create_credentials_from_token(access_token)
        classroom_service = ClassroomService(credentials)
        
        # Verify requester is a teacher
        is_teacher = await classroom_service.is_teacher(request.course_id, request.teacher_id)
        
        if not is_teacher:
            raise HTTPException(status_code=403, detail="Only teachers can reset attempts")
        
        # Delete all attempts for this student/assignment
        attempts_key = f"{request.student_id}_{request.coursework_id}"
        result = await db.classroom_attempts.delete_many({"key": attempts_key})
        
        # Keep submission record but mark as reset
        await db.classroom_submissions.update_one(
            {
                "student_id": request.student_id,
                "coursework_id": request.coursework_id
            },
            {
                "$set": {
                    "reset": True,
                    "reset_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {
            "success": True,
            "message": f"Reset {result.deleted_count} attempts for student",
            "student_id": request.student_id
        }
        
    except Exception as e:
        logger.error(f"Error resetting attempts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()