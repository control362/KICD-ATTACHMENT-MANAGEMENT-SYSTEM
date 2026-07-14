# KICD Attachment Management System

This repository contains the complete KICD Attachment Management System, consisting of a Spring Boot backend and a strictly-typed Next.js frontend styled with TailwindCSS.

## Architecture Highlights
- **Frontend**: Next.js (App Router), React, SWR Caching, Strict TypeScript.
- **Backend**: Spring Boot 3, Java 21, Hibernate, JWT Authentication.
- **Database**: PostgreSQL with Flyway Migrations.
- **API Gateway**: Nginx Reverse Proxy with Rate Limiting (10 req/min on `/api/auth/login`).
- **Orchestration**: Docker Compose for easy deployment.

---

## 🚀 Quick Start (Recommended: Docker)

The easiest way to run the entire enterprise stack (PostgreSQL, Spring Boot, Next.js, and Nginx) is via Docker.

### Prerequisites
- Docker & Docker Compose installed.

### Steps
1. Clone the repository and navigate to the root directory.
2. Build and start the containers in detached mode:
   ```bash
   docker compose up -d --build
   ```
3. The system is now live!
   - **Frontend App**: `http://localhost`
   - **Swagger API Docs**: `http://localhost:8081/swagger-ui.html`

*Note: Flyway will automatically run database migrations and seed default data on startup.*

---

## 🛠️ Manual Development Setup

If you prefer to run the components locally for development without Docker:

### Prerequisites
1. **Java Development Kit (JDK)**: Version 21.
2. **PostgreSQL**: Version 12 or higher.
3. **Node.js**: Version 18 or higher.

### 1. Database Setup
Create the database in PostgreSQL:
```sql
CREATE DATABASE kicd_db;
```
By default, the backend expects `postgres`/`admin123`. To override this, edit `BACKEND-main/src/main/resources/application.properties` or set environment variables (`DB_APP_USER`, `DB_APP_PASSWORD`).

### 2. Run Backend (Spring Boot)
```bash
cd BACKEND-main
./mvnw clean spring-boot:run
```
*Runs on `http://localhost:8081`*

### 3. Run Frontend (Next.js)
```bash
cd kicd-nextjs-client
npm install
npm run dev
```
*Runs on `http://localhost:3000`*

---

## 🔐 Default Login Credentials

The database is automatically seeded with default accounts to get you started. All default passwords are **`admin123`**.

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@kicd.ac.ke` | `admin123` | Full system administrator. Manages staff, departments, and configs. |
| **HR_OFFICER** | `hr@kicd.ac.ke` | `admin123` | Reviewer who evaluates and accepts/rejects applications. |
| **STUDENT** | `student@gmail.com` | `admin123` | Standard applicant who browses opportunities and tracks their status. |

*You can also register a brand new student account via the public landing page interface.*
