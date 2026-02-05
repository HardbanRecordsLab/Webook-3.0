from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Form, Request, Response
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Portable JSON Database (Zero-Config replacement for MongoDB)
class JsonCollection:
    def __init__(self, name, data_dir):
        self.path = data_dir / f"{name}.json"
        if not self.path.exists():
            self.path.write_text("[]", encoding='utf-8')
            
    def _read(self):
        try:
            with open(self.path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []

    def _write(self, data):
        with open(self.path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)

    async def find_one(self, query, projection=None):
        data = self._read()
        for item in data:
            if all(item.get(k) == v for k, v in query.items()):
                return item
        return None

    async def find(self, query=None, projection=None):
        data = self._read()
        if not query:
            return JsonQueryBuilder(data)
        results = [item for item in data if all(item.get(k) == v for k, v in query.items())]
        return JsonQueryBuilder(results)

    async def insert_one(self, doc):
        data = self._read()
        data.append(doc)
        self._write(data)
        return doc

    async def update_one(self, query, update):
        data = self._read()
        updated = False
        for item in data:
            if all(item.get(k) == v for k, v in query.items()):
                if "$set" in update:
                    item.update(update["$set"])
                elif "$inc" in update:
                    for k, v in update["$inc"].items():
                        item[k] = item.get(k, 0) + v
                else:
                    item.update(update)
                updated = True
        if updated:
            self._write(data)
        return updated

    async def delete_one(self, query):
        data = self._read()
        for i, item in enumerate(data):
            if all(item.get(k) == v for k, v in query.items()):
                data.pop(i)
                self._write(data)
                return True
        return False

    async def delete_many(self, query):
        data = self._read()
        new_data = [item for item in data if not all(item.get(k) == v for k, v in query.items())]
        self._write(new_data)
        return True

    async def count_documents(self, query):
        data = self._read()
        return len([item for item in data if all(item.get(k) == v for k, v in query.items())])

class JsonQueryBuilder:
    def __init__(self, data):
        self.data = data
    def sort(self, field, direction):
        self.data.sort(key=lambda x: str(x.get(field, "")), reverse=(direction == -1))
        return self
    async def to_list(self, limit=None):
        return self.data[:limit] if limit else self.data

class JsonDB:
    def __init__(self, data_dir_name="data"):
        self.data_dir = ROOT_DIR / data_dir_name
        self.data_dir.mkdir(exist_ok=True)
        self.collections = {}

    def __getattr__(self, name):
        if name not in self.collections:
            self.collections[name] = JsonCollection(name, self.data_dir)
        return self.collections[name]

db = JsonDB()

# Stripe & Payments (Local Mock)
from lib.payments import StripeCheckout, CheckoutSessionResponse, CheckoutSessionRequest
import resend
import asyncio

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', 'sk_test_emergent')
WEBBOOK_PRICE = 25.0  # Fixed price in USD

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

app = FastAPI(title="Webbook Generator 3.0 API")
api_router = APIRouter(prefix="/api")

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
    options: List[str]
    correct_answer: int
    explanation: str = ""

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
    
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        return None
    
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        return None
    
    return User(**user)

async def require_auth(request: Request) -> User:
    """Require authentication - raises 401 if not authenticated"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

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
    # For development, we allow any valid-looking session_id to log in
    data = {
        "email": "local_user@example.com",
        "name": "Local Developer",
        "picture": ""
    }
    
    # Check if user exists
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user data
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data["name"], "picture": data.get("picture", "")}}
        )
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": data["email"],
            "name": data["name"],
            "picture": data.get("picture", ""),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session
    session_token = f"sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
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
    
    await db.projects.insert_one(doc)
    return project_obj.model_dump()

@api_router.get("/projects")
async def get_projects(request: Request):
    user = await require_auth(request)
    
    projects = await db.projects.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return projects

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, request: Request):
    user = await require_auth(request)
    
    project = await db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@api_router.put("/projects/{project_id}")
async def update_project(project_id: str, updates: Dict[str, Any], request: Request):
    user = await require_auth(request)
    
    updates['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.projects.update_one({"id": project_id, "user_id": user.user_id}, {"$set": updates})
    return await get_project(project_id, request)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, request: Request):
    user = await require_auth(request)
    
    await db.projects.delete_one({"id": project_id, "user_id": user.user_id})
    await db.chapters.delete_many({"project_id": project_id})
    return {"message": "Project deleted"}

# ==================== CHAPTER ENDPOINTS ====================

@api_router.post("/projects/{project_id}/chapters")
async def create_chapter(project_id: str, chapter_data: Dict[str, Any], request: Request):
    user = await require_auth(request)
    
    # Verify project ownership
    project = await db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    count = await db.chapters.count_documents({"project_id": project_id})
    
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
    
    await db.chapters.insert_one(doc)
    await db.projects.update_one({"id": project_id}, {"$inc": {"total_chapters": 1}})
    
    return chapter.model_dump()

@api_router.get("/projects/{project_id}/chapters")
async def get_chapters(project_id: str, request: Request):
    user = await require_auth(request)
    
    # Verify project ownership
    project = await db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    chapters = await db.chapters.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(100)
    return chapters

@api_router.put("/chapters/{chapter_id}")
async def update_chapter(chapter_id: str, updates: Dict[str, Any], request: Request):
    user = await require_auth(request)
    
    chapter = await db.chapters.find_one({"id": chapter_id}, {"_id": 0})
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    # Verify ownership via project
    project = await db.projects.find_one({"id": chapter["project_id"], "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if 'content' in updates:
        updates['reading_time'] = calculate_reading_time(updates['content'])
    updates['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.chapters.update_one({"id": chapter_id}, {"$set": updates})
    return await db.chapters.find_one({"id": chapter_id}, {"_id": 0})

@api_router.delete("/chapters/{chapter_id}")
async def delete_chapter(chapter_id: str, request: Request):
    user = await require_auth(request)
    
    chapter = await db.chapters.find_one({"id": chapter_id}, {"_id": 0})
    if chapter:
        project = await db.projects.find_one({"id": chapter["project_id"], "user_id": user.user_id}, {"_id": 0})
        if not project:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        await db.chapters.delete_one({"id": chapter_id})
        await db.projects.update_one({"id": chapter["project_id"]}, {"$inc": {"total_chapters": -1}})
    
    return {"message": "Chapter deleted"}

# ==================== QUIZ ENDPOINTS ====================

@api_router.post("/chapters/{chapter_id}/quiz")
async def create_quiz(chapter_id: str, quiz_data: Dict[str, Any], request: Request):
    user = await require_auth(request)
    
    quiz = Quiz(
        chapter_id=chapter_id,
        title=quiz_data.get("title", "Quiz"),
        questions=[QuizQuestion(**q) for q in quiz_data.get("questions", [])]
    )
    
    await db.quizzes.delete_many({"chapter_id": chapter_id})  # Replace existing
    await db.quizzes.insert_one(quiz.model_dump())
    return quiz.model_dump()

@api_router.get("/chapters/{chapter_id}/quiz")
async def get_quiz(chapter_id: str):
    quiz = await db.quizzes.find_one({"chapter_id": chapter_id}, {"_id": 0})
    return quiz

# ==================== PDF UPLOAD ====================

@api_router.post("/projects/{project_id}/upload-pdf")
async def upload_pdf(project_id: str, request: Request, file: UploadFile = File(...)):
    user = await require_auth(request)
    
    project = await db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
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
            await db.chapters.insert_one(doc)
        
        await db.projects.update_one(
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
    project = await db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
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
    await db.payment_transactions.insert_one({
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
    transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    
    if transaction and status.payment_status == "paid" and transaction.get("payment_status") != "paid":
        # Update transaction
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Update project
        await db.projects.update_one(
            {"id": transaction["project_id"]},
            {"$set": {"payment_status": "paid", "status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Send emails
        project = await db.projects.find_one({"id": transaction["project_id"]}, {"_id": 0})
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
            await db.payment_transactions.update_one(
                {"session_id": event.session_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            transaction = await db.payment_transactions.find_one({"session_id": event.session_id}, {"_id": 0})
            if transaction:
                await db.projects.update_one(
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
    project = await db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
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
        await db.payment_transactions.insert_one({
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
            await db.payment_transactions.update_one(
                {"session_id": order_id},
                {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            # Update project and send emails
            transaction = await db.payment_transactions.find_one({"session_id": order_id}, {"_id": 0})
            if transaction:
                await db.projects.update_one(
                    {"id": transaction["project_id"]},
                    {"$set": {"payment_status": "paid", "status": "paid"}}
                )
                
                # Get project info for email
                project = await db.projects.find_one({"id": transaction["project_id"]}, {"_id": 0})
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

@api_router.get("/projects/{project_id}/export")
async def export_webbook(project_id: str, request: Request):
    """Export webbook as standalone HTML - only for paid projects"""
    user = await require_auth(request)
    
    project = await db.projects.find_one({"id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check payment status
    if project.get("payment_status") != "paid":
        raise HTTPException(status_code=402, detail="Payment required to export webbook")
    
    chapters = await db.chapters.find({"project_id": project_id}, {"_id": 0}).sort("order", 1).to_list(100)
    
    html_content = generate_webbook_html(project, chapters)
    
    return {"html": html_content, "filename": f"{project['title'].replace(' ', '_')}_webbook.html"}

def generate_webbook_html(project: dict, chapters: list) -> str:
    settings = project.get('settings', {})
    primary = settings.get('primary_color', '#14532D')
    
    chapters_html = ""
    toc_html = ""
    
    for i, ch in enumerate(chapters):
        chapter_id = f"chapter-{i}"
        toc_html += f'<li><a href="#{chapter_id}" class="toc-link" data-chapter="{i}">{ch["title"]}</a></li>'
        chapters_html += f'''
        <section id="{chapter_id}" class="chapter" data-index="{i}">
            <h2 class="chapter-title">{ch["title"]}</h2>
            <div class="chapter-meta"><span>⏱️ {ch.get("reading_time", 5)} min read</span></div>
            <div class="chapter-content">{ch["content"]}</div>
            <div class="chapter-complete">
                <button class="complete-btn" onclick="completeChapter({i})">✓ Complete Chapter (+10 XP)</button>
            </div>
        </section>
        '''
    
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{project["title"]}</title>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@300;600;700&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {{ --primary: {primary}; --bg: #FDFCF8; --text: #2C2C2C; }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; }}
        .header {{ background: var(--primary); color: white; padding: 2rem; text-align: center; position: sticky; top: 0; z-index: 100; }}
        .header h1 {{ font-family: 'Fraunces', serif; font-size: 2rem; margin-bottom: 0.5rem; }}
        .progress-bar {{ height: 4px; background: rgba(255,255,255,0.3); margin-top: 1rem; }}
        .progress-fill {{ height: 100%; background: white; width: 0%; transition: width 0.3s; }}
        .stats {{ display: flex; justify-content: center; gap: 2rem; padding: 1rem; background: #f5f5f5; font-size: 0.9rem; }}
        .container {{ display: grid; grid-template-columns: 250px 1fr; max-width: 1400px; margin: 0 auto; }}
        .sidebar {{ background: white; border-right: 1px solid #e0e0e0; padding: 2rem 1rem; position: sticky; top: 120px; height: calc(100vh - 120px); overflow-y: auto; }}
        .sidebar h3 {{ font-size: 0.8rem; text-transform: uppercase; color: #888; margin-bottom: 1rem; }}
        .toc-link {{ display: block; padding: 0.75rem 1rem; color: var(--text); text-decoration: none; border-radius: 8px; margin-bottom: 0.25rem; transition: all 0.2s; }}
        .toc-link:hover, .toc-link.active {{ background: var(--primary); color: white; }}
        .toc-link.completed::before {{ content: '✓ '; color: var(--primary); }}
        .content {{ padding: 3rem; max-width: 800px; }}
        .chapter {{ margin-bottom: 4rem; padding-bottom: 2rem; border-bottom: 1px solid #e0e0e0; }}
        .chapter-title {{ font-family: 'Fraunces', serif; font-size: 2rem; color: var(--primary); margin-bottom: 1rem; }}
        .chapter-meta {{ color: #888; font-size: 0.9rem; margin-bottom: 2rem; }}
        .chapter-content {{ line-height: 1.8; }}
        .chapter-content p {{ margin-bottom: 1.5rem; }}
        .complete-btn {{ background: var(--primary); color: white; border: none; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; font-size: 1rem; margin-top: 2rem; transition: transform 0.2s; }}
        .complete-btn:hover {{ transform: scale(1.02); }}
        .complete-btn.done {{ background: #888; cursor: default; }}
        @media (max-width: 768px) {{ .container {{ grid-template-columns: 1fr; }} .sidebar {{ display: none; }} .content {{ padding: 1.5rem; }} }}
    </style>
</head>
<body>
    <header class="header">
        <h1>{project["title"]}</h1>
        <p>{project.get("description", "")}</p>
        <div class="progress-bar"><div class="progress-fill" id="progress"></div></div>
    </header>
    <div class="stats">
        <span>🏆 XP: <strong id="xp">0</strong></span>
        <span>📚 Completed: <strong id="completed">0</strong>/{len(chapters)}</span>
    </div>
    <div class="container">
        <aside class="sidebar"><h3>Table of Contents</h3><ul style="list-style:none">{toc_html}</ul></aside>
        <main class="content">{chapters_html}</main>
    </div>
    <script>
        let state = JSON.parse(localStorage.getItem('webbook_{project["id"]}') || '{{"xp":0,"completed":[]}}');
        function updateUI() {{
            document.getElementById('xp').textContent = state.xp;
            document.getElementById('completed').textContent = state.completed.length;
            document.getElementById('progress').style.width = (state.completed.length / {len(chapters)} * 100) + '%';
            document.querySelectorAll('.toc-link').forEach((link, i) => {{ if (state.completed.includes(i)) link.classList.add('completed'); }});
            document.querySelectorAll('.complete-btn').forEach((btn, i) => {{ if (state.completed.includes(i)) {{ btn.textContent = '✓ Completed'; btn.classList.add('done'); btn.disabled = true; }} }});
        }}
        function completeChapter(index) {{
            if (state.completed.includes(index)) return;
            state.completed.push(index);
            state.xp += 10;
            localStorage.setItem('webbook_{project["id"]}', JSON.stringify(state));
            updateUI();
        }}
        updateUI();
    </script>
</body>
</html>'''

# ==================== GAMIFICATION ====================

@api_router.get("/progress/{project_id}")
async def get_progress(project_id: str, request: Request):
    user = await require_auth(request)
    
    progress = await db.user_progress.find_one(
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
        await db.user_progress.insert_one(progress)
    
    return progress

@api_router.post("/progress/{project_id}/complete-chapter")
async def complete_chapter(project_id: str, request: Request, chapter_id: str = Form(...)):
    user = await require_auth(request)
    
    progress = await db.user_progress.find_one(
        {"user_id": user.user_id, "project_id": project_id}, {"_id": 0}
    )
    
    if not progress:
        progress = {"user_id": user.user_id, "project_id": project_id, "completed_chapters": [], "xp_earned": 0, "badges": [], "bookmarks": []}
        await db.user_progress.insert_one(progress)
    
    xp_earned = 10
    new_badges = []
    
    if chapter_id not in progress.get('completed_chapters', []):
        await db.user_progress.update_one(
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
    
    progress = await db.user_progress.find_one({"user_id": user.user_id, "project_id": project_id}, {"_id": 0})
    
    if not progress:
        await db.user_progress.insert_one({
            "user_id": user.user_id, "project_id": project_id, 
            "completed_chapters": [], "xp_earned": 0, "badges": [], "bookmarks": [chapter_id]
        })
        return {"bookmarked": True}
    
    if chapter_id in progress.get('bookmarks', []):
        await db.user_progress.update_one(
            {"user_id": user.user_id, "project_id": project_id},
            {"$pull": {"bookmarks": chapter_id}}
        )
        return {"bookmarked": False}
    else:
        await db.user_progress.update_one(
            {"user_id": user.user_id, "project_id": project_id},
            {"$addToSet": {"bookmarks": chapter_id}}
        )
        return {"bookmarked": True}

@api_router.get("/badges")
async def get_badges():
    return [b.model_dump() for b in BADGES]

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    pass # No client to close for JSON DB
