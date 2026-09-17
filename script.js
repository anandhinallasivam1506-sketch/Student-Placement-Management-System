let students = [];


// Load students when the page opens
document.addEventListener("DOMContentLoaded", function () {
    loadStudents();

    document
        .getElementById("studentForm")
        .addEventListener("submit", saveStudent);
});


// Get all students from the backend
async function loadStudents() {
    try {
        const response = await fetch("/api/students/");
        const data = await response.json();

        if (data.success) {
            students = data.students;
            displayStudents(students);
        } else {
            showMessage("Unable to load students.", "error");
        }

    } catch (error) {
        console.error(error);
        showMessage("Server connection failed.", "error");
    }
}


// Display students in the table
function displayStudents(data) {

    const tableBody =
        document.getElementById("studentTableBody");

    const emptyMessage =
        document.getElementById("emptyMessage");

    const studentCount =
        document.getElementById("studentCount");

    tableBody.innerHTML = "";

    studentCount.textContent =
        `${data.length} student${data.length !== 1 ? "s" : ""}`;


    if (data.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";


    data.forEach(function (student) {

        const row = document.createElement("tr");


        let statusClass = "";

        if (student.placement_status === "Placed") {
            statusClass = "status-placed";
        }
        else if (student.placement_status === "Not Placed") {
            statusClass = "status-not-placed";
        }
        else {
            statusClass = "status-looking";
        }


        row.innerHTML = `
            <td>${student.id}</td>

            <td>${escapeHtml(student.name)}</td>

            <td>${escapeHtml(student.email)}</td>

            <td>${escapeHtml(student.department)}</td>

            <td>${student.cgpa}</td>

            <td>${escapeHtml(student.skills)}</td>

            <td>
                <span class="status ${statusClass}">
                    ${escapeHtml(student.placement_status)}
                </span>
            </td>

            <td>
                <button
                    class="action-btn edit-btn"
                    onclick="editStudent(${student.id})">
                    Edit
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteStudent(${student.id})">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// Add or update a student
async function saveStudent(event) {

    event.preventDefault();


    const studentId =
        document.getElementById("studentId").value;


    const studentData = {

        name:
            document.getElementById("name").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        department:
            document.getElementById("department").value,

        cgpa:
            document.getElementById("cgpa").value,

        skills:
            document.getElementById("skills").value.trim(),

        placement_status:
            document.getElementById("placementStatus").value
    };


    // Frontend CGPA validation
    const cgpa = Number(studentData.cgpa);

    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {

        showMessage(
            "CGPA must be between 0 and 10.",
            "error"
        );

        return;
    }


    // Decide whether this is CREATE or UPDATE
    let url;
    let method;


    if (studentId) {

        url = `/api/students/${studentId}`;
        method = "PUT";

    } else {

        url = "/api/students/";
        method = "POST";
    }


    try {

        const response = await fetch(url, {

            method: method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(studentData)
        });


        const data = await response.json();


        if (response.ok) {

            showMessage(
                data.message,
                "success"
            );

            resetForm();

            await loadStudents();

        } else {

            showMessage(
                data.message || "Operation failed.",
                "error"
            );
        }

    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to connect to the server.",
            "error"
        );
    }
}


// Edit student
function editStudent(id) {

    const student =
        students.find(function (item) {
            return item.id === id;
        });


    if (!student) {
        return;
    }


    document.getElementById("studentId").value =
        student.id;

    document.getElementById("name").value =
        student.name;

    document.getElementById("email").value =
        student.email;

    document.getElementById("department").value =
        student.department;

    document.getElementById("cgpa").value =
        student.cgpa;

    document.getElementById("skills").value =
        student.skills;

    document.getElementById("placementStatus").value =
        student.placement_status;


    document.getElementById("formTitle").textContent =
        "Edit Student";

    document.getElementById("cancelButton").style.display =
        "inline-block";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Delete student
async function deleteStudent(id) {

    const confirmed =
        confirm("Are you sure you want to delete this student?");


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `/api/students/${id}`,
            {
                method: "DELETE"
            }
        );


        const data = await response.json();


        if (response.ok) {

            showMessage(
                data.message,
                "success"
            );

            await loadStudents();

        } else {

            showMessage(
                data.message || "Delete failed.",
                "error"
            );
        }

    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to delete student.",
            "error"
        );
    }
}


// Reset the form
function resetForm() {

    document.getElementById("studentForm").reset();

    document.getElementById("studentId").value = "";

    document.getElementById("formTitle").textContent =
        "Add Student";

    document.getElementById("cancelButton").style.display =
        "none";
}


// Search students
function searchStudents() {

    const search =
        document.getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();


    const filteredStudents =
        students.filter(function (student) {

            return (

                student.name
                    .toLowerCase()
                    .includes(search)

                ||

                student.email
                    .toLowerCase()
                    .includes(search)

                ||

                student.department
                    .toLowerCase()
                    .includes(search)

                ||

                student.skills
                    .toLowerCase()
                    .includes(search)

                ||

                student.placement_status
                    .toLowerCase()
                    .includes(search)
            );
        });


    displayStudents(filteredStudents);
}


// Show success/error message
function showMessage(message, type) {

    const messageBox =
        document.getElementById("message");


    messageBox.textContent = message;

    messageBox.className = type;


    setTimeout(function () {

        messageBox.textContent = "";

        messageBox.className = "";

    }, 3000);
}


// Prevent HTML injection in displayed data
function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}