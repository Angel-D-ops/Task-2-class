// Array to store tasks (each task is now an object with text and dueDate)
let tasks = [];

// DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date-input');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');

// Helper function to format date nicely
function formatDueDate(dueDate) {
    if (!dueDate) {
        return '';
    }
    
    // Convert YYYY-MM-DD to a readable format
    const formattedDate = new Date(`${dueDate}T00:00:00`);
    
    return formattedDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Helper function to check if a task is overdue
function isOverdue(dueDate) {
    if (!dueDate) {
        return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(`${dueDate}T00:00:00`);
    return taskDate < today;
}

// Function to render tasks
function renderTasks() {
    // Clear current list
    taskList.innerHTML = '';
    
    // Add each task to the list
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        
        // Check if task is overdue
        const overdue = isOverdue(task.dueDate);
        if (overdue) {
            li.classList.add('overdue');
        }
        
        // Create task content container
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        // Create task title
        const taskTitle = document.createElement('span');
        taskTitle.className = 'task-title';
        taskTitle.textContent = task.text;
        
        // Create due date display
        const taskDueDate = document.createElement('span');
        taskDueDate.className = 'task-due-date';
        
        if (task.dueDate) {
            taskDueDate.textContent = `Due: ${formatDueDate(task.dueDate)}`;
            if (overdue) {
                taskDueDate.textContent += ' (Overdue!)';
            }
        } else {
            taskDueDate.textContent = 'No due date';
        }
        
        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
            deleteTask(index);
        });
        
        // Assemble the task item
        taskContent.appendChild(taskTitle);
        taskContent.appendChild(taskDueDate);
        li.appendChild(taskContent);
        li.appendChild(deleteButton);
        
        taskList.appendChild(li);
    });
    
    // Update task count
    taskCount.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
}

// Function to add a task (now accepts due date)
function addTask(taskText, dueDate) {
    if (taskText) {
        tasks.push({
            text: taskText,
            dueDate: dueDate || null  // Store due date or null if not provided
        });
        renderTasks();
    }
}

// Function to delete a task
window.deleteTask = function(index) {
    tasks.splice(index, 1);
    renderTasks();
};

// Handle form submission
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value; // Get the selected due date
    
    if (taskText) {
        addTask(taskText, dueDate);
        taskInput.value = '';
        dueDateInput.value = ''; // Clear the date input
    }
});

// Initial render
renderTasks();