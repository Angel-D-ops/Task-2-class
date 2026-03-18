// Array to store tasks (each task is now an object with text and dueDate)
let tasks = [];

// Active filter & search state
let activeFilter = 'all';
let searchQuery = '';

// DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date-input');
const priorityInput = document.getElementById('priority-input');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const filterButtons = document.querySelectorAll('.filter-btn');
const emptyMessage = document.getElementById('empty-message');
const metricTotal = document.getElementById('metric-total');
const metricOverdue = document.getElementById('metric-overdue');
const metricUpcoming = document.getElementById('metric-upcoming');
const metricNoDate = document.getElementById('metric-no-date');

const priorityRank = {
    high: 0,
    medium: 1,
    low: 2
};

const priorityLabels = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority'
};

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
function highlightMatch(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

function compareTasks(a, b) {
    const priorityDiff = (priorityRank[a.priority] ?? priorityRank.medium) - (priorityRank[b.priority] ?? priorityRank.medium);

    if (priorityDiff !== 0) {
        return priorityDiff;
    }

    if (a.dueDate && b.dueDate) {
        return new Date(`${a.dueDate}T00:00:00`) - new Date(`${b.dueDate}T00:00:00`);
    }

    if (a.dueDate) {
        return -1;
    }

    if (b.dueDate) {
        return 1;
    }

    return a.originalIndex - b.originalIndex;
}
// getFilteredTasks carries originalIndex so delete works on filtered lists
function getFilteredTasks() {
    return tasks
        .map((task, index) => ({ ...task, originalIndex: index }))
        .filter(({ text, dueDate }) => {
            const matchesSearch = text.toLowerCase().includes(searchQuery.toLowerCase());
 
            let matchesFilter = true;
            if (activeFilter === 'overdue') {
                matchesFilter = isOverdue(dueDate);
            } else if (activeFilter === 'upcoming') {
                matchesFilter = dueDate && !isOverdue(dueDate);
            } else if (activeFilter === 'no-date') {
                matchesFilter = !dueDate;
            }
 
            return matchesSearch && matchesFilter;
        })
        .sort(compareTasks);
}

function updateMetrics() {
    const overdueCount = tasks.filter(task => isOverdue(task.dueDate)).length;
    const noDateCount = tasks.filter(task => !task.dueDate).length;
    const upcomingCount = tasks.filter(task => task.dueDate && !isOverdue(task.dueDate)).length;

    metricTotal.textContent = tasks.length;
    metricOverdue.textContent = overdueCount;
    metricUpcoming.textContent = upcomingCount;
    metricNoDate.textContent = noDateCount;
}
// Function to render tasks
function renderTasks() {
    // Clear current list
    taskList.innerHTML = '';
    
    // Update task count
    
     const filtered = getFilteredTasks();
 
    if (filtered.length === 0) {
        emptyMessage.style.display = 'flex';
    } else {
        emptyMessage.style.display = 'none';
    }
 
    filtered.forEach(({ text, dueDate, priority = 'medium', originalIndex }) => {
        const li = document.createElement('li');
        const taskContent = document.createElement('div');
        const taskTitle = document.createElement('span');
        const taskMeta = document.createElement('div');
        const taskDueDate = document.createElement('span');
        const taskPriority = document.createElement('span');
        const deleteButton = document.createElement('button');
        const overdue = isOverdue(dueDate);
        const hasNoDate = !dueDate;
 
        if (overdue) li.classList.add('overdue');
        if (hasNoDate) li.classList.add('no-date');
 
        taskContent.className = 'task-content';
 
        taskTitle.className = 'task-title';
        // Use innerHTML to support <mark> highlight tags
        taskTitle.innerHTML = highlightMatch(text, searchQuery);

        taskMeta.className = 'task-meta';
 
        taskDueDate.className = 'task-due-date';
        taskDueDate.innerHTML = dueDate
            ? `<i class="ph ph-calendar-blank"></i> Due: ${formatDueDate(dueDate)}`
            : `<i class="ph ph-calendar-blank"></i> No due date`;

        taskPriority.className = `task-priority priority-${priority}`;
        taskPriority.innerHTML = `<i class="ph ph-flag-banner-fold"></i> ${priorityLabels[priority] ?? priorityLabels.medium}`;
 
        deleteButton.className = 'delete-button';
        deleteButton.title = 'Delete Task';
        deleteButton.innerHTML = '<i class="ph ph-trash"></i>';
        deleteButton.addEventListener('click', function () {
            deleteTask(originalIndex);
        });
 
        taskContent.appendChild(taskTitle);
        taskMeta.appendChild(taskPriority);
        taskMeta.appendChild(taskDueDate);
        taskContent.appendChild(taskMeta);
        li.appendChild(taskContent);
        li.appendChild(deleteButton);
        
        taskList.appendChild(li);
    });
 
    // Count reflects filtered results when searching/filtering, total otherwise
    const isFiltering = searchQuery || activeFilter !== 'all';
    if (isFiltering) {
        taskCount.textContent = `${filtered.length} of ${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
    } else {
        taskCount.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
    }

    updateMetrics();
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
        addTask(taskText, dueDate, priority);
        taskInput.value = '';
        dueDateInput.value = ''; // Clear the date input
    }
});

// Search input
searchInput.addEventListener('input', function () {
    searchQuery = this.value;
    // Show/hide clear button
    clearSearchBtn.style.display = searchQuery ? 'grid' : 'none';
    renderTasks();
});
 
// Clear search button
clearSearchBtn.addEventListener('click', function () {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    renderTasks();
});
 
// Filter buttons
filterButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeFilter = this.dataset.filter;
        renderTasks();
    });
});
 
// Initial render
renderTasks();
