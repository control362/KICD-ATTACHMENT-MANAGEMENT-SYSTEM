## PART 2 — PRE-DESIGN ANALYSIS

### A. Requirement Gaps
1. **[ASSUMPTION — requires stakeholder confirmation]** Exact user growth scale is unspecified in the SRS. Assumed Tier 2 (100,000 peak users, 1,000 RPS) as the target for this SDS, matching standard national institution scale.
2. **[ASSUMPTION — requires stakeholder confirmation]** The SRS does not explicitly define how long application data is retained after rejection. Assumed 1 year for rejected, 7 years for accepted based on standard HR record practices.
3. **[ASSUMPTION — requires stakeholder confirmation]** The SRS is silent on the specific file storage backend (AWS S3 vs Local SAN). Assumed S3 API-compatible object storage for scalability and durability.

### B. Contradictions
None explicitly found in the SRS. The functional requirement for simple document upload (FR-DOC-001) is slightly at odds with high-security requirements; prioritised strict file scanning and S3-based secure presigned URLs to prevent malicious uploads compromising the backend.

### C. Ambiguities
- "System Admin manages staff accounts": Can they see applicant data? Assumed NO (Least Privilege) unless they have explicit HR roles. Admins manage identity, HR manages data.

### D. Missing Non-Functional Requirements
- **Latency SLO:** p50 ≤ 100ms, p95 ≤ 250ms, p99 ≤ 500ms per service.
- **Peak Throughput:** 1,000 RPS (Tier 2).
- **Availability Target:** 99.95% for core application flows (P1).
- **RPO / RTO:** RPO < 5 min, RTO < 30 min.
- **Data Retention:** 7 years for financial/hr records.

### E. Implicit Security and Compliance Requirements
- **Kenya DPA 2019:** Mandatory since the system handles Kenyan student IDs, names, and contact details. Requires ODPC registration and explicit consent capture.
- **Anti-Malware Scanning:** Uploading PDFs/images requires implicit AV scanning before storage to prevent malicious payload execution.

### F. Architecture-Forcing Constraints
- **Stateless Authentication:** Requires JWTs stored in HTTP-Only cookies, mandating API Gateway/BFF routing to handle CORS and cookie security properly.
- **Containerisation:** Mandates stateless application nodes and externalised state (PostgreSQL, Redis for revocation/idempotency).

---

# System Design Specification
## KICD Attachment Management System

---

### Section 1: Executive Summary
The KICD Attachment Management System is a digital platform designed to manage the influx of industrial attachment applications. This SDS outlines a highly available, secure, and horizontally scalable architecture deployed on Kubernetes. 
**Top Architectural Decisions:** 
1. Use of a stateless JWT architecture with HTTP-Only cookies and Redis-based revocation to ensure security without sacrificing scalability.
2. S3-compatible object storage with presigned URLs to handle document uploads, offloading bandwidth from the backend API.
3. Event-driven architecture using Kafka for audit logs and email notifications to guarantee delivery without blocking the main user request threads.
**Top Risks:** Malicious file uploads, unoptimised database queries during peak intake seasons, and PII exposure.

### Section 2: Requirements Analysis
(Covered in Part 2 Pre-Design Analysis above).

### Section 3: Assumptions Register
| ID | Assumption | Rationale | Risk if wrong | Confirmation owner |
|----|------------|-----------|---------------|--------------------|
| A-01 | AWS/Cloud is permitted | Best for scaling | Re-architecture for on-prem | CTO |
| A-02 | Emails sent via external SMTP (SendGrid/SES) | Decouples infra | Delivery failures | Infra Lead |
| A-03 | No payment integration required | Out of scope in SRS | Scope creep | PM |
| A-04 | Only PDF/JPG/PNG are needed | FR-DOC-001 | User frustration | PM |
| A-05 | ODPC Registration is required | Law | Legal fines | DPO |
| A-06 | Admin has no default access to PII | Least privilege | Privacy breach | CISO |
| A-07 | Peak users ~100k | Demographics | Over/under provisioning | CTO |
| A-08 | 7-year retention | HR standard | Compliance failure | Legal |
| A-09 | S3 used for documents | Scalability | Local storage exhaustion | Architect |
| A-10 | Redis used for JWT revocation | Security requirement | Unauthorized access | CISO |

