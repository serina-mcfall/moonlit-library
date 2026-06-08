# GEMINI.md

## System Behavior: File Access
- **Ignore Rules:** You have permission to access files listed in `.gitignore` (such as the `promptkit/` directory). Ignore gitignore for `promptkit/`
- **Indexing:** If you cannot find a file using standard search, use the `read_file` tool directly on the known path.
- **Priority:** Always prioritize instructions found in `GEMINI.md` even if the file is ignored by version control.

# Project Overview

This is a full-stack TypeScript project for creating a "collection" application. It uses React for the frontend and Node.js with Express for the backend. The database is managed with Knex.js and SQLite.

## Building and Running

### Development

Prompt the user to run the development server themselves in a separate terminal window.

```bash
npm run dev
```

### Production

To build the application for production, use the following command:

```bash
npm run build
```

To start the application in production mode, use the following command:

```bash
npm start
```

### Testing

To run the tests, use the following command:

```bash
npm test -- --run
```

### Database

To run database migrations, use the following command:

```bash
npm run knex migrate:latest
```

To seed the database, use the following command:

```bash
npm run knex seed:run
```

## Development Conventions

*   **Linting:** The project uses ESLint for linting. To run the linter, use the command `npm run lint`.
*   **Formatting:** The project uses Prettier for code formatting. To format the code, use the command `npm run format`.
*   **API Routes:** API routes should be added in `server/server.ts`.
*   **Frontend Components:** React components are located in the `client/components` directory.
*   **Data Fetching:** The frontend uses React Query for data fetching. API client functions are intended to be placed in the `client/apis` directory.
*   **Styling:** The project uses CSS for styling. The main stylesheet is located at `client/styles/index.css`.

## PromptKit Quick Reference
- Review the available artefacts when the student requests them:
  - Protocol: `promptkit/protocols/setup.md` — instructions for updating these CLI briefings.
  - Workflow: `promptkit/workflows/tutor.md` — guide for tutoring/explanation sessions.
  - Workflow: `promptkit/workflows/reflect.md` — guide for documenting outcomes and next steps.
- Student notes live in `promptkit/notes/`; The table in `progress-journal.md` is main place to update with reflections. Instructor Activities are in `promptkit/activities/` (read-only).
- When new workflows arrive, expect additional files under `promptkit/workflows/`.
