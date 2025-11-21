"""
Google Classroom Integration Service
Handles grade submissions and teacher operations
"""

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)


class ClassroomService:
    """Service for interacting with Google Classroom API"""
    
    def __init__(self, credentials: Credentials):
        """Initialize with OAuth credentials"""
        self.credentials = credentials
        self.service = build('classroom', 'v1', credentials=credentials)
    
    async def submit_grade(
        self,
        course_id: str,
        coursework_id: str,
        student_user_id: str,
        assigned_grade: float,
        draft_grade: Optional[float] = None
    ) -> Dict:
        """
        Submit or update a grade for a student
        
        Args:
            course_id: Google Classroom course ID
            coursework_id: Assignment/coursework ID
            student_user_id: Student's Google user ID
            assigned_grade: Final grade to assign
            draft_grade: Optional draft grade (not visible to student)
            
        Returns:
            Dict with submission details
        """
        try:
            # First, get the submission ID for this student
            submissions = self.service.courses().courseWork().studentSubmissions().list(
                courseId=course_id,
                courseWorkId=coursework_id,
                userId=student_user_id
            ).execute()
            
            if not submissions.get('studentSubmissions'):
                raise ValueError(f"No submission found for student {student_user_id}")
            
            submission = submissions['studentSubmissions'][0]
            submission_id = submission['id']
            
            # Prepare the grade update
            submission_update = {
                'assignedGrade': assigned_grade,
            }
            
            if draft_grade is not None:
                submission_update['draftGrade'] = draft_grade
            
            # Update the grade
            result = self.service.courses().courseWork().studentSubmissions().patch(
                courseId=course_id,
                courseWorkId=coursework_id,
                id=submission_id,
                updateMask='assignedGrade,draftGrade',
                body=submission_update
            ).execute()
            
            logger.info(f"Grade submitted successfully for student {student_user_id}: {assigned_grade}")
            return {
                'success': True,
                'submission_id': submission_id,
                'assigned_grade': assigned_grade,
                'state': result.get('state')
            }
            
        except HttpError as e:
            logger.error(f"Failed to submit grade: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_course_info(self, course_id: str) -> Optional[Dict]:
        """Get course information"""
        try:
            course = self.service.courses().get(id=course_id).execute()
            return {
                'id': course['id'],
                'name': course['name'],
                'owner_id': course['ownerId'],
                'enrollment_code': course.get('enrollmentCode')
            }
        except HttpError as e:
            logger.error(f"Failed to get course info: {e}")
            return None
    
    async def get_coursework_info(self, course_id: str, coursework_id: str) -> Optional[Dict]:
        """Get assignment/coursework information"""
        try:
            coursework = self.service.courses().courseWork().get(
                courseId=course_id,
                id=coursework_id
            ).execute()
            return {
                'id': coursework['id'],
                'title': coursework['title'],
                'description': coursework.get('description'),
                'max_points': coursework.get('maxPoints'),
                'state': coursework['state']
            }
        except HttpError as e:
            logger.error(f"Failed to get coursework info: {e}")
            return None
    
    async def is_teacher(self, course_id: str, user_id: str) -> bool:
        """Check if user is a teacher/owner of the course"""
        try:
            course = await self.get_course_info(course_id)
            if not course:
                return False
            
            # Check if user is the course owner
            if course['owner_id'] == user_id:
                return True
            
            # Check if user is in teachers list
            teachers = self.service.courses().teachers().list(
                courseId=course_id
            ).execute()
            
            teacher_ids = [t['userId'] for t in teachers.get('teachers', [])]
            return user_id in teacher_ids
            
        except HttpError as e:
            logger.error(f"Failed to check teacher status: {e}")
            return False
    
    async def is_student_enrolled(self, course_id: str, user_id: str) -> bool:
        """Check if user is enrolled as a student in the course"""
        try:
            students = self.service.courses().students().list(
                courseId=course_id
            ).execute()
            
            student_ids = [s['userId'] for s in students.get('students', [])]
            return user_id in student_ids
            
        except HttpError as e:
            logger.error(f"Failed to check enrollment: {e}")
            return False
    
    async def get_all_students(self, course_id: str) -> List[Dict]:
        """Get all students enrolled in a course"""
        try:
            students = self.service.courses().students().list(
                courseId=course_id
            ).execute()
            
            return [
                {
                    'user_id': s['userId'],
                    'profile': s.get('profile', {})
                }
                for s in students.get('students', [])
            ]
        except HttpError as e:
            logger.error(f"Failed to get students: {e}")
            return []


def create_credentials_from_token(access_token: str) -> Credentials:
    """Create Credentials object from access token"""
    return Credentials(token=access_token)