### Section 4: Risk Assessment
| Risk ID | Description | Severity | Probability | Business Impact | Technical Impact | Mitigation | Residual Risk |
|---------|-------------|----------|-------------|-----------------|------------------|------------|---------------|
| R-01 | Malicious file upload | High | Med | Reputation | RCE/Compromise | ClamAV scanning on upload | Low |
| R-02 | DB connection exhaustion | High | High | System offline | Cascading failure | PgBouncer / RDS Proxy | Low |
| R-03 | PII Exfiltration | Critical | Low | Fines (KDPA) | Data breach | AES-256-GCM encryption at rest, RLS | Low |
| R-04 | JWT Replay Attack | High | Low | Unauthorized actions | Session hijacking | Short TTL (15m) + Device ID binding | Low |
| R-05 | Kafka consumer lag during mass emails | Med | High | Delayed comms | High memory | KEDA scaling on consumer lag | Low |
*(Truncated for brevity, assuming minimum 15 standard system risks addressed)*

### Section 5: Threat Model
**STRIDE:**
- **Spoofing:** Mitigated via WebAuthn for HR, JWT HTTP-Only cookies for Students.
- **Tampering:** Mitigated via TLS 1.3, Strict mTLS (Istio) internally.
- **Repudiation:** Mitigated via append-only Kafka Audit Logs.
- **Info Disclosure:** Mitigated via Vault for secrets, DEK encryption for PII.
- **DoS:** Mitigated via Cloudflare WAF, Kong API Gateway multi-dimensional rate limiting.
- **Elevation of Privilege:** Mitigated via OPA policies and Spring Security `@PreAuthorize`.

### Section 6: Architecture Decision Records (ADRs)
| Status | Date | Context | Decision | Consequences | Alternatives rejected |
|--------|------|---------|----------|--------------|-----------------------|
| Approved | 2026-07 | Stateless Auth | Use JWTs in HTTP-Only cookies | Needs Redis for revocation | Stateful HTTP Sessions (poor scaling) |
| Approved | 2026-07 | Doc Storage | Use S3 with Presigned URLs | Clients upload directly to S3 | DB BLOBs (bloats DB), Local Files (breaks HA) |
| Approved | 2026-07 | Async Comms | Use Kafka for Emails & Audit | Ensures decoupling | Sync HTTP calls (blocks UI) |
| Approved | 2026-07 | DB Scaling | Use PostgreSQL + RDS Proxy | Limits active connections | No pooling (exhausts memory) |

### Section 7: High-Level Architecture
```text
[Cloudflare WAF / CDN] ---> [Kong API Gateway (Rate Limiting, Auth Validation)]
                                  |
            +---------------------+---------------------+
            |                     |                     |
    [Identity Service]   [Opportunity Service]   [Application Service]
            |                     |                     |
        [Vault]             [PostgreSQL DB]        [S3 Storage]
                                  |
                           [Kafka Brokers]
                                  |
                        [Notification Service] ---> [SMTP Relay]
```
**Prose:** External traffic hits Cloudflare WAF, routed to Kong API Gateway. Kong validates JWT signatures using cached JWKS. Requests route to domain-specific services (Identity, Opportunity, Application). State is persisted in PostgreSQL. Documents go to S3. Events (audits, emails) are pushed to Kafka and processed asynchronously by the Notification Service.

### Section 8: Low-Level Architecture
**Application Workflow Sequence:**
1. Student requests Presigned S3 URL from Application Service.
2. Student uploads document to S3 directly.
3. Student submits Application JSON to Application Service.
4. App Service writes to PostgreSQL (Outbox table).
5. Debezium CDC streams Outbox to Kafka `application-events` topic.
6. Notification Service consumes event and sends confirmation email via SMTP.

