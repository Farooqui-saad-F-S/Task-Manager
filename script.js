const taskInput = document.querySelector("#newtask input");
const dateInput = document.querySelector("#date");
const timeInput = document.querySelector("#time");
const catSelect = document.querySelector("#selection");
const filterButtons = document.querySelectorAll(".filter-btn");
const setPriority = document.querySelector("#priority");
const priorityButtons = document.querySelectorAll(".priority-btn");
const taskSection = document.querySelector(".tasks");
const toggleBtn = document.querySelector(".switch input");


let savedMode = localStorage.getItem("mode");

if (savedMode === "dark") {
    document.body.classList.add("dark");
    toggleBtn.checked = true;
} else {
    document.body.classList.remove("dark");
    toggleBtn.checked = false;
}

toggleBtn.addEventListener("change", function () {
    if (this.checked) {
        document.body.classList.add("dark");
        localStorage.setItem("mode", "dark");
    }
    else {
        document.body.classList.remove("dark")
        localStorage.setItem("mode", "light");
    }
})

taskInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        createTask();
    }
});
document.querySelector("#push").onclick = function () {
    createTask();
}

function buildTask(text, completed = false, dueDate, dueTime, categoryValue, prioValue) {
    let task = document.createElement('div');
    task.classList.add('task');
    let taskname = document.createElement('label');
    taskname.classList.add('taskname');

    let check_task = document.createElement('input');
    check_task.id = "check-task"
    check_task.checked = completed;
    check_task.type = "checkbox"

    let p = document.createElement('p');
    p.innerText = text;

    if (completed) {
        p.classList.add("checked");
    }

    let edit = document.createElement('div');
    edit.classList.add('edit');

    let editIcon = document.createElement('i');
    editIcon.classList.add('uil', 'uil-pen');
    edit.appendChild(editIcon);

    edit.addEventListener("click", function () {
        if (task.querySelector("input[type='text']")) return;
        let input = document.createElement('input');
        input.type = "text";
        input.value = p.innerText;

        input.focus();
        taskname.replaceChild(input, p);

        function finishEdit() {
            let newText = input.value.trim() || "Untitled";
            p.innerText = newText;
            taskname.replaceChild(p, input);
            saveTasks();
        }

        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                finishEdit();
            }
        });
        // Click outside
        input.addEventListener("blur", finishEdit);

    });

    check_task.addEventListener("click", function () {
        p.classList.toggle("checked");
        saveTasks();
        applyAllFilters();
    });

    taskname.appendChild(check_task);
    taskname.appendChild(p);

    let del = document.createElement('div');
    del.classList.add('delete');
    let i = document.createElement('i');
    i.classList.add('uil', 'uil-trash');
    del.appendChild(i);

    del.addEventListener("click", function () {
        let confirmDelete = confirm("Are you sure you want to delete this task?");
        if (confirmDelete) {
            task.remove();
            saveTasks();
        }
    });

    let dt = document.createElement("div");
    dt.classList.add('dt');

    let date = document.createElement('span');


    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = yyyy + '-' + mm + '-' + dd;
    date.innerText = dueDate || formattedToday;

    let time = document.createElement('small');
    time.innerText = dueTime || "23:59";

    if (ifOverdue(dueDate, dueTime, completed)) {
        task.classList.add("overdue")
    }

    let category = document.createElement('strong');
    category.innerText = categoryValue;
    task.dataset.category = categoryValue;
    category.classList.add("category")

    if (categoryValue === "Study") {
        category.style.color = "darkgreen";
    }
    else if (categoryValue === "Personal") {
        category.style.color = "blue";
    }
    else {
        category.style.color = "saddlebrown";
    }

    let priority = document.createElement("i");
    task.dataset.priority = prioValue;
    priority.innerText = "";
    priority.title = prioValue;

    if (prioValue === "Green") {
        priority.classList.add("lowPrio");
        priority.style.background = "green";
    }
    else if (prioValue === "Yellow") {
        priority.classList.add("mediumPrio");
        priority.style.background = "yellow";
    }
    else if (prioValue === "Red") {
        priority.classList.add("highPrio");
        priority.style.background = "rgb(228, 71, 71)";
    }
    else {
        priority.style.display = "none"
    }

    task.appendChild(priority);
    task.appendChild(taskname);
    dt.appendChild(date);
    dt.appendChild(time);
    dt.appendChild(category);
    task.appendChild(dt);
    task.appendChild(edit);
    task.appendChild(del);


    return task;
}

