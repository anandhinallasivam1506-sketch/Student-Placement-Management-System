# Student-Placement-Management-System
Student Placement Management System is a CRUD-based web application for managing student placement records. It allows users to add, view, update, delete, and search student details using HTML, CSS, JavaScript, Flask, REST API, and SQLite.

# Student Placement Management System

The Student Placement Management System is a CRUD-based full-stack web application developed as part of a Placement Cell activity.

The application helps manage student placement records in an organized and efficient way. Users can add new student details, view existing records, update information, delete records, and search for students.

## Features

- Add student placement records
- View all student records
- Update student information
- Delete student records
- Search student records
- CGPA and email validation
- Placement status management
- REST API integration
- SQLite database
- Responsive web interface
- Error handling and validation

## Technologies Used

- HTML
- CSS
- JavaScript
- Python
- Flask
- REST API
- SQLite
- Postman
- Git & GitHub

## Student Details Managed

- Student Name
- Email
- Department
- CGPA
- Skills
- Placement Status

## CRUD Operations

- **Create** – Add a new student
- **Read** – View student records
- **Update** – Edit student details
- **Delete** – Remove student records

## REST API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/students/` | Add student |
| GET | `/api/students/` | Get all students |
| GET | `/api/students/<id>` | Get a specific student |
| PUT | `/api/students/<id>` | Update student |
| DELETE | `/api/students/<id>` | Delete student |

## Database

The application uses SQLite to store student placement information. The database is automatically created when the Flask application is started.

## How to Run

1. Clone the repository.
2. Open the project folder in VS Code.
3. Install the required packages:

```bash
pip install -r requirements.txt
