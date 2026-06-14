# ROLE

You are a Senior Frontend Architect with 10+ years of experience.

Your task is to design the complete ReactJS frontend architecture for the project based on the provided Backend Task List.

Tech Stack:

* ReactJS
* TypeScript
* Vite
* React Router
* Zustand
* React Query (TanStack Query)
* Axios
* TailwindCSS
* Shadcn UI
* React Hook Form
* Zod
* STOMP WebSocket
* SockJS

The frontend architecture must follow enterprise-level standards and be scalable.

---

# PROJECT

AI Interview Platform

Main Features:

1. Authentication
2. User Profile
3. Create Interview Session
4. AI Interview Chat
5. Real-time WebSocket Communication
6. Answer Evaluation
7. Final Feedback Report
8. Interview History
9. Dashboard Analytics

---

# BACKEND MODULES

auth/
user/
interview/
chat/
evaluation/
feedback/
ai/
security/
common/

---

# API MODULES

Authentication:

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

Interview:

POST /api/interviews
GET /api/interviews/{id}
GET /api/interviews/my
PUT /api/interviews/{id}/cancel
PUT /api/interviews/{id}/finish

Chat:

POST /api/chat/messages
GET /api/chat/sessions/{id}

Feedback:

GET /api/feedback/{sessionId}

WebSocket:

/ws
/topic/interviews/{id}

---

# REQUIRED OUTPUT

Generate:

## 1. Complete Frontend Folder Structure

Show full src tree.

Example:

src/
├── app/
├── pages/
├── features/
├── services/
├── hooks/
├── store/
├── components/
├── layouts/
├── routes/
├── types/
├── utils/
└── assets/

Expand every folder down to feature level.

---

## 2. Route Structure

Generate all routes.

Example:

/login
/register
/dashboard
/interviews
/interviews/new
/interviews/:id
/interviews/:id/result
/history
/profile

For each route explain:

* Purpose
* Page Component
* API Used

---

## 3. Feature-Based Architecture

For each backend module:

auth
interview
chat
evaluation
feedback

Generate:

features/
module/
components/
hooks/
services/
store/
types/
pages/

Explain responsibility of every file.

---

## 4. Global State Design

Design Zustand stores:

authStore
interviewStore
chatStore
feedbackStore

For each store provide:

State
Actions
Persistence Strategy

Example:

interface AuthStore {
user: User;
token: string;
login(): Promise<void>;
logout(): void;
}

---

## 5. API Layer

Generate:

services/api/

axiosClient.ts

authApi.ts

interviewApi.ts

chatApi.ts

feedbackApi.ts

Requirements:

* JWT interceptor
* Refresh token strategy
* Global error handler
* Request timeout

---

## 6. React Query Design

Generate:

Query Keys

Example:

queryKeys.auth.me

queryKeys.interview.detail

queryKeys.chat.messages

queryKeys.feedback.bySession

For every API define:

useQuery
useMutation

hooks

---

## 7. WebSocket Architecture

Design:

WebSocketService

STOMP Client

Connection Lifecycle

Reconnect Strategy

Message Flow

User Answer
→ Backend
→ Gemini
→ AI Response
→ WebSocket
→ UI

Generate folder structure and responsibilities.

---

## 8. DTO Contract

Generate frontend types based on backend entities:

UserDto

InterviewSessionDto

ChatMessageDto

AnswerEvaluationDto

InterviewFeedbackDto

Include TypeScript interfaces.

---

## 9. Page Breakdown

Generate detailed page structure for:

LoginPage

RegisterPage

DashboardPage

CreateInterviewPage

InterviewRoomPage

InterviewResultPage

HistoryPage

ProfilePage

For each page:

Components
Hooks
API Calls
State Usage

---

## 10. Component Library

Generate reusable components:

Button

Input

Modal

Loading

EmptyState

ErrorBoundary

ChatBubble

ScoreCard

FeedbackCard

ProgressBar

InterviewHeader

Explain usage.

---

## 11. Interview Room Architecture

This is the most important page.

Generate:

InterviewRoomPage

Layout Diagram

Data Flow

WebSocket Flow

State Flow

Component Tree

InterviewHeader

QuestionPanel

ChatWindow

AnswerInput

EvaluationSidebar

Loading States

Error Handling

---

## 12. Final Folder Structure

Output the final production-ready frontend architecture tree.

The structure must be directly usable for implementation.

Do not explain theory.

Output only architecture and implementation-ready structure.
