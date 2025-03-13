// Task data structure
let tasks = [];
let currentUser = null;
let currentCategory = "today";
let searchQuery = "";
let viewMode = "grid";
let token = null;

// DOM Elements
document.addEventListener("DOMContentLoaded", function() {
  // Check if user is logged in
  token = localStorage.getItem("token");
  if (!token) {
    // Redirect to login page if not logged in
    window.location.href = "signin.html";
    return;
  }
  
  // Initialize the application
  initApp();
  
  // Event Listeners
  setupEventListeners();
});

// Initialize the application
async function initApp() {
  try {
    // Load user data from API
    await loadUserData();
    
    // Load tasks from API
    await loadTasks();
    
    // Set up dark mode
    initDarkMode();
  } catch (error) {
    console.error("Error initializing app:", error);
    alert("Failed to load data. Please try again or log in again.");
  }
}

// Load user data from API
async function loadUserData() {
  try {
    // First try to get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      currentUser = JSON.parse(storedUser);
      
      // Update UI with user data
      document.getElementById("userName").textContent = currentUser.name;
      document.getElementById("userEmail").textContent = currentUser.email;
      document.getElementById("userPhone").textContent = currentUser.phone || "No phone number";
      document.getElementById("userImage").src = "https://via.placeholder.com/100"; // Default image
      
      return;
    }
    
    // If not in localStorage, fetch from API
    const response = await fetch("http://localhost:5000/user", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // If token is invalid or expired, redirect to login
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "signin.html";
        return;
      }
      throw new Error("Failed to fetch user data");
    }
    
    currentUser = await response.json();
    
    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify(currentUser));
    
    // Update UI with user data
    document.getElementById("userName").textContent = currentUser.name;
    document.getElementById("userEmail").textContent = currentUser.email;
    document.getElementById("userPhone").textContent = currentUser.phone || "No phone number";
    document.getElementById("userImage").src = "https://via.placeholder.com/100"; // Default image
  } catch (error) {
    console.error("Error loading user data:", error);
    throw error;
  }
}

// Load tasks from API
async function loadTasks() {
  try {
    const response = await fetch("http://localhost:5000/tasks", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // If token is invalid or expired, redirect to login
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "signin.html";
        return;
      }
      throw new Error("Failed to fetch tasks");
    }
    
    tasks = await response.json();
    
    // Transform tasks to match our frontend structure
    tasks = tasks.map(task => ({
      id: task.id.toString(),
      title: task.title,
      description: task.description || "",
      dueDate: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      isCompleted: task.status === "completed",
      isImportant: task.category === "important",
      category: task.category
    }));
    
    // Update UI
    updateTasksUI();
  } catch (error) {
    console.error("Error loading tasks:", error);
    throw error;
  }
}

// Set up event listeners
function setupEventListeners() {
  // Category navigation
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", function(e) {
      e.preventDefault();
      const category = this.getAttribute("data-category");
      changeCategory(category);
    });
  });
  
  // Search input
  document.getElementById("searchInput").addEventListener("input", function() {
    searchQuery = this.value.trim().toLowerCase();
    updateTasksUI();
  });
  
  // View toggle
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const view = this.getAttribute("data-view");
      changeViewMode(view);
    });
  });
  
  // Add task button
  document.getElementById("addTaskBtn").addEventListener("click", function() {
    openAddTaskModal();
  });
  
  // Task form submission
  document.getElementById("taskForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const taskId = document.getElementById("taskId").value;
    
    if (taskId) {
      await updateTask(taskId);
    } else {
      await addNewTask();
    }
    
    closeModal("taskModal");
  });
  
  // Modal close buttons
  document.querySelectorAll(".close-modal, .cancel-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const modal = this.closest(".modal");
      closeModal(modal.id);
    });
  });
  
  // Delete confirmation
  document.querySelector("#deleteModal .delete-btn").addEventListener("click", async function() {
    const taskId = this.getAttribute("data-task-id");
    await deleteTask(taskId);
    closeModal("deleteModal");
  });
  
  // Dark mode toggle
  document.getElementById("darkModeToggle").addEventListener("change", function() {
    toggleDarkMode(this.checked);
  });
  
  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", function() {
    logout();
  });
}

// Change current category
function changeCategory(category) {
  currentCategory = category;
  
  // Update active class
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
    if (item.getAttribute("data-category") === category) {
      item.classList.add("active");
    }
  });
  
  // Update category title
  document.getElementById("currentCategory").textContent = getCategoryTitle(category);
  
  // Update tasks
  updateTasksUI();
}

