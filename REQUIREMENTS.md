# TarkVtark - Software Requirements Specification

## 1. Project Overview

**Project Name:** TarkVtark (Debate Arena)  
**Version:** 1.0.0  
**Domain:** Online Debate Platform  
**Deployment:** Web Application (SPA)  
**Primary URL:** https://www.tarkvtark.com  

TarkVtark is a full-stack web application that enables users to participate in structured, two-column debates on various topics. The platform supports nested question-answer threads, evidence attachments, voting, and administrative moderation. Users authenticate via Google OAuth, while administrators use JWT-based authentication.

---

## 2. Business Requirements

### BR-1: Topic-Based Debates
- The system shall allow creation of debate topics in the format **"X vs Y"** (e.g., "Sanatan vs Islam").
- Each topic shall have a left label and a right label representing opposing viewpoints.
- Topics shall be listed on the home page and be clickable to enter a debate.

### BR-2: Two-Column Debate Layout
- Each debate shall display questions and replies in a **left vs right** two-column layout.
- Questions and replies shall alternate sides to maintain visual opposition.
- Arrows (`→` or `←`) shall indicate the flow from question to answer.

### BR-3: Nested Reply Structure
- Users shall be able to reply to top-level questions.
- Users shall be able to reply to existing replies (nested/threaded discussions).
- The system shall support recursive reply nesting with depth tracking.

### BR-4: Evidence and Attachments
- Users shall be able to attach files (images, videos, audio, PDFs, documents) to questions and replies.
- Users shall be able to add external URLs as evidence (YouTube, articles, sources).
- Attachments and URLs shall be stored persistently and displayed inline.

### BR-5: Voting System
- Users shall be able to upvote or downvote questions and replies.
- Vote counts shall be displayed on each post.
- Voting shall be toggleable (click again to remove vote, or switch vote type).

### BR-6: User Authentication
- Regular users shall authenticate via **Google OAuth**.
- Anonymous posting shall be supported with "Anonymous" as the default author.
- Authenticated users shall see their email/name associated with posts.

### BR-7: Administrative Control
- Administrators shall manage topics, questions, replies, guidelines, FAQ, and contact messages.
- Administrators shall authenticate via username/password with JWT tokens.
- Administrators shall be able to archive (soft-delete) topics.

### BR-8: Community Guidelines and FAQ
- The system shall display community guidelines to users.
- The system shall provide a FAQ section for common questions.
- Administrators shall be able to manage guidelines and FAQ content.

### BR-9: Contact and Reporting
- Users shall be able to send contact messages via a contact form.
- Users shall be able to report inappropriate content.
- Administrators shall be able to view and manage contact messages.

---

## 3. Functional Requirements

### 3.1 Home Page / Topic Listing

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-1.1 | Display all active debate topics with question counts | High |
| FR-1.2 | Allow users to click a topic to navigate to its debate page | High |
| FR-1.3 | Show loading state while topics are being fetched | Medium |
| FR-1.4 | Show error state if topics fail to load | Medium |
| FR-1.5 | Display empty state when no topics exist | Medium |
| FR-1.6 | Show "Contact" button to navigate to Contact Us page | Low |

### 3.2 Add Topic Feature

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-2.1 | Provide text input for new topic name | High |
| FR-2.2 | Validate topic format matches "X vs Y" pattern | High |
| FR-2.3 | Check for duplicate topics before creation | High |
| FR-2.4 | Require authentication to add topics | High |
| FR-2.5 | Show login modal if user is not authenticated | High |
| FR-2.6 | Clear input field after successful topic creation | Medium |
| FR-2.7 | Reload topic list after creation | Medium |
| FR-2.8 | Show success/error toast notifications | Medium |
| FR-2.9 | Add Topic form shall appear above the topic list in a single row (input + button inline) | Medium |

### 3.3 Debate Board / Question Display

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-3.1 | Display all questions for the selected topic | High |
| FR-3.2 | Render questions in a two-column layout (left/right) | High |
| FR-3.3 | Show question text, author, timestamp, and unique ID | High |
| FR-3.4 | Display category tags on questions | Medium |
| FR-3.5 | Show expand/collapse toggle for questions with replies | Medium |
| FR-3.6 | Display question count for each topic | Low |

### 3.4 Reply System

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-4.1 | Allow users to reply to any question | High |
| FR-4.2 | Allow users to reply to any reply (nested) | High |
| FR-4.3 | Auto-assign opposite side for replies (left ↔ right) | High |
| FR-4.4 | Track reply depth for nested display | High |
| FR-4.5 | Show reply form toggled open/closed per post | Medium |
| FR-4.6 | Auto-focus reply textarea when form opens | Medium |
| FR-4.7 | Require authentication to post replies | High |
| FR-4.8 | Support evidence files and URLs in replies | Medium |

