# UBCSchedules

Automatically generates every weekly schedule for a set of UBC courses, so you don't have to manually check section times yourself.

**Live app:** https://ubcschedules.vercel.app

## Usage Instructions

1. Choose a campus (Vancouver or Okanagan) and a term.
2. Add the courses you want to take (e.g. CPSC 110).
3. Hit `Generate schedules`. The app backtracks over every section combination and keeps only the ones with no time conflicts.
4. Lock in specific sections or filter by time or enrollment status to reduce the number of generated schedules.

Course data is pulled live from UBC's own [Drupal JSON:API](https://courses.students.ubc.ca/jsonapi) to reflect real-time section offerings and enrollment status, cached for different lengths based on time of year for backend efficiency and server politeness.

## Tech stack

| Layer    | Stack                                                     
| -------- | ---------------------------------------------------------- 
| Frontend | React 18 + Vite, deployed on Vercel                         
| Backend  | Node.js + Express, deployed on Render                       
| Data     | UBC's Drupal JSON:API (`courses.students.ubc.ca/jsonapi`)  
| Testing  | Vitest                                                       
| Email    | Resend (bug report)                                

<!-- ## Getting started

### Prerequisites
- Node.js 18+
- npm

### 1. Backend

```bash
cd ubc-data
npm install
npm run dev       # http://localhost:3001
```

### 2. Frontend

In a separate terminal, from the repo root:

```bash
npm install
cp .env.example .env    # defaults to http://localhost:3001, override if needed
npm run dev              # http://localhost:5173
```

### Running tests

```bash
npm test          # Vitest — scheduler conflict logic, time formatting, palette
``` -->

<!-- ## API

| Method | Route                        | Description                                                            |
| ------ | ----------------------------- | ------------------------------------------------------------------------ |
| GET    | `/api/terms`                  | List of available terms                                                 |
| GET    | `/api/sections/:dept/:course` | Sections for a course
| POST   | `/api/bug-report`             | Submits a bug report via email (Resend)                                 |
| GET    | `/health-check`               | Pinged by an external cron job to keep Render's free-tier instance warm | -->

## Known limitations / roadmap

- **Linked sections**: Some UBC courses have specific lab/discussion sections paired with a lecture (MATH_V 100). The scheduler currently treats component types as independently combinable, which results in combinations UBC's registration system wouldn't allow.
- No persistence: schedules aren't saved between sessions.
- Backend currently has no automated tests.

## License

MIT — see [LICENSE.md](./LICENSE.md).