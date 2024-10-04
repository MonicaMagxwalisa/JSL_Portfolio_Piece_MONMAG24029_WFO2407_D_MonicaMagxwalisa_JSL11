import { getTasks, saveTasks, createNewTask, patchTask, putTask, deleteTask } from "./utils/taskFunctions.js"
import { initialData } from "./initialData.js";

// Initialize local storage with initial data if no tasks exist
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData));
    localStorage.setItem('showSideBar', 'true');
  } else {
    console.log('Data already exists');
  }
}
initializeData();

// Get elements from the DOM
const elements = {
  sideBarDiv: document.getElementById('side-bar-div'),
  boardsNavLinksDiv: document.getElementById('boards-nav-links-div'),
  headerBoardName: document.getElementById('header-board-name'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  newTaskModalWindow: document.getElementById('new-task-modal-window'),
  titleInput: document.getElementById('title-input'),
  descInput: document.getElementById('desc-input'),
  statusSelect: document.getElementById('select-status'),
  cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
  editTaskModalWindow: document.querySelector('.edit-task-modal-window'),
  editTaskTitleInput: document.getElementById('edit-task-title-input'),
  editTaskDescInput: document.getElementById('edit-task-desc-input'),
  editStatusSelect: document.getElementById('edit-select-status'),
  saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
  cancelEditBtn: document.getElementById('cancel-edit-btn'),
  deleteEditBtn: document.getElementById('delete-task-btn'),
  columnDivs: document.querySelectorAll(".column-div"),
  switchToggle: document.getElementById('switch'),
  hideSidebarBtn: document.getElementById('hide-side-bar-btn'),
  showSidebarBtn: document.getElementById('show-side-bar-btn'),
  filterDiv: document.getElementById('filterDiv'),
  logoImage: document.getElementById('logo'),
};

let activeBoard = "";
let currentTaskId = null; // Add this to track the current task ID

// Fetch unique board names and display boards and tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];

  displayBoards(boards);

  if (boards.length > 0) {
    activeBoard = JSON.parse(localStorage.getItem("activeBoard")) || boards[0];
    elements.headerBoardName.textContent = activeBoard;
    filterAndDisplayTasksByBoard(activeBoard);
  }
}

// Display boards in the sidebar
function displayBoards(boards) {
  const boardsContainer = elements.boardsNavLinksDiv;
  boardsContainer.innerHTML = ''; // Clear existing boards

  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {setActiveBoard(board);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Set active board and filter tasks
function setActiveBoard(board) {
  activeBoard = board;
  localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
  elements.headerBoardName.textContent = activeBoard;
  filterAndDisplayTasksByBoard(activeBoard);
}

// Filter and display tasks based on the selected board
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(task => task.board === boardName);

  elements.columnDivs.forEach(column => {
    const status = column.dataset.status;
    const tasksContainer = column.querySelector('.tasks-container') || createTasksContainer(column);
    tasksContainer.innerHTML = ''; // Clear existing tasks

    const tasksForColumn = filteredTasks.filter(task => task.status === status);
    tasksForColumn.forEach(task => tasksContainer.appendChild(createTaskElement(task)));
  });
}

// Create tasks container if it doesn't exist
function createTasksContainer(column) {
  const tasksContainer = document.createElement('div');
  tasksContainer.className = 'tasks-container';
  column.appendChild(tasksContainer);
  return tasksContainer;
}

// Create an individual task element
function createTaskElement(task) {
  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.innerHTML = `<h4>${task.title}</h4>`;
  taskElement.setAttribute('data-task-id', task.id);

  taskElement.addEventListener("click", (event) => {
    event.stopPropagation();
    openEditTaskModal(task);
  });

  return taskElement;
}

// Initialize event listeners for interactive elements
function setupEventListeners() {
  elements.cancelEditBtn.addEventListener("click", closeEditModal);
  elements.cancelAddTaskBtn.addEventListener('click', closeAddTaskModal);
  elements.hideSidebarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSidebarBtn.addEventListener("click", () => toggleSidebar(true));

  elements.switchToggle.addEventListener('change', toggleTheme);
  elements.addNewTaskBtn.addEventListener('click', openNewTaskModal);
  elements.newTaskModalWindow.addEventListener('submit', addTask);
  
  // Delete task listener
  elements.deleteEditBtn.addEventListener('click', () => {
    if (currentTaskId) {
      deleteTaskHandler(currentTaskId);
    }
  });
}

// Modal functions
function closeAddTaskModal() {
  toggleModal(false, elements.newTaskModalWindow);
  resetNewTaskForm();
}

function openNewTaskModal() {
  toggleModal(true, elements.newTaskModalWindow);
}

// Toggles the visibility of modals
function toggleModal(show, modal) {
  if (modal) {
    modal.style.display = show ? 'block' : 'none';
    elements.filterDiv.style.display = show ? 'block' : 'none';
  }
}

// Reset new task form to blank
function resetNewTaskForm() {
  elements.titleInput.value = '';
  elements.descInput.value = '';
  elements.statusSelect.value = 'todo'; // Default to 'todo'
}

// Add a new task
function addTask(event) {
  event.preventDefault();

  const task = {
    id: Date.now(),
    title: elements.titleInput.value.trim(),
    description: elements.descInput.value.trim(),
    status: elements.statusSelect.value,
    board: activeBoard
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    closeAddTaskModal();
    refreshTasksUI();
  } else {
    alert("Failed to create new task!");
  }
}

// Add task to the UI
function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  const tasksContainer = column.querySelector('.tasks-container') || createTasksContainer(column);
  tasksContainer.appendChild(createTaskElement(task));
}

// Refresh UI to display current tasks
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Open modal for editing a task
function openEditTaskModal(task) {
  currentTaskId = task.id; // Track the current task ID
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editStatusSelect.value = task.status;
  elements.editTaskModalWindow.dataset.taskId = task.id; // Store taskId in modal for deletion

  toggleModal(true, elements.editTaskModalWindow);
}

// Save changes to the task
function saveTaskChanges(taskId) {
  if(currentTaskId){
  const updatedTask = {
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editStatusSelect.value,
    board: activeBoard
  };

  putTask(currentTaskId, updatedTask);
  closeEditModal();
  refreshTasksUI();
}

// Close the edit modal
function closeEditModal() {
  toggleModal(false, elements.editTaskModalWindow);
  currentTaskId = null; // Reset current task ID
}

// Delete a task handler
function deleteTaskHandler(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    deleteTask(taskId);
    const taskElement = document.querySelector(`[data-task-id='${taskId}']`);
    if (taskElement) {
      taskElement.remove();
    }
    closeEditModal();
  }
}

// Toggle sidebar visibility
function toggleSidebar(show) {
  elements.sideBarDiv.style.display = show ? 'block' : 'none';
  elements.showSidebarBtn.style.display = show ? 'none' : 'block';
  localStorage.setItem('showSideBar', show);
}

// Toggle theme between dark and light
function toggleTheme() {
  const isDarkTheme = elements.switchToggle.checked;
  document.body.classList.toggle('dark-theme', isDarkTheme);
  document.body.classList.toggle('light-theme', !isDarkTheme);
  localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  elements.logoImage.src = isDarkTheme ? './assets/logo-dark.svg' : './assets/logo-light.svg';
}

// Set initial theme upon loading
function setInitialTheme() {
  const savedTheme = localStorage.getItem('theme');
  elements.switchToggle.checked = savedTheme === 'dark';
  toggleTheme();
}

// Initialize the application on DOM content load
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setInitialSidebarVisibility();
  setInitialTheme();
  fetchAndDisplayBoardsAndTasks();
});
