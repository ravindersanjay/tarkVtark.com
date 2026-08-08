# Week 2 Implementation - Technical Reference

## 🔧 Changes Quick Reference

### File 1: `frontend/src/styles/loginModal.css`

#### Changes Made:
▶ **Extended mobile breakpoints** from `@media (max-width: 600px)` to include both:
- `@media (max-width: 768px)` - Tablet/large phones
- `@media (max-width: 480px)` - Ultra-mobile phones

▶ **Close Button Upgrade**
```css
.modal-close {
  width: 44px;      /* Was: 30px */
  height: 44px;     /* Was: 30px */
}
```

▶ **Responsive Modal Scaling**
```css
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-width: 90vw;        /* New: vw-based scaling */
    max-height: 85vh;       /* New: 85% viewport height */
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 96%;
    max-width: 100%;
    max-height: 90vh;
  }
}
```

▶ **Responsive Typography**
```css
/* 768px breakpoint */
.modal-header h2 {
  font-size: 20px;     /* Was: 24px */
}
.modal-message {
  font-size: 15px;     /* New: smaller */
}
.modal-note {
  font-size: 12px;     /* New */
}

/* 480px breakpoint */
.modal-header h2 {
  font-size: 18px;     /* Smaller for ultra-mobile */
}
.modal-note {
  font-size: 11px;
}
```

▶ **Optimized Padding & Spacing**
```css
/* 768px */
.modal-header {
  padding: 16px 20px;  /* Was: 20px */
}
.modal-body {
  padding: 16px 20px;
}

/* 480px */
.modal-header {
  padding: 12px 16px;  /* Tighter spacing */
}
.modal-body {
  padding: 12px 16px;
}
```

---

### File 2: `frontend/src/styles/app.css`

#### Section A: Card Button Stacking (768px breakpoint)

**Before:**
```css
.controls {
  flex-wrap: wrap;     /* Horizontal with wrapping */
  gap: 6px;
}
.btn {
  padding: 8px 12px;
  font-size: 13px;
  /* No width specified */
}
```

**After:**
```css
.controls {
  flex-direction: column;  /* ← MAIN CHANGE: Vertical stacking */
  gap: 8px;                 /* Slightly increased spacing */
}
.btn {
  padding: 12px 16px;       /* Increased for touch comfort */
  font-size: 13px;
  width: 100%;              /* Full width button */
  min-height: 44px;         /* Touch target minimum */
  display: flex;            /* Center content */
  align-items: center;
  justify-content: center;
}
```

**Vote Button Special Handling:**
```css
.btn.vote {
  width: auto;              /* NOT full-width */
  flex: 0 0 auto;          /* Don't grow/shrink */
}
.vote-count {
  font-size: 14px;
  font-weight: 600;
  min-width: 30px;         /* Align vote counts */
  text-align: center;
}
```

#### Section B: Reply Form Inputs (768px breakpoint)

**Added Styles:**
```css
.reply-form textarea {
  font-size: 16px;         /* iOS zoom prevention */
  min-height: 80px;
}
.reply-form input[type=file],
.reply-form input[type=text] {
  font-size: 16px;         /* iOS zoom prevention */
  min-height: 44px;        /* Touch target */
}
```

#### Section C: Evidence Display (768px breakpoint)

**New CSS Classes (Added):**
```css
.evidence-container {
  margin-top: 12px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  border: 1px solid #bae6fd;
}

.evidence-title {
  font-size: 13px;
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 8px;
}

.evidence-item {
  padding: 10px;
  background: #fff;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #e0f2fe;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.evidence-item a {
  flex: 1;
  word-break: break-word;  /* Wrap long URLs */
  min-height: 44px;        /* Touch target */
  display: flex;
  align-items: center;
  font-size: 13px;
}

.evidence-icon {
  font-size: 16px;
  flex-shrink: 0;
  padding-top: 4px;
}
```

**Global Evidence Link Styles (Added):**
```css
.evidence-item a {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
}
.evidence-item a:hover {
  color: #1d4ed8;
}
```

