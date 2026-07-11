# School Management Platform — Frontend

The frontend for **SchoolApply**, a full-stack school admissions and management
platform built for South African primary and high schools. This repo contains the
React-based user interface that admins, teachers, and parents use to manage
applications, dashboards, and day-to-day school activities.

> 🔗 Backend repo: link it here once pushed (Spring Boot API)

## ✨ Features

- 🔐 JWT-based authentication with role-based access control (Admin / Teacher / Parent)
- 📝 Multi-step school application form for prospective parents
- 📁 Document upload for admissions (ID copies, report cards, proof of residence, etc.)
- 📊 Role-specific dashboards:
  - **Admin** — manage applications, users, and school-wide announcements
  - **Teacher** — view assigned classes and student records
  - **Parent** — track application status and submitted documents
- 📰 Public school news and announcements section

## 🛠️ Tech Stack

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM
- **State/Auth:** JWT stored client-side, role read from token payload
- **API:** REST, communicating with the [SchoolApply backend](https://github.com/Nhlamulo-Mokwena/School-Management-Platform-Backend) (Spring Boot)

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/Nhlamulo-Mokwena/School-Management-Platform-Frontend.git
cd School-Management-Platform-Frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app expects the SchoolApply backend API running locally (see backend repo for setup).
Configure the API base URL in your `.env` file:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 📸 Screenshots

_Add a few screenshots of the admin dashboard, application form, and parent view here —
this is often the first thing a recruiter looks at._

## 🧭 Project Status

Actively in development. Current focus: polishing the parent application flow and
admin review dashboard.

## 👤 Author

**Phillemon Nhlamulo Mokwena**
[GitHub](https://github.com/Nhlamulo-Mokwena) ·
[LinkedIn](https://www.linkedin.com/in/nhlamulo-mokwena-947a0b321/)
