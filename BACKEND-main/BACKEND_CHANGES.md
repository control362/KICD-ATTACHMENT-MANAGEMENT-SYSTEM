# BACKEND_CHANGES.md

Scope of this pass: **authentication, authorization, database migrations, and
security-critical bug fixes.** This is the first of several planned passes —
see "Not done in this pass" at the bottom before assuming anything else was
touched.

---

## 1. Why these changes were made

The backend as received had:
- `SecurityConfig` set to `anyRequest().permitAll()` — every endpoint, including
  staff/admin CRUD and application approve/reject, was open to anyone with no
  token at all.
- No auth controller, despite `User` already having the fields for it
  (password hash, verification token, lockout counters).
- `application-dev.yml` pointing Flyway at `db/migration`, but no migration
  files existed anywhere in the repo — that profile could not have booted.
- Two IDOR (Insecure Direct Object Reference) bugs: `StudentApplicationDTO`
  took a client-supplied `userId`, and the approve/reject endpoints took a
  client-supplied `hrId` in the URL. Either let any caller act as a different
  user just by changing a number.
- Every "not found" case threw a bare `RuntimeException`, which Spring turns
  into an opaque 500 rather than a 404 — the frontend would have no reliable
  way to distinguish "not found" from "server broke."

## 2. Files added

| File | Purpose |
|---|---|
| `src/main/resources/db/migration/V1__init_schema.sql` | Baseline schema for `roles`, `users`, `departments`, `students`, `jobs`, matching the JPA entities exactly (so `ddl-auto=validate` passes). Seeds the three roles (`STUDENT`, `HR_OFFICER`, `ADMIN`) the rest of the app assumes exist. |
| `security/JwtService.java` | Issues/parses/validates HS256 JWTs. Refuses to start if `jwt.secret` is under 32 bytes. |
| `security/UserPrincipal.java` | `UserDetails` adapter around `User`; exposes `userId` and `role` to controllers via `@AuthenticationPrincipal`. |
| `security/CustomUserDetailsService.java` | Loads a `UserPrincipal` by email for Spring Security. |
| `security/JwtAuthenticationFilter.java` | Reads `Authorization: Bearer <token>`, populates the security context per-request, returns a proper 401 JSON body on a bad/expired token instead of falling through to an anonymous 403. |
| `DTOS/auth/RegisterRequest.java`, `LoginRequest.java`, `AuthResponse.java`, `ForgotPasswordRequest.java`, `ResetPasswordRequest.java` | Auth request/response shapes, with `@Valid` constraints. |
| `serviceInterfaces/AuthService.java` + `serviceImplimentations/AuthServiceImpl.java` | Registration (creates a `STUDENT` account), login (with failed-attempt counting and time-based lockout), email verification, resend-verification, forgot/reset password. |
| `serviceInterfaces/EmailService.java` + `serviceImplimentations/LoggingEmailServiceImpl.java` | Abstraction for sending verification/reset emails. **The implementation only logs the link — see "Not done" below.** |
| `controllers/AuthController.java` | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/verify-email`, `POST /api/auth/resend-verification`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`. |
| `controllers/RoleController.java` + `DTOS/RoleDTO.java` | `GET /api/roles` — closes the gap the spec doc explicitly flagged (Staff Management screen had no live role source). |
| `exceptions/ResourceNotFoundException.java`, `ConflictException.java`, `UnauthorizedException.java`, `ApiError.java`, `GlobalExceptionHandler.java` | Consistent JSON error shape (`timestamp`, `status`, `error`, `message`, `path`, `fieldErrors`) for every failure mode: 404, 409, 401, 403, 400 (bean validation), 500 (generic, message scrubbed). |

## 3. Files modified

