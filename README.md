# KICD Attachment Management System

This repository contains the complete KICD Attachment Management System, consisting of a Spring Boot backend and a vanilla HTML/JS/CSS frontend styled with TailwindCSS.

## Prerequisites

Before running the application, ensure you have the following installed:
1. **Java Development Kit (JDK)**: Version 17 or higher.
2. **PostgreSQL**: Version 12 or higher.
3. **Node.js**: (Optional) For running a local HTTP server for the frontend, e.g., using `serve` or `http-server`.
4. **Git**: For version control.

---

## 1. Database Setup

The backend relies on PostgreSQL. You need to create a database and optionally configure your database credentials.

1. Open your PostgreSQL terminal (e.g., `psql` or pgAdmin).
2. Create the database used by the application:
   ```sql
   CREATE DATABASE kicd_db;
   ```
3. By default, the application is configured to connect with:
   - **Username**: `postgres`
   - **Password**: `admin123`

*If your local PostgreSQL credentials differ, you must update them in the backend configuration file located at:*
`BACKEND-main/src/main/resources/application-dev.yml`

*Note: The backend uses **Flyway** for database migrations. You do not need to manually create any tables; simply starting the backend will automatically set up your database schema.*

---

## 2. Running the Backend

The backend is built with Spring Boot and uses Maven.

1. Open your terminal (Command Prompt, PowerShell, or Git Bash).
2. Navigate into the backend directory:
   ```bash
   cd BACKEND-main
   ```
3. Run the application using the included Maven Wrapper:
   - **On Windows**:
     ```powershell
     .\mvnw spring-boot:run
     ```
   - **On macOS/Linux**:
     ```bash
     ./mvnw spring-boot:run
     ```

4. The backend will start up and run on **`http://localhost:8080`**. Wait until you see the message `Started KicdApplication` in your terminal.

---

## 3. Running the Frontend

The frontend is a vanilla JavaScript application with routing. It must be served over a local HTTP server (simply double-clicking the `index.html` file in your browser will cause CORS and module issues).

1. Open a **new** terminal window.
2. Navigate into the frontend app directory:
   ```bash
   cd "kicd-frontend-app (1)/app"
   ```
3. Serve the directory over HTTP. You can use any lightweight server:
   
   **Using Python (Recommended if you have Python installed):**
   ```bash
   python -m http.server 3000
   ```

   **Using Node.js/npx:**
   ```bash
   npx serve . -p 3000
   ```
   *Alternatively, if you use VS Code, you can right-click the `index.html` file and select "Open with Live Server".*

4. Open your browser and navigate to the frontend URL (e.g., **`http://localhost:3000`**).

---

## System Users & Roles

Once both servers are running, you can access the system. The platform manages three distinct roles:

- **STUDENT**: Applicants looking for attachment opportunities. They can view opportunities, update their profiles, and submit applications.
- **HR_OFFICER**: Reviewers who manage incoming applications, assess candidates, and accept/reject them.
- **ADMIN**: System administrators who manage departments, staff accounts, and overall platform configurations.

*You can register a new student account via the frontend interface. For HR and Admin roles, credentials must be manually seeded or created by an existing Admin.*
