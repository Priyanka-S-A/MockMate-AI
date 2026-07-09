# 🎯 MockMate AI — AI-Powered Interview Preparation Platform

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-8E44AD?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![JWT Authentication](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)
[![Chart.js](https://img.shields.io/badge/chart.js-F5788D.svg?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org/)
[![Google OAuth](https://img.shields.io/badge/Google%20OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/identity)

---

## 📝 Project Description
**MockMate AI**  is an **AI-powered interview preparation platform** designed to help students, job seekers, and professionals practice technical and HR interviews through personalized mock interview experiences.

With features like Speech-to-Text response capturing, interactive Text-to-Speech reading, instant AI-backed evaluations, comprehensive performance analytics dashboards, and downloadable PDF feedback reports, MockMate AI offers an end-to-end simulation that prepares users to succeed in actual corporate hiring pipelines.

---

## 📋 Table of Contents
1. [Features](#-features)
2. [Technology Stack](#-technology-stack)
3. [System Architecture](#-system-architecture)
4. [Authentication Flow](#-authentication-flow)
5. [Security Features](#-security-features)
6. [Folder Structure](#-folder-structure)
7. [Installation Guide](#-installation-guide)
8. [Environment Variables](#-environment-variables)
9. [Usage Guide](#-usage-guide)
10. [Admin Portal](#-admin-portal)
11. [Screenshots](#-screenshots)
12. [Challenges Faced](#-challenges-faced)
13. [Key Learning Outcomes](#-key-learning-outcomes)
14. [Developer](#-developer)
15. [License](#-license)

---

## ✨ Features

MockMate AI comes equipped with a wide array of premium features:

*   **AI-Powered Mock Interviews:** Interactive mock interview sessions simulating real technical and HR questions.
*   **Resume-Based Interview Generation:** Upload your resume (PDF format) and receive highly customized questions matching your specific projects, experience, and skillset.
*   **Company-Specific Interview Practice:** Select target companies (e.g. TCS, Infosys, Accenture, Oracle, Cognizant, Wipro, Capgemini, IBM, Deloitte, HCL, etc.) to practice mocks tailored to their historical hiring criteria.
*   **Technical and HR Interview Support:** Practice a blend of domain-specific technical questions (Java, Python, DBMS, OS, Networking, OOPs, React, JavaScript, SQL, Node.js) and standard behavioral HR prompts.
*   **Speech-to-Text Answer Input:** Transcribe your spoken answers in real time using the browser-native Web Speech API.
*   **Text-to-Speech Question Playback:** Listen to interview questions voiced by the platform's audio engine for a realistic mock experience.
*   **AI Answer Evaluation:** Receive immediate, question-by-question scoring and suggestions on formatting, tone, technical accuracy, and model answers.
*   **Interview Analytics Dashboard:** Track your weekly interview frequency, overall scores trend, topic distribution, and difficulty levels.
*   **Daily Challenge:** Engage in a fresh daily question challenge to build consistency, test your quick-thinking skills, and earn XP.
*   **Interview History Log:** Revisit all previous mock sessions, complete with detailed breakdowns of your strengths, weaknesses, and performance statistics.
*   **PDF Report Generation:** Export professionally formatted PDF report cards summarizing scores, domains, and question details.
*   **XP and Interview Tracking:** Track your growth using your total completed interview counts, XP awards, and activity calendars.
*   **Google Sign-In Authentication:** One-click registration and login using your Google account via Google Identity Services (OAuth 2.0).
*   **Automatic Account Creation:** New users can sign up instantly with their Google account (defaults to standard user role).
*   **Automatic Login:** Existing users are instantly logged in upon verifying their Google identity.
*   **Secure JWT Sessions:** Stateless, expiring JWT tokens protect all authenticated API routes and maintain sessions.
*   **Admin Portal:** A hidden, secure dashboard providing platform-wide statistics, user moderation (suspend, activate, delete accounts), session management, and server settings.
*   **Responsive UI:** A fully responsive, modern, dark-themed UI styled meticulously with vanilla CSS and HSL tailormade colors.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React (v19), Vite | User interface rendering, component-driven architecture, and modern build tooling. |
| **Backend** | Node.js, Express.js | Core REST API design, session routing, validation, and file uploads. |
| **Database** | MongoDB Atlas, Mongoose | NoSQL database storing users, interview sessions, daily challenges, and settings. |
| **AI Integration** | Generative AI API | Real-time generation of custom questions, evaluations, and mock templates. |
| **Authentication** | JWT (JSON Web Tokens) | Secure stateless auth sessions and route protection. |
| **Google OAuth** | Google Identity Services, google-auth-library | One-click Google Sign-In for registration and login via OAuth 2.0 ID token verification. |
| **Charts & Visualization** | Chart.js, react-chartjs-2 | Visual trends, registration lines, domain doughnuts, and activity tracking. |
| **Other Libraries** | pdfkit, multer, pdf-parse, lucide-react | PDF certificate rendering, file upload management, resume parsing, and premium iconography. |

---

## 🌐 System Architecture

```mermaid
graph LR
    A[React Frontend] --> B[Express Backend]
    B --> C[(MongoDB Atlas)]
    B --> D[Generative AI API]
    A --> E[Speech-to-Text]
    A --> F[Text-to-Speech]
```

1.  **Frontend (React Client):** Serves the responsive Dark-Theme dashboard, coordinates interactive components (Web Speech API, Charts, resume file uploaders), and handles routing and authentication headers.
2.  **Backend (Express API):** Enforces rate-limiting, JWT authentication, and administrative controls. Acts as a middleman coordinating requests, file processing, and DB queries.
3.  **Database (MongoDB Atlas):** Holds schemas for Users (with XP, streaks, status), Interviews (questions, user answers, AI feedback), and platform settings.
4.  **AI Engine (Google Gemini):** Dynamically receives prompts formatted with user skills, targets, or company profiles to generate relevant interviews and evaluations.

---

## 🔐 Authentication Flow

MockMate AI implements a secure, single-click Google Sign-In authentication flow:

### 🔵 Google Sign-In Flow
```
User clicks "Continue with Google"
    → Google ID Token verified on backend using Google's OAuth2 client
    → If New User: Account auto-created in database with default role "user"
    → If Existing User: Authenticate user profile (no duplicate accounts created)
    → JWT issued for stateless session management
    → Automatic redirect & login to Dashboard
```

---

## 🛡️ Security Features

| Feature | Implementation |
|---|---|
| **Google OAuth Verification** | Server-side ID token verification using Google's official `google-auth-library` |
| **JWT Authentication** | Stateless tokens with configurable expiry (default 7 days) issued upon successful Google authentication |
| **Protected Routes** | JWT middleware guards all private API endpoints |
| **Admin Route Guard** | Role check (`req.user.role === 'admin'`) blocks unauthorized portal access |
| **Account Suspension** | Suspended accounts are blocked at login with a clear error message |

---

## 📁 Folder Structure

```text
AI_Interview_Practice_Platform/
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Controllers for Auth, Interviews, Settings, and Admin
│   ├── middleware/         # JWT parsing, auth protection, status and maintenance checks
│   ├── models/             # Mongoose Schemas (User, Interview, Settings, DailyChallenge)
│   ├── routes/             # API Router definitions (auth, interviews, stats, settings, admin)
│   ├── utils/              # PDF generator and fallback question templates
│   ├── server.js           # Server entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── assets/         # Dynamic asset files
    │   ├── components/
    │   │   ├── common/     # Sidebar, ProtectedRoute, AppLayout, and 403 page
    │   │   └── ui/         # Chart wrappers, Modal alerts, and multi-select tags
    │   ├── context/        # React Context (Auth State)
    │   ├── pages/          # View Pages (Dashboard, Login, Analytics, AdminPortal, etc.)
    │   ├── services/       # Client-side API fetch client
    │   ├── App.jsx         # App routes mapping
    │   ├── main.jsx        # App entry point
    │   └── index.css       # Core typography, dark variables, and custom scrollbars
    └── package.json
```

---

## 🚀 Installation Guide

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
*   [Google AI Studio API Key](https://aistudio.google.com/) for Gemini access

### 1. Clone the Repository
```bash
git clone https://github.com/Priyanka-S-A/MockMate-AI.git
cd MockMate-AI
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend` folder and populate it with your environment variables (see [Environment Variables](#-environment-variables)).
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the platform in your browser at `http://localhost:5173`.

---

## 🔑 Environment Variables

To run the backend server, create a `.env` file in the `/backend` folder with the following variables:

```env
# Server
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_jwt_signing_secret_key
JWT_EXPIRES_IN=7d

# AI
GEMINI_API_KEY=your_google_gemini_api_key

# Google OAuth (backend token verification)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

For the frontend, create a `.env` file in the `/frontend` folder:

```env
# Google OAuth (frontend button rendering)
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

> **Variable Reference**
>
> | Variable | Description |
> |---|---|
> | `MONGODB_URI` | MongoDB Atlas connection string |
> | `JWT_SECRET` | Secret key used to sign JSON Web Tokens |
> | `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`, `24h`) |
> | `GEMINI_API_KEY` | API key for Google Gemini AI question generation |
> | `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID for server-side Google token verification |
> | `VITE_GOOGLE_CLIENT_ID` | Same Client ID exposed to Vite frontend for Google Sign-In button |

---

## 📖 Usage Guide

*   **Sign-In:** Authenticate with your Google account. Your profile will be automatically set up as a standard user with the `"user"` role.
*   **Daily Challenge:** Tackle the daily question from the dashboard to earn XP and build a daily practice habit.
*   **Start a Practice Mock:** Choose multiple domains (e.g. Java, DBMS, Operating Systems) to generate a customized mock interview mixing questions from those domains.
*   **Resume Interview:** Upload your professional resume in PDF format. The backend parses your qualifications to customize the interview questions.
*   **Company-Specific Practice:** Select your dream company (e.g. TCS, Capgemini) to practice mocks tailored to their hiring profile.
*   **Interactive Interview Room:** Listen to the question using Text-to-Speech. Answer by typing or use Speech-to-Text to dictate your response.
*   **AI Summary Evaluation:** Review your scoring breakdowns, strong/weak areas, and learning roadmaps, and download a PDF report card of your performance.

---

## 🛡️ Admin Portal
MockMate AI features a secure, hidden administrative portal reserved for administrators.

*   **Authorized Access Only:** The portal is hidden from all headers and navigation. It utilizes middleware role checking (`req.user.role === 'admin'`). Any non-admin attempting to access it receives a 403 page.
*   **Features:** Provides overall registration trends, active user metrics, platform settings (maintenance mode and registration controls), and database moderation functions (user suspension and account deletion).

---

## 📸 Screenshots

## Landing Page
![Landing Page](screenshots/landing-page.png)

## Login Page
![Login Page](screenshots/login-page.png)

## Dashboard
![Dashboard](screenshots/dashboard.png)

## Practice Interview
![Practice Interview](screenshots/practice-interview.png)

## Resume Interview
![Resume Interview](screenshots/resume-interview.png)

## Company-Specific Interview
![Company-Specific Interview](screenshots/company-interview.png)

## Analytics
![Analytics](screenshots/analytics.png)

## Interview History Logs
![Interview History Logs](screenshots/interview-history-log.png)

## Admin Portal
![Admin Portal](screenshots/admin-portal.png)

---

## ⚡ Challenges Faced

*   **Gemini API Quota & Fallbacks:** Designed a local fallback question pool when API quotas or internet connections fail, avoiding mock interruption.
*   **Resume Parsing Integrity:** Sanitized resume PDFs using `pdf-parse` to accurately map experience profiles to API prompts.
*   **Speech-to-Text Response Capturing:** Integrated browser SpeechRecognition with custom timeout handling to ensure continuous dictation.
*   **Streak & Active Days Logic:** Programmed aggregation logic to calculate active days dynamically from Completed status database documents.

---

## 🧠 Key Learning Outcomes

*   Developing clean REST APIs using Express.js and Mongoose schemas.
*   Formatting AI prompts with custom system constraints.
*   Managing state with React Context and securing routes using JWT.
*   Integrating browser speech APIs (Synthesis and Recognition).
*   Visualizing datasets using Chart.js wrappers.
*   Implementing secure authentication using Google OAuth 2.0 API token verification.
*   Designing role-based access control with JWT middleware and admin route guards.

---

## 👩‍💻 Developer

**Priyanka S**
*   **Degree:** B.Tech in Computer Science and Business Systems
*   **Institution:** Priyanka-S-A / MockMate-AI

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the file for details.

---

<p align="center">
  MockMate AI — Practice, Improve, and Master Your Technical & HR Interviews! 🚀
</p>
