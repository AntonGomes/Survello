# Survello

> The first AI-native platform for Building Surveyors.

SMEs in Britain are positioned to gain a massive competitive advantage from the proper adoption of AI in their internal workflows. Survello is the tool that does this for Building Surveyors, giving them the efficiency and organisation of a large firm.

Survello grows with you, easily scalable to new team members and larger jobs.

---

## Features

### Work Management
- Track your active jobs and instructions, **no more spreadsheets**.
- Use time tracking to accurately measure your billable hours, improve the accuracy of your fee proposals, and **feel confident in your invoices**.
- Upload your surveys, keeping your site notes and images easily accessible. **No more digging through SharePoint for hours**.

### Client Contact Book
- Keep a tab on your contacts, when you last reached out, and what jobs they have active.
- Easily email or call your client contacts straight from Survello.

### AI Document Writing
- Use **Document Generation** to create technical schedules in minutes, not hours.
- Survello AI looks through the relevant files (e.g. external reports, images, lease documents, site notes, etc.), extracts the details that really matter for this job, and inserts them into **your template**.
- No branding or watermarks, Survello-generated documents look *identical* to your documents. **The only difference: they take minutes, not hours**.

---

## AI Philosophy: More than Bells and Whistles
AI as a technology has huge potential to level the playing field in business and beyond. However, it is too often adopted without enough thought or compassion for the user.

At Survello, we promise that all of your information is kept secure and is never used to train AI models. Our AI tools will never be a hindrance to your work. We only implement AI features that we have tried and tested, because they genuinely improve your workflow. They are not bells and whistles, they are tools designed to help you do your job better.

---


## Coming Soon

- **Survello Chat**: Use Survello AI to learn more about your own jobs. Survello AI can dig through environmental reports, costings, lease documents, and pull out the information you need. Cited and sourced, Survello AI will show you exactly where it got its answer — no guesswork involved.
- **Quote and Lead Tracking**: Got something in the works with a new client? Survello lets you track recent leads and reminds you to follow them up. Just sent off a quote? Survello lets you track that too — no need to hunt for replies in your inbox.

---

## Tech Stack

### Backend

| Category | Technology |
|----------|------------|
| **Language** | Python 3.11+ |
| **Framework** | FastAPI |
| **ORM / Data Models** | SQLModel (Pydantic + SQLAlchemy) |
| **Database** | PostgreSQL (via psycopg2) |
| **Migrations** | Alembic |
| **Authentication** | Passlib, Argon2 (pwdlib) |
| **AI / LLM** | OpenAI SDK, ContextGem |
| **File Storage** | AWS S3 (boto3) |
| **Email** | Resend |
| **Server** | Uvicorn |
| **Linting & Type Checking** | Ruff, Ty |
| **Testing** | Pytest |

### Frontend

| Category | Technology |
|----------|------------|
| **Language** | TypeScript 5 |
| **Framework** | Next.js 15 (with Turbopack) |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **Component Library** | shadcn/ui (Radix UI primitives) |
| **State & Data Fetching** | TanStack Query (React Query) |
| **Forms** | React Hook Form, Zod |
| **API Client** | HeyAPI (OpenAPI code generation) |
| **Animations** | Motion (Framer Motion) |
| **Charts** | Recharts |
| **Drag & Drop** | dnd-kit |
| **PDF Rendering** | react-pdf |
| **Date Utilities** | date-fns |
| **Notifications** | Sonner |
| **Linting** | ESLint |
| **Git Hooks** | Husky, lint-staged | 