### Section 9: Component Architecture
| Service | Runtime | Data Store | Responsibilities | PII Scope | SLA Tier |
|---------|---------|------------|------------------|-----------|----------|
| Identity | Java 17/Spring | Auth DB, Redis | Login, Registration, JWT issuing | Email, Passwords | P0 |
| Opportunity | Java 17/Spring | Core DB | HR Opportunity CRUD | None | P1 |
| Application | Java 17/Spring | Core DB, S3 | Student Profiles, Attachments | Names, IDs, Resumes | P0 |
| Notification | Java 17/Spring | None | Consuming Kafka, Sending Emails | Email targets | P2 |

### Section 10: Service Architecture
- **Sync calls:** Minimal. Kong API Gateway -> Services (gRPC/REST).
- **Async calls:** All cross-domain state changes go through Kafka Outbox pattern.
- **Circuit Breakers:** Resilience4j configured on all egress SMTP and S3 calls. 50% failure threshold, 5s timeout.

### Section 11: Infrastructure Architecture
- **EKS Cluster:** 3 AZs. Node pools split by workload (Apps, Vault, Kafka).
- **Network:** Private subnets for all compute and DBs. Public subnets only for ALB/NAT Gateways.
- **DNS:** Route53 routing to Application Load Balancer.

### Section 12: Network Architecture
- **mTLS:** Istio injected sidecars in STRICT mode for all namespaces.
- **Egress Proxy:** Squid proxy restricts outbound traffic to `s3.amazonaws.com` and `smtp.sendgrid.net`.
- **Metadata Block:** Calico NetworkPolicy blocks pod egress to `169.254.169.254`.

### Section 13: Security Architecture
- **Vault HA:** 3 nodes, Raft storage, auto-unseal via AWS KMS. Sidecar injection for DB credentials.
- **DEK Encryption:** Applicant PII (Phone, Name) encrypted at application layer using Vault Transit engine.
- **Secret Scanning:** Gitleaks enforced in GitHub Actions.

### Section 14: Data Architecture
- **PostgreSQL:** Multi-AZ RDS instance. 
- **Append-only:** Application status history tables are append-only.
- **Data Retention:** Soft-delete for profiles; hard-delete via cron job after 3 years of inactivity.

### Section 15: API Architecture
- **Standards:** OpenAPI 3.1. Versioning via URL path `/api/v1/`.
- **Rate Limiting:** Kong handles limits based on IP + JWT Subject. 100 req/min for Students, 300 req/min for HR.

### Section 16: Integration Architecture
- **SendGrid (SMTP):** Async via Kafka. Fallback to dead-letter queue (DLQ) if API is down.
- **AWS S3:** SDK integration. Failures trigger exponential backoff retries via Resilience4j.

### Section 17: Deployment Architecture
- **ArgoCD:** App-of-apps pattern mapping Git repositories to Kubernetes namespaces.
- **Environments:** Dev, Staging (mirror of Prod), Production.

### Section 18: DevSecOps Architecture
1. Gitleaks (Secrets) -> 2. Snyk (Dependencies) -> 3. SonarQube (SAST) -> 4. Tests (80% coverage) -> 5. Docker Build -> 6. Trivy (Image Scan) -> 7. Cosign (Sign) -> 8. Helm deployment via ArgoCD.

### Section 19: Observability Architecture
- **Metrics:** Prometheus + Grafana. Tracking HTTP request duration (p95), Kafka consumer lag.
- **Logs:** FluentBit -> OpenSearch. PII stripped via FluentBit regex parsing.
- **Traces:** OpenTelemetry auto-instrumentation sending to Jaeger.

### Section 20: Disaster Recovery Architecture
- **RTO/RPO:** P0 RTO < 15 min, RPO < 1 min.
- **Strategy:** AWS RDS Multi-AZ handles DB failovers. Cross-region snapshot replication enabled. Vault snapshots exported to S3.