let currentFilter = "all";
let currentPrio = "None";

function applyAllFilters() {
    document.querySelectorAll(".task").forEach(task => {
        const taskCategory = task.dataset.category;
        const isCompleted = task.querySelector("input").checked;
        const taskPriority = task.dataset.priority;

        let categoryMatch =
            currentFilter === "all" ||
            (currentFilter === "Completed" && isCompleted) ||
            taskCategory === currentFilter;

        let priorityMatch =
            currentPrio === "None" ||
            taskPriority === currentPrio;

        if (categoryMatch && priorityMatch) {
            task.style.display = "flex";
        } else {
            task.style.display = "none";
        }
    });
}

filterButtons.forEach(btn => {
    btn.addEventListener("click", function () {
        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });
        this.classList.add("active");
        currentFilter = this.dataset.filter;
        applyAllFilters();
    })
});

priorityButtons.forEach(btn => {
    btn.addEventListener("click", function () {
        priorityButtons.forEach(btn => {
            btn.classList.remove("activated");
        });
        this.classList.add("activated");
        currentPrio = this.dataset.priority;
        applyAllFilters();
    });
});

function sortingTask() {
    let allTask = [];
    Array.from(document.querySelectorAll(".task")).forEach(task => {
        let date = task.querySelector("span").innerText;
        let time = task.querySelector("small").innerText;
        let datetime = new Date(`${date}T${time}`);
        allTask.push({ task, datetime })
    })

    allTask.sort((a, b) => {
        return a.datetime - b.datetime;
    });
    taskSection.innerHTML = "";

    allTask.forEach(item => {
        taskSection.appendChild(item.task);
    });
}

function createTask() {
    if (taskInput.value.length == 0) {
        alert("Please enter a task");
    } else {
        let taskElement = buildTask(taskInput.value, completed = false, dateInput.value, timeInput.value, catSelect.value, setPriority.value);
        taskSection.appendChild(taskElement);
        sortingTask();
        applyAllFilters();
        taskSection.offsetHeight >= 300 ?
            taskSection.classList.add("overflow") :
            taskSection.classList.remove("overflow");
    }

    taskInput.value = "";
    dateInput.value = "";
    timeInput.value = "";
    saveTasks();
}

function ifOverdue(dueDate, dueTime, completed) {
    if (!dueDate || completed) return false;
    let combinedDT = `${dueDate}T${dueTime}`;
    let due = new Date(combinedDT)
    let now = new Date()

    return now > due;
}

function saveTasks() {
    let allTask = [];
    document.querySelectorAll(".task").forEach(task => {
        let text = task.querySelector("p").innerText;
        let completed = task.querySelector("input").checked;
        let date = task.querySelector("span").innerText;
        let time = task.querySelector("small").innerText;
        let category = task.querySelector("strong").innerText;
        let prioValue = task.dataset.priority;
        allTask.push({ text, completed, date, time, category, prioValue })
    })

    localStorage.setItem("tasks", JSON.stringify(allTask));
}

function loadData() {
    let storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    storedTasks.forEach(task => {
        let taskElement = buildTask(task.text, task.completed, task.date, task.time, task.category, task.prioValue);
        taskSection.appendChild(taskElement);
    });

    taskSection.offsetHeight >= 300 ?
        taskSection.classList.add("overflow") :
        taskSection.classList.remove("overflow");
};

loadData();
applyAllFilters();