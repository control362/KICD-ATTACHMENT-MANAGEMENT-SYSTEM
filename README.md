# KICD Attachment Management System

This repository contains the complete KICD Attachment Management System, consisting of a Spring Boot backend and a modern Next.js frontend styled with TailwindCSS.

## Prerequisites

Before running the application, ensure you have the following installed:
1. **Java Development Kit (JDK)**: Version 17 or higher.
2. **PostgreSQL**: Version 12 or higher.
3. **Node.js**: Version 18 or higher (for running the Next.js frontend).
4. **Git**: For version control.

---

## 1. Database Setup

The backend relies on PostgreSQL. You need to create a database and configure your credentials.

1. Open your PostgreSQL terminal (e.g., `psql` or pgAdmin).
2. Create the database used by the application:
   ```sql
   CREATE DATABASE kicd_db;
   ```
3. By default, the application connects with `postgres`/`admin123`. If your credentials differ, update them in:
`BACKEND-main/src/main/resources/application.properties`

*Note: The backend uses **Flyway** for migrations. Starting the backend will automatically set up the schema and seed default data.*

---

## 2. Running the Backend (Spring Boot)

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd BACKEND-main
   ```
2. Run the application:
   - **Windows**: `.\mvnw spring-boot:run`
   - **macOS/Linux**: `./mvnw spring-boot:run`

The backend runs on **`http://localhost:8081`** by default (configured in `application.properties`).

---

## 3. Running the Frontend (Next.js)

The frontend is a robust Next.js application built with App Router and Tailwind CSS.

1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd kicd-nextjs-client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend runs on **`http://localhost:3000`**. Open this URL in your browser to access the system.

---

## 4. Default Logins & System Roles

The platform manages three distinct roles. To get you started immediately, the system automatically seeds the following default accounts (all passwords are `password123`):

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@kicd.ac.ke` | `password123` | Full system administrator: manages staff, departments, and system configs. |
| **HR_OFFICER** | `hr@kicd.ac.ke` | `password123` | Reviewer who evaluates and accepts/rejects applications. |
| **STUDENT** | `student@test.com` | `password123` | Applicant who browses opportunities and tracks their application status. |

*You can also register a brand new student account via the public landing page interface.*
