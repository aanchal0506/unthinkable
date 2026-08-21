**Healthcare Appointment & Follow-up Manager**

A full-stack healthcare appointment management system designed to handle the complete appointment flow, from booking a consultation to post-visit follow-up.

The platform has separate portals for patients, doctors, and administrators. Patients can search for doctors, book appointments, provide their symptoms before a consultation, and view their follow-up information. Doctors can manage their appointments, view patient symptoms and AI-generated summaries, and add consultation notes and prescriptions. Administrators manage doctor profiles, working hours, and leave.

**Tech Stack**

Frontend
React.js — Used to build the user interface and the separate patient, doctor, and admin portals.
Vite — Used as the frontend build tool and development server for a lightweight and fast React setup.
React Router — Used for navigation and protected routes based on user roles.
Tailwind CSS — Used for styling the application and building the dashboards and forms.
Axios — Used to communicate with the Express backend through REST APIs.
React Hook Form — Used to manage forms such as registration, appointment booking, symptom submission, and prescriptions.
date-fns — Used for handling appointment dates, working hours, and slot-related date calculations.

Backend
Node.js — Used as the runtime environment for the backend.
Express.js — Used to build the REST API and handle requests from the frontend.
JWT (JSON Web Tokens) — Used for authentication and role-based authorization.
bcrypt — Used to securely hash user passwords before storing them.
cookie-parser — Used to handle authentication cookies.
CORS — Used to allow communication between the frontend and backend.

Database
PostgreSQL — Used as the primary database because the application contains several related entities such as users, doctors, appointments, working hours, leave days, prescriptions, and notifications. PostgreSQL also provides transactions and constraints that are useful for preventing issues such as double-booking.
Prisma — Used as the ORM for PostgreSQL. It provides database migrations, schema management, relationships, and a simpler way to interact with the database from the Node.js backend.

External Services
LLM API — Used to generate pre-visit symptom summaries for doctors and patient-friendly summaries after consultations. LLM processing is handled by the backend so that failures do not affect the core appointment system.
Nodemailer — Used to send appointment confirmations, reminders, cancellation notifications, and other email notifications.
Google Calendar API — Used to create, update, and delete calendar events for appointments.
Google OAuth 2.0 — Used to securely connect users' Google Calendar accounts.