#### Section D: Ultra-Mobile Optimization (480px breakpoint)

**Button Sizing for Compact Screens:**
```css
.btn {
  padding: 10px 12px;       /* Slightly reduced */
  font-size: 12px;
  width: 100%;
  min-height: 40px;         /* Slightly reduced from 44px */
}

.vote-count {
  font-size: 13px;
  min-width: 26px;          /* Narrower for space */
}

.controls {
  gap: 6px;                 /* Tighter spacing */
}

.meta {
  font-size: 11px;          /* Smaller metadata */
}

.content {
  font-size: 14px;          /* Slightly smaller */
}
```

**Evidence Display on 480px:**
```css
.evidence-container {
  margin-top: 8px;
  padding: 8px;             /* Tighter */
}

.evidence-title {
  font-size: 12px;
}

.evidence-item {
  padding: 8px;
  margin-bottom: 6px;
}

.evidence-item a {
  font-size: 12px;
  min-height: 40px;         /* 40px still acceptable for this size */
}
```

---

### File 3: `frontend/src/components/Card.jsx`

#### Changes Made:

**Before (Lines 281-364):**
```jsx
{/* Display evidence if available */}
{node.evidence && (node.evidence.files?.length > 0 || node.evidence.urls?.length > 0) && (
  <div style={{ marginTop: '8px', padding: '10px', background: '#f0f9ff', ... }}>
    <div style={{ fontSize: '14px', fontWeight: '600', ... }}>
      📚 Evidence Attached:
    </div>
    {/* Inline styles for each item */}
    {node.evidence.files && node.evidence.files.length > 0 && (
      <div style={{ marginBottom: '8px' }}>
        {node.evidence.files.map((file, idx) => (
          <div key={idx} style={{
            padding: '6px 10px',
            background: '#fff',
            ...
          }}>
            <span style={{ fontSize: '16px' }}>📎</span>
            <a style={{...}}... />
          </div>
        ))}
      </div>
    )}
    {/* Similar for URLs */}
  </div>
)}
```

**After (Lines 281-329):**
```jsx
{/* Display evidence if available */}
{node.evidence && (node.evidence.files?.length > 0 || node.evidence.urls?.length > 0) && (
  <div className="evidence-container">
    <div className="evidence-title">📚 Evidence Attached:</div>

    {/* Display file evidence */}
    {node.evidence.files && node.evidence.files.length > 0 && (
      <div>
        {node.evidence.files.map((file, idx) => (
          <div key={idx} className="evidence-item">
            <span className="evidence-icon">📎</span>
            {file.dataUrl ? (
              <a
                href={file.dataUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => openFileInNewTab(file, e)}
              >
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </a>
            ) : (
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>
        ))}
      </div>
    )}

    {/* Similar for URLs */}
  </div>
)}
```

**Key Changes:**
- ✅ Replaced inline `style={}` with CSS class names
- ✅ `.evidence-container` class for main wrapper
- ✅ `.evidence-title` class for header
- ✅ `.evidence-item` class for each file/URL
- ✅ `.evidence-icon` class for emoji icon

**Benefit:** CSS classes allow media query responsive styling without inline style overrides

---

## 📊 Summary of CSS Additions

### Total New CSS Rules
| Category | Breakpoint | New Classes | Lines |
| --- | --- | --- | --- |
| Evidence Display | Global | 5 classes | ~35 |
| Evidence Display | 768px | Updated existing | ~20 |
| Evidence Display | 480px | Optimized values | ~20 |
| Button Stacking | 768px | Modified .controls/.btn | ~25 |
| Button Stacking | 480px | Optimized sizes | ~15 |
| LoginModal | 768px | Enhanced rules | ~50 |
| LoginModal | 480px | New section | ~40 |

**Total Lines Added:** ~205 CSS lines

---

## 🔄 How Media Queries Work (for reference)