### 3.5 Voting

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-5.1 | Allow upvote and downvote on questions | High |
| FR-5.2 | Allow upvote and downvote on replies | High |
| FR-5.3 | Toggle vote off when clicking the same vote type again | High |
| FR-5.4 | Change vote when switching from up to down or vice versa | High |
| FR-5.5 | Require authentication to vote | High |
| FR-5.6 | Show current vote counts on each post | Medium |

### 3.6 Evidence and File Attachments

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-6.1 | Support file upload for questions (images, video, audio, PDF, docs) | High |
| FR-6.2 | Support file upload for replies | High |
| FR-6.3 | Support adding external URLs as evidence | High |
| FR-6.4 | Display file name, size, and type for uploaded files | Medium |
| FR-6.5 | Allow removal of uploaded files before submission | Medium |
| FR-6.6 | Allow removal of added URLs before submission | Medium |
| FR-6.7 | Store files persistently on backend (local/S3/R2) | High |
| FR-6.8 | Serve files via download/view endpoint | High |

### 3.7 Search and Filter

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-7.1 | Allow search by tag on the debate board | Medium |
| FR-7.2 | Filter questions and replies based on search text | Medium |
| FR-7.3 | Show "Refreshing..." indicator during auto-poll | Low |

### 3.8 User Authentication (Google OAuth)

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-8.1 | Authenticate users via Google OAuth ID token | High |
| FR-8.2 | Store JWT token in localStorage | High |
| FR-8.3 | Retrieve current user info via `/auth/me` | High |
| FR-8.4 | Support user logout | High |
| FR-8.5 | Show login modal when authenticated actions are attempted | High |
| FR-8.6 | Display user info (email/name) in navigation when logged in | Medium |

### 3.9 Admin Authentication

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-9.1 | Authenticate admins via username/password | High |
| FR-9.2 | Issue JWT token upon successful login | High |
| FR-9.3 | Verify JWT token for protected admin endpoints | High |
| FR-9.4 | Store admin token in sessionStorage | Medium |
| FR-9.5 | Support admin logout | Medium |

### 3.10 Admin Dashboard

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-10.1 | Manage debate topics (view, create, edit, archive/delete) | High |
| FR-10.2 | View all questions across all topics | High |
| FR-10.3 | Manage community guidelines (CRUD) | High |
| FR-10.4 | Manage FAQ items (CRUD) | High |
| FR-10.5 | View and manage contact messages | High |
| FR-10.6 | View analytics (topic/question/reply/vote counts) | Medium |
| FR-10.7 | View reported content | Medium |

### 3.11 Contact Us

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-11.1 | Display contact form (name, email, subject, message) | High |
| FR-11.2 | Validate form inputs (required fields, email format) | High |
| FR-11.3 | Submit contact message to backend API | High |
| FR-11.4 | Show success/error toast after submission | Medium |
| FR-11.5 | Display contact email address | Low |

### 3.12 Guidelines and FAQ Pages

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-12.1 | Display community guidelines to users | High |
| FR-12.2 | Display FAQ items (question + answer pairs) | High |
| FR-12.3 | Allow navigation to Guidelines and FAQ from main nav | Medium |

### 3.13 Privacy Policy

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-13.1 | Display privacy policy page | Medium |
| FR-13.2 | Allow navigation to Privacy Policy from main nav | Low |

### 3.14 URL Navigation and Sharing

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-14.1 | Support URL-based topic navigation (e.g., `/sanatan_vs_islam`) | High |
| FR-14.2 | Support URL-based post navigation via uniqueId (e.g., `/sanatan_vs_islam/q-123-456`) | High |
| FR-14.3 | Auto-expand reply chains when navigating to a specific post | Medium |
| FR-14.4 | Highlight and scroll to target post on deep link | Medium |
| FR-14.5 | Copy shareable URL to clipboard for each post | Medium |

### 3.15 Real-Time Updates

| ID | Requirement | Priority |
|-----|-------------|----------|
| FR-15.1 | Auto-poll for new data every 15 seconds | Medium |
| FR-15.2 | Show "Refreshing..." indicator during polling | Low |
| FR-15.3 | Disable polling while user is editing a post | Medium |

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load time shall be under 3 seconds on 4G connection.
- API response time shall be under 500ms for standard queries.
- File uploads shall support up to 10MB per file.
- Auto-poll interval shall be 15 seconds.

