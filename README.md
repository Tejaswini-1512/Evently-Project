# Evently — Event & Workshop Management Portal

A responsive React + Vite demo with separate attendee and administrator dashboards.

## Features
- Separate User and Admin views (use **Switch to Admin / Switch to User** in the sidebar).
- Event discovery, search, category filtering, and date sorting.
- Event details and attendee registration form.
- Validation for required fields, email, contact number, duplicate registration, and seat capacity.
- Admin dashboard statistics, event creation/editing/deletion, registration list, and capacity indicators.
- Data is saved to the browser's localStorage.

## Run in VS Code
1. Install Node.js (LTS) if it is not already installed.
2. Extract this ZIP.
3. Open the extracted `event-portal` folder in VS Code.
4. Open Terminal → New Terminal.
5. Run:

   ```bash
   npm install
   npm run dev
   ```

6. Open the local URL Vite prints, usually `http://localhost:5173`.

## Notes
- This is a frontend demo; it does not use a server or shared database. Data is saved only in the current browser.
- The sample events use remote Unsplash image URLs, so event photos require an internet connection.
- This is not a production authentication system. The role switch is for demonstrating both dashboards.
