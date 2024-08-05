// DOM elements
const authContainer = document.getElementById('auth-container');
const loginContainer = document.getElementById('login-container');
const dashboard = document.getElementById('dashboard');
const signUpBtn = document.getElementById('sign-up-btn');
const loginBtn = document.getElementById('login-btn');
const showLogin = document.getElementById('show-login');
const showSignUp = document.getElementById('show-signup');
const createTaskBtn = document.getElementById('create-task-btn');
const notificationCount = document.getElementById('notification-count');
const bellIcon = document.querySelector('.bell-icon');
const taskList = document.getElementById('task-list');

let currentUser;

// Show login form
showLogin.addEventListener('click', () => {
  authContainer.classList.add('hidden');
  loginContainer.classList.remove('hidden');
});

// Show sign up form
showSignUp.addEventListener('click', () => {
  loginContainer.classList.add('hidden');
  authContainer.classList.remove('hidden');
});

// Sign up
signUpBtn.addEventListener('click', () => {
  const fullName = document.getElementById('full-name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const mobile = document.getElementById('mobile').value;

  if (!fullName || !email || !password || !mobile) {
    alert('All fields are mandatory');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return database.ref('users/' + user.uid).set({
        fullName: fullName,
        email: email,
        mobile: mobile
      }).then(() => {
        currentUser = user;
        loadUserDashboard();
      });
    })
    .catch((error) => {
      console.error(error.message);
      alert('Error during sign up: ' + error.message);
    });
});

// Login
loginBtn.addEventListener('click', () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    alert('Email and Password are mandatory');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      if (email === 'nserekonajib3@gmail.com') {
        loadAdminDashboard();
      } else {
        loadUserDashboard();
      }
    })
    .catch((error) => {
      console.error(error.message);
      alert('Error during login: ' + error.message);
    });
});

function loadUserDashboard() {
  authContainer.classList.add('hidden');
  loginContainer.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadTasks();
  loadNotifications();
}

function loadAdminDashboard() {
  authContainer.classList.add('hidden');
  loginContainer.classList.add('hidden');
  dashboard.classList.remove('hidden');

  const tasksRef = database.ref('tasks');
  tasksRef.on('value', (snapshot) => {
    taskList.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
      const task = childSnapshot.val();
      addAdminTaskToTable(task, childSnapshot.key);
    });
  });
}

// Create a new task
createTaskBtn.addEventListener('click', () => {
  const level = document.getElementById('cpa-level').value;
  const courseUnit = document.getElementById('course-unit').value;
  const topic = document.getElementById('topic').value;

  if (!level || !courseUnit || !topic) {
    alert('All fields are mandatory');
    return;
  }

  const timestamp = new Date().toLocaleString();
  const newTaskKey = database.ref().child('tasks').push().key;
  const taskData = {
    userId: currentUser.uid,
    level: level,
    courseUnit: courseUnit,
    topic: topic,
    timestamp: timestamp,
    status: 'Processing'
  };

  const updates = {};
  updates['/tasks/' + newTaskKey] = taskData;
  database.ref().update(updates)
    .then(() => {
      addTaskToTable(taskData);
      notifyAdmin(`New task created by ${currentUser.email}`);
    })
    .catch((error) => {
      console.error(error.message);
      alert('Error creating task: ' + error.message);
    });
});

// Load tasks for users
function loadTasks() {
  const tasksRef = database.ref('tasks').orderByChild('userId').equalTo(currentUser.uid);
  tasksRef.on('value', (snapshot) => {
    taskList.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
      const task = childSnapshot.val();
      addTaskToTable(task);
    });
  });
}

// Add task to table
function addTaskToTable(task) {
  const row = taskList.insertRow();
  row.insertCell(0).textContent = `Level ${task.level}`;
  row.insertCell(1).textContent = task.topic;
  row.insertCell(2).textContent = task.timestamp;
  row.insertCell(3).textContent = task.status;
}

// Load notifications
function loadNotifications() {
  const notificationsRef = database.ref('notifications').orderByChild('userId').equalTo(currentUser.uid);
  notificationsRef.on('value', (snapshot) => {
    let count = 0;
    snapshot.forEach((childSnapshot) => {
      const notification = childSnapshot.val();
      if (!notification.read) {
        count++;
      }
    });
    notificationCount.textContent = count;
  });
}