### 4.2 Security
- All user inputs shall be sanitized to prevent XSS attacks.
- Rate limiting shall be enforced on API endpoints (200 req/min general, 30 req/min write, 5 req/hr contact, 10 req/15min login).
- Duplicate request prevention shall block double submissions.
- JWT tokens shall be used for admin authentication.
- Google OAuth shall be used for user authentication.
- Passwords shall be stored as hashes (BCrypt) in the database.

### 4.3 Availability
- The backend shall run on a standard Spring Boot server (port 8080).
- The frontend shall be deployable as static files (Vite build).
- Database shall be PostgreSQL 13+.

### 4.4 Compatibility
- Frontend shall support modern browsers (Chrome, Firefox, Safari, Edge).
- Mobile responsive design shall be supported.
- The application shall work on iOS Safari without zoom issues (16px font inputs).

### 4.5 Maintainability
- Code shall follow consistent naming conventions.
- API contracts shall be documented in OpenAPI/YAML format.
- Database schema shall be version controlled.
- Environment variables shall be used for configuration.

---

## 5. Technical Stack

### 5.1 Frontend
| Component | Technology |
|-----------|-----------|
| Framework | React 19 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| UI Libraries | react-toastify, @react-oauth/google |
| State Management | React hooks (useState, useEffect, useContext, useRef) |
| Routing | Client-side routing via state/navigation callbacks |
| HTTP Client | Native fetch with custom wrapper |

### 5.2 Backend
| Component | Technology |
|-----------|-----------|
| Framework | Spring Boot 3.2 |
| Language | Java 17 |
| Build Tool | Maven |
| Database | PostgreSQL 13+ |
| ORM | Spring Data JPA / Hibernate |
| Security | Spring Security + JWT (jjwt 0.11.5) |
| Authentication | Google OAuth 2.0 |
| API Documentation | SpringDoc OpenAPI (Swagger UI) |
| File Storage | Local filesystem, AWS S3 SDK v2 (Cloudflare R2 compatible) |
| Utilities | Lombok, Jackson, dotenv-java |

### 5.3 Infrastructure
| Component | Technology |
|-----------|-----------|
| Containerization | Docker / Docker Compose |
| Reverse Proxy | Nginx (for SPA routing) |
| Deployment | Render.com (configured via render.yaml) |
| Database Hosting | PostgreSQL (local / Neon DB / cloud) |
| File Storage | Local filesystem / Cloudflare R2 / AWS S3 |

---

## 6. Database Requirements

### 6.1 Tables

| Table | Purpose |
|-------|---------|
| `debate_topics` | Stores debate topics with left/right labels |
| `questions` | Stores top-level questions linked to topics |
| `replies` | Stores nested replies linked to questions or parent replies |
| `attachments` | Stores file attachment metadata and storage URLs |
| `evidence_urls` | Stores external evidence URLs linked to questions/replies |
| `admin_users` | Stores admin credentials and profile info |
| `contact_messages` | Stores contact form submissions |
| `guidelines` | Stores community guidelines |
| `users` | Stores regular user profiles from Google OAuth |

### 6.2 Key Constraints
- `replies` table enforces that each reply has either a `question_id` or `parent_reply_id` (but not both).
- `questions.side` and `replies.side` are constrained to `'left'` or `'right'`.
- `debate_topics.topic` is unique.
- `questions.unique_id` and `replies.unique_id` are unique for shareable links.
- Foreign keys use `ON DELETE CASCADE` for data integrity.

### 6.3 Indexes
- Index on `questions(debate_topic_id)` for fast topic lookups.
- Index on `questions(created_at DESC)` for chronological ordering.
- Index on `replies(question_id)` and `replies(parent_reply_id)` for tree traversal.
- Index on `debate_topics(is_active)` for filtering active topics.

---

## 7. API Requirements

### 7.1 Base URL
- Development: `http://localhost:8080/api/v1`
- Production: `https://api.tarkvtark.com/api/v1`

### 7.2 Endpoint Summary

