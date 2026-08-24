# 🏥 Healthcare Appointment & Follow-up Manager

A full-stack healthcare appointment management system designed to handle the complete appointment flow, from booking a consultation to post-visit follow-up.

The platform provides separate portals for **patients, doctors, and administrators**.

* **Patients** can search for doctors, book appointments, provide symptoms before a consultation, and view follow-up information.
* **Doctors** can manage appointments, view patient symptoms and AI-generated summaries, and add consultation notes and prescriptions.
* **Administrators** can manage doctor profiles, working hours, and leave.

---

## 🛠️ Tech Stack

### 🎨 Frontend

| Technology          | Usage                                                                       |
| ------------------- | --------------------------------------------------------------------------- |
| **React.js**        | Builds the user interface and separate patient, doctor, and admin portals   |
| **Vite**            | Frontend build tool and development server                                  |
| **React Router**    | Navigation and protected routes based on user roles                         |
| **Tailwind CSS**    | Styling dashboards, forms, and application components                       |
| **Axios**           | Communicating with the Express backend through REST APIs                    |
| **React Hook Form** | Managing registration, appointment booking, symptom, and prescription forms |
| **date-fns**        | Handling appointment dates, working hours, and slot-related calculations    |

### ⚙️ Backend

| Technology        | Usage                                             |
| ----------------- | ------------------------------------------------- |
| **Node.js**       | Runtime environment for the backend               |
| **Express.js**    | Building REST APIs and handling frontend requests |
| **JWT**           | Authentication and role-based authorization       |
| **bcrypt**        | Secure password hashing                           |
| **cookie-parser** | Handling authentication cookies                   |
| **CORS**          | Allowing secure frontend-backend communication    |

### 🗄️ Database

| Technology     | Usage                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| **PostgreSQL** | Primary database for users, doctors, appointments, working hours, leave days, prescriptions, and notifications |
| **Prisma**     | ORM used for database schema management, migrations, relationships, and queries                                |

PostgreSQL transactions and constraints help maintain data consistency and handle scenarios such as **appointment slot conflicts and double-booking prevention**.

### 🔗 External Services

| Service                 | Usage                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **LLM API**             | Generates pre-visit symptom summaries and patient-friendly post-visit summaries    |
| **Nodemailer**          | Sends appointment confirmations, reminders, cancellations, and other notifications |
| **Google Calendar API** | Creates, updates, and deletes appointment calendar events                          |
| **Google OAuth 2.0**    | Securely connects user accounts with Google Calendar                               |

LLM processing is handled through the backend so that failures in AI services do not interrupt the core appointment workflow.

---

## ⚙️ How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/aanchal0506/unthinkable.git
cd unthinkable
```

### 2. Run the Backend

Open a terminal:

```bash
cd backend
npm install
npm run dev
```

### 3. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Once both servers are running, open the frontend URL displayed in the terminal.

---

## 🚀 Deployment

The application is deployed using **Render**.

🔗 **Live Application:**

Sensitive credentials and third-party service configuration are securely managed through the deployment platform and are not included in the repository.

---

## 👩‍💻 Author

**Aanchal Ladha**

[GitHub Repository](https://github.com/aanchal0506/unthinkable)