| File | Change | Why |
|---|---|---|
| `pom.xml` | Added `spring-boot-starter-validation`, `flyway-core` + `flyway-database-postgresql`, `jjwt-api/impl/jackson` 0.12.6, `spring-boot-starter-test`, `spring-security-test`. | Needed for bean validation, migrations, and JWT; test deps were entirely absent before. |
| `application.properties` | Set `ddl-auto=validate` (was `update`), added Flyway config, JWT secret/expiration (env-overridable), lockout policy. | `update` and Flyway actively fight each other; the default profile had no Flyway config at all. |
| `application-dev.yml` | Fixed `Hikari` → `hikari` (Spring config keys are case-sensitive; this was silently ignored before). Removed `clean-on-validation-error: true`. | That flag drops and rebuilds the entire database on any migration checksum mismatch — not something to leave enabled even in dev the moment there's data worth keeping. Use `./mvnw flyway:repair` instead if that happens. |
| `config/SecurityConfig.java` | Full rewrite: stateless JWT auth, CORS config, role-based `authorizeHttpRequests` matching the spec's role→screen access map. | Was `permitAll()` for literally everything. |
| `DTOS/StudentApplicationDTO.java` | Removed `userId` field. Added `@NotNull`/`@NotBlank`/`@Min` validation. | IDOR fix — see below. |
| `DTOS/UserDTO.java` | Added `@Email`/`@NotBlank`/`@NotNull`/`@Size` validation; documented that this DTO is Admin-only staff management, distinct from self-registration. | Was completely unvalidated; a `roleId` here could previously be set to anything by whoever could reach the endpoint (now Admin-only at the security layer too). |
| `DTOS/DepartmentDTO.java` | Added `@NotBlank` on `name`. | Was unvalidated. |
| `controllers/StudentApplicationController.java` | `createStudentApplication` now takes the user id from `@AuthenticationPrincipal`, never from the request body. `approve`/`reject` no longer take `{hrId}` in the path — the reviewer is always the authenticated caller. Added `GET /me`. `@Valid` added to write endpoints. | Fixes two IDOR bugs (see below) and adds the "what's my own application" lookup the Student Dashboard needs. |
| `controllers/UserController.java`, `controllers/DepartmentController.java` | Added `@Valid` on create/update. | Validation annotations on the DTOs were previously inert without this. |
| `serviceInterfaces/StudentApplicationService.java` + `serviceImplimentations/StudentApplicationServiceImpl.java` | Added `requestingUserId` parameter to get/update for ownership enforcement; added `getOwnApplication`; a student cannot submit a second application (409 if one already exists); approve/reject now reject (409) an already-decided application instead of silently overwriting the decision; all "not found" cases now throw `ResourceNotFoundException` instead of bare `RuntimeException`. | Enforces the spec's "own only" access rule for students and the "no undo" rule for decided applications, at the one layer (service) that can actually see the full picture. |
| `serviceInterfaces/UserService.java` + `serviceImplimentations/UserServiceImpl.java` | Duplicate-email check on create/update (409), password required on create, `deleteUser`/`getUser` now 404 via `ResourceNotFoundException`, admin-created accounts are marked pre-verified (no verification loop for internally provisioned staff). | Was previously possible to create two users with the same email (unique constraint would have thrown a raw, unhandled `DataIntegrityViolationException` before this pass added a handler for that too). |
| `serviceInterfaces/DepartmentService.java` + `serviceImplimentations/DepartmentServiceImpl.java` | 404 via `ResourceNotFoundException` instead of `RuntimeException`; `deleteDepartment` now checks existence first instead of letting `deleteById` no-op silently. | Consistency with the rest of the API's error contract. |
| `repositories/UserRepository.java` | Added `findByEmailVerificationToken`. | Needed for O(1) lookup during email verification / password reset (previously would have required a full table scan — this method didn't exist before so those flows didn't exist at all). |
| `repositories/StudentApplicationRepository.java` | Added `findByUser_UserId`. | Needed for `GET /me` and the "already applied" duplicate check. |

## 4. Security fixes in detail

1. **No authentication at all → JWT-based auth.** Every route was reachable
   anonymously. Now `/api/auth/**` is public; everything else requires a
   valid, non-expired Bearer token, enforced per-route by role.
