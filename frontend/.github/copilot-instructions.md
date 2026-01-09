# Copilot Instructions for AI Agents

## Project Overview
- This is a React frontend bootstrapped with Vite, using modern JavaScript (JSX) and Tailwind CSS for styling.
- The main entry point is `src/main.jsx`, which renders the root `App` component from `src/App.jsx`.
- UI is organized into reusable components under `src/components/` (e.g., `QuestionCard.jsx`, `QuestionColumn.jsx`, `ReplyCard.jsx`).
- Styles are managed with Tailwind CSS (`tailwind.config.js`, `postcss.config.cjs`, and `src/index.css`).

## Key Workflows
- **Development:**
  - Start the dev server: `npm run dev` (uses Vite for fast refresh and HMR).
  - Main HTML template: `index.html` at the project root.
- **Build:**
  - Production build: `npm run build` (outputs to `dist/`).
- **Linting:**
  - Lint JS/JSX: `npm run lint` (configured via `eslint.config.js`).
- **No built-in testing setup** is present; add your own if needed.

## Project-Specific Patterns
- **Component Structure:**
  - Components are colocated in `src/components/` and use `.jsx` extension.
  - Prefer functional components and hooks (no class components observed).
- **Styling:**
  - Use Tailwind utility classes directly in JSX for layout and design.
  - Avoid custom CSS unless necessary; global styles in `src/index.css` and `src/App.css`.
- **Assets:**
  - Static assets (e.g., SVGs) are in `src/assets/` and `public/`.
  - Reference assets in JSX using import or public path as appropriate.

## Integration & Conventions
- **No backend integration** is present in this repo; focus is on UI logic and state.
- **No TypeScript**; all code is JavaScript/JSX.
- **No routing** or state management libraries (e.g., Redux) are present by default.
- **Follow Vite and React best practices** for file structure and imports.

## Examples
- To add a new card component, place it in `src/components/`, use Tailwind for styling, and import it in `App.jsx` or another parent component.
- To update global styles, edit `src/index.css` or `tailwind.config.js`.

## References
- Main entry: `src/main.jsx`
- App root: `src/App.jsx`
- Components: `src/components/`
- Styles: `src/index.css`, `tailwind.config.js`, `postcss.config.cjs`
- Lint config: `eslint.config.js`

---
For more, see the [Vite React template docs](https://vitejs.dev/guide/) and [Tailwind CSS docs](https://tailwindcss.com/docs/installation).