const taskInput = document.querySelector('#task'); //the task input text field

const form = document.querySelector('#task-form'); //The form at the top

const filter = document.querySelector('#filter'); //the task filter text field

const taskList = document.querySelector('.collection'); //The ul

const clearBtn = document.querySelector('.clear-tasks'); //the all task clear button

const reloadBtn = document.querySelector('.fa'); // the reload button

const query = document.querySelector('.collection'); //      I've used querySelector for the .collection

const allLi = query.getElementsByTagName('li'); //I've used by TagName method to identify every collection-item


//Declare DB var
let DB;
// Add Event Listener [on Load]
document.addEventListener('DOMContentLoaded', () => {
  function displayTaskList() {
    filter.addEventListener('keyup', filterTasks);
    // clear the previous task list
    while (taskList.firstChild) {
      taskList.removeChild(taskList.firstChild);
    }

    // create the object store
    let objectStore = DB.transaction('tasks').objectStore('tasks');

    objectStore.openCursor().onsuccess = function (e) {
      // assign the current cursor
      let cursor = e.target.result;

      if (cursor) {
        const li = document.createElement('li');
        li.className = 'collection-item';
        li.appendChild(document.createTextNode(taskInput.value));
        //Create new element for the link
        const dateID = Date.now();
        const link = document.createElement('a');
        link.className = "delete-item secondary-content";
        // link.innerHTML = '<i class="fa fa-remove"></i>';
        link.innerHTML = `<i class="fa fa-remove"></i>  &nbsp; <a href="edit.html?id=${cursor.value.id}"><i class="fa fa-edit"></i> </a>`;
        const dateDiv = document.createElement("div");
        dateDiv.className = "dateDiv";
        dateDiv.style.display = "none";
        dateDiv.textContent = dateID;

        li.appendChild(dateDiv);
        li.setAttribute('data-task-id', cursor.value.id);
        li.appendChild(link);
        taskList.appendChild(li);
        // Create text node and append it 
        li.appendChild(document.createTextNode(cursor.value.taskname));
        taskInput.value = '';
        cursor.continue();

      }
    }
  }

  //all code will reside here 
  let TasksDB = indexedDB.open("tasks", 1);
  TasksDB.onsuccess = function () {
    DB = TasksDB.result;
    console.log('Database created.');
    console.log(DB);
    displayTaskList();
  }
  TasksDB.onerror = function () {
    console.log('Some Error has happned.');
  }
  TasksDB.onupgradeneeded = function (e) {
    // the event will be the database
    let db = e.target.result;

    // create an object store, 
    // keypath is going to be the Indexes
    let objectStore = db.createObjectStore('tasks', {
      keyPath: 'id',
      autoIncrement: true
    });

    // createindex: 1) field name 2) keypath 3) options
    objectStore.createIndex('taskname', 'taskname', {
      unique: false
    });

    console.log('Database ready and fields created!');
  }

  form.addEventListener('submit', addNewTask);

  function addNewTask(e) {
    e.preventDefault();
    if (taskInput.value === '') {
      taskInput.style.borderColor = 'red';
      return;
    }
    taskInput.style.borderColor = 'green';
    //add to DB
    // create a new object with the form info
    let newTask = {
      taskname: taskInput.value,
      date: new Date()
    }
    // Insert the object into the database 
    let transaction = DB.transaction(['tasks'], 'readwrite');
    let objectStore = transaction.objectStore('tasks');

    let request = objectStore.add(newTask);
    // on success
    request.onsuccess = () => {
      form.reset();
      displayTaskList();


    }
    transaction.oncomplete = () => {
      console.log('New appointment added');
      //displayTaskList();
    }
    transaction.onerror = () => {
      console.log('There was an error, try again!');
    }

  }
  // Remove task event [event delegation]
  taskList.addEventListener('click', removeTask);

  function removeTask(e) {
    Number(e.target.parentElement.parentElement.getAttribute('data-task-id'));

    if (e.target.parentElement.classList.contains('delete-item')) {
      if (confirm('Are You Sure about that ?')) {
        // get the task id


        let taskID = Number(e.target.parentElement.parentElement.getAttribute('data-task-id'));
        let transaction = DB.transaction(['tasks'], 'readwrite');
        // use a transaction
        let objectStore = DB.transaction('tasks', 'readwrite').objectStore('tasks');
        objectStore.delete(taskID);

        transaction.oncomplete = () => {
          e.target.parentElement.parentElement.remove();
        }

      }
    }
  }
  //making the filter function
  function filterTasks() {
    let key = document.getElementById('filter').value; //key now has the filtered value
    for (let i = 0; i < allLi.length; i++) {
      if ((new RegExp(key)).test(allLi[i].textContent)) {
        allLi[i].style.display = "";
      } else {
        allLi[i].style.display = "none";
      }
    }
  }
  clearBtn.addEventListener('click', clearAllTasks);
  //clear tasks 
  function clearAllTasks() {
    if (confirm("Are you sure you want to clear all tasks?")) {
      //Create the transaction and object store
      let transaction = DB.transaction("tasks", "readwrite");
      let tasks = transaction.objectStore("tasks");

      // clear the the table
      tasks.clear();
      //repaint the UI
      displayTaskList();

      console.log("Tasks Cleared !!!");
    }
  }
  $(".dropdown-trigger").dropdown();
  const ascendingBtn = document.querySelector(".ascending-btn");
  const descendingBtn = document.querySelector(".descending-btn");
  const collectionSorted = document.querySelector(".collection-sorted");
  //ascending Sort function
  function ascendSort() {
    const unorderedList = document.querySelectorAll(".collection-item");
    var orderingArray = new Array();
    const currentTime = Date.now();
    for (let i = 0; i < unorderedList.length; i++) {
      listItem = unorderedList[i].querySelector(".dateDiv");
      taskListTime = listItem.textContent;
      let differenceTime = currentTime - taskListTime;
      orderingArray[i] = [differenceTime, i];
    }
    orderingArray.sort();
    for (let i = 0; i < unorderedList.length; i++) {
      collectionSorted.appendChild(unorderedList[orderingArray[i][1]]);
    }
    for (let i = 0; i < unorderedList.length; i++) {
      taskList.appendChild(unorderedList[orderingArray[i][1]]);
    }
  }
  // descending sort function
  function descendSort() {
    const unorderedList = document.querySelectorAll(".collection-item");
    var orderingArray = new Array();
    const currentTime = Date.now();
    for (let i = 0; i < unorderedList.length; i++) {
      listItem = unorderedList[i].querySelector(".dateDiv");
      taskListTime = listItem.textContent;
      let differenceTime = currentTime - taskListTime;
      orderingArray[i] = [differenceTime, i];
    }
    orderingArray.sort();
    orderingArray.reverse();
    for (let i = 0; i < unorderedList.length; i++) {
      collectionSorted.appendChild(unorderedList[orderingArray[i][1]]);
    }
    for (let i = 0; i < unorderedList.length; i++) {
      taskList.appendChild(unorderedList[orderingArray[i][1]]);
    }
  }

  ascendingBtn.addEventListener("click", ascendSort);
  descendingBtn.addEventListener("click", descendSort);


});