| Module | Method | Endpoint | Purpose |
|--------|--------|----------|---------|
| Topics | GET | `/topics` | List all topics |
| Topics | GET | `/topics/{id}` | Get topic by ID |
| Topics | POST | `/topics` | Create topic |
| Topics | PUT | `/topics/{id}` | Update topic |
| Topics | DELETE | `/topics/{id}` | Delete topic |
| Questions | GET | `/questions/topic/{topicId}` | List questions for topic |
| Questions | POST | `/questions` | Create question |
| Questions | PUT | `/questions/{id}` | Update question |
| Questions | DELETE | `/questions/{id}` | Delete question |
| Questions | PUT | `/questions/{id}/vote` | Vote on question |
| Replies | GET | `/replies/question/{questionId}` | List replies for question |
| Replies | POST | `/replies` | Create reply |
| Replies | PUT | `/replies/{id}` | Update reply |
| Replies | DELETE | `/replies/{id}` | Delete reply |
| Replies | PUT | `/replies/{id}/vote` | Vote on reply |
| Files | POST | `/files/upload` | Upload file attachment |
| Files | GET | `/files/{filename}` | Download/view file |
| Files | DELETE | `/files/{id}` | Delete attachment |
| Files | POST | `/files/evidence-url` | Add evidence URL |
| Files | DELETE | `/files/evidence-url/{id}` | Delete evidence URL |
| Files | GET | `/files/attachments` | List attachments for post |
| Files | GET | `/files/evidence-urls` | List evidence URLs for post |
| Auth | POST | `/auth/google` | Google OAuth login |
| Auth | GET | `/auth/me` | Get current user |
| Auth | POST | `/auth/logout` | Logout user |
| Admin | POST | `/admin/login` | Admin login |
| Admin | POST | `/admin/verify` | Verify JWT token |
| Admin | GET | `/admin/guidelines` | Get guidelines |
| Admin | GET | `/admin/guidelines/all` | Get all guidelines (admin) |
| Admin | POST | `/admin/guidelines` | Create guideline |
| Admin | PUT | `/admin/guidelines/{id}` | Update guideline |
| Admin | DELETE | `/admin/guidelines/{id}` | Delete guideline |
| Admin | GET | `/admin/faq` | Get FAQ items |
| Contact | POST | `/contact` | Submit contact message |
| Contact | GET | `/contact/messages` | List all messages (admin) |
| Contact | GET | `/contact/messages/unread` | List unread messages (admin) |
| Contact | PUT | `/contact/messages/{id}/read` | Mark message as read |
| Contact | PUT | `/contact/messages/{id}/unread` | Mark message as unread |
| Contact | DELETE | `/contact/messages/{id}` | Delete contact message |

---

## 8. Security Requirements

### 8.1 Authentication
- **Regular Users:** Google OAuth 2.0 with ID token verification.
- **Admins:** Username/password authentication with BCrypt password hashing and JWT tokens.

### 8.2 Authorization
- Topic creation requires user authentication.
- Posting questions and replies requires user authentication.
- Voting requires user authentication.
- Admin endpoints require valid admin JWT token.
- Contact form is rate-limited (5 requests per hour).

### 8.3 Input Validation
- Text inputs shall be sanitized to prevent XSS (script tags, event handlers removed).
- Email inputs shall be validated for format.
- URLs shall be validated for format.
- File uploads shall be validated for type and size (max 10MB).
- All API inputs shall be validated on both client and server sides.

### 8.4 Rate Limiting
- General API: 200 requests per minute.
- Write operations (POST/PUT/DELETE): 30 requests per minute.
- Contact form: 5 requests per hour.
- Login attempts: 10 attempts per 15 minutes.

---

## 9. User Interface Requirements

### 9.1 Navigation
- Top navigation bar with links: Home, Guidelines, FAQ, Privacy Policy, Contact Us.
- User login/logout button in navigation.
- Admin panel link visible when admin is logged in.

### 9.2 Home Page
- Breadcrumb showing "Home".
- Header with optional Contact button.
- "Debate Topics(N)" heading showing topic count.
- Add Topic form (input + button in one row) above the topic list.
- List of topics as clickable buttons with question counts.
- Loading and error states.

### 9.3 Debate Board
- Two-column layout with left/right headers.
- Search/filter input by tag.
- Auto-refresh indicator during polling.
- Expandable question threads.
- Paired rows showing parent → child with arrow indicators.
- Single rows for standalone posts.

### 9.4 Add Question Form
- Side selector (left/right radio buttons).
- Rich text input for question text.
- Tag input with multi-tag support (Enter/comma to add).
- Evidence section with file upload and URL input.
- Submit button.

### 9.5 Reply Form
- Toggle open/closed per post.
- Text input for reply content.
- File upload for evidence.
- URL input for evidence.
- Submit button.

### 9.6 Post Cards
- Display author, timestamp, unique ID.
- Show post text with truncation and "Read more/Less".
- Vote buttons (up/down) with counts.
- Reply button.
- Copy unique ID button.
- Edit/Delete buttons for author or admin.
- Evidence display (files and URLs).

