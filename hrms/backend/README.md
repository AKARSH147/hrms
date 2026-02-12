# HRMS Lite

A lightweight Human Resource Management System (HRMS) backend that allows an admin to manage employee records and track daily attendance. Built with Django and Django REST Framework.

## Project Overview

HRMS Lite is a web-based internal HR tool focused on:

- **Employee Management**: Add, view, and delete employees with unique Employee ID, full name, email, and department.
- **Attendance Management**: Mark and view daily attendance (Present/Absent) per employee, with optional filtering by date and summary statistics.

The system assumes a single admin user; no authentication is required. Leave management, payroll, and advanced HR features are out of scope.

## Tech Stack

- **Backend**: Python 3.9+, Django 4.2+, Django REST Framework 3.14+
- **Database**: SQLite (default; can be switched to PostgreSQL/MySQL via settings)
- **CORS**: django-cors-headers for cross-origin requests

## Project Structure

```
hrms/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── hrms_lite/           # Project settings & URL config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── exceptions.py    # Custom API error handler
│   │   └── ...
│   └── employees/           # Main app: Employee & Attendance
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       └── admin.py
└── README.md
```

## Steps to Run the Project Locally

1. **Clone the repository** (or navigate to the project folder).

2. **Create and activate a virtual environment** (recommended):

   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate   # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**:

   ```bash
   python manage.py migrate
   ```

5. **Start the development server**:

   ```bash
   python manage.py runserver
   ```

   The API will be available at **http://127.0.0.1:8000/**.

6. **(Optional)** Create a superuser for Django admin:

   ```bash
   python manage.py createsuperuser
   ```

   Then open **http://127.0.0.1:8000/admin/** to manage data via the admin interface.

## API Endpoints

Base URL: `http://127.0.0.1:8000/api/`

### Employee Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees/` | List all employees |
| POST | `/api/employees/` | Add a new employee |
| GET | `/api/employees/<id>/` | Get a single employee |
| DELETE | `/api/employees/<id>/` | Delete an employee |

**Create employee (POST /api/employees/)**  
Body (JSON): `employee_id`, `full_name`, `email`, `department` (all required).

### Attendance Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance/` | List all attendance records (optional: `employee_id`, `date_from`, `date_to`) |
| POST | `/api/attendance/` | Mark attendance for an employee |
| GET | `/api/employees/<id>/attendance/` | View attendance for one employee (optional: `date_from`, `date_to`; includes `total_present_days`) |
| GET | `/api/attendance/<id>/` | Get a single attendance record |
| PUT | `/api/attendance/<id>/` | Update an attendance record |
| DELETE | `/api/attendance/<id>/` | Delete an attendance record |

**Mark attendance (POST /api/attendance/)**  
Body (JSON): `employee` (id), `date` (YYYY-MM-DD), `status` ("present" or "absent").

### Bonus: Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/` | Summary: total employees, total attendance records, total present days, and present days per employee |

## API Examples (cURL)

Assume the server is running at `http://127.0.0.1:8000`. Replace `<id>` with actual numeric IDs (e.g. `1`, `2`) from your responses.

### Employee Management

**List all employees**
```bash
curl -s http://127.0.0.1:8000/api/employees/
```

**Add a new employee**
```bash
curl -s -X POST http://127.0.0.1:8000/api/employees/ \
  -H "Content-Type: application/json" \
  -d '{"employee_id":"E001","full_name":"John Doe","email":"john@example.com","department":"Engineering"}'
```

**Get a single employee**
```bash
curl -s http://127.0.0.1:8000/api/employees/1/
```

**Delete an employee**
```bash
curl -s -X DELETE http://127.0.0.1:8000/api/employees/1/
```

### Attendance Management

**List all attendance records**
```bash
curl -s http://127.0.0.1:8000/api/attendance/
```

**List attendance filtered by employee and date range**
```bash
curl -s "http://127.0.0.1:8000/api/attendance/?employee_id=E001&date_from=2026-02-01&date_to=2026-02-28"
```

**Mark attendance (present)**
```bash
curl -s -X POST http://127.0.0.1:8000/api/attendance/ \
  -H "Content-Type: application/json" \
  -d '{"employee":1,"date":"2026-02-12","status":"present"}'
```

**Mark attendance (absent)**
```bash
curl -s -X POST http://127.0.0.1:8000/api/attendance/ \
  -H "Content-Type: application/json" \
  -d '{"employee":1,"date":"2026-02-13","status":"absent"}'
```

**View attendance for one employee**
```bash
curl -s http://127.0.0.1:8000/api/employees/1/attendance/
```

**View attendance for one employee with date filter**
```bash
curl -s "http://127.0.0.1:8000/api/employees/1/attendance/?date_from=2026-02-01&date_to=2026-02-28"
```

**Get a single attendance record**
```bash
curl -s http://127.0.0.1:8000/api/attendance/1/
```

**Update an attendance record**
```bash
curl -s -X PUT http://127.0.0.1:8000/api/attendance/1/ \
  -H "Content-Type: application/json" \
  -d '{"employee":1,"date":"2026-02-12","status":"absent"}'
```

**Delete an attendance record**
```bash
curl -s -X DELETE http://127.0.0.1:8000/api/attendance/1/
```

### Dashboard

**Get dashboard summary**
```bash
curl -s http://127.0.0.1:8000/api/dashboard/
```

## Validation & Error Handling

- **Required fields**: Employee ID, full name, email, and department are required; attendance requires employee, date, and status.
- **Email**: Must be a valid email format.
- **Duplicate employee**: Same `employee_id` or same `email` cannot be used for another employee.
- **Attendance**: One record per employee per date; status must be `present` or `absent`.
- Invalid requests return **400** with a JSON body like `{"success": false, "error": {...}}`.
- Not found resources return **404** with a meaningful message.
- Successful create returns **201**; successful delete returns **204**.

## Assumptions & Limitations

- Single admin user; no login or role-based access.
- Employee ID and email are unique across the system.
- One attendance record per employee per day; updating is done via PUT on the attendance record ID.
- Date format for APIs is **YYYY-MM-DD** (ISO).
- SQLite is used by default; for production, use a database such as PostgreSQL and set `DATABASES` in `hrms_lite/settings.py`.
- Leave management, payroll, and advanced HR features are not implemented.

## Bonus Features Implemented

- Filter attendance by `date_from` and `date_to` (query params on `/api/attendance/` and `/api/employees/<id>/attendance/`).
- Total present days per employee (in `/api/employees/<id>/attendance/` response and in dashboard).
- Dashboard summary at `/api/dashboard/` with counts and per-employee present days.

## License

This project is for assignment/educational use.