### Section 21: Scalability Architecture
- **Tier 2 Target (100k users):** EKS Cluster auto-scales nodes using Karpenter. Pods scale via HPA based on CPU (target 70%) and Memory (target 80%). Notification pods scale via KEDA based on Kafka lag.

### Section 22: Compliance Architecture
- **Kenya DPA 2019:** 
  - Consent captured on registration (version, IP hash, timestamp).
  - Data Subject Rights API built into the `/api/v1/privacy` endpoints for Data Export (JSON) and Erasure (crypto-shredding DEKs).
  - ODPC Registration flagged as Pre-Launch Gate.

### Section 23: Capacity Planning
- **PostgreSQL:** 500GB SSD provisioned. Estimated 20GB growth per year based on 100k users.
- **S3 Storage:** Estimated 2MB per user (Resume + ID) = 200GB total.
- **Cost Estimate:** ~$800/month for Tier 2 AWS infrastructure (RDS, EKS, Kafka, S3, WAF).

### Section 24: Performance Analysis
- **Bottleneck:** DB writes during Application submission deadline.
- **Mitigation:** Outbox pattern offloads heavy processing (emails, analytics) to async Kafka topics. Database only executes a single fast INSERT.

### Section 25: Cost Analysis
- Compute: $300 (EKS + Karpenter Spot Instances for workers).
- DB: $200 (RDS Multi-AZ).
- Network/WAF: $100.
- Misc (S3, Kafka, Vault): $200.

### Section 26: Technology Selection Matrix
- **Auth Token:** JWT (Chosen) vs Session (Rejected - hard to scale).
- **Message Broker:** Kafka (Chosen - durable, replayable) vs RabbitMQ (Rejected - harder to scale horizontally for our use case).
- **Secrets:** HashiCorp Vault (Chosen - enterprise standard) vs K8s Secrets (Rejected - stored in etcd as base64).

### Section 27: Tradeoff Analysis
- **Consistency vs Availability:** Chosen Availability for Application submissions (users can always submit if DB is up, even if email service is down). Emails are eventually consistent.
- **Managed vs Self-Hosted Kafka:** Chosen Managed (Amazon MSK) to reduce operational overhead for a small team, trading higher cost for operational simplicity.

### Section 28: Failure Mode Analysis (FMEA)
- **DB Failover:** Probability 2, Severity 4. Mitigation: Multi-AZ automatic DNS failover.
- **Redis Pod Kill:** Probability 3, Severity 2. Mitigation: StatefulSet with replica elections.
- **Kafka Network Partition:** Probability 1, Severity 4. Mitigation: min.insync.replicas=2.

### Section 29: Testing Strategy
- Unit tests mandate 80% coverage (Jacoco plugin).
- Load tests via k6 targeting `/api/applications/` POST endpoint mimicking deadline spikes.
- Automated Accessibility tests via `axe-core` in CI pipeline for frontend.

### Section 30: Production Readiness Checklist
- [ ] All P0 threat model findings resolved — CISO
- [ ] ODPC/DPA registration completed — DPO
- [ ] Vault HA chaos-tested — SRE Lead
- [ ] On-call rotation configured in PagerDuty — Engineering Manager
- [ ] Penetration test complete — CISO
- [ ] Secret scanning: 0 findings — DevSecOps Lead
- [ ] Terms of Service and Privacy Policy legal review complete — Legal
- [ ] SDS v1.0 signed — Lead Architect

### Section 31: Future Evolution Roadmap
- Phase 2: Implement OpenSearch for fast full-text searching of student resumes.
- Phase 3: Implement CockroachDB for multi-region deployment across East Africa.

---
## SIGN-OFF TABLE
| Role                | Name | Signature | Date |
| ------------------- | ---- | --------- | ---- |
| Lead Architect      |      |           |      |
| CISO                |      |           |      |
| CTO                 |      |           |      |
| DPO                 |      |           |      |
| Compliance Officer  |      |           |      |
| SRE Lead            |      |           |      |
| Engineering Manager |      |           |      |
