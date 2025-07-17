// Define core sections
const sections = {
  'my-day': { input: 'myDayInput', list: 'myDayList', addBtn: 'myDayAddBtn' },
  'important': { input: 'importantInput', list: 'importantList', addBtn: 'importantAddBtn' },
  'planned': { input: 'plannedInput', list: 'plannedList', addBtn: 'plannedAddBtn' }
};

let todos = {
  'my-day': [],
  'important': [],
  'planned': [],
  'calendar': {}
};

let customColumns = {}; // Dynamically added sections

// Show selected section
const showSection = (section) => {
  document.querySelectorAll('.task-section').forEach(s => s.classList.remove('active'));
  const selected = document.getElementById(`${section}-section`);
  if (selected) selected.classList.add('active');
};

// Handle nav link switching
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    showSection(link.dataset.section);
  });
});

// Add task to section
const addTodo = (section) => {
  const input = document.getElementById(sections[section].input);
  const text = input.value.trim();
  if (!text) return;

  const task = {
    id: Date.now(),
    text,
    date: new Date().toLocaleDateString()
  };

  if (section === 'planned') {
    const dateInput = document.getElementById('plannedDate');
    task.due = dateInput.value;
  }

  todos[section].push(task);
  renderTodos(section);
  input.value = '';
  if (section === 'planned') document.getElementById('plannedDate').value = '';
};

// Delete task
const deleteTodo = (section, id) => {
  todos[section] = todos[section].filter(todo => todo.id !== id);
  renderTodos(section);
};

// Render task list
const renderTodos = (section) => {
  const list = document.getElementById(sections[section].list);
  if (!list) return;
  list.innerHTML = todos[section].map(todo => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <span>${todo.text} (${todo.date}${todo.due ? ` - Due: ${todo.due}` : ''})</span>
      <button class="btn btn-delete-task ms-2" onclick="deleteTodo('${section}', ${todo.id})">Delete</button>
    </li>
  `).join('');
};



// Add listeners to all Add buttons
Object.keys(sections).forEach(section => {
  const btn = document.getElementById(sections[section].addBtn);
  if (btn) btn.addEventListener('click', () => addTodo(section));
});

// Task Search
document.getElementById('taskSearch').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();

  Object.keys(sections).forEach(section => {
    const filtered = todos[section].filter(todo => todo.text.toLowerCase().includes(searchTerm));
    const list = document.getElementById(sections[section].list);
    if (list) {
      list.innerHTML = filtered.map(todo => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>${todo.text} (${todo.date})</span>
         <button class="btn btn-delete-task" onclick="deleteTodo('${section}', ${todo.id})">Delete</button>

        </li>
      `).join('');
    }
  });
});

// Add Calendar task
document.getElementById('calendarAddBtn').addEventListener('click', () => {
  const date = document.getElementById('calendarDate').value;
  const task = document.getElementById('calendarTask').value.trim();
  if (!date || !task) return;

  if (!todos.calendar[date]) todos.calendar[date] = [];
  todos.calendar[date].push({ id: Date.now(), text: task });

  renderCalendarTasks(date);
  document.getElementById('calendarTask').value = '';
});

// Render calendar tasks
const renderCalendarTasks = (date) => {
  const taskList = document.getElementById('calendarTaskList');
  const items = todos.calendar[date] || [];

  taskList.innerHTML = items.length
    ? `<h5>Tasks for ${date}</h5>` + items.map(todo => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>${todo.text}</span>
          <button class="btn btn-sm btn-danger" onclick="deleteCalendarTask('${date}', ${todo.id})">Delete</button>
        </li>
      `).join('')
    : `<p class="text-muted">No tasks for ${date}.</p>`;
};

// Delete a task from calendar
function deleteCalendarTask(date, id) {
  todos.calendar[date] = todos.calendar[date].filter(t => t.id !== id);
  renderCalendarTasks(date);
}

// Update calendar view on date change
document.getElementById('calendarDate').addEventListener('change', () => {
  const date = document.getElementById('calendarDate').value;
  renderCalendarTasks(date);
});

document.getElementById('addColumnBtn').addEventListener('click', () => {
  const name = prompt("Enter new column name:");
  if (!name) return;

  const id = name.toLowerCase().replace(/\s+/g, '-');
  if (customColumns[id] || sections[id]) return alert("Column already exists");

  
 // 1. Create Task Section (Right Side)
const container = document.createElement('div');
container.className = 'task-section position-relative';
container.id = `${id}-section`;
container.innerHTML = `
  <video autoplay loop muted playsinline class="bg-video">
    <source src="videos/default.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>

  <div class="task-content">
    <h2>${name}</h2>
    <input type="text" class="form-control mb-2" id="${id}Input" placeholder="Add a task..." />
    <button class="btn btn-secondary mb-2" id="${id}AddBtn">Add</button>
    <ul class="list-group" id="${id}List"></ul>
  </div>
`;

  document.querySelector('.content').appendChild(container);

  // 2. Create Sidebar Link with Delete Button
  const navItem = document.createElement('div');
  navItem.className = 'd-flex justify-content-between align-items-center my-1';
  navItem.innerHTML = `
    <a class="nav-link flex-grow-1" href="#" data-section="${id}">${name}</a>
    <button class="btn btn-sm btn-outline-danger ms-2" title="Delete Column">&times;</button>
  `;

  document.querySelector('.nav.flex-column').appendChild(navItem);

  // 3. Store this column
  customColumns[id] = [];
  sections[id] = { input: `${id}Input`, list: `${id}List`, addBtn: `${id}AddBtn` };
  todos[id] = [];

  // 4. Add listeners
  navItem.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    navItem.querySelector('a').classList.add('active');
    showSection(id);
  });

  document.getElementById(`${id}AddBtn`).addEventListener('click', () => addTodo(id));

  // 5. Handle column deletion
  navItem.querySelector('button').addEventListener('click', () => {
    const confirmDelete = confirm(`Delete column "${name}" and all its tasks?`);
    if (!confirmDelete) return;

    // Remove DOM elements
    navItem.remove();
    container.remove();

    // Clean from memory
    delete todos[id];
    delete sections[id];
    delete customColumns[id];
  });
});
