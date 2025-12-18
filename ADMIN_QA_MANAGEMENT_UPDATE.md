# Admin Dashboard - Questions & Answers Management Update

## Date: December 18, 2025

## Overview
Enhanced the Admin Dashboard's "Questions & Answers" management tab to allow full CRUD operations (Create, Read, Update, Delete) on both questions and their nested replies.

## Changes Made

### 1. AdminDashboard Component (`frontend/src/components/AdminDashboard.jsx`)

#### Previous Implementation:
- Only displayed questions and answers
- Only had **Delete** buttons for questions and replies
- No edit functionality
- Nested replies were not displayed with proper indentation

#### New Implementation:
- **Edit & Save functionality** for both questions and answers
- **Delete functionality** retained for both questions and answers
- **Proper visual hierarchy** for nested replies with indentation
- **Depth indicators** showing reply nesting level

#### Key Features Added:

1. **Editable Questions:**
   - Click "Edit" button to enter edit mode
   - Text appears in a textarea for modification
   - "Save" button updates the question
   - "Cancel" button exits edit mode without saving

2. **Editable Answers (Replies):**
   - Same edit/save/cancel workflow as questions
   - Works on all nested levels of replies
   - Uses the existing `updatePostRecursive()` function

3. **Visual Improvements:**
   - Reply headers show author name, unique ID, and depth level
   - Nested replies are indented based on depth (20px per level)
   - Depth level indicator (e.g., "↳ Level 2", "↳ Level 3")
   - Clear separation between questions and nested replies

4. **State Management:**
   - Uses existing `editingPost` state to track which post is being edited
   - Uses existing `updatePost()` function to save changes
   - Properly handles nested reply structures

### 2. Admin CSS Styles (`frontend/src/styles/admin.css`)

#### Updated Styles:

```css
.reply-item {
  /* Changed from flex layout to block layout for better edit form display */
  background: #fff;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  margin-bottom: 8px;
  transition: box-shadow 0.2s;
}

.reply-header {
  /* New class for reply metadata */
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.reply-depth {
  /* New class for depth indicator */
  color: #6b7280;
  font-size: 0.85rem;
  font-style: italic;
}

.reply-item .edit-form,
.question-item .edit-form {
  /* Improved edit form layout */
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
```

## How to Use (Admin Guide)

### Accessing the Feature:
1. Login to Admin Dashboard
2. Navigate to "Questions & Answers" tab
3. Select a debate topic
4. All questions and nested answers will be displayed

### Editing a Question:
1. Find the question you want to edit
2. Click the "Edit" button
3. Modify the text in the textarea
4. Click "Save" to save changes or "Cancel" to discard

### Editing an Answer:
1. Find the answer/reply you want to edit
2. Click the "Edit" button next to that specific reply
3. Modify the text in the textarea
4. Click "Save" to save changes or "Cancel" to discard

### Deleting Content:
1. Click "Delete" button next to any question or answer
2. Confirm the deletion in the popup dialog
3. For questions: deletes the question and all its nested replies
4. For answers: deletes the answer and all its nested sub-replies

## Technical Details

### Data Structure:
```javascript
{
  topic: "Debate Topic Name",
  questions: [
    {
      id: "q-123456789",
      uniqueId: "unique-id-123",
      text: "Question text",
      author: "Author Name",
      tag: "Category",
      replies: [
        {
          id: "r-987654321",
          uniqueId: "unique-id-456",
          text: "Reply text",
          author: "Reply Author",
          replies: [ /* nested replies */ ]
        }
      ]
    }
  ]
}
```

### Key Functions:

1. **`updatePostRecursive(items, postId, newText)`**
   - Recursively searches through questions and replies
   - Updates the text of the post matching `postId`
   - Returns updated data structure

2. **`flattenReplies(replies, depth)`**
   - Flattens nested reply structure for display
   - Tracks depth level for indentation
   - Returns array of replies with depth metadata

3. **`updatePost(postId, newText)`**
   - Wrapper function that calls `updatePostRecursive()`
   - Saves updated data to localStorage
   - Clears editing state

## Testing Checklist

- [x] Edit a top-level question
- [x] Edit a first-level answer
- [x] Edit a nested reply (level 2+)
- [x] Save changes and verify they persist
- [x] Cancel edit without saving
- [x] Delete a question with nested replies
- [x] Delete an answer with sub-replies
- [x] Verify visual hierarchy with indentation
- [x] Verify depth indicators appear correctly
- [x] Check responsive layout on mobile

## Browser Compatibility
- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Mobile browsers: ✅ Responsive design

## Future Enhancements (Optional)
1. Bulk edit functionality
2. Rich text editor for formatting
3. Preview mode before saving
4. Change history/versioning
5. Search and filter within Q&A
6. Export Q&A to CSV/JSON

## Notes
- All changes are saved to localStorage with key format: `debate_threads_{topic_name}`
- Edit mode can be cancelled by clicking "Cancel" button
- Only one post can be edited at a time (controlled by `editingPost` state)
- Deleting a parent post also deletes all child replies

