# Probatiq

An AI-powered mock interview platform that helps candidates prepare for technical and behavioral interviews. Practice with realistic, role-specific questions, hold live voice conversations with an AI interviewer, and receive instant, personalized feedback to sharpen your performance before the real thing.

## What It Does

The platform tailors every session to the job you are targeting. You describe the role you want to practice for, and the system generates questions, conducts the interview, and evaluates your responses against that context — so the practice always feels relevant.

## Main Goal

Give job seekers a low-pressure, repeatable way to rehearse interviews with feedback they can actually act on, closing the gap between studying and performing.

## Features

- **Job Profiles** — Create and manage multiple job descriptions to practice for different roles or seniorities.
- **AI-Generated Questions** — Get role-specific interview questions generated on demand, with difficulty matched to the position.
- **Written Answer Practice** — Type out responses and receive detailed written feedback covering clarity, structure, and content.
- **Live Voice Interviews** — Hold a spoken, real-time conversation with an AI interviewer that listens, asks follow-ups, and reacts naturally.
- **Resume Analysis** — Upload a resume and receive a structured breakdown of how well it matches a target job, with strengths, gaps, and improvement suggestions.
- **Personalized Feedback** — Every answer and interview is scored and explained, highlighting what worked and what to improve.
- **Secure Accounts** — Sign in, manage your own job profiles and interview history privately, and pick up where you left off.
- **Dashboard** — One place to view your job profiles, past interviews, and resume analyses.

## Getting Started

### Prerequisites

- Node.js 20 or newer
- A running PostgreSQL database
- API credentials for the third-party services used by the app (authentication, AI generation, voice, security). See the environment variables list below.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root with the following keys:

```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Security / rate limiting
ARCJET_KEY=
ARCJET_ENV=development

# Database
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=5432
DB_NAME=

# (Add any additional keys required by the AI and voice providers used in this project.)
```

### 3. Set up the database

Apply the schema to your database:

```bash
npm run db:push
```

Or, if you prefer to work with migration files:

```bash
npm run db:generate
npm run db:migrate
```

You can browse and edit data with:

```bash
npm run db:studio
```

### 4. Run the app

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production build

```bash
npm run build
npm run start
```

## Useful Scripts

| Command               | Purpose                                           |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Start the development server with hot reload      |
| `npm run build`       | Build the production bundle                       |
| `npm run start`       | Run the production server                         |
| `npm run lint`        | Lint the codebase                                 |
| `npm run db:generate` | Generate a database migration from schema changes |
| `npm run db:migrate`  | Apply pending migrations                          |
| `npm run db:push`     | Push the current schema directly (dev shortcut)   |
| `npm run db:studio`   | Open the database browser UI                      |

## How To Use

1. Sign up and complete onboarding.
2. From the dashboard, create a **Job Profile** by pasting or describing the job you want to prepare for.
3. Optionally upload your **resume** to get a tailored match analysis against that job.
4. Pick a job profile and either:
   - Generate a **practice question** and submit a written answer to receive feedback, or
   - Start a **live voice interview** and talk through your responses in real time.
5. Review your feedback, iterate, and run as many sessions as you like.

## Project Status

Active development. Features and behavior may change.
