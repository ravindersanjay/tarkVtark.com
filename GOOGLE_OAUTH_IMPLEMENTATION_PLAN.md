# Google OAuth Login Implementation - Analysis & Plan

## Requirements Summary

### Current State
- **Guest users** can:
  - ✅ View list of debates
  - ✅ Visit any debate page
  - ✅ Read questions and answers

- **Guest users CANNOT** (must login first):
  - ❌ Like/vote on answers
  - ❌ Reply to answers
  - ❌ Post new questions
  - ❌ Create new debates

### Desired State
- Implement Google OAuth login
- Guest users prompted to login when attempting protected actions
- No breaking changes to existing functionality
- Admin login remains separate (username/password)

---

## Current System Analysis

### Frontend Authentication

**File: `frontend/src/App.jsx`**
```javascript
const CURRENT_USER = 'CurrentUser'; // Hardcoded user
```

**Current Issues:**
1. No actual user authentication
2. User is hardcoded as 'CurrentUser'
3. No session management
4. No distinction between guest and logged-in users
5. All actions allowed without authentication

### Backend Authentication

**File: `backend/src/main/java/com/debatearena/controller/AuthController.java`**
- Only handles **admin** authentication
- Uses username/password
- Generates JWT tokens
- No user (non-admin) authentication

**Services:**
- `AuthService` - Admin authentication only
- No Google OAuth integration
- No user session management

### Database

**Current tables:**
- `admin_users` - Admin accounts only
- No `users` table for regular users

**Need to create:**
- `users` table for regular users
- Store Google OAuth info (email, name, googleId, profile picture)

---

## Impact Analysis

### Frontend Changes Required

#### 1. User Context/State Management
**Impact:** 🟡 Medium
- Add user context provider
- Track authentication state
- Store user info (name, email, photo)
- Replace hardcoded `CURRENT_USER`

#### 2. Protected Actions
**Impact:** 🟡 Medium
- Wrap voting in auth check
- Wrap reply forms in auth check
- Wrap question form in auth check
- Wrap topic creation in auth check

#### 3. Login UI
**Impact:** 🟢 Low
- Add Google Sign-In button
- Login modal/popup
- User profile display
- Logout button

#### 4. API Integration
**Impact:** 🟢 Low
- Send auth token with requests
- Handle 401 responses
- Refresh tokens if needed

### Backend Changes Required

#### 1. User Model & Repository
**Impact:** 🟢 Low
- Create `User` entity
- Create `UserRepository`
- Database migration for users table

#### 2. Google OAuth Integration
**Impact:** 🟡 Medium
- Add Spring Security OAuth2 dependencies
- Configure Google OAuth client
- Create OAuth callback endpoint
- Generate JWT for users (separate from admin)

#### 3. Authentication Service
**Impact:** 🟡 Medium
- Create `UserAuthService`
- Handle Google token validation
- Create user sessions
- Generate user JWT tokens

#### 4. API Endpoints
**Impact:** 🟢 Low
- `POST /auth/google` - Google OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout user

#### 5. Authorization Middleware
**Impact:** 🟡 Medium
- Protect endpoints (questions, replies, votes)
- Validate JWT on protected routes
- Extract user from token
- Return 401 for unauthorized

### Breaking Changes Risk

#### ✅ Zero Breaking Changes (If Done Correctly)

**Why:**
1. **Viewing is public** - No auth required for GET endpoints
2. **Admin separate** - Admin auth unchanged
3. **Backward compatible** - Old data works with new system
4. **Graceful degradation** - Guests see "Login to continue"

**Mitigation:**
- All GET endpoints remain public
- POST/PUT/DELETE require authentication
- Frontend handles auth gracefully
- Clear error messages for guests

---

## Implementation Strategy

### Phase 1: Backend Foundation (No Breaking Changes)

#### Step 1.1: Create User Model
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private String email;
    private String name;
    private String googleId;
    private String profilePicture;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Boolean isActive;
}
```

#### Step 1.2: Database Migration
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    profile_picture VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

#### Step 1.3: Add Spring Security OAuth2
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>
```

#### Step 1.4: Configure Google OAuth
```yaml
# application.yml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - email
              - profile
```

#### Step 1.5: Create UserAuthService
```java
@Service
public class UserAuthService {
    public LoginResponse authenticateWithGoogle(String googleToken) {
        // Validate Google token
        // Get user info from Google
        // Create or update user in DB
        // Generate JWT
        // Return LoginResponse
    }
}
```

#### Step 1.6: Create Auth Endpoints
```java
@RestController
@RequestMapping("/auth")
public class UserAuthController {
    @PostMapping("/google")
    public ResponseEntity<LoginResponse> googleLogin(@RequestBody GoogleTokenRequest request) { }
    
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal User user) { }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() { }
}
```

#### Step 1.7: Protect Endpoints
```java
// In QuestionController, ReplyController
@PostMapping("/questions")
public ResponseEntity<QuestionDTO> createQuestion(
    @AuthenticationPrincipal User user,  // ← Requires auth
    @RequestBody QuestionRequest request
) {
    // Save question with user.getId() as author
}
```

### Phase 2: Frontend Integration

#### Step 2.1: Add Google Sign-In Library
```bash
npm install @react-oauth/google
```

#### Step 2.2: Create Auth Context
```jsx
// AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const loginWithGoogle = async (credential) => {
    const response = await fetch('/api/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: credential })
    });
    const data = await response.json();
    setUser(data.user);
    setIsAuthenticated(true);
    localStorage.setItem('user_token', data.token);
  };
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Step 2.3: Add Login Modal
```jsx
// LoginModal.jsx
const LoginModal = ({ isOpen, onClose, action }) => {
  return (
    <Modal isOpen={isOpen}>
      <h2>Login Required</h2>
      <p>You need to login to {action}</p>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />
    </Modal>
  );
};
```

#### Step 2.4: Protect Actions in App.jsx
```jsx
// Replace CURRENT_USER with actual user
const { user, isAuthenticated, showLoginModal } = useAuth();

