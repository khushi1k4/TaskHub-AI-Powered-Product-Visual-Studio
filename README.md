# TaskHub – AI-Powered Product Photography Platform

**Deployed Link:** [https://taskhub-ai-visual.vercel.app/](https://taskhub-ai-visual.vercel.app/)

(NOTE: Deployed on Vercel+Docker+Render but Render sleeps backend frequently, especially ML due to heavy loading which might cause issues and Railway is paid for deployment.)

**Video:** [Demostration video](https://drive.google.com/file/d/19-hrZH5Zgv5aVLeFbHobw4AAdLl0LwMp/view?usp=sharing)

TaskHub is a full-stack task management platform that combines workflow management with an AI-powered Product Photography Studio.

Admins can assign product photography tasks to users, while users generate professional AI-enhanced product images and submit them for review. The platform supports role-based access control, email notifications, asynchronous image generation, task review workflows, and analytics.

---

# 🚀 Features

## Admin Features

* Create product photography tasks
* Upload product reference images
* Assign tasks to users
* Accept submissions
* Request revisions
* View all users and tasks
* Receive submission notifications

## User Features

* Receive assigned tasks
* View personal task dashboard
* Generate AI product images
* Regenerate images as needed
* Task To-do List
* Submit completed work
* Receive acceptance or revision notifications

---

# 📸 AI Product Photography Studio

Each task requires generation of **8 images**:

| Type                     | Count |
| ------------------------ | ----- |
| White Background         | 1     |
| Theme-Based Backgrounds  | 2     |
| Creative Backgrounds     | 2     |
| Model Wearing (Front)    | 1     |
| Model Wearing (Side)     | 1     |
| Model Wearing (Close-up) | 1     |
| **Total**                | **8** |

## Supported Variations

### White Background

* Pure white (#FFFFFF)
* E-commerce ready
* Clean product extraction

### Theme-Based

Examples:

* Luxury marble surface
* Velvet premium display
* High-end showroom environment

### Creative Lifestyle

Examples:

* Luxury interior scenes
* Natural outdoor settings
* Editorial-style compositions

### Model Wearing

* Front view
* 45° side view
* Close-up product shot

---

# 🏗️ Architecture Overview

```text
┌─────────────────────────┐
│ Frontend: Next.js in TS │
└─────────────┬───────────┘
              │
              ▼
┌─────────────────────────┐
│       Flask Backend     │
└─────────────┬───────────┘
              │
     ┌────────┴────────┐
     ▼                 ▼
┌───────────┐   ┌─────────────┐
│ Supabase  │   │ Redis Queue │
│ PostgreSQL│   │ + Celery    │
└───────────┘   └──────┬──────┘
                       ▼
             ┌─────────────────┐
             │ AI Processing   │
             │ Pipeline        │
             └─────────────────┘
                       ▼
             ┌─────────────────┐
             │ Image Storage   │
             └─────────────────┘
```

## Workflow

1. Admin creates a task
2. Product image uploaded with reference
3. Task assigned to the user
4. User receives email notification
5. User generates AI variations
6. Images stored and tracked
7. User submits task
8. Admin receives notification
9. Admin accepts or requests revision

---

# 🛠 Tech Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS

## Backend

* Flask
* Celery
* Redis
* Docker

## Database

* Supabase PostgreSQL

## Authentication

* Google OAuth 2.0
* GitHub OAuth 2.0

## Email Service

* Resend

## AI Components

* Background Removal
* Product Extraction
* Prompt Engineering
* Image Generation Pipeline using stability AI, Cloudflare AI

---

# 🗄️ Database Schema

## users

Stores platform users and authentication details.

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| email      | TEXT      |
| full_name  | TEXT      |
| role       | TEXT      |
| provider   | TEXT      |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## tasks

Stores assigned photography tasks.

| Field             | Type      |
| ----------------- | --------- |
| id                | UUID      |
| task_title        | TEXT      |
| product_name      | TEXT      |
| product_image_url | TEXT      |
| gender            | TEXT      |
| assigned_user_id  | UUID      |
| admin_id          | UUID      |
| status            | TEXT      |
| revision_count    | INT4      |
| created_at        | TIMESTAMP |
| updated_date      | TIMESTAMP |

---

## generated_images

Stores AI-generated outputs.

| Field       | Type      |
| ----------- | --------- |
| id          | UUID      |
| task_id     | UUID      |
| image_url   | TEXT      |
| prompt_used | TEXT      |
| image_type  | TEXT      |
| created_at  | TIMESTAMP |

---

# 🔄 Task Status Flow

```text
pending
   ↓
assigned
   ↓
in_progress
   ↓
submitted
   ↓
accepted
```

Revision workflow:

```text
submitted
   ↓
revision_requested
   ↓
in_progress
```

---

# 🤖 AI Approach

## Stage 1: Product Extraction

The uploaded product image is isolated from its background using automated background removal techniques.

## Stage 2: Product Analysis

The system extracts:

* Product category
* Product colors
* Product characteristics

## Stage 3: Prompt Generation

Dynamic prompts are created using:

* Product metadata
* Image type
* Desired angle
* Quality constraints

## Stage 4: Image Generation

The AI pipeline generates:

1. White background image
2. Theme variation #1
3. Theme variation #2
4. Creative variation #1
5. Creative variation #2
6. Model front view
7. Model side view
8. Model close-up

## Stage 5: Storage

Generated outputs and metadata are stored and linked to the associated task in **Cloudinary**.

---

# 🔌 API Endpoints

## Authentication

```http
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/oauth/callback
GET  /api/auth/me
GET /api/auth/users
POST /api/auth/logout
```

## Task

```http
POST    /api/tasks
GET     /api/tasks
PATCH   /api/tasks/:task_id/status
GET     /api/tasks/dashboard-stats
GET     /api/tasks/my-tasks
GET     /api/tasks/:task_id
POST   /api/tasks/:id/assign
PUT    /api/tasks/:id/accept
PUT    /api/tasks/:id/request-revision
PUT    /api/tasks/:id/start
DELETE /api/tasks/:id
POST   /api/tasks/:id/submit
```

## AI Generations

```http
GET     /api/ai/tasks/:task_id/generations
GET     /api/ai/jobs/:id/status
DELETE  /api/ai/generations/:gen_id
POST    /api/ai/tasks/:task_id/generate
POST    /api/ai/generate
```

---

# ⚙️ Local Setup

## Clone Repository

```bash
git clone https://github.com/yourusername/taskhub.git
cd taskhub
```

## Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate
# Windows:
# venv\Scripts\activate

pip install -r requirements.txt
python app.py
```

## Frontend Setup

```bash
cd taskhub-frontend

npm install

npm run dev
```

## Start Redis

```bash
redis-server
```

## Start Celery

```bash
celery -A workers.celery_app worker --loglevel=info

celery -A workers.celery_app.celery worker --loglevel=info -P gevent
```

## Start Backend

```bash
gunicorn "app:create_app()"
```

---

# 🔧 Environment Variables

Create a `.env` file using `.env.example`.

```env
# /taskhub/backend

# Flask
FLASK_ENV=

# Redis (Celery)
REDIS_URL=

SECRET_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

SUPABASE_JWT_SECRET=

RESEND_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Replicate (SDXL / FLUX)
REPLICATE_API_TOKEN=

CLOUDFLARE_API_KEY=
CLOUDFLARE_ACCOUNT_ID=

STABILITY_API_KEY=

FRONTEND_URL=

# taskhub/frontend
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_API_URL=
```

---

# 🗃 Database Setup

The project currently uses SQL schema files.

```text
database.py
routes/
```

Run the schema file against PostgreSQL or Supabase before starting the application.

---

# 📂 Project Structure

```text

taskhub/
├── taskhub-frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── providers/
│   ├── public/
├── backend/
│   ├── routes/
│   ├── utils/
│   ├── tasks/
│   ├── workers/
│   ├── ml/
│   ├── app.py
│   ├── config.py
│   ├── decorators.py
│   ├── database.py
│   └── Dockerfile
├── .env.example
├── README.md

```
---
# Output Images
<img width="400" height="300" alt="Image" src="https://github.com/user-attachments/assets/f12bb38a-7ce9-4251-a51f-4a2462c15699" />
<img width="200" height="300" alt="Image" src="https://github.com/user-attachments/assets/941b087a-6fe4-4dcf-8816-ebb29b3c027f" />
<img width="236" height="300" alt="Image" src="https://github.com/user-attachments/assets/4ee9bdff-1467-4bf7-8e14-ba7700559ccc" />
<img width="225" height="300" alt="Image" src="https://github.com/user-attachments/assets/f5d50df7-1885-4f0f-a047-21dab7f89996" />

---
# ⚠ Known Limitations

* AI-generated outputs may vary depending on image quality.
* Product preservation depends on the capabilities of underlying AI providers.
* Highly reflective jewelry can be challenging.
* Model-wearing generations may introduce minor visual inconsistencies.
* Processing time depends on queue load and AI provider response times.

---

# 🔮 Future Enhancements

* Automated quality scoring
* Batch generation
* Fine-tuned product-preservation models
* Multi-product scene generation
* Versioned image history
* Advanced analytics

---
<div align="center">

  ## 👩‍💻 Built By
— <b>Khushi Goyal</b> ✨

AI-ML Developer | MERN | Full-Stack Developer
<br/>
( Sky is not the limit, Limit is in our vision. )
</div>
