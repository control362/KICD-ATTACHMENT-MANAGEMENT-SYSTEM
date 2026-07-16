# KICD Attachment Management System: Input Validation and Integrity Checks

This document provides a comprehensive overview of the validation layers, data integrity constraints, and security checks enforced across the KICD Attachment Management System. The system utilizes a defense-in-depth approach, ensuring data is validated at the frontend, backend application layer, and database schema levels.

---

## 1. Frontend Validation Checks (React / Next.js)

The frontend relies primarily on native HTML5 validation augmented by custom React state logic to provide immediate feedback to the user and prevent unnecessary API calls.

*   **Native HTML5 Validation:**
    *   **`required` Attribute:** Enforced on almost all form fields (e.g., Registration, Profile Editing, Application submissions) to prevent empty data submission.
    *   **Input Types (`type="email"`, `type="number"`, `type="password"`):** Browsers enforce basic formatting (e.g., requiring an `@` symbol in emails or restricting input to numeric characters).
*   **Numeric Constraints:**
    *   **Range Constraints:** `min` and `max` attributes are used on numeric fields. For example, `yearOfStudy` is restricted between `1` and `7`.
    *   **Precision:** The `step` attribute is used for fields like `gpa` (`step="0.01"`, `min="0"`, `max="5"`) to enforce decimal precision locally.
*   **Length Constraints:**
    *   `minLength={8}` is enforced natively on password change forms.
*   **Custom React Logic (Cross-field Validation):**
    *   **Password Matching:** Custom logic prevents form submission if `password` and `confirmPassword` states do not match (e.g., in `RegisterPage.tsx`).
    *   **Password Strength Scoring:** The frontend evaluates password complexity (length, uppercase, lowercase, numbers, special characters) to provide real-time visual feedback ("Weak" to "Strong").
*   **API Error Mapping:**
    *   The frontend dynamically catches `ApiError` responses. If the backend returns `fieldErrors` (400 Bad Request), the UI dynamically binds these error messages to the corresponding input fields for contextual user correction.

---

## 2. Backend Application Layer Checks (Spring Boot API)

Before data ever reaches the persistence layer, the Spring Boot backend enforces strict payload validation across all user roles (Student, Reviewer/HR, Admin) using the Jakarta Validation API and custom business logic.

*   **DTO (Data Transfer Object) Validation:**
    *   **`@NotBlank` / `@NotNull`:** Ensures that required payload fields (like `email`, `password`, `roleId`) are present and not empty strings or whitespace.
    *   **`@Email`:** Enforces strict regex matching to ensure the string conforms to standard email formats.
    *   **`@Size(min = 8)`:** Enforces minimum string length policies securely on the backend (e.g., passwords must be at least 8 characters).
    *   Controllers utilize the `@Valid` annotation to automatically trigger these checks when a request is received.
*   **Global Exception Handling:**
    *   If DTO validation fails, Spring throws a `MethodArgumentNotValidException`. A global `@ControllerAdvice` intercepts this and formats it into a standard `400 Bad Request` response containing a map of the specific fields that failed and their respective error messages (which the frontend then consumes).
*   **Business Logic Validations (Service Layer):**
    *   **Existence Checks:** Services check if a record exists before creation (e.g., `userRepository.existsByEmail()` throws a conflict error if an email is already registered).
    *   **Integrity Checks:** e.g., verifying `passwordEncoder.matches()` before allowing a user to change their password.
    *   **Authorization Context:** Validating that the `SecurityContextHolder` user has the appropriate Role to perform actions (e.g., a Student cannot create an Opportunity).

---

## 3. Database Schema Checks (JPA / Hibernate)

The database (PostgreSQL/MySQL) serves as the final source of truth. The JPA Entity models define strict constraints that translate into database schema rules, protecting against data corruption even if application-layer checks are bypassed.

*   **Nullability (`nullable = false`):**
    *   Critical columns such as `email`, `password_hash`, `user_id`, and `role_id` cannot be inserted as `NULL` at the database level.
*   **Uniqueness (`unique = true`):**
    *   The `email` column on the `users` table, and the `user_id` foreign key on the `applicant_profiles` table, are constrained to be unique, preventing duplicate accounts or multiple profiles for a single user at the index level.
*   **Length Limits (`length = ...`):**
    *   Database columns are optimized and constrained to prevent excessive payload sizes.
    *   Examples: `admission_number` (max 50 chars), `first_name` and `last_name` (max 100 chars), `course_name` (max 150 chars).
*   **Precision and Scale (`precision = 3, scale = 2`):**
    *   Fields like `gpa` are strictly typed as `DECIMAL(3,2)`, ensuring the database physically cannot store a value larger than `9.99` or with more than two decimal places.
*   **Foreign Key Constraints:**
    *   Annotations like `@ManyToOne` and `@JoinColumn(nullable = false)` enforce referential integrity. A user cannot be created without a valid reference to an existing `Role`, and an `ApplicantProfile` must link to a valid `User`.
*   **Enumerations (`@Enumerated(EnumType.STRING)`):**
    *   Fields like `gender` and application statuses are stored as string literals but are strictly bounded by the Java Enum definitions, preventing arbitrary string insertion into these categorical columns.
*   **Default Values:**
    *   Boolean flags like `is_active` and `email_verified` have builder defaults (`true` and `false` respectively) ensuring they are initialized correctly upon record creation if omitted.
