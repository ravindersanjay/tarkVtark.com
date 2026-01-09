# Debate Application - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Concepts](#core-concepts)
4. [File Structure](#file-structure)
5. [Data Flow](#data-flow)
6. [Key Algorithms](#key-algorithms)
7. [Component Reference](#component-reference)
8. [Development Guide](#development-guide)

---

## Overview

This is a React-based debate application that displays questions and answers in a two-column layout. Questions and replies alternate between left and right columns, creating a visual conversation flow.

### Key Features
- **Two-column layout**: Questions start on one side, answers appear on the opposite side
- **Nested replies**: Answers can be replied to, creating threaded conversations
- **Parent-child pairing**: When a post gets a reply, they appear adjacent in the same row
- **Reply duplication**: When a reply gets sub-replied, the parent is duplicated in a new row
- **Arrow indicators**: Visual arrows (→ or ←) show conversation flow
- **Local storage**: All data persists in browser localStorage
- **Search/filter**: Filter posts by tag or content
- **Voting**: Upvote/downvote posts
- **Unique ID sharing**: Copy and share links to specific posts

---

## Architecture

### Technology Stack
- **React 18**: UI library with hooks
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **localStorage**: Client-side data persistence

### Application Flow
```
User opens app
    ↓
main.jsx bootstraps React
    ↓
MainRouter determines which page to show
    ↓
If debate page → App.jsx component
    ↓
App loads data from localStorage
    ↓
App renders questions using renderQuestion()
    ↓
Each question becomes a series of rows (Card components)
    ↓
User interacts (add question, reply, vote)
    ↓
State updates → localStorage auto-saves → UI re-renders
```

---

## Core Concepts

### 1. Two-Column Layout
- Questions can be posted on either LEFT or RIGHT side
- Replies always appear on the OPPOSITE side of their parent
- This creates an alternating pattern that visualizes the debate

### 2. Parent-Child Pairing
When a post gets a reply, they are displayed in the same row:
```
Row 1: [Question (left)] → [Answer (right)]
```

### 3. Reply Duplication
When a reply itself gets replied to, the parent reply is DUPLICATED in a new row:
```
Row 1: [Question (left)] → [Answer1 (right)]
Row 2: [Answer2 (right)]  [empty]
Row 3: [Answer1 (right)] → [SubAnswer (left)]  ← Answer1 duplicated here!
```

This ensures parent and child are always adjacent, making conversations easy to follow.

### 4. Data Structure
```javascript
debateData = {
  topic: "Sanatan vs Islam",
  questions: [
    {
      id: "q-1702475844123-456",
      text: "Question text",
      tag: "Category",
      side: "left",  // or "right"
      author: "CurrentUser",
      timestamp: "12/13/2024, 3:54:44 PM",
      replies: [
        {
          id: "r-1702475844567-789",
          text: "Reply text",
          side: "right",  // opposite of parent
          replies: [...]  // nested replies
        }
      ],
      votes: { up: 5, down: 2 },
      uniqueId: "q-1702475844123-456"
    }
  ]
}
```

---

## File Structure

```
src/
├── main.jsx                 # Entry point, routing, app bootstrap
├── App.jsx                  # Main debate board component
├── index.css                # Global styles
│
├── components/
│   ├── Card.jsx             # Individual question/reply card (ACTIVE)
│   ├── ReplyForm.jsx        # Form for posting replies (ACTIVE)
│   ├── TopNav.jsx           # Navigation bar
│   ├── DebateTopics.jsx     # Home page - list of debates
│   ├── Guidelines.jsx       # Rules and guidelines page
│   ├── FAQ.jsx              # FAQ page
│   ├── ContactUs.jsx        # Contact page
│   └── [Old components]     # QuestionCard, ReplyCard, QuestionColumn (not used)
│
├── utils/
│   └── helpers.js           # Utility functions (generateUniqueId, deepCopy)
│
└── styles/
    └── app.css              # Debate board specific styles
```

### Active vs Inactive Components
**ACTIVE** (currently used):
- Card.jsx - Displays questions and replies
- ReplyForm.jsx - Form for posting replies

**INACTIVE** (legacy, not used):
- QuestionCard.jsx, ReplyCard.jsx, QuestionColumn.jsx - Old implementation

---

## Data Flow

### Adding a Question
1. User fills form and clicks "Add Question"
2. `addNewQuestion()` validates inputs
3. Creates new question object with:
   - Unique ID
   - User's text and tag
   - Selected side (left/right)
   - Empty replies array
4. Updates `debateData` state
5. useEffect auto-saves to localStorage
6. React re-renders with new question

### Posting a Reply
1. User clicks "Reply this question" button
2. Reply form appears (controlled by `openForms` state)
3. User types reply and clicks "Post Reply"
4. `postReply(parentId)` is called
5. Function finds parent in the tree using `findPostById()`
6. Creates new reply with OPPOSITE side of parent
7. Adds reply to parent's `replies` array
8. Updates state → auto-saves → re-renders

### Rendering Logic
1. `renderQuestion(q)` is called for each question
2. `buildThreadRows(q)` flattens the tree into array
3. `processNode()` recursively processes nodes, creating paired rows
4. For each pair, render parent and child in same row
5. Arrow indicator shows direction (→ or ←)

---

## Key Algorithms

### 1. Finding Posts by ID
```javascript
// Search entire tree recursively
findPostById(id, questions)
  → Check top-level questions
  → If not found, recursively search all replies
  → Return found post or null
```

### 2. Pairing Algorithm
```javascript
For each node:
  If node has children:
    Pair node with FIRST child in same row
    Process first child recursively
    Show remaining children in separate rows
  Else:
    Show node alone (if first occurrence)
```

This creates the duplication effect - parents appear multiple times when they have multiple children.

### 3. Deep Copy for Immutability
```javascript
// Never mutate state directly!
setDebateData(prev => {
  const newData = deepCopy(prev);  // Create new object
  // Modify newData...
  return newData;  // Return modified copy
});
```

---

## Component Reference

### App.jsx
**Purpose**: Main debate board component  
**Props**: `{ topic: string }`  
**State**:
- `debateData` - All questions and replies
- `newQuestionText`, `newTag`, `newQuestionSide` - New question form
- `drafts` - Draft text for each reply form
- `openForms` - Which reply forms are currently open
- `copied` - Track copied uniqueIds for "Copied!" message
- `filterTag` - Search/filter text

**Key Functions**:
- `addNewQuestion()` - Add new top-level question
- `postReply(parentId)` - Add reply to a post
- `handleVote(type, id)` - Handle voting
- `renderQuestion(q)` - Render a question and all its replies

### Card.jsx
**Purpose**: Display a single question or reply  
**Props**:
- `node` - The question/reply data
- `depth` - How deep in tree (0 = question)
- `toggleForm`, `handleVote`, `copyUniqueId` - Action callbacks
- `openForms`, `drafts`, `copied` - UI state
- `leftLabel`, `rightLabel` - Column labels

**Renders**:
- Metadata (author, timestamp, uniqueId)
- Content text
- Controls (Reply, Report, Vote, Copy)
- Embedded ReplyForm

### ReplyForm.jsx
**Purpose**: Form for posting replies  
**Props**:
- `id` - Parent post ID
- `value` - Draft text
- `onChange` - Text change callback
- `onPost` - Submit callback
- `open` - Visibility flag

---

## Development Guide

### Running the App
```bash
npm install         # Install dependencies
npm run dev         # Start dev server (http://localhost:5180)
npm run build       # Build for production
npm run lint        # Check code quality
```

### Adding a New Feature

1. **Identify where to add code**:
   - UI changes → Card.jsx or ReplyForm.jsx
   - Logic changes → App.jsx
   - New utility → helpers.js

2. **Maintain immutability**:
   ```javascript
   // WRONG - mutates state
   debateData.questions.push(newQ);
   
   // CORRECT - creates new object
   const newData = deepCopy(debateData);
   newData.questions.push(newQ);
   setDebateData(newData);
   ```

3. **Update localStorage** automatically happens via useEffect

4. **Test thoroughly**:
   - Add questions on both sides
   - Add nested replies (3+ levels deep)
   - Test voting, filtering, copying IDs
   - Refresh page to ensure data persists

### Common Pitfalls

1. **Forgetting to use deepCopy**: Always use when modifying nested objects
2. **Wrong side assignment**: Replies should be OPPOSITE of parent
3. **Breaking the pairing logic**: Be careful when modifying renderQuestion()
4. **Not handling edge cases**: Empty arrays, null values, etc.

### Performance Considerations

- **localStorage**: Has ~5-10MB limit, plenty for text-based debates
- **deepCopy**: Fast enough for typical debates (<1000 posts)
- **Re-renders**: React efficiently updates only what changed
- **Large threads**: Algorithm is O(n) where n = total posts

---

## Future Enhancements

Potential features to add:
- User authentication
- Real-time multi-user support (WebSockets)
- Rich text editor
- Image/file attachments
- Moderator tools
- Export debates to PDF
- Search with highlighting
- Debate analytics/statistics
- Mobile-responsive design improvements

---

## Troubleshooting

**Q: Questions appear as blank rows**  
A: Check that `node.text` is being rendered correctly in Card.jsx. React auto-escapes text, so no need for escapeHtml().

**Q: Replies not showing in correct column**  
A: Verify that `side` is set to opposite of parent in postReply().

**Q: Data not persisting after refresh**  
A: Check browser console for localStorage errors. Some browsers block it in private mode.

**Q: Arrow not showing between cards**  
A: Check that paired rows have `position: 'relative'` and arrow has `position: 'absolute'`.

---

**Last Updated**: December 13, 2025  
**Version**: 1.0.0