// Bell icon click
bellIcon.addEventListener('click', () => {
  const notificationsRef = database.ref('notifications').orderByChild('userId').equalTo(currentUser.uid);
  notificationsRef.once('value', (snapshot) => {
    let notifications = '';
    snapshot.forEach((childSnapshot) => {
      const notificationData = childSnapshot.val();
      if (!notificationData.read) {
        notifications += `${notificationData.message}\n`;
        database.ref('notifications/' + childSnapshot.key).update({ read: true });
      }
    });
    notificationCount.textContent = '0';
    alert(notifications || 'No new notifications');
  });
});

// Add task to table for admin
function addAdminTaskToTable(task, taskId) {
  const row = taskList.insertRow();
  row.insertCell(0).textContent = `Level ${task.level}`;
  row.insertCell(1).textContent = task.topic;
  row.insertCell(2).textContent = task.timestamp;
  row.insertCell(3).textContent = task.status;
  const detailsBtn = document.createElement('button');
  detailsBtn.textContent = 'View Details';
  detailsBtn.addEventListener('click', () => {
    showTaskDetails(taskId);
  });
  const approveBtn = document.createElement('button');
  approveBtn.textContent = 'Approve';
  approveBtn.addEventListener('click', () => {
    updateTaskStatus(taskId, 'Approved');
  });
  const denyBtn = document.createElement('button');
  denyBtn.textContent = 'Deny';
  denyBtn.addEventListener('click', () => {
    updateTaskStatus(taskId, 'Denied');
  });
  const endBtn = document.createElement('button');
  endBtn.textContent = 'End';
  endBtn.addEventListener('click', () => {
    updateTaskStatus(taskId, 'Ended');
  });
  row.insertCell(4).appendChild(detailsBtn);
  row.insertCell(4).appendChild(approveBtn);
  row.insertCell(4).appendChild(denyBtn);
  row.insertCell(4).appendChild(endBtn);
}

// Show task details
function showTaskDetails(taskId) {
  const taskRef = database.ref('tasks/' + taskId);
  taskRef.once('value', (taskSnapshot) => {
    const task = taskSnapshot.val();
    const userRef = database.ref('users/' + task.userId);
    userRef.once('value', (userSnapshot) => {
      const user = userSnapshot.val();
      const details = `
        Task Details:
        - Level: ${task.level}
        - Course Unit: ${task.courseUnit}
        - Topic: ${task.topic}
        - Timestamp: ${task.timestamp}
        - Status: ${task.status}
        
        User Details:
        - Full Name: ${user.fullName}
        - Email: ${user.email}
        - Mobile: ${user.mobile}
      `;
      alert(details);
    });
  });
}

// Update task status
function updateTaskStatus(taskId, status) {
  database.ref('tasks/' + taskId).update({ status: status })
    .then(() => {
      const task = taskList.querySelector(`tr[data-id="${taskId}"]`);
      task.cells[3].textContent = status;
      notifyUser(taskId, `Your discussion has been ${status.toLowerCase()}.`);
    })
    .catch((error) => {
      console.error(error.message);
      alert('Error updating task status: ' + error.message);
    });
}

// Notify user
function notifyUser(taskId, message) {
  const taskRef = database.ref('tasks/' + taskId);
  taskRef.once('value', (taskSnapshot) => {
    const task = taskSnapshot.val();
    const notificationData = {
      userId: task.userId,
      message: message,
      read: false
    };
    const newNotificationKey = database.ref().child('notifications').push().key;
    const updates = {};
    updates['/notifications/' + newNotificationKey] = notificationData;
    database.ref().update(updates)
      .catch((error) => {
        console.error(error.message);
        alert('Error sending notification: ' + error.message);
      });
  });
}

// Notify admin
function notifyAdmin(message) {
  const notificationData = {
    userId: 'admin',
    message: message,
    read: false
  };
  const newNotificationKey = database.ref().child('notifications').push().key;
  const updates = {};
  updates['/notifications/' + newNotificationKey] = notificationData;
  database.ref().update(updates)
    .catch((error) => {
      console.error(error.message);
      alert('Error sending notification: ' + error.message);
    });
}
