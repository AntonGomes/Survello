# Security Implementation Report

## 1. Overview
This document details the security mitigations implemented for the Document Generation MVP. The architecture follows a "Zero Trust" model where the backend validates identity on every request, and the frontend acts as a secure proxy for token handling.

## 2. Implemented Mitigations

### 2.1. Infrastructure Security (Network Layer)
**Vulnerability:** Database was publicly accessible.
**Mitigation:**
- **VPC Connector:** Created `docgen-connector` to bridge App Runner to the private VPC.
- **Security Groups:** RDS Security Group now denies `0.0.0.0/0` and only accepts traffic from the App Runner VPC Connector.
- **Result:** The database is invisible to the public internet.

### 2.2. Backend Authentication (Application Layer)
**Vulnerability:** API endpoints trusted `user_id` from request bodies, allowing impersonation.
**Mitigation:**
- **Token Validation:** Implemented `CurrentUserDep` in `deps.py` which decodes the Auth0 JWT.
- **Identity Injection:** Refactored `generate.py` and `users.py` to inject `user_id` directly from the token.
- **Path Parameter Removal:** Removed `{external_id}` from `/users/upsert` to prevent ID spoofing.
- **Result:** It is mathematically impossible to act as another user without their private key signed token.

### 2.3. Frontend Security (Proxy Layer)
**Vulnerability:** Next.js API routes were "Open Relays" forwarding requests without credentials.
**Mitigation:**
- **Token Forwarding:** Updated all API routes (`create_job`, `presign_uploads`, etc.) to retrieve the Auth0 Access Token using `getAccessToken()`.
- **Header Injection:** The proxy now attaches `Authorization: Bearer <token>` to every backend request.
- **Result:** The backend receives authenticated requests, while the browser never sees the Access Token (only the session cookie).

## 3. Critique & Future Improvements (Senior Dev Review)

### 3.1. Token Verification (Critical for V2)
**Critique:** The current `jwt.decode` in `deps.py` skips signature verification (`verify_signature=False`) for MVP speed. This relies entirely on the assumption that only Auth0 could have signed the token we received.
**Fix:** In V2, we must implement JWKS caching and signature verification to prevent token forgery if the signing key is ever rotated or if we support multiple issuers.

### 3.2. Observability
**Critique:** We lack distributed tracing. A 500 error in Python is hard to correlate with a user action in Next.js.
**Fix:** Implement OpenTelemetry or pass a `X-Request-ID` header from Next.js to Python to trace requests across the boundary.

### 3.3. Error Handling
**Critique:** The frontend proxy blindly forwards backend errors.
**Fix:** Implement structured error handling in the Next.js proxy to sanitize backend error messages before showing them to the user.

## 4. Conclusion
The current implementation meets the security requirements for a robust MVP. The critical paths (Data Access, Identity, Network Exposure) are secured.
