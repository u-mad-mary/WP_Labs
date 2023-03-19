"use strict";

let tasks = [];
let doneTasks = [];

// Check if there are any tasks saved in local storage
const savedTasks = localStorage.getItem('tasks');
if (savedTasks) {
    tasks = JSON.parse(savedTasks);
}

// Function to save the tasks to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

const newTaskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task');
const descriptionText = document.getElementById('description-text');
const taskList = document.getElementById('task-list');
const doneTaskList = document.getElementById('done-task-list');

function renderTasks() {

    taskList.innerHTML = '';
    doneTaskList.innerHTML = '';

    // Loop through the tasks and create a new list item for each one
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];

        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        taskItem.setAttribute('draggable', 'true');

        // Add dragstart event listener to task item
        taskItem.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', i); // Save the task index as data
        });

        const taskText = document.createElement('div');
        taskText.classList.add('task-text');
        taskText.innerText = task.text;

        const descriptionText = document.createElement('div');
        descriptionText.classList.add('new-description');
        descriptionText.innerText = task.description ? task.description : '';

        const deadlineText = document.createElement('div');
        deadlineText.classList.add('deadline-text');
        deadlineText.innerText = task.deadline ? task.deadline : '';

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerText = 'x';
        deleteButton.addEventListener('click', function() {
            deleteTask(i);
        });

        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.innerText = 'Edit';
        editButton.addEventListener('click', function() {
            editTask(i);
        });

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.done;
        checkbox.addEventListener('change', function() {
            toggleTaskDone(i);
        });

        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);
        taskItem.appendChild(descriptionText);
        taskItem.appendChild(deadlineText);
        taskItem.appendChild(editButton);
        taskItem.appendChild(deleteButton);

        if (task.done) {
            taskItem.classList.add('done');

            doneTaskList.addEventListener('dragover', function(e) {
                e.preventDefault();
                doneTaskList.classList.add('drag-over');
            });

            doneTaskList.addEventListener('dragleave', function() {
                doneTaskList.classList.remove('drag-over');
            });

            doneTaskList.addEventListener('drop', function(e) {
                e.preventDefault();
                doneTaskList.classList.remove('drag-over');
                const index = e.dataTransfer.getData('text/plain');
                markTaskDone(index);
            });

            doneTaskList.appendChild(taskItem);
        } else {
            taskList.appendChild(taskItem);

            taskList.addEventListener('dragover', function(e) {
                e.preventDefault();
                taskList.classList.add('drag-over');
            });

            taskList.addEventListener('dragleave', function() {
                taskList.classList.remove('drag-over');
            });

            taskList.addEventListener('drop', function(e) {
                e.preventDefault();
                taskList.classList.remove('drag-over');
                const index = e.dataTransfer.getData('text/plain');
                markTaskUndone(index);
            });

            taskList.appendChild(taskItem);
        }

    }

    saveTasks();
}

function toggleTaskDone(index) {
    tasks[index].done = !tasks[index].done;
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

function editTask(index) {
    const task = tasks[index];
    const inputs = prompt('Enter task name, task description (optional), and new deadline (optional), separated by commas', `${task.text},${task.description},${task.deadline}`);
    const inputArray = inputs.split(',');

    const newTask = inputArray[0];
    const newDescription = inputArray[1];
    const newDeadline = inputArray[2];

    if (newTask !== null && newTask !== '') {
        task.text = newTask;
        task.description = newDescription;
        task.deadline = newDeadline;
        renderTasks();
    }
}

function markTaskDone(index) {
    tasks[index].done = true;
    renderTasks();
}

function markTaskUndone(index) {
    tasks[index].done = false;
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

// Event listener to handle adding tasks
addTaskButton.addEventListener('click', function() {
    const newTask = newTaskInput.value;
    const newDeadline = document.getElementById('new-deadline').value;
    const newDescription = document.getElementById('description-text').value;

    if (newTask !== '') {
        tasks.push({ text: newTask, deadline: newDeadline, description: newDescription, done: false });
        newTaskInput.value = '';
        document.getElementById('new-deadline').value = '';
        document.getElementById('description-text').value = '';
        renderTasks();
    }
});

newTaskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTaskButton.click();
    }
});

// Function to check for tasks every 30 minutes and send notifications
function checkTasks() {
    const interval = setInterval(() => {
        // Check if there are any tasks in the to-do list
        const hasTasks = tasks.some(task => !task.done);

        if (hasTasks) {
            const notification = new Notification('To-Do List', {
                body: 'You have tasks to complete!',
            });
        }
    }, 30 * 60 * 1000); // 30 minutes in milliseconds

    return interval;
}

if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {

            const interval = checkTasks(); // Start checking for tasks every 30 minutes

            window.addEventListener('beforeunload', (e) => {
                e.clearInterval(interval);
            });
        }
    });
}

renderTasks();