# Webbook Generator 3.0 - PRD

## Problem Statement
Build a comprehensive platform for creating interactive educational webbooks (like magdalena-iskra.vercel.app). Transform PDF content into engaging e-learning programs with gamification, quizzes, and multimedia.

## User Personas
1. **Content Creators** - Therapists, coaches, educators creating courses
2. **Course Authors** - People selling educational webbooks
3. **Students/Learners** - End users consuming webbooks

## Business Model
- **Pay-per-webbook**: $25 per exported webbook (one-time payment)
- **Free creation**: Users can create and edit for free
- **Payment gate**: Export/publish requires payment

## Architecture
- Frontend: React + Tailwind CSS + Shadcn UI
- Backend: FastAPI + MongoDB
- Auth: Google OAuth via Emergent Auth
- Payments: Stripe (active), PayPal (prepared), Przelewy24/BLIK (prepared)
- Export: Standalone HTML with gamification

## Core Requirements (Static)
1. User authentication (Google OAuth) ✅
2. Project management (CRUD) ✅
3. Chapter editor (WYSIWYG) ✅
4. PDF import ✅
5. Gamification (XP, badges, progress) ✅
6. Quizzes ✅
7. Text-to-Speech (Web Speech API) ✅
8. Stripe payment integration ✅
9. HTML export (standalone) ✅
10. Multiple payment methods (PayPal, P24/BLIK) - prepared, needs API keys

## What's Been Implemented

### Completed (Feb 2026)
- [x] Landing page with pricing ($25/webbook) - English UI
- [x] Google OAuth login via Emergent Auth
- [x] Dashboard with project management
- [x] Builder with chapter editor (WYSIWYG)
- [x] PDF import functionality
- [x] Preview mode with gamification
- [x] Stripe checkout integration
- [x] Payment success page with deployment options
- [x] HTML export for paid projects
- [x] Dark/Light theme toggle
- [x] All UI text translated to English
- [x] Badge system translated to English
- [x] Export HTML template translated to English
- [x] Multiple payment methods UI (PayPal, P24/BLIK) - ready for API keys

### Payment Methods Status
| Method | Status | API Keys Required |
|--------|--------|-------------------|
| Stripe (Card) | ✅ Active | Pre-configured |
| PayPal | 🔧 Prepared | PAYPAL_CLIENT_ID, PAYPAL_SECRET |
| Przelewy24/BLIK | 🔧 Prepared | P24_MERCHANT_ID, P24_API_KEY, P24_CRC_KEY |

## Prioritized Backlog

### P0 (Critical) - DONE ✅
- Authentication flow ✅
- Project CRUD ✅
- Chapter management ✅
- Payment flow (Stripe) ✅
- Export functionality ✅
- UI/UX overhaul to English ✅

### P1 (High Priority) - TODO
- AI features (quiz generation, chatbot) - requires Claude API
- Multi-author collaboration
- Real-time editing
- Enable PayPal payments (needs API keys)
- Enable P24/BLIK payments (needs API keys)

### P2 (Medium Priority) - TODO
- Advanced quiz types
- Comments system
- Leaderboards
- Certificates

### P3 (Nice to Have) - TODO
- PWA offline mode
- Custom themes
- Animation builder
- 3D model viewer

## API Endpoints

### Auth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/session` - Exchange session_id for token
- `POST /api/auth/logout` - Logout

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Chapters
- `GET /api/projects/{id}/chapters` - List chapters
- `POST /api/projects/{id}/chapters` - Create chapter
- `PUT /api/chapters/{id}` - Update chapter
- `DELETE /api/chapters/{id}` - Delete chapter

### Payments
- `GET /api/payments/methods` - Get available payment methods
- `POST /api/payments/checkout` - Create Stripe checkout
- `POST /api/payments/paypal/checkout` - Create PayPal checkout
- `POST /api/payments/przelewy24/checkout` - Create P24 checkout
- `GET /api/payments/status/{session_id}` - Get payment status

### Export
- `GET /api/projects/{id}/export` - Export webbook HTML (paid only)

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
STRIPE_API_KEY=sk_test_emergent

# Optional - for additional payment methods
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox

P24_MERCHANT_ID=your_p24_merchant_id
P24_API_KEY=your_p24_api_key
P24_CRC_KEY=your_p24_crc_key
P24_API_URL=https://sandbox.przelewy24.pl
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://eduweb-builder.preview.emergentagent.com
```

## Next Tasks
1. Add AI-powered quiz generation (Claude API)
2. Implement collaboration features
3. Add more quiz question types
4. Build certificate generator
5. Enable PayPal (when user provides API keys)
6. Enable P24/BLIK (when user provides API keys)
