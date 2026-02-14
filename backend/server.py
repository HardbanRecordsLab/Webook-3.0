from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Form, Request, Response
from fastapi.staticfiles import StaticFiles
import shutil
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import json
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import pdfplumber
import io
import httpx
import google.generativeai as genai

# Import generators
from lib.epub_generator import EPUBGenerator
from lib.pdf_generator import PDFGenerator

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Portable JSON Database (Zero-Config replacement for MongoDB) -> Replaced by PostgresDB
from lib.postgres_db import PostgresDB

db = PostgresDB()

# Stripe & Payments (Local Mock)
from lib.payments import StripeCheckout, CheckoutSessionResponse, CheckoutSessionRequest
import resend
import asyncio
from lib.epub_generator import EPUBGenerator

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')
WEBBOOK_PRICE = 15.0  # Fixed price in USD

# PayPal Configuration
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID')
PAYPAL_SECRET = os.environ.get('PAYPAL_SECRET')
PAYPAL_MODE = os.environ.get('PAYPAL_MODE', 'sandbox')  # sandbox or live

# Email Configuration (Resend)
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'hardbanrecordslab.pl@gmail.com')

# Initialize Resend if API key is available
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Gemini AI Configuration
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    ai_model = genai.GenerativeModel('gemini-1.5-flash')
else:
    ai_model = None

class AIRequest(BaseModel):
    content: str

