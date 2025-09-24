// === LocalStorage Keys ===
const USERS_KEY = "portal_users";
const REQUESTS_KEY = "portal_requests";

document.addEventListener("DOMContentLoaded", () => {
  // Navigation
  document.querySelectorAll("nav button").forEach(btn => {
    btn.addEventListener("click", () => showSection(btn.dataset.section));
  });

  // Forms
  document.getElementById("signup-form").addEventListener("submit", handleSignup);
  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document.getElementById("student-form").addEventListener("submit", handleRequest);

  // Modal
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("feedback-form").addEventListener("submit", submitFeedback);

  // Initial
  renderStudentTable();
  renderTeacherTable();
  showSection("welcome");
});

// --- Section Navigation ---
function showSection(id) {
  document.querySelectorAll("section").forEach(sec => {
    sec.classList.remove("active");
    sec.setAttribute("aria-hidden", "true");
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
    target.setAttribute("aria-hidden", "false");
  }
}

// --- User Auth ---
function handleSignup(e) {
  e.preventDefault();
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const role = document.getElementById("signup-role").value;

  let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  if (users.some(u => u.username === username)) {
    alert("User already exists!");
    return;
  }

  users.push({ username, password, role });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  alert("Signup successful! Please login.");
  showSection("login");
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const role = document.getElementById("login-role").value;

  let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  let user = users.find(u => u.username === username && u.password === password && u.role === role);

  if (!user) {
    alert("Invalid credentials or role!");
    return;
  }

  if (role === "student") {
    showSection("student-dashboard");
  } else {
    showSection("teacher-dashboard");
    renderTeacherTable();
  }
}

// --- Student Request ---
function handleRequest(e) {
  e.preventDefault();
  const id = document.getElementById("student-id").value.trim();
  const name = document.getElementById("student-name").value.trim();
  const type = document.getElementById("request-type").value;
  const reason = document.getElementById("reason").value.trim();

  let requests = JSON.parse(localStorage.getItem(REQUESTS_KEY)) || [];
  requests.push({
    id,
    name,
    type,
    reason,
    status: "Pending",
    feedback: ""
  });

  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  alert("Request submitted!");
  renderStudentTable();
  e.target.reset();
}

function renderStudentTable() {
  const table = document.getElementById("student-table");
  if (!table) return;

  let requests = JSON.parse(localStorage.getItem(REQUESTS_KEY)) || [];
  table.innerHTML = `
    <tr><th>ID</th><th>Name</th><th>Type</th><th>Reason</th><th>Status</th><th>Feedback</th></tr>
    ${requests.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.type}</td>
        <td>${r.reason}</td>
        <td>${r.status}</td>
        <td>${r.feedback}</td>
      </tr>`).join("")}
  `;
}

// --- Teacher Dashboard ---
function renderTeacherTable() {
  const table = document.getElementById("teacher-table");
  if (!table) return;

  let requests = JSON.parse(localStorage.getItem(REQUESTS_KEY)) || [];
  table.innerHTML = `
    <tr><th>ID</th><th>Name</th><th>Type</th><th>Reason</th><th>Status</th><th>Action</th></tr>
    ${requests.map((r, i) => `
      <tr>
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.type}</td>
        <td>${r.reason}</td>
        <td>${r.status}</td>
        <td>
          <button onclick="openModal(${i})">Review</button>
        </td>
      </tr>`).join("")}
  `;
}

// --- Modal Logic ---
let currentRequestIndex = null;

function openModal(index) {
  currentRequestIndex = index;
  document.getElementById("feedback-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("feedback-modal").classList.add("hidden");
  currentRequestIndex = null;
}

function submitFeedback(e) {
  e.preventDefault();
  if (currentRequestIndex === null) return;

  let requests = JSON.parse(localStorage.getItem(REQUESTS_KEY)) || [];
  requests[currentRequestIndex].status = document.getElementById("feedback-status").value;
  requests[currentRequestIndex].feedback = document.getElementById("feedback-text").value.trim();

  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  renderTeacherTable();
  renderStudentTable();
  closeModal();
}
