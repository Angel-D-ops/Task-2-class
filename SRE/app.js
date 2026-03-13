// Array to store tasks
let tasks = [];

// DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date-input');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');

function formatDueDate(dueDate) {
    if (!dueDate) {
        return '';
    }

    const formattedDate = new Date(`${dueDate}T00:00:00`);

    return formattedDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function isOverdue(dueDate) {
    if (!dueDate) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return new Date(`${dueDate}T00:00:00`) < today;
}

// Function to render tasks
function renderTasks() {
    // Clear current list
    taskList.innerHTML = '';
    
    // Add each task to the list
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        const taskContent = document.createElement('div');
        const taskTitle = document.createElement('span');
        const taskDueDate = document.createElement('span');
        const deleteButton = document.createElement('button');
        const overdue = isOverdue(task.dueDate);

        if (overdue) {
            li.classList.add('overdue');
        }

        taskContent.className = 'task-content';
        taskTitle.className = 'task-title';
        taskTitle.textContent = task.text;

        taskDueDate.className = 'task-due-date';
        taskDueDate.textContent = task.dueDate
            ? `Due: ${formatDueDate(task.dueDate)}`
            : 'No due date';

        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
            deleteTask(index);
        });

        taskContent.appendChild(taskTitle);
        taskContent.appendChild(taskDueDate);
        li.appendChild(taskContent);
        li.appendChild(deleteButton);
        taskList.appendChild(li);
    });
    
    // Update task count
    taskCount.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
}

// Function to add a task
function addTask(taskText, dueDate) {
    if (taskText) {
        tasks.push({
            text: taskText,
            dueDate
        });
        renderTasks();
    }
}

// Function to delete a task (make it global so onclick works)
window.deleteTask = function(index) {
    tasks.splice(index, 1);
    renderTasks();
};

// Handle form submission
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    
    if (taskText) {
        addTask(taskText, dueDate);
        taskInput.value = '';
        dueDateInput.value = '';
    }
});

// Initial render
renderTasks();