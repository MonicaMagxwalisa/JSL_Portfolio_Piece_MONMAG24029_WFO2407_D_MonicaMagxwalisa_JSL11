/// utils/taskFunction.js


// Fetch tasks from localStorage
export const getTasks = () => {
  try {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error("Failed to retrieve tasks:", error);
    return [];
  }
};


// Save tasks to localStorage
export const saveTasks = (tasks) => {
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  } catch (error) {
    console.error("Failed to save tasks:", error);
  }
};


// Generate unique IDs for tasks
let taskIdCounter = Date.now();
const generateUniqueId = () => taskIdCounter++;

// Create a new task
export const createNewTask = (task) => {
  const tasks = getTasks();
  const newTask = { ...task, id: generateUniqueId() };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
};


// Update existing task properties
export const patchTask = (id, updates) => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id === id);
 
  if (taskIndex > -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    saveTasks(tasks);
    return tasks[taskIndex]; // Return the updated task
  }
 
  console.warn(`Task with ID ${id} not found.`);
  return null; // or return undefined
};

// Replace task with a fully updated object
export const putTask = (id, updatedTask) => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(task => task.id === id);
 
  if (taskIndex > -1) {
    tasks[taskIndex] = { ...updatedTask, id }; // Keep the original ID
    saveTasks(tasks);
    return tasks[taskIndex]; // Return the updated task
  }
 
  console.warn(`Task with ID ${id} not found.`);
  return null; // or return undefined
};

// Delete task
export const deleteTask,(taskId) {
  const tasks = JSON.parse(localStorage.getItem('Tasks')) || [];
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
};
 
  if (updatedTasks.length < tasks.length) {
    saveTasks(updatedTasks);
    return { deleted: true, remainingTasks: updatedTasks }; // Return deletion status
  }
 
  console.warn(`Task with ID ${id} not found.`);
  return { deleted: false, remainingTasks: tasks }; // Return status indicating no deletion
};
