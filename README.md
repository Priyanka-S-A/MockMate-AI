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
[![Nodemailer](https://img.shields.io/badge/Nodemailer-009688?style=for-the-badge&logo=gmail&logoColor=white)](https://nodemailer.com/)

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
*   **Email OTP Verification:** New accounts are created only after verifying a 6-digit OTP sent to the registered email — no unverified accounts in the database.
*   **Automatic Login after OTP Verification:** Upon successful OTP verification, users are instantly logged in without a separate login step.
*   **Forgot Password via OTP:** Recover account access through a secure 3-step flow: submit email → verify OTP → reset password.
*   **Multi-Provider Authentication:** A single account can authenticate via both email/password and Google Sign-In simultaneously without duplication.
*   **60-Second OTP Resend Cooldown:** Prevents OTP spam by enforcing a 60-second wait between resend requests.
*   **Secure JWT Authentication:** Stateless, expiring JWT tokens protect all authenticated API routes.
*   **Secure Authentication:** Secure user sign-up, JWT-based login sessions, password encryption, and automatic user profile management.
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
| **Authentication** | JWT (JSON Web Tokens), bcryptjs | Secure stateless auth sessions, route protection, and hashed password security. |
| **Google OAuth** | Google Identity Services | One-click Google Sign-In for registration and login via OAuth 2.0 ID token verification. |
| **Email Service** | Nodemailer, Gmail SMTP | Transactional OTP emails for account verification and password recovery. |
| **OTP Verification** | bcryptjs, Mongoose TTL | 6-digit OTPs hashed with bcrypt and stored in a self-expiring TTL collection (5-minute auto-purge). |
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

MockMate AI implements a fully secure, multi-provider authentication system:

### ✉️ Email + Password Registration
```
User fills Name / Email / Password
    → OTP generated & emailed (valid 5 minutes)
    → OTP Verification Screen (6-digit input)
    → Account created in database
    → JWT issued → Automatic Login → Dashboard
```

### 🔵 Google Sign-In
```
User clicks "Continue with Google"
    → Google ID Token verified on backend (OAuth 2.0)
    → New user: account auto-created with role=user
    → Existing user: Google provider merged (no duplicate)
    → JWT issued → Automatic Login → Dashboard
```

### 🔑 Forgot Password Recovery
```
User submits registered email
    → Recovery OTP emailed (valid 5 minutes)
    → OTP Verification Screen
    → New Password form
    → Password updated securely → Redirect to Login
```

> **Note:** OTP resend requests are rate-limited to once every **60 seconds**. Unverified registrations auto-expire after 5 minutes via a MongoDB TTL index.

---

## 🛡️ Security Features

| Feature | Implementation |
|---|---|
| **JWT Authentication** | Stateless tokens with configurable expiry (default 7 days) |
| **Password Hashing** | bcryptjs with salt rounds on every save via Mongoose pre-save hook |
| **Google OAuth Verification** | Server-side ID token verification using `google-auth-library` |
| **Email OTP Verification** | 6-digit OTP hashed with bcrypt before storage |
| **OTP Expiration** | All OTPs expire after **5 minutes** |
| **OTP Resend Cooldown** | **60-second** cooldown enforced server-side (HTTP 429) |
| **Temporary Registration Store** | Pending registrations stored in TTL collection — auto-deleted after 5 min |
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
│   ├── models/             # Mongoose Schemas (User, Interview, Settings, DailyChallenge, OtpPending)
│   ├── routes/             # API Router definitions (auth, interviews, stats, settings, admin)
│   ├── utils/              # PDF generator, email OTP service (Nodemailer), and fallback question templates
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

# Gmail SMTP (for OTP email delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-gmail-app-password
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
> | `SMTP_HOST` | SMTP server hostname (e.g. `smtp.gmail.com`) |
> | `SMTP_PORT` | SMTP port (`587` for TLS, `465` for SSL) |
> | `SMTP_USER` | Gmail address used as the OTP email sender |
> | `SMTP_PASS` | Gmail App Password (not your regular Gmail password) |
>
> **Tip:** Generate a Gmail App Password at **Google Account → Security → App Passwords**.
> If SMTP variables are not set, OTPs will be logged to the backend console (development fallback).

---

## 📖 Usage Guide

*   **Register & Login:** Set up your profile. Your account will start as a standard user with the `"user"` role.
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

*Placeholders for MockMate AI visual flow:*

#### Landing Page
> *Professional introduction layout featuring key value propositions and CTA buttons.*

#### Login Page
> *Dark-themed login form with email/password fields and "Continue with Google" OAuth button.*

#### Registration Page — Step 1
> *Registration form capturing Name, Email, Password, and Confirm Password with Google Sign-In option.*

#### Registration Page — Step 2 (OTP Verification)
> *6-digit OTP input screen with 60-second countdown timer and resend button, dispatched after registration.*

#### Forgot Password — Step 1 (Email Entry)
> *Email submission form to trigger the account recovery OTP flow.*

#### Forgot Password — Step 2 (OTP Verification)
> *OTP verification screen with resend cooldown for password recovery.*

#### Forgot Password — Step 3 (Reset Password)
> *New password and confirm password form to finalize account recovery.*

#### Dashboard
> *Permanent dark-themed layout displaying total interviews, XP tracker, daily challenge, and quick mock options.*

#### Practice Interview
> *Multi-select domain configuration form with options for question count and difficulty levels.*

#### Resume Interview
> *Minimalist PDF resume uploader.*

#### Company-Specific Interview
> *Grid listing target corporations.*

#### Analytics
> *Chart.js grids displaying score trends, domain coverages, and weekly activity metrics.*

#### Interview Summary
> *Evaluation cards outlining overall score rings, key strengths, weak points, learning roadmap, and PDF export buttons.*

#### Admin Portal
> *Administrator dashboard showing real-time sign-up lines, interview bar graphs, and user management tables.*

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
*   Implementing multi-provider authentication (Email OTP + Google OAuth 2.0) with secure token flows.
*   Building SMTP-driven email services with bcrypt-hashed OTP verification and TTL-based auto-expiry.
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
