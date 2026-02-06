# AppBlocker Backend

Simple backend for the AppBlocker-native UI.

## Quick start
1. npm install
2. Copy .env.example to .env and edit values
3. npx prisma migrate dev --name init
4. npm run dev

Optional seed (creates a demo user):
- npm run seed
- Demo login: jeferson@gmail.com / admin123

## Scripts
- npm run dev
- npm run build
- npm start
- npm run prisma:migrate
- npm run prisma:studio
- npm run seed

## API overview
- GET /health
- POST /auth/register
- POST /auth/login
- GET /me
- PATCH /me
- GET /tasks
- POST /tasks
- GET /tasks/:id
- PATCH /tasks/:id
- DELETE /tasks/:id
- GET /projects
- POST /projects
- DELETE /projects/:id
- GET /reminders
- POST /reminders
- PATCH /reminders/:id
- DELETE /reminders/:id
- GET /notifications
- POST /notifications
- PATCH /notifications/:id/read
- POST /notifications/read-all
- GET /timer-settings
- PUT /timer-settings
- GET /focus-sessions
- POST /focus-sessions
- GET /stats
