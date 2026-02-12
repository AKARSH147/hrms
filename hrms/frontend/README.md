# HRMS Lite – Frontend

React (JavaScript) frontend for HRMS Lite. Uses Vite and React Router.

## Run locally

1. **Start the backend** (from project root):

   ```bash
   cd backend
   source .venv/bin/activate
   python manage.py runserver
   ```

2. **Start the frontend** (from project root):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open **http://127.0.0.1:5173/** in your browser. The app proxies `/api` to `http://127.0.0.1:8000`, so the backend must be running.

## Scripts

- `npm run dev` – development server (port 5173)
- `npm run build` – production build to `dist/`
- `npm run preview` – serve production build locally

## Features

- **Dashboard**: Summary counts and present days per employee
- **Employees**: List, add, delete employees
- **Attendance**: Mark attendance (Present/Absent), list with filters (employee ID, date range)
