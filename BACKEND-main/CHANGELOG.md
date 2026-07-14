# Backend Architecture & Refactoring Changelog

This document tracks all the detailed enterprise-level architectural changes, security enhancements, and optimizations made to the Spring Boot backend since the original prototype.

## 1. Database & Schema Architecture
- **Flyway Consolidation**: Refactored and squashed a bloated migration history (V1 through V9) into a clean, two-step initialization process:
  - `V1__init_schema.sql`: Contains the complete, normalized DDL for all tables.
  - `V2__seed_data.sql`: Contains all necessary seed data (Departments, Roles, Users, Opportunities) separated from the schema definition.
- **Role-Based Least Privilege**: Implemented a security strategy that removes `postgres` (superuser) from application runtime. The application now connects via a restricted `kicd_app` role capable only of DML operations (SELECT, INSERT, UPDATE, DELETE), while `kicd_admin` owns the schema for Flyway.

## 2. Performance Optimization
- **N+1 Query Elimination**: Discovered and resolved critical N+1 query bottlenecks in the Hibernate/JPA layer.
  - Modified `@OneToOne` and `@ManyToOne` associations in `ApplicantProfile` from `FetchType.EAGER` to `FetchType.LAZY`.
  - This drastically reduced the number of database queries executed when listing applications or profiles, improving API response times from O(N) to O(1) for entity associations.

## 3. Security & Hardening
- **Stateless JWT Architecture**: Verified and hardened the Spring Security configuration (`SecurityConfig.java`).
  - Confirmed the API is fully stateless (`SessionCreationPolicy.STATELESS`).
  - Disabled CSRF (`csrf.disable()`) explicitly because the architecture utilizes `Authorization: Bearer` tokens, rendering traditional browser-based CSRF attacks physically impossible.
- **Role-Based Access Control (RBAC)**: Enforced strict endpoint authorization using `hasRole()` (e.g., separating `/api/reviewer/**` from `/api/student/**`).
- **Global Exception Handling**: Hardened the `GlobalExceptionHandler` to catch all unexpected errors and return structured `ApiError` DTOs, preventing internal stack traces from leaking to the client.

## 4. Environment & Deployment
- **Configuration Segregation**: Separated configurations into `application.properties` (dev) and `application-prod.properties` (production) to manage environment variables (`DB_APP_USER`, `DB_APP_PASSWORD`, `JWT_SECRET`).
- **Dockerization**: Built a highly optimized, multi-stage `Dockerfile` using `eclipse-temurin:21-jdk-alpine` for building and `eclipse-temurin:21-jre-alpine` for running the `.jar`.
- **API Gateway Rate Limiting**: Offloaded rate-limiting to an Nginx API Gateway container to protect endpoints like `/api/auth/login` from brute-force stuffing, keeping the Java application logic lean.

## 5. Clean Code & Dead Code Elimination
- **Test Cleanup**: Removed obsolete default testing classes (`KicdStudentApplicationTests.java`) that were no longer relevant to the actual integration tests.
- **Dependency Audit**: Verified that the `pom.xml` contains zero unused runtime dependencies, maintaining a lean enterprise application profile.

## 6. API Documentation
- **Swagger Integration**: Integrated `springdoc-openapi-starter-webmvc-ui` into the `pom.xml`. The API contracts are now automatically generated and interactively testable via `/swagger-ui.html`.