### 9.7 Admin Dashboard
- Tabbed interface: Debates, Questions, Analytics, Reports, FAQ, Guidelines, Messages.
- Topic management with edit/archive/delete.
- Question management across all topics.
- Analytics with vote counts, question counts, topic statistics.
- FAQ and Guidelines CRUD interfaces.
- Contact message management.

---

## 10. Data Requirements

### 10.1 Data Persistence
- All debate data (topics, questions, replies, votes) shall be stored in PostgreSQL.
- File attachments shall be stored in a persistent file storage system (local/S3/R2).
- Contact messages shall be stored in PostgreSQL.
- Guidelines and FAQ shall be stored in PostgreSQL (with fallback to localStorage for FAQ in admin panel).

### 10.2 Data Relationships
- One topic has many questions.
- One question has many replies.
- One reply can have many child replies (self-referential).
- One question/reply can have many attachments.
- One question/reply can have many evidence URLs.
- One admin manages content.

### 10.3 Data Validation
- Topic name: 5-255 characters, must contain " vs ".
- Question/reply text: 10-5000 characters.
- Tags: max 100 characters.
- Side: must be 'left' or 'right'.
- Author: max 100 characters, default 'Anonymous'.
- File size: max 10MB.
- Email: valid email format.

---

## 11. Integration Requirements

### 11.1 Google OAuth
- Integrate with Google Identity Services for user authentication.
- Verify ID tokens on the backend.
- Create/update user profiles based on Google account info.

### 11.2 File Storage
- Support local filesystem storage for development.
- Support Cloudflare R2 S3-compatible storage for production.
- Abstract storage behind `FileStorageService` interface with implementations:
  - `LocalFileStorageService`
  - `S3FileStorageService`
  - `R2FileStorageService`
  - `SupabaseFileStorageService`

### 11.3 Email (Future)
- Contact form submissions may trigger email notifications to administrators.
- Currently stored in database; email sending is a potential enhancement.

---

## 12. Constraints and Assumptions

### 12.1 Constraints
- The application is a single-page application (SPA) requiring proper server-side routing configuration.
- PostgreSQL 13+ is required for `gen_random_uuid()` and `SCRAM` authentication.
- Java 17+ is required for the backend.
- Node.js 18+ is required for the frontend build.
- Google OAuth requires a valid client ID configured in the frontend environment.

### 12.2 Assumptions
- Users have modern browsers supporting ES6+ and fetch API.
- Administrators are trusted users with access to the admin login credentials.
- File uploads are primarily for evidence/supporting documents, not large media hosting.
- The debate topic format "X vs Y" is sufficient for the application's use case.
- Users will participate in good faith; moderation is primarily reactive (via reports/contact).

---

## 13. Deployment Requirements

### 13.1 Environment Variables
- Frontend: `VITE_API_URL` - Backend API base URL.
- Backend: `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD` - PostgreSQL connection.
- Backend: `GOOGLE_CLIENT_ID` - Google OAuth client ID.
- Backend: `JWT_SECRET` - Secret key for JWT signing.
- Backend: `ADMIN_USERNAME`, `ADMIN_PASSWORD` - Default admin credentials (for initial setup).

### 13.2 Build and Deployment
- Frontend: `npm run build` produces static files in `dist/`.
- Backend: `mvnw package` produces executable JAR.
- Docker Compose configured for local development with PostgreSQL.
- Render deployment configured via `render.yaml`.
- Nginx configured for SPA routing and static file serving.

---

## 14. Out of Scope

The following features are explicitly **out of scope** for version 1.0:
- Real-time WebSocket updates (polling is used instead).
- Rich text formatting beyond basic sanitization.
- User profiles and social features (friends, follows).
- Direct messaging between users.
- Mobile native applications (responsive web only).
- Multi-language support (English only).
- Advanced moderation tools (AI-based content filtering).
- Payment integration or premium features.

---

## 15. Glossary

| Term | Definition |
|------|------------|
| Topic | A debate subject in "X vs Y" format (e.g., "Sanatan vs Islam"). |
| Question | A top-level post in a debate, assigned to left or right side. |
| Reply | A response to a question or another reply, nested in a tree structure. |
| Side | The column assignment: 'left' or 'right'. |
| Evidence | Supporting files or URLs attached to a post. |
| UniqueId | Human-readable identifier for sharing direct links to posts. |
| Admin | A privileged user who can manage topics, content, and site settings. |
| JWT | JSON Web Token used for admin authentication. |
| Polling | Periodic background refresh of data (every 15 seconds). |