```css
/* Desktop (1024px and above) - DEFAULT STYLES */
.btn {
  padding: 6px 12px;
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;  /* Buttons stay inline */
}

/* Tablet/Mobile (768px and below) */
@media (max-width: 768px) {
  .btn {
    padding: 12px 16px;
    width: 100%;
    flex-direction: column;  /* Stack vertically */
  }
}

/* Ultra-Mobile (480px and below) */
@media (max-width: 480px) {
  .btn {
    padding: 10px 12px;    /* Slightly smaller */
    min-height: 40px;      /* Still accessible */
  }
}
```

**How It Works:**
1. Browser starts with default styles (desktop)
2. If screen is ≤768px, apply `@media (max-width: 768px)` rules (override defaults)
3. If screen is ≤480px, apply `@media (max-width: 480px)` rules (override desktop AND 768px)
4. This cascading allows safe, scoped changes

---

## ✅ Validation Checklist

### CSS Validation
- [ ] All media queries properly formatted
- [ ] No syntax errors in CSS
- [ ] Vendor prefixes not needed (modern browsers)
- [ ] Color values valid (#2563eb, #f0f9ff, etc.)
- [ ] Responsive units correct (px, vw, vh)

### JSX Validation
- [ ] All className attributes valid
- [ ] CSS classes match their definitions
- [ ] No orphaned style props
- [ ] Conditional rendering still works

### Breakpoint Validation
- [ ] 768px: Tablet/large phone
- [ ] 480px: Small phone/ultra-mobile
- [ ] Desktop (>768px): Unchanged
- [ ] No gaps between breakpoints

---

## 🚀 Testing CSS Changes

### Chrome DevTools Method
1. **Open DevTools** (F12)
2. **Go to Sources tab**
3. **Search for CSS** (Ctrl+F)
4. **Find media query** (@media (max-width: 768px))
5. **Verify rules** match what's documented here

### File Inspection
```bash
# Count media queries in app.css
grep -c "@media" frontend/src/styles/app.css

# Should output: 2 (for 768px and 480px)

# Find specific class
grep -n "\.evidence-container" frontend/src/styles/app.css

# Should show line number with definition
```

---

## 💡 Design Decisions

### Why 44px Touch Targets?
- **WCAG AAA Standard** minimum for touch interfaces
- **Finger size**: Average adult finger width is 40-50px
- **Safety margin**: 44px provides comfortable tapping

### Why Vertical Button Stacking?
- **Full-width buttons** easier to tap than small adjacent buttons  
- **Mobile pattern**: Standard on mobile apps (iOS, Android)
- **Reduced accidental clicks**: More space between targets

### Why word-break on URLs?
- **Long URLs** would cause horizontal scroll on small screens
- **word-break: break-word**: Wraps text at character boundaries
- **Alternative**: Could use `overflow-x: auto` (but less ideal)

### Why Separate 480px Breakpoint?
- **Space constraints**: Ultra-small screens need aggressive optimization
- **Touch accuracy**: Reduced size (40px) still accessible but saves space
- **User experience**: Tighter layout feels more mobile-native

---

## 📋 Files to Monitor

Watch these files for any manual edits that might conflict:

1. **`frontend/src/styles/app.css`**
   - Do not manually edit inside `@media` queries
   - Any changes should go through this process

2. **`frontend/src/styles/loginModal.css`**
   - Mobile breakpoints (768px, 480px) are now primary
   - Avoid changing close button size

3. **`frontend/src/components/Card.jsx`**
   - Evidence section now uses classes, not inline styles
   - If modifying evidence display, ensure classes are applied correctly

---

## 🔜 Next Implementation Areas (Week 3)

### Admin Dashboard Components
- Apply similar `.evidence-*` classes pattern
- Ensure button stacking on admin tables
- Touch-friendly admin controls

### Admin Forms
- Input min-height 44px
- Font-size 16px (iOS zoom prevention)
- Proper mobile spacing

### Contact & FAQ Forms
- Textarea at 44px+ min-height
- Full-width inputs on mobile
- Touch-friendly form layout

---

**Questions?** Refer to WEEK2_TESTING_GUIDE.md for testing procedures.

*Document Version: 1.0*  
*Last Updated: August 8, 2026*

