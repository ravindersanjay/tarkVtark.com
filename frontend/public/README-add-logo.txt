Place the provided logo image into this project's public folder so the app can load it at runtime.

Filename to use:
  public/tarkVtark_Logo3.jpg

Steps:
1) Save the attached image (tarkVtark_Logo3.jpg) into this folder: `public/`.
   - On Windows: copy the file into `d:\debate-app\debate-frontend\public\tarkVtark_Logo3.jpg`
2) Restart the dev server (if running) so Vite will serve the new static asset.
   - Example: in PowerShell from project root:
     npm run dev

Notes:
- The nav component (`src/components/TopNav.jsx`) now requests `/tarkVtark_Logo3.jpg` and falls back to the bundled SVG if the file is missing or fails to load.
- If you see an old image or no image, try a hard reload in the browser (Ctrl+F5) or clear the browser cache.
