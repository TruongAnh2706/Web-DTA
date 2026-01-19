# Handoff Instructions - Transition to New Machine

**Date**: 2026-01-19
**Status**: In Progress (Admin Security & Google Sheets Sync)

## Current State
1.  **Codebase**: All recent changes (Security Fix + Google Sheets 2-way sync utility) have been pushed to the `main` branch.
2.  **Security**: The hardcoded `isAdmin = true` logic has been REMOVED. Admin access now strictly relies on Supabase Roles (or the hardcoded owner email).
3.  **Google Sheets**: The `src/utils/googleSheets.ts` file has been updated to support `GET` (fetch users) and `POST` (create/update users).

## Pending Action (Crucial)
**On the Google Apps Script side (User's responsibility):**
-   The user must update their Google Apps Script deployment with the NEW code provided in the conversation (also available in the comments of `src/utils/googleSheets.ts`).
-   Without this update, the new Admin "User Management" features will fail.

## Next Steps (To-Do on New Machine)
1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/TruongAnh2706/Web-DTA.git
    cd Web-DTA
    npm install
    ```
2.  **Environment Setup**:
    -   Create `.env` file.
    -   Copy `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
    -   **Important**: Ensure `VITE_GOOGLE_SHEETS_WEBHOOK_URL` is set to the *deployed* Web App URL of the Google Script.

3.  **Continue Development**:
    -   Implement the **Admin User Management** UI (`src/components/admin/UserManagement.tsx`).
    -   Add the "Sync/Upgrade" buttons in the Admin Dashboard.
    -   Verify the 2-way sync works (Change user in UI -> Updates Sheet).

## Recent Files Created/Modified
-   `src/contexts/AuthContext.tsx` (Security Logic)
-   `src/utils/googleSheets.ts` (Sync Logic)
-   `src/pages/Admin.tsx` (To be updated next)