2. **IDOR #1 — application ownership.** `StudentApplicationDTO.userId` let
   any authenticated caller create an application record attributed to any
   user id. Fixed by deriving the owner from the JWT, never the request body.
3. **IDOR #2 — approve/reject attribution.** `PUT .../approve/{hrId}` let any
   caller attribute a decision to an arbitrary `hrId`, not necessarily
   themselves. Fixed by removing `{hrId}` from the path entirely; the
   decision is always attributed to the authenticated caller.
4. **Row-level authorization.** A student can now only `GET`/`PUT` their own
   application (service-layer check, since Spring Security's path matchers
   can't express row ownership); HR/Admin are unrestricted within their role.
5. **Account lockout.** Failed logins now increment a counter and lock the
   account for a configurable window (`security.lockout.*`), using fields
   that already existed on `User` but were previously unused by anything.
6. **Decision immutability.** Approving/rejecting an already-decided
   application now returns 409 instead of silently overwriting `approvedBy`/
   `approvalDate` — matches the spec's explicit "no undo" behavior.
7. **Duplicate application prevention.** A student can no longer submit a
   second application once they have one (409).
8. **Error responses no longer leak internals.** The generic `Exception`
   handler returns a fixed, non-descriptive message — no stack traces or
   raw exception text ever reach the client.

## 5. Breaking changes to be aware of

- `POST /api/student-applications` no longer accepts `userId` in the body —
  remove it from any client payload; the server infers it from the token.
- `PUT /api/student-applications/{id}/approve/{hrId}` and `.../reject/{hrId}`
  are now `PUT /api/student-applications/{id}/approve` and `.../reject` (no
  second path segment). This was necessary to close IDOR #2; the frontend
  spec's mention of these routes should be read with this correction.
- All endpoints except `/api/auth/**` now require `Authorization: Bearer
  <token>`. Anything that worked anonymously before will now 401.

## 6. Not done in this pass (explicitly out of scope, not forgotten)

- **Email delivery.** `LoggingEmailServiceImpl` only logs the verification/
  reset link — no SMTP/SES/SendGrid provider is wired up. Verification and
  reset links currently only surface in the server log. This must be
  replaced before any real user relies on registering.
- **Build verification.** This sandbox has no network access to Maven
  Central (only a small allowlist of package registries), so `mvn compile`
  / `mvn test` could not actually be run here. The code was written and
  reviewed carefully, but **run `./mvnw clean verify` locally or in CI
  before deploying** — treat this as unverified until that passes.
- **Pagination/sorting/search** on `GET /api/student-applications`,
  `/api/departments`, `/api/users` — all still return unbounded lists, as
  the spec doc already flagged. Fine at current scale, will need addressing
  before real data volume.
- **The `Jobs` entity** is still a stub with no repository/service/controller.
- **Automated tests.** Test dependencies were added to `pom.xml` but no test
  classes were written yet in this pass.
- **Rate limiting** on `/api/auth/login` and `/api/auth/register` beyond the
  per-account lockout (no global/IP-based throttle yet — recommend adding
  one, e.g. via a gateway or Bucket4j, before production).

## 7. Addendum — email verification removed (2nd pass)

No transactional email provider was ever wired up (see §6), so gating login
on a verification link that only ever appeared in the server log was a dead
end for real users — nobody could actually get past it. Changed to:

- `POST /api/auth/register` now creates the account **pre-verified** and
  returns an `AuthResponse` (token + user info) immediately, same shape as
  `/login`. It used to return a plain message and require a separate
  verify-email step.
- `login()` no longer checks `emailVerified` at all.
- **`V2__backfill_email_verified.sql`** — retroactively sets
  `email_verified = TRUE` for any account created before this change.
  Without this migration, anyone who registered under the old flow (and
  never clicked the log-only link) would be permanently locked out the
  moment this deployed. Migrations only ever run forward, so this needed to
  be a new file, not an edit to `V1`.
- `verify-email` / `resend-verification` endpoints are left in place but
  unused by the current flow — cheap to keep, easy to re-enable if a real
  email provider gets added later instead of gating anything on it again.
