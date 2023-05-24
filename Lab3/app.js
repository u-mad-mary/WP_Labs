"use strict";

let tasks = [];

// Check if there are any tasks saved in local storage
const savedTasks = localStorage.getItem('tasks');
if (savedTasks) {
    tasks = JSON.parse(savedTasks);
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

const newTaskInput = document.getElementById('new-task');
const addTaskButton = document.getElementById('add-task');
const descriptionText = document.getElementById('description-text');
const taskList = document.getElementById('task-list');
const doneTaskList = document.getElementById('done-task-list');
const searchInput = document.getElementById('search');

function renderTasks(filteredTasks = tasks) {

    taskList.innerHTML = '';
    doneTaskList.innerHTML = '';

    // Loop through the tasks and create a new list item for each one
    for (let i = 0; i < filteredTasks.length; i++) {
        const task = filteredTasks[i];

        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        taskItem.draggable = true;

        taskItem.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', i);
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
        deleteButton.innerText = '\u2715';
        deleteButton.addEventListener('click', function() {
            deleteTask(i);
        });

        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.innerText = '\u270E';
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
            doneTaskList.appendChild(taskItem);
            doneTaskList.addEventListener('drop', function(e) {
                e.preventDefault();
                doneTaskList.classList.remove('drag-over');
                const index = e.dataTransfer.getData('text/plain');
                markTaskDone(index);
            });
        } else {
            taskList.appendChild(taskItem);
            taskList.addEventListener('drop', function(e) {
                e.preventDefault();
                taskList.classList.remove('drag-over');
                const index = e.dataTransfer.getData('text/plain');
                markTaskUndone(index);
            });
        }

        taskList.addEventListener('dragover', function(e) {
            e.preventDefault();
            taskList.classList.add('drag-over');
        });

        taskList.addEventListener('dragleave', function() {
            taskList.classList.remove('drag-over');
        });

        doneTaskList.addEventListener('dragover', function(e) {
            e.preventDefault();
            doneTaskList.classList.add('drag-over');
        });

        doneTaskList.addEventListener('dragleave', function() {
            doneTaskList.classList.remove('drag-over');
        });

    }

    saveTasks();
}

function toggleTaskDone(index) {
    tasks[index].done = !tasks[index].done;
    renderTasks();
}

function editTask(index) {
    const task = tasks[index];
    const inputs = prompt('Enter task name, task description (optional), and new deadline (optional), separated by semi-colons', `${task.text};${task.description};${task.deadline}`);
    const inputArray = inputs.split(';');

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

// Function for filtering tasks
function filterTasks() {
    const searchKeyword = searchInput.value.trim().toLowerCase();
    const filteredTasks = tasks.filter(function(task) {
        return task.text.toLowerCase().includes(searchKeyword);
    });
    renderTasks(filteredTasks);
}

searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        searchInput.value = '';
        renderTasks();
    }
});

searchInput.addEventListener('input', filterTasks);


newTaskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTaskButton.click();
    }
});

function updateImage() {
    var imageBG = document.querySelector("body"),
        file = document.querySelector("#imgUpload").files[0],
        reader = new FileReader();

    reader.onloadend = function() {
        imageBG.style.backgroundImage = "url(" + reader.result + ")";
        localStorage.setItem("backgroundImage", reader.result);
    };

    if (file) reader.readAsDataURL(file);
    else {
        imageBG.style.backgroundImage = "";
        localStorage.removeItem("backgroundImage");
    }
}

window.onload = function() {
    var savedImage = localStorage.getItem("backgroundImage");
    if (savedImage) {
        document.querySelector("body").style.backgroundImage = "url(" + savedImage + ")";
    }
};

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