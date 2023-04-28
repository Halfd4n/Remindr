import { ApiCaller } from '/scripts/module.mjs'


// ---- SELECTORS ----
const unfinishedTodosContainer = document.querySelector(".unfinished-todos");
const finishedTodosContainer = document.querySelector(".finished-todos");
const todoText = document.getElementById("todo-input-text");
const typeSelect = document.getElementById("type-select");
const statusText = document.getElementById("status-message");
const addSaveBtn = document.getElementById("add-save-btn");
let todoToUpdateId;

// ---- INSTANCEIATE API ---- 
const todosApiCaller = new ApiCaller("http://localhost:3000/", "todos");
const typeApiCaller = new ApiCaller("http://localhost:3000/", "types");

// ---- INITIAL FUNCTION CALLS ----
getTodos();
getTypes();


// ----- EVENT LISTENERS ----
document.addEventListener("click", handleClick)

// ---- FUNCTIONS ----

async function getTodos() {

    unfinishedTodosContainer.innerHTML = "<h2>To do:</h2>";
    finishedTodosContainer.innerHTML = "<h2>Done:</h2>"

    todosApiCaller.getAll()
        .then(value => showTodos(value));
}

function showTodos(data){
    
    data.forEach(d => {
        if(d.isFinished === false){
            const todoElement = `<div id="${d.id}" class="todo">
                        <h3><i class=${getSymbol(d.type)}></i></h3>
                        <h3>${d.task}</h3>
                        <div class="button-container">
                            <input type="checkbox" class="checkbox" /> 
                            <button id="delete-btn">X</button>
                        </div>
                    </div>`

            unfinishedTodosContainer.innerHTML += todoElement;
        } else if (d.isFinished) {
            const todoElement = `<div id="${d.id}" class="todo">
                                    <h3 id="todo-type"><i class=${getSymbol(d.type)}></i></h3>
                                    <h3 id="todo-task">${d.task}</h3>
                                    <div class="button-container">
                                        <input type="checkbox" class="checkbox" checked />
                                        <button id="delete-btn">X</button>
                                    </div>
                                </div>`

            finishedTodosContainer.innerHTML += todoElement;
        }

    })
}

function getTypes() {
    typeApiCaller.getAll()
        .then(value => showTypes(value));
}

function showTypes(data){
    data.forEach(d => {
        const typeElement = `<option>${d.type}</option>`
        
        typeSelect.innerHTML += typeElement;
    })
}

function getSymbol(type) {
    if(type.toLowerCase() === "home"){
        return `"fa-solid fa-house-chimney"`
    } else if (type.toLowerCase() === "work"){
        return `"fa-solid fa-briefcase"`
    } else if (type.toLowerCase() === "leisure"){
        return `"fa-solid fa-sun"`
    }
}

function convertSymbolToText(html){
    if(html === `<i class="fa-solid fa-sun"></i>`){
        return "Leisure"
    } else if (html === `<i class="fa-solid fa-house-chimney"></i>`){
        return "Home"
    } else if (html === `<i class="fa-solid fa-briefcase"></i>`){
        return "Work"
    };
}

function handleClick(e){
    const clickTarget = e.target;

    if(clickTarget.classList.contains("todo-btn")){
        addTodo();
        setInterval(clearMessage, 4000)
    } else if (clickTarget.type === "checkbox"){
        
        let isChecked = isCheckboxChecked(clickTarget);

        if(isChecked){
            const parent = clickTarget.parentElement;

            const todo = parent.parentElement;

            finishTodo(todo.id);

            statusText.classList.add("green-text");
            statusText.classList.remove("red-text");
            statusText.innerText = "Todo finished!";

            setInterval(clearMessage, 4000)

        } else {
            const parent = clickTarget.parentElement;

            const todo = parent.parentElement;

            unfinishTodo(todo.id);

            statusText.classList.add("red-text");
            statusText.classList.remove("green-text");
            statusText.innerText = "Todo unfinished :(..";

            setInterval(clearMessage, 4000)
        }
    } else if (clickTarget.id === "delete-btn"){
        deleteTodo(clickTarget);
        setInterval(clearMessage, 4000);
    } else if (clickTarget.classList.contains("todo")){
        
        const children = clickTarget.children;
        const childrenArray = Array.from(children);

        typeSelect.value = convertSymbolToText(childrenArray[0].innerHTML);
        todoText.value = childrenArray[1].innerText;

        todoToUpdateId = clickTarget.id;

        if(!addSaveBtn.classList.contains("save-btn")){
            toggleButtons();
        }

    } else if(clickTarget.classList.contains("save-btn")){
        updateTodo(todoToUpdateId)
        setInterval(clearMessage, 4000)
    } else if(addSaveBtn.classList.contains("save-btn")
        && clickTarget != addSaveBtn 
        && !clickTarget.classList.contains("todo") 
        && clickTarget != todoText
        && clickTarget != typeSelect) {    
        toggleButtons();
        clearInputs();
    }
}

function toggleButtons(){
    if(addSaveBtn.classList.contains("todo-btn")){
        addSaveBtn.classList.remove("todo-btn");
        addSaveBtn.classList.add("save-btn");
        addSaveBtn.innerText = "Save"
    } else {
        addSaveBtn.classList.add("todo-btn");
        addSaveBtn.classList.remove("save-btn");
        addSaveBtn.innerText = "Add";
    }
}

async function addTodo(){
    if(todoText.value.trim().length != 0 && typeSelect.value != "Todo type"){
        
        await todosApiCaller.postTodo(todoText.value, typeSelect.value, false);

        statusText.classList.add("green-text");
        statusText.classList.remove("red-text");
        statusText.innerText = "Todo added to Remindr!";

        getTodos();
        clearInputs();

    } else {
        statusText.classList.add("red-text");
        statusText.classList.remove("green-text");
        statusText.innerText = "All fields weren't filled in correctly!";
    }
}

async function updateTodo(id){

    if(todoText.value.trim().length != 0 && typeSelect.value != "Todo type"){
        
        await todosApiCaller.updateExistingTodo(id, todoText.value, typeSelect.value, false)
        
        statusText.classList.add("green-text");
        statusText.classList.remove("red-text");
        statusText.innerText = "Todo successfully updated!";
    } else {
        statusText.classList.add("red-text");
        statusText.classList.remove("green-text");
        statusText.innerText = "All fields weren't filled in correctly!";
    }

    clearInputs();
    toggleButtons();
    getTodos();
}

function isCheckboxChecked(checkbox) {
    if(checkbox.checked){
        return true;
    } else {
        return false;
    }
}

async function finishTodo(id){
    
    await todosApiCaller.finishTodo(id, true);

    getTodos();
}

async function unfinishTodo(id){

    await todosApiCaller.unfinishTodo(id, false);

    getTodos();
}

async function deleteTodo(target)
{
    const parent = target.parentElement;

    const todo = parent.parentElement;

    await todosApiCaller.deleteTodoFromDb(todo.id)

    statusText.classList.add("green-text");
    statusText.classList.remove("red-text");
    statusText.innerText = "Todo successfully removed!"

    getTodos();
}

async function clearMessage() {
    statusText.innerText = null;
}

function clearInputs() {
    todoText.value = null;
    typeSelect.value = "Todo type";
}