// Get category title
function getCategoryTitle(category) {
  switch (category) {
    case "today": return "Today's Tasks";
    case "all": return "All Tasks";
    case "important": return "Important Tasks";
    case "completed": return "Completed Tasks";
    case "uncompleted": return "Uncompleted Tasks";
    default: return "Tasks";
  }
}

// Change view mode
function changeViewMode(mode) {
  viewMode = mode;
  
  // Update active class
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-view") === mode) {
      btn.classList.add("active");
    }
  });
  
  // Update tasks UI
  updateTasksUI();
}

// Update tasks UI
function updateTasksUI() {
  const tasksGrid = document.getElementById("tasksGrid");
  tasksGrid.innerHTML = "";
  
  // Filter tasks
  const filteredTasks = filterTasks();
  
  // Update task counts
  updateTaskCounts();
  
  // Update progress bar
  updateProgressBar();
  
  // Display tasks
  if (filteredTasks.length === 0) {
    tasksGrid.innerHTML = `
      <div class="empty-state">
        <p>No tasks found. Add a new task to get started.</p>
      </div>
    `;
  } else {
    filteredTasks.forEach(task => {
      tasksGrid.appendChild(createTaskElement(task));
    });
  }
  
  // Apply view mode class
  tasksGrid.className = viewMode === "grid" ? "tasks-grid" : "tasks-list";
}

// Filter tasks based on current category and search query
function filterTasks() {
  return tasks.filter(task => {
    // Filter by category
    if (currentCategory === "today") {
      const today = new Date().toISOString().split("T")[0];
      if (task.dueDate !== today) return false;
    } else if (currentCategory === "important") {
      if (!task.isImportant) return false;
    } else if (currentCategory === "completed") {
      if (!task.isCompleted) return false;
    } else if (currentCategory === "uncompleted") {
      if (task.isCompleted) return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(query) || 
             task.description.toLowerCase().includes(query);
    }
    
    return true;
  });
}

