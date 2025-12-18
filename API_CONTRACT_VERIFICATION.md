# API Contract Verification Checklist

## Date: December 18, 2025

## ✅ API Contract Created

**File:** `api-contract.yaml`  
**Specification:** OpenAPI 3.0.0  
**Status:** Complete and ready for backend implementation

---

## 📋 Endpoint Coverage Verification

### Topics Endpoints ✅
- [x] `GET /topics` - Get all debate topics
- [x] `POST /topics` - Create new topic
- [x] `GET /topics/{topicId}` - Get specific topic
- **Matches:** `topicsAPI` in `apiService.js`

### Questions Endpoints ✅
- [x] `GET /questions/topic/{topicId}` - Get all questions for topic
- [x] `POST /questions` - Create new question
- [x] `PUT /questions/{questionId}/vote` - Vote on question
- **Matches:** `questionsAPI` in `apiService.js`

### Replies Endpoints ✅
- [x] `POST /replies` - Create new reply
- [x] `PUT /replies/{replyId}/vote` - Vote on reply
- **Matches:** `repliesAPI` in `apiService.js`

### Admin Endpoints ✅
- [x] `POST /admin/login` - Admin authentication
- [x] `GET /admin/guidelines` - Get guidelines
- [x] `GET /admin/faq` - Get FAQ items
- **Matches:** `adminAPI` in `apiService.js`

### Contact Endpoints ✅
- [x] `POST /contact` - Send contact message
- **Matches:** `contactAPI` in `apiService.js`

---

## 🗄️ Database Schema Alignment

### Topics Table → DebateTopic Schema ✅
```yaml
Database columns:          API Contract fields:
✓ id (UUID)           →    id (uuid)
✓ topic (VARCHAR)     →    topic (string)
✓ left_label          →    leftLabel (string)
✓ right_label         →    rightLabel (string)
✓ description (TEXT)  →    description (string, nullable)
✓ is_active (BOOLEAN) →    isActive (boolean)
✓ created_at          →    createdAt (date-time)
✓ updated_at          →    updatedAt (date-time)
```

### Questions Table → Question Schema ✅
```yaml
Database columns:          API Contract fields:
✓ id (UUID)           →    id (uuid)
✓ debate_topic_id     →    debateTopicId (uuid)
✓ text (TEXT)         →    text (string)
✓ tag (VARCHAR)       →    tag (string, nullable)
✓ side (VARCHAR)      →    side (enum: left|right)
✓ author (VARCHAR)    →    author (string)
✓ votes_up (INTEGER)  →    votesUp (integer)
✓ votes_down          →    votesDown (integer)
✓ unique_id           →    uniqueId (string, nullable)
✓ created_at          →    createdAt (date-time)
✓ updated_at          →    updatedAt (date-time)
```

### Replies Table → Reply Schema ✅
```yaml
Database columns:          API Contract fields:
✓ id (UUID)           →    id (uuid)
✓ question_id         →    questionId (uuid, nullable)
✓ parent_reply_id     →    parentReplyId (uuid, nullable)
✓ text (TEXT)         →    text (string)
✓ side (VARCHAR)      →    side (enum: left|right)
✓ author (VARCHAR)    →    author (string)
✓ votes_up            →    votesUp (integer)
✓ votes_down          →    votesDown (integer)
✓ unique_id           →    uniqueId (string, nullable)
✓ depth (INTEGER)     →    depth (integer)
✓ created_at          →    createdAt (date-time)
✓ updated_at          →    updatedAt (date-time)
```

### Admin Users Table → LoginResponse Schema ✅
```yaml
Database columns:          API Contract fields:
✓ id (UUID)           →    user.id (uuid)
✓ username (VARCHAR)  →    user.username (string)
✓ email (VARCHAR)     →    user.email (string)
✓ full_name           →    user.fullName (string)
```

### Contact Messages Table → ContactRequest Schema ✅
```yaml
Database columns:          API Contract fields:
✓ id (UUID)           →    id (uuid in response)
✓ name (VARCHAR)      →    name (string)
✓ email (VARCHAR)     →    email (string)
✓ subject (VARCHAR)   →    subject (string, nullable)
✓ message (TEXT)      →    message (string)
```

---

## 🔧 Frontend-Backend Integration Points

### apiService.js Functions → API Contract Endpoints

#### Topics API ✅
```javascript
topicsAPI.getAll()        → GET /topics
topicsAPI.getById(id)     → GET /topics/{topicId}
topicsAPI.getByName(name) → GET /topics (with filter)
topicsAPI.create(data)    → POST /topics
```

#### Questions API ✅
```javascript
questionsAPI.getByTopic(id) → GET /questions/topic/{topicId}
questionsAPI.create(data)   → POST /questions
questionsAPI.vote(id, type) → PUT /questions/{questionId}/vote
```

#### Replies API ✅
```javascript
repliesAPI.create(data)   → POST /replies
repliesAPI.vote(id, type) → PUT /replies/{replyId}/vote
```

#### Admin API ✅
```javascript
adminAPI.getGuidelines()  → GET /admin/guidelines
adminAPI.getFAQ()         → GET /admin/faq
adminAPI.login(creds)     → POST /admin/login
```