class QuizQuestionAI(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    explanation: str

class QuizAIResponse(BaseModel):
    questions: List[QuizQuestionAI]

app = FastAPI(title="Webbook Generator 3.0 API")

# CORS Middleware - MUST be added BEFORE routes
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:80",
        "http://195.191.162.224",
        "https://app-webook.hardbanrecordslab.online",
        "https://webook.hardbanrecordslab.online"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload file to local storage"""
    try:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = UPLOAD_DIR / file_name
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return relative URL (client should prepend backend URL)
        # Or return full URL if we know the host
        return {
            "url": f"/uploads/{file_name}",
            "name": file.filename,
            "id": file_name.split(".")[0]
        }
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== EMAIL HELPERS ====================

async def send_payment_confirmation_email(user_email: str, user_name: str, project_title: str, amount: float):
    """Send payment confirmation email"""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured, skipping email")
        return
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #8B5CF6, #A855F7); padding: 40px 30px; text-align: center; }}
            .header h1 {{ color: white; margin: 0; font-size: 28px; }}
            .content {{ padding: 40px 30px; }}
            .success-icon {{ width: 80px; height: 80px; background: #10B981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }}
            .success-icon svg {{ width: 40px; height: 40px; color: white; }}
            h2 {{ color: #1F2937; text-align: center; margin-bottom: 30px; }}
            .details {{ background: #F9FAFB; border-radius: 12px; padding: 20px; margin: 20px 0; }}
            .detail-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5E7EB; }}
            .detail-row:last-child {{ border-bottom: none; }}
            .detail-label {{ color: #6B7280; }}
            .detail-value {{ color: #1F2937; font-weight: 600; }}
            .footer {{ background: #F9FAFB; padding: 30px; text-align: center; color: #6B7280; font-size: 14px; }}
            .btn {{ display: inline-block; background: #8B5CF6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📚 Webbook Generator</h1>
            </div>
            <div class="content">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="width: 80px; height: 80px; background: #10B981; border-radius: 50%; margin: 0 auto 20px; line-height: 80px; font-size: 40px;">✓</div>
                </div>
                <h2>Payment Successful! 🎉</h2>
                <p style="color: #4B5563; text-align: center; margin-bottom: 30px;">
                    Thank you, <strong>{user_name}</strong>! Your payment has been processed successfully.
                </p>
                <div class="details">
                    <div class="detail-row">
                        <span class="detail-label">Project</span>
                        <span class="detail-value">{project_title}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount Paid</span>
                        <span class="detail-value">${amount:.2f} USD</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value" style="color: #10B981;">✓ Completed</span>
                    </div>
                </div>
                <p style="color: #4B5563; text-align: center;">
                    Your webbook is now ready to export and publish! You can download it as a standalone HTML file and host it anywhere.
                </p>
                <div style="text-align: center;">
                    <a href="https://eduweb-builder.preview.emergentagent.com/dashboard" class="btn">Go to Dashboard</a>
                </div>
            </div>
            <div class="footer">
                <p>Thank you for using Webbook Generator!</p>
                <p>Questions? Contact us at {ADMIN_EMAIL}</p>
                <p style="margin-top: 20px; font-size: 12px;">© 2026 Webbook Generator by Kamil Skomra</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [user_email],
            "subject": f"✅ Payment Confirmed - {project_title}",
            "html": html_content
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Payment confirmation email sent to {user_email}")
    except Exception as e:
        logger.error(f"Failed to send payment confirmation email: {e}")

async def send_admin_notification_email(user_email: str, user_name: str, project_title: str, amount: float, payment_method: str):
    """Send notification to admin about new payment"""
    if not RESEND_API_KEY:
        return
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }}
            .header {{ background: #10B981; padding: 30px; text-align: center; color: white; }}
            .content {{ padding: 30px; }}
            .detail {{ padding: 10px 0; border-bottom: 1px solid #E5E7EB; }}
            .label {{ color: #6B7280; font-size: 14px; }}
            .value {{ color: #1F2937; font-weight: 600; font-size: 16px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💰 New Payment Received!</h1>
            </div>
            <div class="content">
                <div class="detail">
                    <div class="label">Customer</div>
                    <div class="value">{user_name} ({user_email})</div>
                </div>
                <div class="detail">
                    <div class="label">Project</div>
                    <div class="value">{project_title}</div>
                </div>
                <div class="detail">
                    <div class="label">Amount</div>
                    <div class="value">${amount:.2f} USD</div>
                </div>
                <div class="detail">
                    <div class="label">Payment Method</div>
                    <div class="value">{payment_method}</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [ADMIN_EMAIL],
            "subject": f"💰 New Payment: ${amount:.2f} from {user_name}",
            "html": html_content
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Admin notification email sent")
    except Exception as e:
        logger.error(f"Failed to send admin notification email: {e}")

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: str = ""
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

def is_admin_email(email: str) -> bool:
    """Check if email belongs to admin"""
    return email.lower() == ADMIN_EMAIL.lower()

class ProjectSettings(BaseModel):
    primary_color: str = "#14532D"
    secondary_color: str = "#F4F4F5"
    accent_color: str = "#A27B5C"
    font_heading: str = "Fraunces"
    font_body: str = "Manrope"
    show_progress: bool = True
    show_toc: bool = True
    enable_tts: bool = True

class ProjectCreate(BaseModel):
    title: str
    description: str = ""

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str = ""
    cover_image: str = ""
    settings: ProjectSettings = Field(default_factory=ProjectSettings)
    total_chapters: int = 0
    status: str = "paid"  # FREE VERSION: Always set to paid
    payment_status: str = "paid"  # FREE VERSION: Always set to paid
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Chapter(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    title: str
    content: str = ""
    order: int = 0
    reading_time: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuizQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    question_type: str = "multiple_choice"  # multiple_choice, true_false, short_answer, matching, drag_drop, hotspot
    options: List[str] = []  # For multiple_choice and true_false
    correct_answer: Any = 0  # Can be int (MCQ, T/F) or List[int] (DragDrop)
    correct_answers: List[int] = []  # For matching (optional)
    matching_pairs: List[Dict[str, str]] = []  # For matching: [{"left": "A", "right": "1"}, ...]
    short_answer_regex: str = ""  # For short_answer validation
    short_answer_keywords: List[str] = []  # Alternative: keywords to match
    explanation: str = ""
    hints: List[str] = []  # Optional hints for the question
    time_limit: int = 0  # 0 = no limit, in seconds

class Quiz(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chapter_id: str
    title: str
    questions: List[QuizQuestion] = []

class Badge(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    xp_required: int = 0

BADGES = [
    Badge(id="first_chapter", name="First Step", description="Complete your first chapter", icon="🎯", xp_required=10),
    Badge(id="streak_7", name="Week Streak", description="7 days in a row", icon="⭐", xp_required=0),
    Badge(id="quiz_master", name="Quiz Master", description="100% on a quiz", icon="🏆", xp_required=0),
    Badge(id="bookworm", name="Bookworm", description="Read 10 chapters", icon="📚", xp_required=100),
    Badge(id="champion", name="Champion", description="Complete the entire webbook", icon="👑", xp_required=0),
]

# ==================== HELPERS ====================

def calculate_reading_time(content: str) -> int:
    import re
    words = len(re.findall(r'\w+', content))
    return max(1, round(words / 200))

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token cookie or Authorization header"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    session = db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        return None
    
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user = db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        return None
    
    return User(**user)

async def require_auth(request: Request) -> User:
    """Require valid session authentication"""
    # Check for session token in cookies
    session_token = request.cookies.get("session_token")

    if not session_token:
        # Fallback: Check Authorization header
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            session_token = auth_header[7:]

    if not session_token:
        raise HTTPException(status_code=401, detail="No session token provided")

    # Validate session
    session = get_session_from_token(session_token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    user = db.users.find_one({"user_id": session.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return User(**user)

# ==================== AUTH ENDPOINTS ====================

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await require_auth(request)
    return user.model_dump()

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # LOCAL AUTH BYPASS (Removing Emergent Dependency)
    # For development, we use a stable user_id for the local dev
    data = {
        "email": "local_user@example.com",
        "name": "Local Developer",
        "picture": ""
    }
    
    # Stable user_id for local developer
    user_id = "user_local_dev_12345"
    
    # Check if user exists
    existing_user = db.users.find_one({"email": data["email"]}, {"_id": 0})
    
    if existing_user:
        # Ensure we use the stable ID if it was already created differently, 
        # but for consistency we'll stick to one.
        user_id = existing_user["user_id"]
    else:
        # Create new user with current data
        user_doc = {
            "user_id": user_id,
            "email": data["email"],
            "name": data["name"],
            "picture": data.get("picture", ""),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.users.insert_one(user_doc)
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Set cookie (Relaxed for local development)
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,  
        samesite="lax", 
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user = db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ==================== PROJECT ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Webbook Generator 3.0 API", "version": "3.0.0"}

@api_router.post("/projects")
async def create_project(project: ProjectCreate, request: Request):
    user = await require_auth(request)
    
    project_obj = Project(
        user_id=user.user_id,
        title=project.title,
        description=project.description
    )
    
    doc = project_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    doc['settings'] = project_obj.settings.model_dump()
    
    db.projects.insert_one(doc)
    return project_obj.model_dump()

@api_router.get("/projects")
async def get_projects(request: Request):
    user = await require_auth(request)
    
    projects = db.projects.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return projects

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, request: Request):
    user = await require_auth(request)
    
    project = db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, updates: Dict[str, Any], request: Request):
    user = await require_auth(request)
    
    updates['updated_at'] = datetime.now(timezone.utc).isoformat()
    db.projects.update_one({"id": project_id, "user_id": user.user_id}, {"$set": updates})
    return await get_project(project_id, request)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, request: Request):
    user = await require_auth(request)
    
    db.projects.delete_one({"id": project_id, "user_id": user.user_id})
    db.chapters.delete_many({"project_id": project_id})
    return {"message": "Project deleted"}

# ==================== CHAPTER ENDPOINTS ====================

@api_router.post("/projects/{project_id}/chapters")
async def create_chapter(project_id: str, chapter_data: Dict[str, Any], request: Request):
    user = await require_auth(request)
    
    # Verify project ownership
    project = db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    count = db.chapters.count_documents({"project_id": project_id})
    
    chapter = Chapter(
        project_id=project_id,
        title=chapter_data.get("title", "New Chapter"),
        content=chapter_data.get("content", "<p>Start writing...</p>"),
        order=chapter_data.get("order", count),
        reading_time=calculate_reading_time(chapter_data.get("content", ""))
    )
    
    doc = chapter.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    db.chapters.insert_one(doc)
    db.projects.update_one({"id": project_id}, {"$inc": {"total_chapters": 1}})
    
    return chapter.model_dump()

@api_router.get("/projects/{project_id}/chapters")
async def get_chapters(project_id: str, request: Request):
    user = await require_auth(request)
    
    # Verify project ownership
    project = db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chapters = db.chapters.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(100)
    return chapters

@api_router.put("/chapters/{chapter_id}")
async def update_chapter(chapter_id: str, updates: Dict[str, Any], request: Request):
    user = await require_auth(request)
    
    chapter = db.chapters.find_one({"id": chapter_id}, {"_id": 0})
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    # Verify ownership via project
    project = db.projects.find_one({"id": chapter["project_id"], "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if 'content' in updates:
        updates['reading_time'] = calculate_reading_time(updates['content'])
    updates['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    db.chapters.update_one({"id": chapter_id}, {"$set": updates})
    return db.chapters.find_one({"id": chapter_id}, {"_id": 0})

@api_router.delete("/chapters/{chapter_id}")
async def delete_chapter(chapter_id: str, request: Request):
    user = await require_auth(request)

    chapter = db.chapters.find_one({"id": chapter_id}, {"_id": 0})
    if chapter:
        project = db.projects.find_one({"id": chapter["project_id"], "user_id": user.user_id}, {"_id": 0})
        if not project:
            raise HTTPException(status_code=403, detail="Not authorized")

        db.chapters.delete_one({"id": chapter_id})
        db.projects.update_one({"id": chapter["project_id"]}, {"$inc": {"total_chapters": -1}})

    return {"message": "Chapter deleted"}

@api_router.put("/chapters/reorder")
async def reorder_chapters(body: Dict[str, Any], request: Request):
    user = await require_auth(request)

    chapter_ids = body.get("chapter_ids", [])
    if not chapter_ids:
        raise HTTPException(status_code=400, detail="No chapters provided")

    # Get first chapter to verify project ownership
    first_chapter = db.chapters.find_one({"id": chapter_ids[0]}, {"_id": 0})
    if not first_chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    project = db.projects.find_one({"id": first_chapter["project_id"], "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update order for each chapter
    for i, chapter_id in enumerate(chapter_ids):
        db.chapters.update_one({"id": chapter_id}, {"$set": {"order": i, "updated_at": datetime.now(timezone.utc).isoformat()}})

    return {"message": "Chapters reordered"}

# ==================== QUIZ ENDPOINTS ====================

@api_router.post("/chapters/{chapter_id}/quiz")
async def create_quiz(chapter_id: str, quiz_data: Dict[str, Any], request: Request):
    user = await require_auth(request)
    
    quiz = Quiz(
        chapter_id=chapter_id,
        title=quiz_data.get("title", "Quiz"),
        questions=[QuizQuestion(**q) for q in quiz_data.get("questions", [])]
    )
    
    db.quizzes.delete_many({"chapter_id": chapter_id})  # Replace existing
    db.quizzes.insert_one(quiz.model_dump())
    return quiz.model_dump()

@api_router.get("/chapters/{chapter_id}/quiz")
async def get_quiz(chapter_id: str):
    quiz = db.quizzes.find_one({"chapter_id": chapter_id}, {"_id": 0})
    return quiz

@api_router.post("/chapters/{chapter_id}/quiz/evaluate")
async def evaluate_quiz(chapter_id: str, request: Request):
    """Submit and evaluate quiz answers"""
    body = await request.json()
    answers = body.get("answers", {})  # Format: {"q_index": answer_value}

    quiz = db.quizzes.find_one({"chapter_id": chapter_id}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    results = {
        "total_questions": len(quiz["questions"]),
        "correct_count": 0,
        "score_percentage": 0,
        "question_results": []
    }

    for idx, question in enumerate(quiz["questions"]):
        q_type = question.get("question_type", "multiple_choice")
        user_answer = answers.get(str(idx))
        is_correct = False

        if q_type == "multiple_choice":
            is_correct = user_answer == question.get("correct_answer")
        elif q_type == "true_false":
            # True/False is stored as 0 (False) or 1 (True)
            is_correct = user_answer == question.get("correct_answer")
        elif q_type == "short_answer":
            # Check keywords or regex
            if user_answer:
                keywords = question.get("short_answer_keywords", [])
                if keywords:
                    is_correct = any(kw.lower() in user_answer.lower() for kw in keywords)
                else:
                    import re
                    regex = question.get("short_answer_regex", "")
                    if regex:
                        try:
                            is_correct = bool(re.search(regex, user_answer, re.IGNORECASE))
                        except:
                            is_correct = False
        elif q_type == "matching":
            # Matching: user_answer is list of selected right values
            # Correct answers are the right values from matching_pairs in order
            correct_matches = [pair.get("right", "") for pair in question.get("matching_pairs", [])]
            is_correct = user_answer == correct_matches if user_answer else False
        elif q_type == "drag_drop":
            # Drag & drop: user provides ranking (positions)
            correct_order = question.get("correct_answer", [])
            is_correct = user_answer == correct_order if user_answer else False

        if is_correct:
            results["correct_count"] += 1

        results["question_results"].append({
            "question_index": idx,
            "question": question.get("question"),
            "question_type": q_type,
            "user_answer": user_answer,
            "correct_answer": question.get("correct_answer"),
            "correct": is_correct,
            "explanation": question.get("explanation", "")
        })

    results["score_percentage"] = round((results["correct_count"] / results["total_questions"]) * 100, 2)
    results["passed"] = results["correct_count"] == results["total_questions"]

    return results

@api_router.post("/ai/generate-quiz")
async def generate_quiz_ai(data: AIRequest):
    if not ai_model:
        # Fallback / Mock for development if no API key
        return {
            "questions": [
                {
                    "question": "What is the main topic of this chapter?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": 0,
                    "explanation": "This is a mock question because Gemini API key is not set."
                }
            ]
        }
    
    prompt = f"""
    Analyze the following educational content and generate a quiz in JSON format.
    The quiz should have 3-5 multiple choice questions.
    Each question must have exactly 4 options, a correct_index (0-3), and a brief explanation.
    
    Content:
    {data.content}
    
    Return ONLY JSON in this format:
    {{
        "questions": [
            {{
                "question": "string",
                "options": ["string", "string", "string", "string"],
                "correct_answer": number,
                "explanation": "string"
            }}
        ]
    }}
    """
    
    try:
        response = ai_model.generate_content(prompt)
        # Attempt to parse JSON from response
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        quiz_data = json.loads(text)
        return quiz_data
    except Exception as e:
        logger.error(f"AI Generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate quiz with AI")

# ==================== PDF UPLOAD ====================

@api_router.post("/projects/{project_id}/upload-pdf")
async def upload_pdf(project_id: str, request: Request, file: UploadFile = File(...)):
    user = await require_auth(request)
    
    project = db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        content = await file.read()
        chapters = []
        
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            current_chapter = {"title": "Chapter 1", "content": ""}
            chapter_num = 1
            
            for page in pdf.pages:
                text = page.extract_text() or ""
                lines = text.split('\n')
                
                for line in lines:
                    line = line.strip()
                    if line and (line.isupper() or line.startswith('Chapter') or line.startswith('CHAPTER') or line.startswith('Rozdział') or line.startswith('ROZDZIAŁ')):
                        if current_chapter["content"]:
                            chapters.append(current_chapter)
                            chapter_num += 1
                        current_chapter = {"title": line[:100], "content": ""}
                    else:
                        current_chapter["content"] += line + "\n"
            
            if current_chapter["content"]:
                chapters.append(current_chapter)
        
        if not chapters:
            chapters = [{"title": "Content", "content": "Could not extract text from PDF"}]
        
        for i, ch in enumerate(chapters):
            chapter = Chapter(
                project_id=project_id,
                title=ch["title"],
                content=f"<p>{ch['content'].replace(chr(10), '</p><p>')}</p>",
                order=i,
                reading_time=calculate_reading_time(ch["content"])
            )
            doc = chapter.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['updated_at'] = doc['updated_at'].isoformat()
            db.chapters.insert_one(doc)
        
        db.projects.update_one(
            {"id": project_id},
            {"$set": {"total_chapters": len(chapters), "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        return {"message": f"Created {len(chapters)} chapters from PDF", "chapters": len(chapters)}
    except Exception as e:
        logger.error(f"PDF upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PAYMENT ENDPOINTS ====================

@api_router.post("/payments/checkout")
async def create_checkout(request: Request):
    """Create Stripe checkout session for webbook purchase"""
    user = await require_auth(request)
    body = await request.json()
    
    project_id = body.get("project_id")
    origin_url = body.get("origin_url")
    
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id required")
    if not origin_url:
        raise HTTPException(status_code=400, detail="origin_url required")
    
    # Verify project ownership
    project = db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if already paid
    if project.get("payment_status") == "paid":
        raise HTTPException(status_code=400, detail="Project already paid")
    
    # Create Stripe checkout
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    success_url = f"{origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/builder/{project_id}"
    
    checkout_request = CheckoutSessionRequest(
        amount=WEBBOOK_PRICE,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "project_id": project_id,
            "user_id": user.user_id,
            "project_title": project["title"]
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "user_id": user.user_id,
        "project_id": project_id,
        "amount": WEBBOOK_PRICE,
        "currency": "usd",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, request: Request):
    """Get payment status and update project if paid"""
    user = await require_auth(request)
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Get transaction
    transaction = db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    
    if transaction and status.payment_status == "paid" and transaction.get("payment_status") != "paid":
        # Update transaction
        db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Update project
        db.projects.update_one(
            {"id": transaction["project_id"]},
            {"$set": {"payment_status": "paid", "status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Send emails
        project = db.projects.find_one({"id": transaction["project_id"]}, {"_id": 0})
        if project:
            await send_payment_confirmation_email(
                user.email, user.name, project["title"], WEBBOOK_PRICE
            )
            await send_admin_notification_email(
                user.email, user.name, project["title"], WEBBOOK_PRICE, "Stripe (Card)"
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount": status.amount_total / 100,
        "project_id": transaction["project_id"] if transaction else None
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        event = await stripe_checkout.handle_webhook(body, signature)
        
        if event.payment_status == "paid":
            db.payment_transactions.update_one(
                {"session_id": event.session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            transaction = db.payment_transactions.find_one({"session_id": event.session_id}, {"_id": 0})
            if transaction:
                db.projects.update_one(
                    {"id": transaction["project_id"]},
                    {"$set": {"payment_status": "paid", "status": "paid"}}
                )
        
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"received": True}

# ==================== PAYMENT METHODS ====================

@api_router.get("/payments/methods")
async def get_payment_methods():
    """Get available payment methods and their configuration status"""
    methods = [
        {
            "id": "stripe",
            "name": "Credit/Debit Card",
            "description": "Pay with Visa, Mastercard, or American Express",
            "enabled": True,
            "icon": "credit-card",
            "currencies": ["usd", "eur", "pln"]
        }
    ]
    
    # Add PayPal if configured
    if PAYPAL_CLIENT_ID and PAYPAL_SECRET:
        methods.append({
            "id": "paypal",
            "name": "PayPal",
            "description": "Pay with your PayPal account",
            "enabled": True,
            "icon": "paypal",
            "currencies": ["usd", "eur"]
        })
    
    return {"methods": methods, "default_method": "stripe"}

@api_router.post("/payments/paypal/checkout")
async def create_paypal_checkout(request: Request):
    """Create PayPal checkout session for webbook purchase"""
    if not PAYPAL_CLIENT_ID or not PAYPAL_SECRET:
        raise HTTPException(status_code=503, detail="PayPal is not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_SECRET to backend/.env")
    
    user = await require_auth(request)
    body = await request.json()
    
    project_id = body.get("project_id")
    origin_url = body.get("origin_url")
    
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id required")
    if not origin_url:
        raise HTTPException(status_code=400, detail="origin_url required")
    
    # Verify project ownership
    project = db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.get("payment_status") == "paid":
        raise HTTPException(status_code=400, detail="Project already paid")
    
    # PayPal OAuth token
    import base64
    auth = base64.b64encode(f"{PAYPAL_CLIENT_ID}:{PAYPAL_SECRET}".encode()).decode()
    
    paypal_base = "https://api-m.sandbox.paypal.com" if PAYPAL_MODE == "sandbox" else "https://api-m.paypal.com"
    
    async with httpx.AsyncClient() as client:
        # Get access token
        token_response = await client.post(
            f"{paypal_base}/v1/oauth2/token",
            headers={"Authorization": f"Basic {auth}"},
            data={"grant_type": "client_credentials"}
        )
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to authenticate with PayPal")
        
        access_token = token_response.json()["access_token"]
        
        # Create order
        order_data = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "reference_id": project_id,
                "description": f"Webbook: {project['title']}",
                "amount": {
                    "currency_code": "USD",
                    "value": str(WEBBOOK_PRICE)
                }
            }],
            "application_context": {
                "return_url": f"{origin_url}/payment/success?method=paypal",
                "cancel_url": f"{origin_url}/builder/{project_id}"
            }
        }
        
        order_response = await client.post(
            f"{paypal_base}/v2/checkout/orders",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=order_data
        )
        
        if order_response.status_code not in [200, 201]:
            logger.error(f"PayPal order creation failed: {order_response.text}")
            raise HTTPException(status_code=500, detail="Failed to create PayPal order")
        
        order = order_response.json()
        
        # Find approval URL
        approval_url = next((link["href"] for link in order["links"] if link["rel"] == "approve"), None)
        
        if not approval_url:
            raise HTTPException(status_code=500, detail="PayPal approval URL not found")
        
        # Store transaction
        db.payment_transactions.insert_one({
            "session_id": order["id"],
            "user_id": user.user_id,
            "project_id": project_id,
            "amount": WEBBOOK_PRICE,
            "currency": "usd",
            "payment_method": "paypal",
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"url": approval_url, "order_id": order["id"]}

@api_router.post("/payments/paypal/capture/{order_id}")
async def capture_paypal_payment(order_id: str, request: Request):
    """Capture PayPal payment after user approval"""
    if not PAYPAL_CLIENT_ID or not PAYPAL_SECRET:
        raise HTTPException(status_code=503, detail="PayPal is not configured")
    
    user = await require_auth(request)
    
    import base64
    auth = base64.b64encode(f"{PAYPAL_CLIENT_ID}:{PAYPAL_SECRET}".encode()).decode()
    paypal_base = "https://api-m.sandbox.paypal.com" if PAYPAL_MODE == "sandbox" else "https://api-m.paypal.com"
    
    async with httpx.AsyncClient() as client:
        # Get access token
        token_response = await client.post(
            f"{paypal_base}/v1/oauth2/token",
            headers={"Authorization": f"Basic {auth}"},
            data={"grant_type": "client_credentials"}
        )
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to authenticate with PayPal")
        
        access_token = token_response.json()["access_token"]
        
        # Capture the order
        capture_response = await client.post(
            f"{paypal_base}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        if capture_response.status_code not in [200, 201]:
            raise HTTPException(status_code=500, detail="Failed to capture PayPal payment")
        
        capture = capture_response.json()
        
        if capture["status"] == "COMPLETED":
            # Update transaction
            db.payment_transactions.update_one(
                {"session_id": order_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            # Update project and send emails
            transaction = db.payment_transactions.find_one({"session_id": order_id}, {"_id": 0})
            if transaction:
                db.projects.update_one(
                    {"id": transaction["project_id"]},
                    {"$set": {"payment_status": "paid", "status": "paid"}}
                )
                
                # Get project info for email
                project = db.projects.find_one({"id": transaction["project_id"]}, {"_id": 0})
                if project:
                    # Send confirmation email to customer
                    await send_payment_confirmation_email(
                        user.email, user.name, project["title"], WEBBOOK_PRICE
                    )
                    # Send notification to admin
                    await send_admin_notification_email(
                        user.email, user.name, project["title"], WEBBOOK_PRICE, "PayPal"
                    )
        
        return {"status": capture["status"], "order_id": order_id}

# ==================== EXPORT ====================

@api_router.get("/projects/{project_id}/export/markdown")
async def export_webbook_markdown(project_id: str, request: Request):
    """Export webbook as Markdown ZIP"""
    user = await require_auth(request)

    project = db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    chapters = db.chapters.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(100)

    # Generate Markdown
    from lib.markdown_generator import MarkdownGenerator
    md_gen = MarkdownGenerator(project, chapters)
    md_bytes = md_gen.generate()

    filename = f"{project['title'].replace(' ', '_')}_webbook.zip"

    return {
        "markdown": md_bytes.hex(),  # Convert bytes to hex for JSON serialization
        "filename": filename
    }

@api_router.get("/projects/{project_id}/export/json")
async def export_webbook_json(project_id: str, request: Request):
    """Export webbook as JSON backup"""
    user = await require_auth(request)

    project = db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    chapters = db.chapters.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(100)
    quizzes = []
    for ch in chapters:
        q = db.quizzes.find_one({"chapter_id": ch["id"]}, {"_id": 0})
        if q:
            quizzes.append(q)

    # Create backup structure
    backup = {
        "export_date": datetime.now(timezone.utc).isoformat(),
        "webbook_version": "3.0",
        "project": project,
        "chapters": chapters,
        "quizzes": quizzes,
        "metadata": {
            "total_chapters": len(chapters),
            "total_quizzes": len(quizzes),
            "exported_by": user.email
        }
    }

    filename = f"{project['title'].replace(' ', '_')}_backup.json"

    return {
        "data": backup,
        "filename": filename
    }

@api_router.get("/projects/{project_id}/export")
async def export_webbook(project_id: str, request: Request):
    """Export webbook as standalone HTML - only for paid projects"""
    user = await require_auth(request)
    
    project = db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check payment status
    if project.get("payment_status") != "paid":
        raise HTTPException(status_code=402, detail="Payment required to export webbook")
    
    chapters = db.chapters.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(100)

    html_content = generate_webbook_html(project, chapters)

    return {"html": html_content, "filename": f"{project['title'].replace(' ', '_')}_webbook.html"}

@api_router.get("/projects/{project_id}/export/epub")
async def export_webbook_epub(project_id: str, request: Request):
    """Export webbook as EPUB"""
    user = await require_auth(request)

    project = db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    chapters = db.chapters.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(100)

    # Generate EPUB
    epub_gen = EPUBGenerator(project, chapters, author=user.name or "Author")
    epub_bytes = epub_gen.generate()

    filename = f"{project['title'].replace(' ', '_')}_webbook.epub"

    return {
        "epub": epub_bytes.hex(),  # Convert bytes to hex for JSON serialization
        "filename": filename
    }

@api_router.get("/projects/{project_id}/export/pdf")
async def export_webbook_pdf(project_id: str, request: Request):
    """Export webbook as PDF"""
    user = await require_auth(request)

    project = db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    chapters = db.chapters.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(100)

    # Generate PDF
    pdf_gen = PDFGenerator(project, chapters, author=user.name or "Author")
    pdf_bytes = pdf_gen.generate()

    filename = f"{project['title'].replace(' ', '_')}_webbook.pdf"

    return {
        "pdf": pdf_bytes.hex(),  # Convert bytes to hex for JSON serialization
        "filename": filename
    }

def generate_webbook_html(project: dict, chapters: list) -> str:
    settings = project.get('settings', {})
    primary = settings.get('primary_color', '#8B5CF6')
    
    chapters_html = ""
    toc_html = ""
    
    # Pre-fetch quizzes
    quizzes = {}
    for ch in chapters:
        q = db.quizzes.find_one({"chapter_id": ch["id"]}, {"_id": 0})
        if q: quizzes[ch["id"]] = q

    for i, ch in enumerate(chapters):
        chapter_id = f"chapter-{i}"
        toc_html += f'<li><a href="#{chapter_id}" class="toc-link" data-chapter="{i}">{ch["title"]}</a></li>'
        
        quiz_html = ""
        if ch["id"] in quizzes:
            q_data = quizzes[ch["id"]]
            quiz_html = f'''<div class="quiz-container" id="quiz-{i}"><h3>📝 {q_data.get('title', 'Chapter Quiz')}</h3>'''
            for q_idx, q in enumerate(q_data.get('questions', [])):
                opts = "".join([f'<button class="quiz-opt" onclick="selectOption({i}, {q_idx}, {o_idx})">{o}</button>' for o_idx, o in enumerate(q['options'])])
                quiz_html += f'''<div class="quiz-q" data-correct="{q['correct_answer']}"><p><strong>{q_idx+1}. {q['question']}</strong></p><div class="quiz-options">{opts}</div><p class="explanation" style="display:none">💡 {q.get("explanation", "")}</p></div>'''
            quiz_html += f'<button class="quiz-submit" id="submit-{i}" onclick="submitQuiz({i})">Submit Quiz</button></div>'

        chapters_html += f'''
        <section id="{chapter_id}" class="chapter">
            <h2 class="chapter-title">{ch["title"]}</h2>
            <div class="chapter-meta"><span>⏱️ {ch.get("reading_time", 1)} min read</span></div>
            <div class="chapter-content">{ch["content"]}</div>
            {quiz_html}
            <div class="chapter-complete">
                <button class="complete-btn" id="btn-{i}" onclick="completeChapter({i})" {f'style="display:none"' if ch["id"] in quizzes else ""}>✓ Complete Chapter (+10 XP)</button>
            </div>
        </section>'''
    
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{project["title"]}</title>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <style>
        :root {{ --primary: {primary}; --bg: #FDFCF8; --text: #2C2C2C; }}
        body {{ font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; margin: 0; }}
        .header {{ background: var(--primary); color: white; padding: 3rem 2rem; text-align: center; }}
        .header h1 {{ font-family: 'Fraunces', serif; margin: 0; font-size: 2.5rem; }}
        .progress-bar {{ height: 6px; background: rgba(255,255,255,0.2); margin-top: 2rem; border-radius: 3px; max-width: 600px; margin-left: auto; margin-right: auto; }}
        .progress-fill {{ height: 100%; background: white; width: 0%; transition: width 0.5s; border-radius: 3px; }}
        .stats {{ display: flex; justify-content: center; gap: 2rem; padding: 1rem; background: #fff; border-bottom: 1px solid #eee; position: sticky; top: 0; z-index: 10; }}
        .container {{ display: grid; grid-template-columns: 280px 1fr; max-width: 1400px; margin: 0 auto; min-height: 100vh; }}
        .sidebar {{ padding: 2rem; border-right: 1px solid #eee; position: sticky; top: 60px; height: calc(100vh - 60px); overflow-y: auto; background: #fafafa; }}
        .toc-link {{ display: block; padding: 0.8rem 1rem; color: #666; text-decoration: none; border-radius: 12px; margin-bottom: 0.3rem; transition: 0.2s; font-weight: 500; }}
        .toc-link:hover {{ background: #eee; }}
        .toc-link.active {{ background: var(--primary); color: white; }}
        .toc-link.completed::before {{ content: '✓ '; color: #10b981; }}
        .content {{ padding: 4rem; max-width: 850px; }}
        .chapter {{ margin-bottom: 6rem; }}
        .chapter-title {{ font-family: 'Fraunces', serif; font-size: 2.5rem; color: var(--primary); margin-bottom: 0.5rem; }}
        .chapter-meta {{ color: #999; font-size: 0.9rem; margin-bottom: 3rem; }}
        .chapter-content img {{ max-width: 100%; border-radius: 16px; margin: 2rem 0; }}
        .complete-btn, .quiz-submit {{ background: var(--primary); color: white; border: none; padding: 1.2rem 2.5rem; border-radius: 50px; cursor: pointer; font-size: 1.1rem; font-weight: 600; width: 100%; transition: 0.3s; }}
        .complete-btn:hover {{ opacity: 0.9; transform: translateY(-2px); }}
        .complete-btn.done {{ background: #10b981; cursor: default; }}
        /* Widgets */
        .audio-widget {{ background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.1); padding: 1.5rem; border-radius: 20px; display: flex; align-items: center; gap: 1rem; margin: 2rem 0; }}
        .video-container {{ position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 20px; margin: 2rem 0; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }}
        .video-container iframe, .video-container video {{ position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }}
        .accordion-item {{ border: 1px solid #eee; border-radius: 12px; margin-bottom: 1rem; overflow: hidden; }}
        .accordion-header {{ padding: 1rem 1.5rem; background: #fff; cursor: pointer; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }}
        .accordion-content {{ padding: 0 1.5rem; max-height: 0; overflow: hidden; transition: 0.3s; background: #fafafa; }}
        .accordion-item.open .accordion-content {{ padding: 1.5rem; max-height: 500px; border-top: 1px solid #eee; }}
        .tabs-container {{ border: 1px solid #eee; border-radius: 20px; overflow: hidden; margin: 2rem 0; }}
        .tabs-header {{ display: flex; background: #f5f5f5; border-bottom: 1px solid #eee; }}
        .tab-btn {{ padding: 1rem 1.5rem; border: none; background: none; cursor: pointer; font-weight: 600; color: #666; }}
        .tab-btn.active {{ background: #fff; color: var(--primary); box-shadow: 0 -2px 0 var(--primary) inset; }}
        .tab-content {{ display: none; padding: 2rem; background: #fff; }}
        .tab-content.active {{ display: block; }}
        .poll-container {{ background: #f9f9f9; border: 2px solid #eee; padding: 2rem; border-radius: 24px; margin: 2rem 0; }}
        .code-block {{ background: #1a1a1a; color: #fff; padding: 1.5rem; border-radius: 16px; font-family: monospace; overflow-x: auto; margin: 2rem 0; position: relative; }}
        .code-lang {{ position: absolute; top: 0; right: 0; background: rgba(255,255,255,0.1); padding: 0.2rem 0.8rem; font-size: 0.7rem; border-bottom-left-radius: 8px; }}
        
        .flashcard {{ perspective: 1000px; height: 250px; margin: 2rem 0; cursor: pointer; }}
        .flashcard-inner {{ position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }}
        .flashcard.flipped .flashcard-inner {{ transform: rotateY(180deg); }}
        .flashcard-front, .flashcard-back {{ position: absolute; width: 100%; height: 100%; backface-visibility: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 24px; padding: 2rem; text-align: center; border: 2px solid var(--primary); }}
        .flashcard-back {{ background: var(--primary); color: white; transform: rotateY(180deg); }}
        .quiz-container {{ background: #fff; border: 2px solid #eee; padding: 2rem; border-radius: 24px; margin-top: 3rem; }}
        .quiz-options {{ display: grid; gap: 0.8rem; margin: 1.5rem 0; }}
        .quiz-opt {{ padding: 1rem; border: 2px solid #eee; border-radius: 12px; background: none; cursor: pointer; text-align: left; transition: 0.2s; }}
        .quiz-opt:hover {{ border-color: var(--primary); }}
        .quiz-opt.selected {{ border-color: var(--primary); background: rgba(0,0,0,0.02); }}
        .quiz-opt.correct {{ border-color: #10b981; background: #ecfdf5; }}
        .quiz-opt.wrong {{ border-color: #ef4444; background: #fef2f2; }}
        @media (max-width: 900px) {{ .container {{ grid-template-columns: 1fr; }} .sidebar {{ display: none; }} .content {{ padding: 2rem; }} }}
    </style>
</head>
<body>
    <header class="header"><h1>{project["title"]}</h1><p>{project.get("description", "")}</p><div class="progress-bar"><div class="progress-fill" id="progress"></div></div></header>
    <div class="stats">
        <span>XP: <strong id="xp">0</strong></span>
        <span>Completed: <strong id="completed">0</strong>/{len(chapters)}</span>
        <div id="badge-list" style="display:flex;gap:0.5rem"></div>
    </div>
    <div class="container"><aside class="sidebar"><ul style="list-style:none">{toc_html}</ul></aside><main class="content">{chapters_html}
        <div id="certificate-area" style="display:none;margin-top:5rem;padding:4rem;border:10px double var(--primary);text-align:center;background:#fff;border-radius:24px">
            <h1 style="font-family:'Fraunces', serif;color:var(--primary)">Certificate of Completion</h1>
            <p>This is to certify that you have successfully completed</p>
            <h2 style="font-family:'Fraunces', serif">{project["title"]}</h2>
            <p>Score: <span id="cert-xp"></span> XP</p>
            <div style="margin-top:3rem;font-style:italic">Awarded on ${{new Date().toLocaleDateString()}}</div>
        </div>
    </main></div>
    <script>
        let state = JSON.parse(localStorage.getItem('webbook_{project["id"]}') || '{{"xp":0,"completed":[]}}');
        let selectedOptions = {{}};
        function selectOption(chIdx, qIdx, oIdx) {{
            selectedOptions[`${{chIdx}}-${{qIdx}}`] = oIdx;
            const quizEl = document.getElementById(`quiz-${{chIdx}}`);
            const qs = quizEl.querySelectorAll('.quiz-q');
            const opts = qs[qIdx].querySelectorAll('.quiz-opt');
            opts.forEach((opt, i) => opt.classList.toggle('selected', i === oIdx));
        }}
        function submitQuiz(i) {{
            const quiz = document.getElementById(`quiz-${{i}}`);
            const qs = quiz.querySelectorAll('.quiz-q');
            let correct = 0;
            qs.forEach((q, qIdx) => {{
                const selected = selectedOptions[`${{i}}-${{qIdx}}`];
                const correctIdx = parseInt(q.dataset.correct);
                const opts = q.querySelectorAll('.quiz-opt');
                if (selected === correctIdx) correct++;
                opts.forEach((opt, oIdx) => {{
                    if (oIdx === correctIdx) opt.classList.add('correct');
                    else if (oIdx === selected) opt.classList.add('wrong');
                }});
                q.querySelector('.explanation').style.display = 'block';
            }});
            if (correct === qs.length) {{
                document.getElementById(`submit-${{i}}`).style.display = 'none';
                document.getElementById(`btn-${{i}}`).style.display = 'block';
                completeChapter(i);
            }}
        }}
        function completeChapter(index) {{
            if (state.completed.includes(index)) return;
            state.completed.push(index); state.xp += 10;
            localStorage.setItem('webbook_{project["id"]}', JSON.stringify(state)); 
            
            confetti({{
                particleCount: 100,
                spread: 70,
                origin: {{ y: 0.6 }}
            }});
            
            updateUI();
            checkBadges();
        }}
        function updateUI() {{
            document.getElementById('xp').textContent = state.xp;
            document.getElementById('cert-xp').textContent = state.xp;
            document.getElementById('completed').textContent = state.completed.length;
            document.getElementById('progress').style.width = (state.completed.length / {len(chapters)} * 100) + '%';
            document.querySelectorAll('.toc-link').forEach((link, i) => {{ if (state.completed.includes(i)) link.classList.add('completed'); }});
            document.querySelectorAll('.complete-btn').forEach((btn, i) => {{ if (state.completed.includes(i)) {{ btn.textContent = '✓ Completed'; btn.classList.add('done'); btn.disabled = true; btn.style.display='block'; }} }});
            
            if (state.completed.length === {len(chapters)}) {{
                confetti({{
                    particleCount: 200,
                    spread: 160,
                    origin: {{ y: 0.6 }},
                    colors: ['#8B5CF6', '#D8B4FE', '#ffffff']
                }});
            }}
        }}
        // Init Widgets
        document.querySelectorAll('.interactive-audio').forEach(el => {{
            const src = el.dataset.src; const title = el.dataset.title || 'Audio Lesson';
            el.innerHTML = `<div class="audio-widget"><button onclick="this.nextElementSibling.paused ? this.nextElementSibling.play() : this.nextElementSibling.pause()" style="background:var(--primary);color:white;border:none;width:50px;height:50px;border-radius:25px;cursor:pointer">▶</button><audio src="${{src}}"></audio><div><div style="font-weight:600;font-size:0.9rem">${{title}}</div><div style="height:4px;width:150px;background:#ddd;margin-top:5px;border-radius:2px"></div></div></div>`;
        }});
        document.querySelectorAll('.interactive-video').forEach(el => {{
            const url = el.dataset.url;
            let embed = url;
            if (url.includes('youtube.com/watch')) embed = `https://www.youtube.com/embed/${{url.split('v=')[1]}}`;
            else if (url.includes('vimeo.com/')) embed = `https://player.vimeo.com/video/${{url.split('/').pop()}}`;
            el.innerHTML = `<div class="video-container">${{url.endsWith('.mp4') ? `<video src="${{url}}" controls></video>` : `<iframe src="${{embed}}" allowfullscreen></iframe>`}}</div>`;
        }});
        document.querySelectorAll('.interactive-flashcards').forEach(el => {{
            const cards = JSON.parse(el.dataset.cards || '[]');
            if (cards.length) {{
                el.innerHTML = `<div class="flashcard" onclick="this.classList.toggle('flipped')"><div class="flashcard-inner"><div class="flashcard-front"><span>QUESTION</span><p style="font-size:1.2rem;font-weight:600">${{cards[0].q}}</p></div><div class="flashcard-back"><span>ANSWER</span><p style="font-size:1.2rem;font-weight:600">${{cards[0].a}}</p></div></div></div>`;
            }}
        }});
        document.querySelectorAll('.interactive-accordion').forEach(el => {{
            const items = JSON.parse(el.dataset.items || '[]');
            el.innerHTML = items.map(it => `<div class="accordion-item" onclick="this.classList.toggle('open')"><div class="accordion-header">${{it.title}}<span>+</span></div><div class="accordion-content">${{it.content}}</div></div>`).join('');
        }});
        document.querySelectorAll('.interactive-tabs').forEach(el => {{
            const tabs = JSON.parse(el.dataset.tabs || '[]');
            const header = `<div class="tabs-header">${{tabs.map((t, idx) => `<button class="tab-btn ${{idx==0?'active':''}}" onclick="this.parentElement.nextElementSibling.children[${{idx}}].style.display='block'; Array.from(this.parentElement.children).forEach((b,i)=>{{b.classList.toggle('active',i==${{idx}}); if(i!=${{idx}}) this.parentElement.nextElementSibling.children[i].style.display='none' }})">${{t.label}}</button>`).join('')}}</div>`;
            const content = `<div class="tabs-content">${{tabs.map((t, idx) => `<div class="tab-content" style="display:${{idx==0?'block':'none'}}">${{t.content}}</div>`).join('')}}</div>`;
            el.innerHTML = `<div class="tabs-container">${{header}}${{content}}</div>`;
        }});
        document.querySelectorAll('.interactive-poll').forEach(el => {{
            const q = el.dataset.question;
            const opts = JSON.parse(el.dataset.options || '[]');
            el.innerHTML = `<div class="poll-container"><h4>${{q}}</h4>${{opts.map(o => `<button class="quiz-opt" style="width:100%;margin-bottom:0.5rem" onclick="this.parentElement.innerHTML='<p>✅ Thanks for voting!</p>'">${{o}}</button>`).join('')}}</div>`;
        }});
        document.querySelectorAll('.interactive-code').forEach(el => {{
            const code = el.dataset.code; const lang = el.dataset.lang || 'code';
            el.innerHTML = `<div class="code-block"><div class="code-lang">${{lang}}</div><pre><code>${{code}}</code></pre></div>`;
        }});
        document.querySelectorAll('.interactive-wheel').forEach(el => {{
            const items = JSON.parse(el.dataset.items || '[]');
            el.innerHTML = `<div class="wheel-container" style="text-align:center;margin:2rem 0">
                <div class="wheel-canvas-container" style="position:relative;width:260px;height:260px;margin:0 auto">
                    <div class="wheel-pointer" style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:15px solid transparent;border-right:15px solid transparent;border-top:25px solid var(--primary);z-index:10"></div>
                    <div class="wheel" style="width:100%;height:100%;border-radius:50%;border:5px solid var(--primary);position:relative;overflow:hidden;transition:transform 3s cubic-bezier(0.15, 0, 0.15, 1)">
                        ${{items.map((it, idx) => `<div class="wheel-segment" style="position:absolute;top:0;left:50%;width:2px;height:50%;background:rgba(0,0,0,0.1);transform-origin:bottom;transform:translateX(-50%) rotate(${{idx * (360/items.length)}}deg)"></div>`).join('')}}
                    </div>
                </div>
                <button class="complete-btn" style="margin-top:1.5rem;width:auto" onclick="spinWheel(this)">SPIN THE WHEEL</button>
                <p class="wheel-result" style="margin-top:1rem;font-weight:bold;color:var(--primary);display:none"></p>
            </div>`;
        }});

        function spinWheel(btn) {{
            const wheel = btn.previousElementSibling.querySelector('.wheel');
            const result = btn.nextElementSibling;
            const items = JSON.parse(wheel.parentElement.parentElement.parentElement.querySelector('.interactive-wheel').dataset.items);
            const rotation = 1800 + Math.random() * 360;
            wheel.style.transform = `rotate(${{rotation}}deg)`;
            btn.disabled = true;
            setTimeout(() => {{
                const actualRotation = rotation % 360;
                const index = Math.floor(((360 - (actualRotation % 360)) % 360) / (360 / items.length));
                result.textContent = "Result: " + items[index];
                result.style.display = 'block';
                btn.disabled = false;
            }}, 3000);
        }}

        // Badges & Certificates
        function checkBadges() {{
            const badgeContainer = document.getElementById('badge-list');
            if (!badgeContainer) return;
            badgeContainer.innerHTML = '';
            
            const badges = [
                {{id: "first_chapter", name: "First Step", icon: "🎯", req: 1}},
                {{id: "bookworm", name: "Bookworm", icon: "📚", req: 5}},
                {{id: "champion", name: "Champion", icon: "👑", req: {len(chapters)}}}
            ];

            badges.forEach(b => {{
                if (state.completed.length >= b.req) {{
                    badgeContainer.innerHTML += `<div class="badge-item" title="${{b.name}}">${{b.icon}}</div>`;
                }}
            }});

            if (state.completed.length === {len(chapters)}) {{
                document.getElementById('certificate-area').style.display = 'block';
            }}
        }}

        updateUI();
        checkBadges();
    </script>
</body>
</html>'''

# ==================== GAMIFICATION ====================

@api_router.get("/progress/{project_id}")
async def get_progress(project_id: str, request: Request):
    user = await require_auth(request)
    
    progress = db.user_progress.find_one(
        {"user_id": user.user_id, "project_id": project_id}, {"_id": 0}
    )
    
    if not progress:
        progress = {
            "user_id": user.user_id,
            "project_id": project_id,
            "completed_chapters": [],
            "xp_earned": 0,
            "badges": [],
            "bookmarks": [],
            "last_activity": datetime.now(timezone.utc).isoformat()
        }
        db.user_progress.insert_one(progress)
    
    return progress

@api_router.post("/progress/{project_id}/complete-chapter")
async def complete_chapter(project_id: str, request: Request, chapter_id: str = Form(...)):
    user = await require_auth(request)
    
    progress = db.user_progress.find_one(
        {"user_id": user.user_id, "project_id": project_id}, {"_id": 0}
    )
    
    if not progress:
        progress = {"user_id": user.user_id, "project_id": project_id, "completed_chapters": [], "xp_earned": 0, "badges": [], "bookmarks": []}
        db.user_progress.insert_one(progress)
    
    xp_earned = 10
    new_badges = []
    
    if chapter_id not in progress.get('completed_chapters', []):
        db.user_progress.update_one(
            {"user_id": user.user_id, "project_id": project_id},
            {
                "$addToSet": {"completed_chapters": chapter_id},
                "$inc": {"xp_earned": xp_earned},
                "$set": {"last_activity": datetime.now(timezone.utc).isoformat()}
            }
        )
    
    return {"xp_earned": xp_earned, "new_badges": new_badges}

@api_router.post("/progress/{project_id}/bookmark")
async def toggle_bookmark(project_id: str, request: Request, chapter_id: str = Form(...)):
    user = await require_auth(request)
    
    progress = db.user_progress.find_one({"user_id": user.user_id, "project_id": project_id}, {"_id": 0})
    
    if not progress:
        db.user_progress.insert_one({
            "user_id": user.user_id, "project_id": project_id, 
            "completed_chapters": [], "xp_earned": 0, "badges": [], "bookmarks": [chapter_id]
        })
        return {"bookmarked": True}
    
    if chapter_id in progress.get('bookmarks', []):
        db.user_progress.update_one(
            {"user_id": user.user_id, "project_id": project_id},
            {"$pull": {"bookmarks": chapter_id}}
        )
        return {"bookmarked": False}
    else:
        db.user_progress.update_one(
            {"user_id": user.user_id, "project_id": project_id},
            {"$addToSet": {"bookmarks": chapter_id}}
        )
        return {"bookmarked": True}

@api_router.get("/badges")
async def get_badges():
    return [b.model_dump() for b in BADGES]

from lib.ai_gateway import get_ai_gateway
from lib.audio_generator import get_audio_generator

# ==================== AI ENDPOINTS ====================

class AIRequest(BaseModel):
    content: str
    max_tokens: int = 1000
    temperature: float = 0.7

class AudioRequest(BaseModel):
    text: str
    voice: str = "pl_PL-ewa-medium"
    lesson_id: str = None
    language: str = "pl"

class ImageGenerationRequest(BaseModel):
    prompt: str
    style: str = "realistic"
    size: str = "768x768"

@api_router.post("/ai/enhance")
async def ai_enhance(request: Request):
    """Enhance and polish selected text using AI Gateway"""
    user = await require_auth(request)
    body = await request.json()
    text = body.get("text")
    
    if not text:
        raise HTTPException(status_code=400, detail="text required")
    
    ai = get_ai_gateway()
    
    prompt = f"""
    Enhance and polish the following text for a professional webbook/e-course. 
    Make it more engaging, educational, and well-structured.
    Keep the original meaning but improve the flow and vocabulary.
    Text: "{text}"
    """
    
    try:
        response = await ai.generate_text(prompt)
        return {"enhanced_text": response}
    except Exception as e:
        logger.error(f"AI Enhance failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/generate-content")
async def ai_generate_content(request: Request):
    """Generate chapter content based on a title and context"""
    user = await require_auth(request)
    body = await request.json()
    title = body.get("title")
    context = body.get("context", "")
    
    if not title:
        raise HTTPException(status_code=400, detail="title required")
    
    ai = get_ai_gateway()
    
    prompt = f"""
    Write a comprehensive and engaging chapter for a webbook.
    Title: {title}
    Context/Outline: {context}
    
    Requirements:
    - Educational and professional tone.
    - Use HTML tags like <h3>, <p>, <strong>, <ul>, <li>.
    - Add at least one practical example.
    - Do not include <html> or <body> tags. Just the content.
    """
    
    try:
        response = await ai.generate_text(prompt, max_tokens=2000)
        return {"content": response}
    except Exception as e:
        logger.error(f"AI Content Generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/generate-quiz")
async def generate_quiz(request: AIRequest):
    """
    Generate quiz questions from lesson content
    """
    ai = get_ai_gateway()
    
    prompt = f"""Based on this educational content, generate exactly 5 quiz questions in Polish.

CONTENT:
{request.content[:2000]}

Return ONLY a valid JSON array with this structure (no markdown, no code blocks):
[
    {{
        "question": "Pytanie?",
        "options": ["Opcja A", "Opcja B", "Opcja C", "Opcja D"],
        "correct_answer": 0,
        "explanation": "Wyjaśnienie odpowiedzi"
    }}
]

Make questions cover different difficulty levels (easy, medium, hard).
Do NOT include markdown formatting.
Return ONLY the JSON array."""
    
    try:
        response = await ai.generate_with_json_response(prompt)
        
        if isinstance(response, list):
            return {
                "success": True,
                "questions": response,
                "count": len(response)
            }
        else:
            return {
                "success": False,
                "error": "Invalid response format",
                "details": response
            }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@api_router.post("/ai/generate-audio")
async def generate_audio(request: AudioRequest):
    """
    Generate audio/speech from text
    """
    try:
        audio_gen = get_audio_generator()
        result = await audio_gen.generate_from_text(
            text=request.text,
            voice=request.voice,
            lesson_id=request.lesson_id,
            language=request.language
        )
        return result
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

@api_router.post("/ai/generate-image")
async def generate_image(request: ImageGenerationRequest):
    """
    Generate image from text prompt
    """
    try:
        # Pollinations.ai - ZERO cost
        size_parts = request.size.split('x')
        width, height = size_parts[0], size_parts[1]
        
        # Construct Pollinations URL
        image_url = f"https://image.pollinations.ai/prompt/{request.prompt}?width={width}&height={height}&model=flux"
        
        return {
            "success": True,
            "image_url": image_url,
            "provider": "pollinations",
            "size": request.size
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@api_router.post("/ai/generate-summary")
async def generate_summary(request: AIRequest):
    """Generate concise summary of content"""
    ai = get_ai_gateway()
    
    prompt = f"""Create a concise summary (max 3-4 sentences) in Polish:

{request.content[:1500]}

Summary:"""
    
    try:
        response = await ai.generate_text(prompt, max_tokens=300)
        return {
            "success": True,
            "summary": response.strip()
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@api_router.post("/ai/generate-learning-objectives")
async def generate_learning_objectives(request: AIRequest):
    """Generate learning objectives from lesson content"""
    ai = get_ai_gateway()
    
    prompt = f"""Based on this lesson content, generate 3-5 specific learning objectives in Polish, 
starting with action verbs (understand, apply, analyze, etc.):

{request.content[:2000]}

Return as JSON array:
["Cel 1", "Cel 2", ...]"""
    
    try:
        response = await ai.generate_with_json_response(prompt)
        if isinstance(response, list):
            return {
                "success": True,
                "objectives": response
            }
        return {"success": False, "error": "Invalid format"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@api_router.post("/ai/generate-key-terms")
async def generate_key_terms(request: AIRequest):
    """Extract and explain key terms from lesson"""
    ai = get_ai_gateway()
    
    prompt = f"""Extract 5-7 key terms from this educational content in Polish.
For each term, provide a brief definition (1-2 sentences).

CONTENT:
{request.content[:2000]}

Return as JSON object:
{{
    "term_1": "definition...",
    "term_2": "definition..."
}}"""
    
    try:
        response = await ai.generate_with_json_response(prompt)
        if isinstance(response, dict):
            return {
                "success": True,
                "terms": response
            }
        return {"success": False, "error": "Invalid format"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@api_router.get("/audio/{file_id}")
async def get_audio(file_id: str):
    """Serve generated audio files"""
    from fastapi.responses import FileResponse
    
    # Security: validate file_id
    if not file_id.replace('_', '').replace('-', '').isalnum():
        raise HTTPException(status_code=400, detail="Invalid file ID")
    
    # Try different extensions
    audio_dir = Path("uploads/audio")
    for ext in ['wav', 'mp3', 'm4b']:
        file_path = audio_dir / f"lesson_{file_id}.{ext}"
        if file_path.exists():
            return FileResponse(
                file_path,
                media_type=f"audio/{ext}",
                filename=f"{file_id}.{ext}"
            )
    
    raise HTTPException(status_code=404, detail="Audio file not found")

@api_router.get("/health")
async def health_check():
    """Check API and AI gateway status"""
    ai = get_ai_gateway()
    audio_gen = get_audio_generator()
    
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "groq": ai.groq_key is not None,
            "gemini": ai.gemini_key is not None,
            "piper_tts": audio_gen.piper_available,
            "elevenlabs": audio_gen.elevenlabs_key is not None
        }
    }

# Router already included above