const handleVote = (postId, voteType) => {
  if (!isAuthenticated) {
    showLoginModal('vote on this post');
    return;
  }
  // Proceed with voting
};

const handleReply = (postId) => {
  if (!isAuthenticated) {
    showLoginModal('reply to this post');
    return;
  }
  // Proceed with reply
};
```

#### Step 2.5: Update API Calls
```javascript
// apiService.js
const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('user_token');
  
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });
};
```

### Phase 3: Testing & Validation

#### Test Cases
1. ✅ Guest can view debates
2. ✅ Guest can view questions/answers
3. ❌ Guest cannot vote (shows login)
4. ❌ Guest cannot reply (shows login)
5. ❌ Guest cannot post question (shows login)
6. ❌ Guest cannot create topic (shows login)
7. ✅ Logged-in user can do all actions
8. ✅ Admin login still works
9. ✅ Existing data displays correctly
10. ✅ Backend endpoints protected

---

## Data Migration Strategy

### User Identification
**Current:** All posts have `author: "CurrentUser"`

**Migration Options:**

**Option 1: Leave as-is (Recommended)**
- Old posts keep `author: "CurrentUser"`
- New posts use actual user names/IDs
- No data migration needed
- Shows historical nature of old posts

**Option 2: Migrate to system user**
- Create system user "Anonymous"
- Update all old posts to this user
- Requires database UPDATE

**Recommendation:** Option 1 (no migration)

---

## Google OAuth Setup Required

### Google Cloud Console Steps
1. Create project at https://console.cloud.google.com
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized origins:
   - http://localhost:5173
   - http://localhost:8080
5. Add authorized redirect URIs:
   - http://localhost:5173/auth/callback
   - http://localhost:8080/api/v1/auth/google/callback
6. Copy Client ID and Client Secret

### Environment Variables
```bash
# .env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

## Breaking Changes Analysis

### ✅ NO Breaking Changes Expected

#### Viewing (Public)
- ✅ GET /topics - Still public
- ✅ GET /questions/{topicId} - Still public
- ✅ GET /topics/{id} - Still public
- ✅ Guests can still browse

#### Creating (Protected)
- 🔒 POST /questions - Now requires auth
- 🔒 POST /replies - Now requires auth
- 🔒 POST /topics - Now requires auth
- 🔒 PUT /votes/{id} - Now requires auth

#### Admin (Unchanged)
- ✅ Admin login still works
- ✅ Admin dashboard unchanged
- ✅ Admin API unchanged

#### Frontend (Backward Compatible)
- ✅ Guests see read-only view
- ✅ Login prompts shown when needed
- ✅ No errors for guests
- ✅ Graceful degradation

---

## Implementation Complexity

### Difficulty: 🟡 Medium

**Time Estimate:** 4-6 hours

**Breakdown:**
- Backend setup: 2-3 hours
- Frontend integration: 1.5-2 hours
- Testing: 0.5-1 hour

**Risk Level:** 🟢 Low
- Well-established OAuth pattern
- Clear separation of concerns
- Incremental implementation possible

---

## Dependencies Required

### Backend
```xml
<!-- Spring Security OAuth2 Client -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>

<!-- JWT for user tokens -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
```

### Frontend
```bash
npm install @react-oauth/google
```

---

## Security Considerations

### Token Storage
- ✅ Store JWT in localStorage (acceptable for demo)
- 🔒 Production: Use httpOnly cookies

### Token Validation
- ✅ Validate Google token server-side
- ✅ Generate our own JWT for sessions
- ✅ Set token expiration (24 hours recommended)

### CORS
- ✅ Already configured for localhost:5173
- ✅ Add auth endpoints to CORS whitelist

### SQL Injection
- ✅ Using JPA/Hibernate (parameterized queries)
- ✅ No raw SQL in user input

---

## Rollback Plan

If something goes wrong:

1. **Backend:** Remove `@AuthenticationPrincipal` from endpoints
2. **Frontend:** Remove auth checks, use hardcoded user
3. **Database:** Users table optional, can be empty
4. **Config:** Remove OAuth config from application.yml

**No data loss risk** - All changes are additive

---

## Success Criteria

### Functional Requirements
- [x] Guest can view debates (no login)
- [x] Guest prompted to login for protected actions
- [x] Google Sign-In button works
- [x] User can login with Google
- [x] Logged-in user can post/reply/vote
- [x] User info displayed (name, photo)
- [x] Logout works
- [x] Admin login still works

### Non-Functional Requirements
- [x] No breaking changes
- [x] Existing data visible
- [x] Performance unchanged
- [x] Security best practices
- [x] Clear error messages

---

## Recommendation

### ✅ PROCEED WITH IMPLEMENTATION

**Justification:**
1. **High Value:** Essential feature for production
2. **Low Risk:** No breaking changes
3. **Clear Path:** Well-established patterns
4. **Incremental:** Can be done in phases

**Suggested Approach:**
1. Start with backend (Phase 1)
2. Test with Postman/cURL
3. Add frontend (Phase 2)
4. Test end-to-end
5. Deploy incrementally

---

## Next Steps

1. **Setup Google OAuth credentials**
2. **Implement backend Phase 1**
3. **Test backend endpoints**
4. **Implement frontend Phase 2**
5. **End-to-end testing**
6. **Documentation**

---

**Ready to implement?** The plan ensures zero breaking changes while adding essential authentication. 🚀