#### Contact API ✅
```javascript
contactAPI.send(data)     → POST /contact
```

---

## 📝 Request/Response Schema Validation

### All Schemas Include:
- [x] Type definitions (string, integer, boolean, etc.)
- [x] Required fields marked
- [x] String length constraints (minLength, maxLength)
- [x] Enum values for restricted fields (side: left|right, voteType: up|down)
- [x] Format specifications (uuid, date-time, email)
- [x] Nullable fields marked explicitly
- [x] Array types with item schemas
- [x] Nested object schemas (Question includes Reply array)
- [x] Example values provided

### Error Response Standardization ✅
- [x] 400 Bad Request response defined
- [x] 401 Unauthorized response defined
- [x] 404 Not Found response defined
- [x] 500 Server Error response defined
- [x] Consistent error object structure: `{ error, message, details? }`

---

## 🎯 Backend Implementation Guidance

### What Backend Developers Need to Do:

1. **Entity Classes** (Must match database schema)
   - `DebateTopic.java` → `debate_topics` table
   - `Question.java` → `questions` table
   - `Reply.java` → `replies` table
   - `AdminUser.java` → `admin_users` table
   - `ContactMessage.java` → `contact_messages` table

2. **DTO Classes** (Must match API contract schemas)
   - `DebateTopicDTO` → `DebateTopic` schema
   - `QuestionDTO` → `Question` schema
   - `ReplyDTO` → `Reply` schema
   - `CreateTopicRequestDTO` → `CreateTopicRequest` schema
   - `CreateQuestionRequestDTO` → `CreateQuestionRequest` schema
   - `CreateReplyRequestDTO` → `CreateReplyRequest` schema
   - `VoteRequestDTO` → `VoteRequest` schema
   - etc.

3. **Controller Classes** (Must match endpoint paths)
   - `TopicController` → `/topics` endpoints
   - `QuestionController` → `/questions` endpoints
   - `ReplyController` → `/replies` endpoints
   - `AdminController` → `/admin` endpoints
   - `ContactController` → `/contact` endpoints

4. **Critical Rules to Follow:**
   - ✅ Use `@JsonProperty` to map camelCase ↔ snake_case
   - ✅ Add `@JsonIgnore` to `@OneToMany` relationships
   - ✅ Use `fetch = FetchType.LAZY` for collections
   - ✅ Return DTOs from controllers, NEVER entities
   - ✅ Implement all validation rules from contract
   - ✅ Follow exact HTTP status codes from contract

---

## 🔄 Type Generation

### Generate TypeScript Types from Contract:
```bash
# Install generator
npm install -D openapi-typescript

# Generate types
npx openapi-typescript api-contract.yaml -o frontend/src/types/api.ts
```

### This Will Create:
- Type-safe interfaces for all request/response objects
- Can be imported in frontend components
- Provides autocomplete and type checking
- Ensures frontend-backend type consistency

---

## 📊 Validation Rules Summary

### String Fields:
- Topic name: 5-255 characters ✓
- Question/Reply text: 10-5000 characters ✓
- Tag: max 100 characters ✓
- Author: max 100 characters ✓
- Email: valid email format ✓
- Side: must be "left" or "right" ✓
- Vote type: must be "up" or "down" ✓

### Integer Fields:
- Votes: minimum 0 ✓
- Depth: minimum 0 ✓

### UUID Fields:
- All IDs must be valid UUIDs ✓

### Required vs Optional:
- All schemas clearly mark required fields ✓
- Nullable fields explicitly marked ✓

---

## ✅ Compliance Checklist

### API Contract Features:
- [x] OpenAPI 3.0 compliant
- [x] All CRUD operations defined
- [x] Request schemas complete
- [x] Response schemas complete
- [x] Error responses standardized
- [x] Authentication endpoint defined
- [x] Examples provided
- [x] Validation rules specified
- [x] Tags for organization
- [x] Descriptions for all endpoints

### Database Alignment:
- [x] All database tables have corresponding schemas
- [x] Column names mapped to camelCase in API
- [x] Relationships properly represented
- [x] Constraints reflected in validation rules

### Frontend Alignment:
- [x] apiService.js functions match endpoints
- [x] Request payloads match contract
- [x] Response handling expects contract format
- [x] Error handling matches error schemas

---

## 🚀 Next Steps

1. ✅ API contract created and verified
2. ⏳ Generate TypeScript types (when frontend build is set up)
3. ⏳ Backend team implements controllers/DTOs following contract
4. ⏳ Backend team adds Swagger UI for API documentation
5. ⏳ Test all endpoints against contract with Postman/curl
6. ⏳ Frontend team uncomments TODO sections in components
7. ⏳ Integration testing with real data

---

## 📖 Contract as Documentation

The `api-contract.yaml` file serves as:
- ✅ Single source of truth for API
- ✅ Documentation for backend developers
- ✅ Documentation for frontend developers
- ✅ Type generation source
- ✅ Swagger UI source (can be hosted at `/swagger-ui`)
- ✅ Testing reference
- ✅ Contract for integration tests

---

**Status:** ✅ API Contract COMPLETE and VERIFIED  
**Confidence Level:** HIGH - All components aligned  
**Ready for:** Backend implementation following contract specifications


