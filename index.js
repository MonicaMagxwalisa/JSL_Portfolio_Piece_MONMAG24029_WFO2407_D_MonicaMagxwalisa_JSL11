import { getTasks, createNewTask, patchTask, putTask, deleteTask } from "./utils/taskFunctions.js";
import { initialData } from "./initialData.js";


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() { 
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists');
  }
}
 initializeData();

// TASK: Got elements from the DOM
const elements = {
  sideBarDiv: document.getElementById('side-bar-div'),
  boardsNavLinksDiv: document.getElementById('boards-nav-links-div'),
  headerBoardName: document.getElementById('header-board-name'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  newTaskModalWindow: document.getElementById('new-task-modal-window'),
  titleInput: document.getElementById('title-input'),
  descInput: document.getElementById('desc-input'),
  statusSelect: document.getElementById('select-status'),
  createTaskBtn: document.getElementById('create-task-btn'),
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

// Extracts unique board names and display boards and tasks
// TASK: FIX BUGS
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
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = elements.boardsNavLinksDiv;
  boardsContainer.innerHTML = ''; // Clear existing boards

  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      setActiveBoard(board);
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Set active board and filter tasks
// TASK: Fix Bugs
function setActiveBoard(board) {
  activeBoard = board;
  localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
  elements.headerBoardName.textContent = activeBoard;
  filterAndDisplayTasksByBoard(activeBoard);
}

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status = status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.click() => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').foreach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.add('active') 
    }
    else {
      btn.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.click() => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.click() => toggleSidebar(false));
  elements.showSideBarBtn.click() => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' => 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
 
}

function toggleTheme() {
 
}


// Open modal for editing a task
  function openEditTaskModal(task) { // Set task details in modal inputs
    elements.editTaskTitleInput.value = task.title;
    elements.editTaskDescInput.value = task.description;
    elements.editStatusSelect.value = task.status;
    elements.editTaskModalWindow.dataset.taskId = task.id; // Store taskId in modal for deletion
   
    elements.saveTaskChangesBtn.onclick = () => saveTaskChanges(task.id);
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

f/ Save changes to the task
function saveTaskChanges(taskId) {
  const updatedTask = {
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editStatusSelect.value,
    board: activeBoard
  };


  putTask(taskId, updatedTask);
  closeEditModal();
  refreshTasksUI();


/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}