// Create task element
function createTaskElement(task) {
  const taskElement = document.createElement("div");
  taskElement.className = "task-card";
  taskElement.setAttribute("data-id", task.id);
  
  if (viewMode === "grid") {
    // Grid view
    taskElement.innerHTML = `
      <div class="task-header">
        <h3 class="task-title ${task.isCompleted ? 'completed' : ''}">${task.title}</h3>
        <div class="task-actions">
          <button class="task-menu-btn">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div class="task-menu">
            <div class="task-menu-item task-toggle-important">
              <i class="fas ${task.isImportant ? 'fa-star' : 'fa-star-o'}"></i>
              ${task.isImportant ? 'Remove Important' : 'Mark as Important'}
            </div>
            <div class="task-menu-item task-toggle-complete">
              <i class="fas ${task.isCompleted ? 'fa-check-circle' : 'fa-circle-o'}"></i>
              ${task.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
            </div>
            <div class="task-menu-item task-edit">
              <i class="fas fa-edit"></i>
              Edit
            </div>
            <div class="task-menu-item task-delete">
              <i class="fas fa-trash"></i>
              Delete
            </div>
          </div>
        </div>
      </div>
      <p class="task-description">${task.description || 'No description'}</p>
      <div class="task-meta">
        <div class="task-date">
          <i class="fas fa-calendar"></i>
          ${formatDate(task.dueDate)}
        </div>
        <div class="task-status ${task.isCompleted ? 'status-completed' : 'status-uncompleted'}">
          ${task.isCompleted ? 'Completed' : 'Pending'}
        </div>
      </div>
    `;
  } else {
    // List view
    taskElement.innerHTML = `
      <div class="task-list-item">
        <div class="task-list-checkbox">
          <input type="checkbox" ${task.isCompleted ? 'checked' : ''}>
        </div>
        <div class="task-list-content">
          <h3 class="task-title ${task.isCompleted ? 'completed' : ''}">${task.title}</h3>
          <p class="task-description">${task.description || 'No description'}</p>
        </div>
        <div class="task-list-meta">
          <div class="task-date">
            <i class="fas fa-calendar"></i>
            ${formatDate(task.dueDate)}
          </div>
          <div class="task-status ${task.isCompleted ? 'status-completed' : 'status-uncompleted'}">
            ${task.isCompleted ? 'Completed' : 'Pending'}
          </div>
        </div>
        <div class="task-list-actions">
          <button class="task-important-btn ${task.isImportant ? 'active' : ''}">
            <i class="fas fa-star"></i>
          </button>
          <button class="task-menu-btn">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div class="task-menu">
            <div class="task-menu-item task-edit">
              <i class="fas fa-edit"></i>
              Edit
            </div>
            <div class="task-menu-item task-delete">
              <i class="fas fa-trash"></i>
              Delete
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Add event listeners
  addTaskEventListeners(taskElement, task);
  
  return taskElement;
}

// Add event listeners to task element
function addTaskEventListeners(taskElement, task) {
  // Toggle task menu
  const menuBtn = taskElement.querySelector(".task-menu-btn");
  const menu = taskElement.querySelector(".task-menu");
  
  menuBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    menu.classList.toggle("show");
  });
  
  // Close menu when clicking outside
  document.addEventListener("click", function() {
    menu.classList.remove("show");
  });
  
  // Edit task
  const editBtn = taskElement.querySelector(".task-edit");
  editBtn.addEventListener("click", function() {
    openEditTaskModal(task);
  });
  
  // Delete task
  const deleteBtn = taskElement.querySelector(".task-delete");
  deleteBtn.addEventListener("click", function() {
    openDeleteConfirmation(task);
  });
  
  // Toggle important
  const importantBtn = taskElement.querySelector(".task-toggle-important");
  if (importantBtn) {
    importantBtn.addEventListener("click", function() {
      toggleTaskImportant(task.id);
    });
  }
  
  // Toggle complete
  const completeBtn = taskElement.querySelector(".task-toggle-complete");
  if (completeBtn) {
    completeBtn.addEventListener("click", function() {
      toggleTaskComplete(task.id);
    });
  }
  
  // List view specific event listeners
  if (viewMode === "list") {
    const checkbox = taskElement.querySelector("input[type='checkbox']");
    if (checkbox) {
      checkbox.addEventListener("change", function() {
        toggleTaskComplete(task.id);
      });
    }
    
    const starBtn = taskElement.querySelector(".task-important-btn");
    if (starBtn) {
      starBtn.addEventListener("click", function() {
        toggleTaskImportant(task.id);
      });
    }
  }
}

// Open add task modal
function openAddTaskModal() {
  const modal = document.getElementById("taskModal");
  const form = document.getElementById("taskForm");
  const modalTitle = document.getElementById("modalTitle");
  
  // Reset form
  form.reset();
  document.getElementById("taskId").value = "";
  document.getElementById("taskDueDate").value = new Date().toISOString().split("T")[0];
  
  // Set modal title
  modalTitle.textContent = "Add New Task";
  
  // Show modal
  modal.classList.add("show");
}

// Open edit task modal
function openEditTaskModal(task) {
  const modal = document.getElementById("taskModal");
  const form = document.getElementById("taskForm");
  const modalTitle = document.getElementById("modalTitle");
  
  // Fill form with task data
  document.getElementById("taskId").value = task.id;
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDescription").value = task.description || "";
  document.getElementById("taskDueDate").value = task.dueDate;
  document.getElementById("taskCategory").value = task.category;
  document.getElementById("taskImportant").checked = task.isImportant;
  
  // Set modal title
  modalTitle.textContent = "Edit Task";
  
  // Show modal
  modal.classList.add("show");
}

// Open delete confirmation
function openDeleteConfirmation(task) {
  const modal = document.getElementById("deleteModal");
  const deleteBtn = modal.querySelector(".delete-btn");
  
  // Set task ID for delete button
  deleteBtn.setAttribute("data-task-id", task.id);
  
  // Show modal
  modal.classList.add("show");
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("show");
}

// Add new task
async function addNewTask() {
  try {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const dueDate = document.getElementById("taskDueDate").value;
    const category = document.getElementById("taskCategory").value;
    const isImportant = document.getElementById("taskImportant").checked;
    
    // Prepare task data for API
    const taskData = {
      title,
      description,
      due_date: dueDate,
      category: isImportant ? "important" : category,
      status: "uncompleted"
    };
    
    // Send to API
    const response = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
      throw new Error("Failed to create task");
    }
    
    const newTask = await response.json();
    
    // Add to tasks array with frontend structure
    tasks.push({
      id: newTask.id.toString(),
      title: newTask.title,
      description: newTask.description || "",
      dueDate: newTask.due_date ? new Date(newTask.due_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      isCompleted: newTask.status === "completed",
      isImportant: newTask.category === "important",
      category: newTask.category
    });
    
    // Update UI
    updateTasksUI();
  } catch (error) {
    console.error("Error adding task:", error);
    alert("Failed to add task. Please try again.");
  }
}

// Update task
async function updateTask(taskId) {
  try {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const dueDate = document.getElementById("taskDueDate").value;
    const category = document.getElementById("taskCategory").value;
    const isImportant = document.getElementById("taskImportant").checked;
    
    // Find task in array
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }
    
    // Prepare task data for API
    const taskData = {
      title,
      description,
      due_date: dueDate,
      category: isImportant ? "important" : category,
      status: tasks[taskIndex].isCompleted ? "completed" : "uncompleted"
    };
    
    // Send to API
    const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });
    
    if (!response.ok) {
      throw new Error("Failed to update task");
    }
    
    const updatedTask = await response.json();
    
    // Update task in array
    tasks[taskIndex] = {
      id: updatedTask.id.toString(),
      title: updatedTask.title,
      description: updatedTask.description || "",
      dueDate: updatedTask.due_date ? new Date(updatedTask.due_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      isCompleted: updatedTask.status === "completed",
      isImportant: updatedTask.category === "important",
      category: updatedTask.category
    };
    
    // Update UI
    updateTasksUI();
  } catch (error) {
    console.error("Error updating task:", error);
    alert("Failed to update task. Please try again.");
  }
}

// Delete task
async function deleteTask(taskId) {
  try {
    // Send to API
    const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
    
    // Remove task from array
    tasks = tasks.filter(task => task.id !== taskId);
    
    // Update UI
    updateTasksUI();
  } catch (error) {
    console.error("Error deleting task:", error);
    alert("Failed to delete task. Please try again.");
  }
}

// Toggle task important status
async function toggleTaskImportant(taskId) {
  try {
    // Find task index
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      // Toggle important status
      const isImportant = !tasks[taskIndex].isImportant;
      
      // Prepare task data for API
      const taskData = {
        title: tasks[taskIndex].title,
        description: tasks[taskIndex].description,
        due_date: tasks[taskIndex].dueDate,
        category: isImportant ? "important" : "all",
        status: tasks[taskIndex].isCompleted ? "completed" : "uncompleted"
      };
      
      // Send to API
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      
      // Update task in array
      tasks[taskIndex].isImportant = isImportant;
      tasks[taskIndex].category = isImportant ? "important" : "all";
      
      // Update UI
      updateTasksUI();
    }
  } catch (error) {
    console.error("Error updating task:", error);
    alert("Failed to update task. Please try again.");
  }
}

// Toggle task complete status
async function toggleTaskComplete(taskId) {
  try {
    // Find task index
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      // Toggle complete status
      const isCompleted = !tasks[taskIndex].isCompleted;
      
      // Prepare task data for API
      const taskData = {
        title: tasks[taskIndex].title,
        description: tasks[taskIndex].description,
        due_date: tasks[taskIndex].dueDate,
        category: tasks[taskIndex].category,
        status: isCompleted ? "completed" : "uncompleted"
      };
      
      // Send to API
      const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      
      // Update task in array
      tasks[taskIndex].isCompleted = isCompleted;
      
      // Update UI
      updateTasksUI();
    }
  } catch (error) {
    console.error("Error updating task:", error);
    alert("Failed to update task. Please try again.");
  }
}

// Update task counts
function updateTaskCounts() {
  const today = new Date().toISOString().split("T")[0];
  
  // Calculate counts
  const counts = {
    all: tasks.length,
    today: tasks.filter(task => task.dueDate === today).length,
    important: tasks.filter(task => task.isImportant).length,
    completed: tasks.filter(task => task.isCompleted).length,
    uncompleted: tasks.filter(task => !task.isCompleted).length
  };
  
  // Update UI
  document.getElementById("allCount").textContent = counts.all;
  document.getElementById("todayCount").textContent = counts.today;
  document.getElementById("importantCount").textContent = counts.important;
  document.getElementById("completedCount").textContent = counts.completed;
  document.getElementById("uncompletedCount").textContent = counts.uncompleted;
}

// Update progress bar
function updateProgressBar() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  
  let progressPercent = 0;
  if (totalTasks > 0) {
    progressPercent = Math.round((completedTasks / totalTasks) * 100);
  }
  
  // Update UI
  const progressBar = document.getElementById("taskProgress");
  progressBar.style.width = `${progressPercent}%`;
  document.querySelector(".progress-text").textContent = `${progressPercent}% Completed`;
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Initialize dark mode
function initDarkMode() {
  // Check for saved preference
  const darkMode = localStorage.getItem("darkMode") === "true";
  
  // Set initial state
  document.getElementById("darkModeToggle").checked = darkMode;
  toggleDarkMode(darkMode);
}

// Toggle dark mode
function toggleDarkMode(enabled) {
  if (enabled) {
    document.body.setAttribute("data-theme", "dark");
  } else {
    document.body.removeAttribute("data-theme");
  }
  
  // Save preference
  localStorage.setItem("darkMode", enabled);
}

// Logout function
function logout() {
  // Clear token and redirect to login page
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "signin.html";
}
