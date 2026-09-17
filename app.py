from flask import Flask, request, jsonify, render_template
import sqlite3
import re

app = Flask(__name__)

DATABASE = "students.db"


def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            department TEXT NOT NULL,
            cgpa REAL NOT NULL,
            skills TEXT NOT NULL,
            placement_status TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


def validate_student(data):
    required_fields = [
        "name",
        "email",
        "department",
        "cgpa",
        "skills",
        "placement_status"
    ]

    for field in required_fields:
        if field not in data or str(data[field]).strip() == "":
            return f"{field.replace('_', ' ').title()} is required."

    email = str(data["email"]).strip()

    email_pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"

    if not re.match(email_pattern, email):
        return "Please enter a valid email address."

    try:
        cgpa = float(data["cgpa"])
    except (ValueError, TypeError):
        return "CGPA must be a number."

    if cgpa < 0 or cgpa > 10:
        return "CGPA must be between 0 and 10."

    valid_statuses = [
        "Not Placed",
        "Placed",
        "Looking for Opportunities"
    ]

    if data["placement_status"] not in valid_statuses:
        return "Invalid placement status."

    return None


@app.route("/")
def home():
    return render_template("index.html")


# CREATE
@app.route("/api/students/", methods=["POST"])
def create_student():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required."
        }), 400

    validation_error = validate_student(data)

    if validation_error:
        return jsonify({
            "success": False,
            "message": validation_error
        }), 400

    connection = get_db_connection()

    try:
        cursor = connection.execute("""
            INSERT INTO students
            (name, email, department, cgpa, skills, placement_status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data["name"].strip(),
            data["email"].strip(),
            data["department"].strip(),
            float(data["cgpa"]),
            data["skills"].strip(),
            data["placement_status"]
        ))

        connection.commit()

        student_id = cursor.lastrowid

        student = connection.execute(
            "SELECT * FROM students WHERE id = ?",
            (student_id,)
        ).fetchone()

        return jsonify({
            "success": True,
            "message": "Student added successfully.",
            "student": dict(student)
        }), 201

    except sqlite3.IntegrityError:
        return jsonify({
            "success": False,
            "message": "Email already exists."
        }), 409

    finally:
        connection.close()


# READ ALL
@app.route("/api/students/", methods=["GET"])
def get_students():

    connection = get_db_connection()

    students = connection.execute("""
        SELECT * FROM students
        ORDER BY id DESC
    """).fetchall()

    connection.close()

    return jsonify({
        "success": True,
        "students": [dict(student) for student in students]
    })


# READ ONE
@app.route("/api/students/<int:student_id>", methods=["GET"])
def get_student(student_id):

    connection = get_db_connection()

    student = connection.execute(
        "SELECT * FROM students WHERE id = ?",
        (student_id,)
    ).fetchone()

    connection.close()

    if student is None:
        return jsonify({
            "success": False,
            "message": "Student not found."
        }), 404

    return jsonify({
        "success": True,
        "student": dict(student)
    })


# UPDATE
@app.route("/api/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required."
        }), 400

    validation_error = validate_student(data)

    if validation_error:
        return jsonify({
            "success": False,
            "message": validation_error
        }), 400

    connection = get_db_connection()

    existing_student = connection.execute(
        "SELECT * FROM students WHERE id = ?",
        (student_id,)
    ).fetchone()

    if existing_student is None:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Student not found."
        }), 404

    try:
        connection.execute("""
            UPDATE students
            SET name = ?,
                email = ?,
                department = ?,
                cgpa = ?,
                skills = ?,
                placement_status = ?
            WHERE id = ?
        """, (
            data["name"].strip(),
            data["email"].strip(),
            data["department"].strip(),
            float(data["cgpa"]),
            data["skills"].strip(),
            data["placement_status"],
            student_id
        ))

        connection.commit()

        updated_student = connection.execute(
            "SELECT * FROM students WHERE id = ?",
            (student_id,)
        ).fetchone()

        return jsonify({
            "success": True,
            "message": "Student updated successfully.",
            "student": dict(updated_student)
        })

    except sqlite3.IntegrityError:
        return jsonify({
            "success": False,
            "message": "Email already exists."
        }), 409

    finally:
        connection.close()


# DELETE
@app.route("/api/students/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):

    connection = get_db_connection()

    student = connection.execute(
        "SELECT * FROM students WHERE id = ?",
        (student_id,)
    ).fetchone()

    if student is None:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Student not found."
        }), 404

    connection.execute(
        "DELETE FROM students WHERE id = ?",
        (student_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Student deleted successfully."
    })


if __name__ == "__main__":
    initialize_database()

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )