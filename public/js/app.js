// app.js - Основная логика приложения

// Словари для изучения
const WORD_DICTIONARIES = {
  business: [
    { word: 'Leverage', translation: 'Использовать, использовать преимущество' },
    { word: 'Scalability', translation: 'Масштабируемость' },
    { word: 'Revenue', translation: 'Доход, выручка' },
    { word: 'Stakeholder', translation: 'Заинтересованная сторона' },
    { word: 'Margin', translation: 'Маржа, прибыль' },
    { word: 'Portfolio', translation: 'Портфель (инвестиций)' },
    { word: 'Benchmark', translation: 'Ориентир, эталон' },
    { word: 'Acquisition', translation: 'Приобретение' },
    { word: 'Retention', translation: 'Удержание клиентов' },
    { word: 'Onboarding', translation: 'Адаптация новых сотрудников' }
  ],
  science: [
    { word: 'Hypothesis', translation: 'Гипотеза' },
    { word: 'Empirical', translation: 'Эмпирический' },
    { word: 'Methodology', translation: 'Методология' },
    { word: 'Correlation', translation: 'Корреляция' },
    { word: 'Variable', translation: 'Переменная' },
    { word: 'Parameter', translation: 'Параметр' },
    { word: 'Synthesis', translation: 'Синтез' },
    { word: 'Phenomenon', translation: 'Явление' },
    { word: 'Quantum', translation: 'Квантовый' },
    { word: 'Entropy', translation: 'Энтропия' }
  ],
  art: [
    { word: 'Aesthetics', translation: 'Эстетика' },
    { word: 'Composition', translation: 'Композиция' },
    { word: 'Perspective', translation: 'Перспектива' },
    { word: 'Symmetry', translation: 'Симметрия' },
    { word: 'Palette', translation: 'Палитра' },
    { word: 'Texture', translation: 'Текстура' },
    { word: 'Contrast', translation: 'Контраст' },
    { word: 'Canvas', translation: 'Холст' },
    { word: 'Abstract', translation: 'Абстракция' },
    { word: 'Sculpture', translation: 'Скульптура' }
  ],
  sport: [
    { word: 'Endurance', translation: 'Выносливость' },
    { word: 'Agility', translation: 'Ловкость' },
    { word: 'Stamina', translation: 'Выдержка' },
    { word: 'Coordination', translation: 'Координация' },
    { word: 'Cardio', translation: 'Кардио' },
    { word: 'Repetition', translation: 'Повторение' },
    { word: 'Set', translation: 'Подход (в спорте)' },
    { word: 'Sprint', translation: 'Спринт, короткая дистанция' },
    { word: 'Marathon', translation: 'Марафон' },
    { word: 'Training', translation: 'Тренировка' }
  ],
  tech: [
    { word: 'Algorithm', translation: 'Алгоритм' },
    { word: 'Database', translation: 'База данных' },
    { word: 'Encryption', translation: 'Шифрование' },
    { word: 'Bandwidth', translation: 'Пропускная способность' },
    { word: 'Interface', translation: 'Интерфейс' },
    { word: 'Framework', translation: 'Фреймворк' },
    { word: 'Deployment', translation: 'Развёртывание' },
    { word: 'Debugging', translation: 'Отладка' },
    { word: 'Frontend', translation: 'Клиентская часть' },
    { word: 'Backend', translation: 'Серверная часть' }
  ]
};

// Достижения с требованиями
const ACHIEVEMENTS = {
  'first-task': { name: 'Первая задача', icon: '✅', required: 1, type: 'tasks' },
  'task-master-10': { name: 'Мастер задач', icon: '📋', required: 10, type: 'tasks' },
  'water-master': { name: 'Водный мастер', icon: '💧', required: 7, type: 'water_days' },
  'focus-champion': { name: 'Чемпион фокуса', icon: '🎯', required: 100, type: 'focus_minutes' },
  'word-learner': { name: 'Словоед', icon: '📚', required: 50, type: 'words' },
  'book-worm': { name: 'Книжный червь', icon: '📖', required: 1000, type: 'pages' },
  'grateful': { name: 'Благодарный', icon: '🙏', required: 7, type: 'gratitudes' }
};

// Состояние приложения
const appState = {
  currentTab: 'tasks',
  focusTimer: null,
  exerciseTimer: null,
  dndTimer: null,
  focusTime: 25 * 60,
  focusIsRunning: false,
  exerciseTime: 5 * 60,
  exerciseIsRunning: false,
  sessionsToday: 0,
  wordsToday: [],
  uploadedFile: null,
  currentBook: null,
  userProfile: {
    fullName: '',
    birthDate: null,
    email: 'user@example.com',
    avatar: null
  },
  streak: 0,
  lastVisit: null
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
  // Регистрация Service Worker с обновлением
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker зарегистрирован:', registration.scope);
      
      // Проверяем наличие обновлений
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('Доступно обновление! Перезагрузите страницу.');
          }
        });
      });
    } catch (e) {
      console.error('SW registration failed:', e);
    }
  }

  initNavigation();
  initEventListeners();
  initModal();
  updateStreak();
  await loadProfile();
  await loadTasks();
  await loadTasksCalendar();
  await loadGratitudes();
  await loadSupplements();
  await loadWords();
  await loadPrinciples();
  await loadAchievements();
  await loadBooks();
  await initLifeCalendar();
  notifications.scheduleWaterReminder();
});

// Навигация
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tabName) {
  appState.currentTab = tabName;
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.dataset.tab === tabName);
  });
  
  if (tabName === 'calendar') {
    initLifeCalendar();
  } else if (tabName === 'profile') {
    loadAchievements();
  }
}

// Модальное окно
function initModal() {
  const closeBtn = document.getElementById('modal-close-btn');
  const modal = document.getElementById('day-tasks-modal');
  
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
}

function openDayTasksModal(date, tasks) {
  const modal = document.getElementById('day-tasks-modal');
  const dateEl = document.getElementById('modal-date');
  const tasksList = document.getElementById('modal-tasks-list');
  
  dateEl.textContent = formatDateFull(date);
  
  if (tasks.length === 0) {
    tasksList.innerHTML = '<p class="empty-state">Нет задач за этот день</p>';
  } else {
    tasksList.innerHTML = tasks.map(task => `
      <div class="modal-task ${task.completed ? 'completed' : ''}">
        <span class="modal-task-icon">${task.completed ? '✅' : '⬜'}</span>
        <span class="modal-task-text">${task.text}</span>
      </div>
    `).join('');
  }
  
  modal.style.display = 'flex';
}

// Инициализация обработчиков
function initEventListeners() {
  // === ЗАДАЧИ ===
  document.getElementById('save-tasks-btn')?.addEventListener('click', saveTasks);
  
  document.querySelectorAll('.daily-task-check').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const taskId = e.target.dataset.task;
      const input = document.getElementById(`task-input-${taskId}`);
      const taskData = {
        id: `task_${new Date().toISOString().split('T')[0]}_${taskId}`,
        text: input?.value || `Задача ${taskId}`,
        completed: e.target.checked,
        date: new Date().toISOString().split('T')[0]
      };
      db.put('daily_tasks', taskData);
      loadTasksCalendar();
      checkAchievements();
    });
  });
  
  // Книги
  document.getElementById('add-book-btn')?.addEventListener('click', () => {
    document.getElementById('book-form').style.display = 'block';
  });
  
  document.getElementById('save-book-btn')?.addEventListener('click', saveBook);
  document.getElementById('cancel-book-btn')?.addEventListener('click', () => {
    document.getElementById('book-form').style.display = 'none';
  });
  
  // Разминка
  document.getElementById('start-exercise')?.addEventListener('click', toggleExerciseTimer);
  document.getElementById('reset-exercise')?.addEventListener('click', resetExerciseTimer);
  
  // Вода
  document.getElementById('add-water')?.addEventListener('click', addWater);
  
  // === ФОКУС ===
  document.querySelectorAll('.quick-timer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const minutes = parseInt(btn.dataset.minutes);
      setFocusTimer(minutes * 60);
    });
  });
  
  document.getElementById('start-focus')?.addEventListener('click', toggleFocusTimer);
  document.getElementById('pause-focus')?.addEventListener('click', pauseFocusTimer);
  document.getElementById('reset-focus')?.addEventListener('click', resetFocusTimer);
  
  document.getElementById('dnd-switch')?.addEventListener('change', toggleDND);
  
  // === ИЗУЧАТЬ ===
  document.getElementById('upload-file-btn')?.addEventListener('click', uploadFile);
  document.getElementById('learn-words-btn')?.addEventListener('click', learnWords);
  
  // Принципы
  document.getElementById('add-principle-btn')?.addEventListener('click', addPrinciple);
  
  // === КАЛЕНДАРЬ ===
  document.getElementById('save-birth-date')?.addEventListener('click', saveBirthDate);
  
  // === ПРОФИЛЬ ===
  document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
    document.getElementById('profile-edit-form').style.display = 'block';
    document.getElementById('profile-fullname').value = appState.userProfile.fullName;
    document.getElementById('profile-birthdate').value = appState.userProfile.birthDate || '';
    document.getElementById('profile-email-input').value = appState.userProfile.email;
  });
  
  document.getElementById('save-profile-btn')?.addEventListener('click', saveProfile);
  document.getElementById('cancel-profile-btn')?.addEventListener('click', () => {
    document.getElementById('profile-edit-form').style.display = 'none';
  });
  
  // Аватар
  document.getElementById('avatar-upload')?.addEventListener('change', handleAvatarUpload);
  
  document.getElementById('save-gratitude')?.addEventListener('click', saveGratitude);
  document.getElementById('add-supplement')?.addEventListener('click', addSupplement);
  document.getElementById('syncBtn')?.addEventListener('click', syncData);
}

// === СЕРИЯ ЗАХОДОВ ===
function updateStreak() {
  const today = new Date().toISOString().split('T')[0];
  const visited = JSON.parse(localStorage.getItem('visitDays') || '[]');
  
  if (!visited.includes(today)) {
    visited.push(today);
    localStorage.setItem('visitDays', JSON.stringify(visited));
  }
  
  // Считаем серию
  let streak = 0;
  const sortedDays = [...visited].sort().reverse();
  
  for (let i = 0; i < sortedDays.length; i++) {
    const currentDate = new Date(sortedDays[i]);
    const prevDate = new Date(sortedDays[i + 1] || Date.now() - 86400000);
    const diff = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diff <= 1 || i === 0) {
      streak++;
    } else {
      break;
    }
  }
  
  appState.streak = streak;
  document.getElementById('streak-count').textContent = streak;
}

// === ЗАДАЧИ ===
async function saveTasks() {
  const today = new Date().toISOString().split('T')[0];
  
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`task-input-${i}`);
    const checkbox = document.querySelector(`.daily-task-check[data-task="${i}"]`);
    if (input && input.value.trim()) {
      await db.put('daily_tasks', {
        id: `task_${today}_${i}`,
        text: input.value.trim(),
        completed: checkbox?.checked || false,
        date: today
      });
    }
  }
  
  await loadTasksCalendar();
  await checkAchievements();
  notifications.showToast('Задачи сохранены', 'success');
}

async function loadTasks() {
  const today = new Date().toISOString().split('T')[0];
  const tasks = await db.getByIndex('daily_tasks', 'date', today);
  
  tasks.forEach(task => {
    const taskId = task.id.split('_').pop();
    const input = document.getElementById(`task-input-${taskId}`);
    const checkbox = document.querySelector(`.daily-task-check[data-task="${taskId}"]`);
    if (input) input.value = task.text;
    if (checkbox) checkbox.checked = task.completed;
  });
  
  await updateStats();
}

async function updateStats() {
  const today = new Date().toISOString().split('T')[0];
  const tasks = await db.getByIndex('daily_tasks', 'date', today);
  const completedToday = tasks.filter(t => t.completed).length;
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekTasks = await db.getAll('daily_tasks');
  const completedWeek = weekTasks.filter(t => {
    const taskDate = new Date(t.date);
    return taskDate >= weekAgo && t.completed;
  }).length;
  
  const total = tasks.length || 3;
  const rate = Math.round((completedToday / total) * 100) || 0;
  
  document.getElementById('completed-today').textContent = completedToday;
  document.getElementById('completed-week').textContent = completedWeek;
  document.getElementById('completion-rate').textContent = `${rate}%`;
}

// === КАЛЕНДАРЬ ЗАДАЧ ===
async function loadTasksCalendar() {
  const calendar = document.getElementById('tasks-calendar');
  if (!calendar) return;
  
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() || 7; // Пн=1, Вс=7
  
  // Получаем все задачи месяца
  const allTasks = await db.getAll('daily_tasks');
  const monthTasks = allTasks.filter(t => {
    const taskDate = new Date(t.date);
    return taskDate.getMonth() === month && taskDate.getFullYear() === year;
  });
  
  // Группируем по дням
  const tasksByDay = {};
  monthTasks.forEach(task => {
    const day = new Date(task.date).getDate();
    if (!tasksByDay[day]) tasksByDay[day] = [];
    tasksByDay[day].push(task);
  });
  
  // Создаем календарь
  let html = `
    <div class="calendar-header">
      <span>${today.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</span>
    </div>
    <div class="calendar-grid">
      <div class="calendar-weekday">Пн</div>
      <div class="calendar-weekday">Вт</div>
      <div class="calendar-weekday">Ср</div>
      <div class="calendar-weekday">Чт</div>
      <div class="calendar-weekday">Пт</div>
      <div class="calendar-weekday">Сб</div>
      <div class="calendar-weekday">Вс</div>
  `;
  
  // Пустые ячейки до первого дня
  for (let i = 1; i < startDay; i++) {
    html += '<div class="calendar-day-empty"></div>';
  }
  
  // Дни месяца
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasksByDay[day] || [];
    const completed = dayTasks.filter(t => t.completed).length;
    const total = dayTasks.length || 3;
    
    let statusClass = '';
    if (dayTasks.length > 0) {
      if (completed === total) statusClass = 'complete-green';
      else if (completed >= 2) statusClass = 'complete-yellow';
      else if (completed >= 1) statusClass = 'complete-orange';
      else statusClass = 'complete-red';
    }
    
    const isToday = day === today.getDate();
    
    html += `
      <div class="calendar-day ${statusClass} ${isToday ? 'today' : ''}" data-date="${dateStr}">
        <span class="calendar-day-num">${day}</span>
        <span class="calendar-day-tasks">${completed}/${total}</span>
      </div>
    `;
  }
  
  html += '</div>';
  calendar.innerHTML = html;
  
  // Обработчики кликов
  calendar.querySelectorAll('.calendar-day').forEach(el => {
    el.addEventListener('click', () => {
      const date = el.dataset.date;
      const dayTasks = tasksByDay[new Date(date).getDate()] || [];
      openDayTasksModal(date, dayTasks);
    });
  });
  
  updateStats();
}

function formatDateFull(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// === КНИГИ ===
async function saveBook() {
  const titleInput = document.getElementById('book-title-input');
  const pagesInput = document.getElementById('book-total-pages');
  
  const title = titleInput.value.trim();
  const totalPages = parseInt(pagesInput.value) || 0;
  
  if (!title) {
    notifications.showToast('Введите название книги', 'warning');
    return;
  }
  
  const book = {
    id: `book_${Date.now()}`,
    title,
    total_pages: totalPages,
    pages_read: 0,
    is_current: true,
    created_at: new Date().toISOString()
  };
  
  const books = await db.getAll('books') || [];
  for (const b of books) {
    b.is_current = false;
    await db.put('books', b);
  }
  
  await db.put('books', book);
  appState.currentBook = book;
  
  titleInput.value = '';
  pagesInput.value = '';
  document.getElementById('book-form').style.display = 'none';
  
  loadBooks();
  notifications.showToast('Книга добавлена', 'success');
}

async function loadBooks() {
  const books = await db.getAll('books') || [];
  const list = document.getElementById('books-list');
  
  if (!list) return;
  
  if (books.length === 0) {
    list.innerHTML = '<p class="empty-state">Нет добавленных книг</p>';
    return;
  }
  
  const currentBook = books.find(b => b.is_current) || books[0];
  appState.currentBook = currentBook;
  
  list.innerHTML = books.map(book => {
    const percent = book.total_pages > 0 ? Math.round((book.pages_read / book.total_pages) * 100) : 0;
    return `
      <div class="book-item ${book.is_current ? 'current' : ''}">
        <div class="book-info">
          <span class="book-title">${book.title}</span>
          <span class="book-pages">${book.pages_read} / ${book.total_pages} стр.</span>
        </div>
        <div class="book-progress-bar">
          <div class="book-progress-fill" style="width: ${percent}%"></div>
        </div>
        <div class="book-actions">
          <button class="btn btn-sm btn-primary" onclick="addBookPage('${book.id}')">+10 стр.</button>
          ${!book.is_current ? `<button class="btn btn-sm btn-outline" onclick="setCurrentBook('${book.id}')">Текущая</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function addBookPage(bookId) {
  const books = await db.getAll('books') || [];
  const book = books.find(b => b.id === bookId);
  
  if (book) {
    book.pages_read += 10;
    await db.put('books', book);
    
    if (book.is_current) {
      appState.currentBook = book;
    }
    
    loadBooks();
    notifications.showToast('+10 страниц', 'success');
    checkAchievements();
  }
}

async function setCurrentBook(bookId) {
  const books = await db.getAll('books') || [];
  
  for (const b of books) {
    b.is_current = b.id === bookId;
    await db.put('books', b);
  }
  
  loadBooks();
  notifications.showToast('Книга выбрана текущей', 'success');
}

// === ТАЙМЕРЫ ===
function toggleExerciseTimer() {
  const btn = document.getElementById('start-exercise');
  
  if (appState.exerciseIsRunning) {
    pauseExerciseTimer();
  } else {
    appState.exerciseIsRunning = true;
    btn.textContent = 'Пауза';
    
    appState.exerciseTimer = setInterval(() => {
      appState.exerciseTime--;
      updateTimerDisplay('exercise-timer', appState.exerciseTime);
      
      if (appState.exerciseTime <= 0) {
        resetExerciseTimer();
        notifications.showToast('Разминка завершена!', 'success');
        notifications.playSound('complete');
      }
    }, 1000);
  }
}

function pauseExerciseTimer() {
  clearInterval(appState.exerciseTimer);
  appState.exerciseIsRunning = false;
  document.getElementById('start-exercise').textContent = 'Продолжить';
}

function resetExerciseTimer() {
  clearInterval(appState.exerciseTimer);
  appState.exerciseIsRunning = false;
  appState.exerciseTime = 5 * 60;
  updateTimerDisplay('exercise-timer', appState.exerciseTime);
  document.getElementById('start-exercise').textContent = 'Старт';
}

function addWater() {
  const waterCount = document.getElementById('water-count');
  const waterLevel = document.getElementById('water-level');
  const current = parseInt(waterCount.textContent.split('/')[0]) || 0;
  const newCount = Math.min(current + 250, 500);
  
  waterCount.textContent = `${newCount}/500 мл`;
  waterLevel.style.height = `${(newCount / 500) * 100}%`;
  notifications.showToast('+250мл воды', 'success');
}

// === ФОКУС ===
function setFocusTimer(seconds) {
  pauseFocusTimer();
  appState.focusTime = seconds;
  updateTimerDisplay('focus-time', seconds);
}

function toggleFocusTimer() {
  const btn = document.getElementById('start-focus');
  
  if (appState.focusIsRunning) {
    pauseFocusTimer();
  } else {
    appState.focusIsRunning = true;
    btn.textContent = 'Пауза';
    
    appState.focusTimer = setInterval(() => {
      appState.focusTime--;
      updateTimerDisplay('focus-time', appState.focusTime);
      
      if (appState.focusTime <= 0) {
        completeFocusSession();
      }
    }, 1000);
  }
}

function pauseFocusTimer() {
  clearInterval(appState.focusTimer);
  appState.focusIsRunning = false;
  const btn = document.getElementById('start-focus');
  if (btn) btn.textContent = 'Старт';
}

function resetFocusTimer() {
  pauseFocusTimer();
  appState.focusTime = 25 * 60;
  updateTimerDisplay('focus-time', appState.focusTime);
  document.getElementById('focus-mode').textContent = 'Фокус';
}

async function completeFocusSession() {
  pauseFocusTimer();
  appState.sessionsToday++;
  document.getElementById('session-count').textContent = appState.sessionsToday;
  
  await db.saveFocusSession(25);
  notifications.showToast('Сессия фокуса завершена!', 'success');
  notifications.playSound('complete');
  
  appState.focusTime = 25 * 60;
  updateTimerDisplay('focus-time', appState.focusTime);
  checkAchievements();
}

function updateTimerDisplay(elementId, seconds) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  el.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleDND(e) {
  const statusEl = document.getElementById('dnd-status');
  const timerEl = document.getElementById('dnd-timer');
  
  if (e.target.checked) {
    statusEl.textContent = 'Включён';
    timerEl.style.display = 'block';
    
    let remaining = 60 * 60;
    
    appState.dndTimer = setInterval(() => {
      remaining--;
      const hours = Math.floor(remaining / 3600);
      const mins = Math.floor((remaining % 3600) / 60);
      const secs = remaining % 60;
      document.getElementById('dnd-remaining').textContent =
        `${hours.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
      
      if (remaining <= 0) {
        clearInterval(appState.dndTimer);
        document.getElementById('dnd-switch').checked = false;
        statusEl.textContent = 'Выключен';
        timerEl.style.display = 'none';
      }
    }, 1000);
  } else {
    statusEl.textContent = 'Выключен';
    timerEl.style.display = 'none';
    clearInterval(appState.dndTimer);
  }
}

// === ИЗУЧАТЬ ===
function uploadFile() {
  const fileInput = document.getElementById('file-upload');
  const fileInfo = document.getElementById('file-info');
  const fileName = document.getElementById('file-name');
  
  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    appState.uploadedFile = file;
    
    fileInfo.style.display = 'block';
    fileName.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    notifications.showToast('Файл загружен', 'success');
  } else {
    notifications.showToast('Выберите файл', 'warning');
  }
}

async function learnWords() {
  const container = document.getElementById('words-day-container');
  
  if (appState.wordsToday.length >= 5) {
    container.innerHTML = '<p class="empty-state">Лимит слов на сегодня исчерпан</p>';
    return;
  }
  
  const allWords = Object.values(WORD_DICTIONARIES).flat();
  const shuffled = allWords.sort(() => 0.5 - Math.random());
  const newWords = shuffled.slice(0, 5);
  
  appState.wordsToday = newWords;
  
  container.innerHTML = newWords.map((item, index) => `
    <div class="word-card-day">
      <span class="word-number">${index + 1}.</span>
      <div class="word-info">
        <span class="word-text">${item.word}</span>
        <span class="word-translation">${item.translation}</span>
      </div>
    </div>
  `).join('');
  
  for (const word of newWords) {
    await db.saveWord({
      word: word.word,
      translation: word.translation,
      theme: 'daily',
      date: new Date().toISOString().split('T')[0]
    });
  }
  
  loadWords();
  checkAchievements();
  notifications.showToast('5 слов изучено!', 'success');
}

async function loadWords() {
  const words = await db.getAll('words');
  const container = document.getElementById('words-history');
  
  if (container && words.length > 0) {
    container.innerHTML = words.slice(-20).reverse().map(w => `
      <div class="word-history-item">
        <span class="word-history-word">${w.word}</span>
        <span class="word-history-translation">${w.translation}</span>
      </div>
    `).join('');
  }
}

// === ЖИЗНЕННЫЕ ПРИНЦИПЫ ===
async function addPrinciple() {
  const input = document.getElementById('principle-input');
  const text = input.value.trim();
  
  if (!text) {
    notifications.showToast('Введите текст принципа', 'warning');
    return;
  }
  
  await db.savePrinciple(text);
  input.value = '';
  await loadPrinciples();
  notifications.showToast('Принцип добавлен', 'success');
}

async function loadPrinciples() {
  const principles = await db.getPrinciples() || [];
  const list = document.getElementById('principles-list');
  
  if (!list) return;
  
  if (principles.length === 0) {
    list.innerHTML = '<p class="empty-state">Пока нет принципов</p>';
    return;
  }
  
  list.innerHTML = principles.map(p => `
    <div class="principle-item">
      <span class="principle-text">${p.text}</span>
      <button class="btn-delete" onclick="deletePrinciple('${p.id}')">&times;</button>
    </div>
  `).join('');
}

window.deletePrinciple = async function(id) {
  await db.deletePrinciple(id);
  await loadPrinciples();
};

// === КАЛЕНДАРЬ ЖИЗНИ ===
async function saveBirthDate() {
  const input = document.getElementById('birth-date-input');
  const birthDate = input.value;
  
  if (!birthDate) {
    notifications.showToast('Выберите дату', 'warning');
    return;
  }
  
  appState.userProfile.birthDate = birthDate;
  
  const profile = await db.get('users', 'current') || { id: 'current' };
  profile.birthDate = birthDate;
  await db.put('users', profile);
  
  // Сохраняем в локальное хранилище для быстрого доступа
  localStorage.setItem('userBirthDate', birthDate);
  
  await initLifeCalendar();
  notifications.showToast('Дата рождения сохранена', 'success');
}

async function initLifeCalendar() {
  const grid = document.getElementById('life-grid');
  if (!grid) return;
  
  // Получаем дату рождения из профиля или localStorage
  let birthDateStr = appState.userProfile.birthDate || localStorage.getItem('userBirthDate');
  
  let birthDate;
  if (birthDateStr) {
    birthDate = new Date(birthDateStr);
  } else {
    birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 25);
  }
  
  const now = new Date();
  const totalWeeks = 80 * 52; // 4160 недель до 80 лет
  const weeksInLife = Math.floor((now - birthDate) / (7 * 24 * 60 * 60 * 1000));
  const weeksLeft = Math.max(0, totalWeeks - weeksInLife);
  const lifePercent = Math.round((weeksInLife / totalWeeks) * 100);
  
  document.getElementById('weeks-lived').textContent = weeksInLife;
  document.getElementById('total-weeks').textContent = totalWeeks;
  document.getElementById('life-percent').textContent = lifePercent + '%';
  
  const ageYears = Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  document.getElementById('age-value').textContent = ageYears + ' лет';
  document.getElementById('weeks-value').textContent = weeksInLife;
  document.getElementById('weeks-left').textContent = weeksLeft;
  document.getElementById('birth-date-display').textContent = birthDate.toLocaleDateString('ru-RU');
  
  // Обновляем поле ввода
  const birthInput = document.getElementById('birth-date-input');
  if (birthInput) {
    birthInput.value = birthDateStr || '';
  }
  
  // Генерация сетки
  grid.innerHTML = '';
  for (let i = 0; i < totalWeeks; i++) {
    const week = document.createElement('div');
    week.className = 'life-week';
    
    if (i < weeksInLife) {
      week.classList.add('lived');
    } else if (i === weeksInLife) {
      week.classList.add('current');
    }
    
    grid.appendChild(week);
  }
}

// === ПРОФИЛЬ ===
async function loadProfile() {
  const profile = await db.get('users', 'current');
  
  if (profile) {
    appState.userProfile = {
      fullName: profile.fullName || '',
      birthDate: profile.birthDate || null,
      email: profile.email || 'user@example.com',
      avatar: profile.avatar || null
    };
  }
  
  document.getElementById('profile-name-display').textContent = appState.userProfile.fullName || 'Гость';
  document.getElementById('profile-email').textContent = appState.userProfile.email;
  
  if (appState.userProfile.avatar) {
    const img = document.getElementById('avatar-img');
    const emoji = document.getElementById('avatar-emoji');
    img.src = appState.userProfile.avatar;
    img.style.display = 'block';
    emoji.style.display = 'none';
  }
  
  updateProfileStats();
  
  if (appState.userProfile.birthDate) {
    initLifeCalendar();
  }
}

async function updateProfileStats() {
  const tasks = await db.getAll('daily_tasks');
  const words = await db.getAll('words');
  const focus = await db.getAll('focus_sessions');
  
  document.getElementById('total-tasks').textContent = tasks.filter(t => t.completed).length;
  document.getElementById('total-words').textContent = words.length;
  document.getElementById('focus-minutes').textContent = focus.reduce((sum, s) => sum + (s.duration || 0), 0);
}

async function saveProfile() {
  const fullName = document.getElementById('profile-fullname').value.trim();
  const birthDate = document.getElementById('profile-birthdate').value;
  const email = document.getElementById('profile-email-input').value.trim();
  
  appState.userProfile = {
    id: 'current',
    fullName,
    birthDate: birthDate || null,
    email: email || 'user@example.com'
  };
  
  await db.put('users', appState.userProfile);
  
  document.getElementById('profile-name-display').textContent = fullName;
  document.getElementById('profile-email').textContent = email;
  document.getElementById('profile-edit-form').style.display = 'none';
  
  if (birthDate) {
    initLifeCalendar();
  }
  
  notifications.showToast('Профиль сохранён', 'success');
}

function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (event) => {
    const base64 = event.target.result;
    appState.userProfile.avatar = base64;
    
    const img = document.getElementById('avatar-img');
    const emoji = document.getElementById('avatar-emoji');
    img.src = base64;
    img.style.display = 'block';
    emoji.style.display = 'none';
    
    await db.put('users', appState.userProfile);
    notifications.showToast('Аватар сохранён', 'success');
  };
  reader.readAsDataURL(file);
}

// === ДОСТИЖЕНИЯ ===
async function loadAchievements() {
  const achievements = await db.getAchievements();
  const unlockedTypes = achievements.map(a => a.achievement_type);
  
  // Получаем статистику
  const tasks = await db.getAll('daily_tasks');
  const completedTasks = tasks.filter(t => t.completed).length;
  
  const words = await db.getAll('words');
  
  const focus = await db.getAll('focus_sessions');
  const focusMinutes = focus.reduce((sum, s) => sum + (s.duration || 0), 0);
  
  const books = await db.getAll('books');
  const totalPages = books.reduce((sum, b) => sum + (b.pages_read || 0), 0);
  
  const gratitudes = await db.getAll('gratitude');
  
  // Водные дни (уникальные даты)
  const waterLogs = await db.getAll('water_log');
  const waterDays = new Set(waterLogs.map(w => w.date)).size;
  
  document.querySelectorAll('.achievement').forEach(el => {
    const type = el.dataset.achievement;
    const config = ACHIEVEMENTS[type];
    if (!config) return;
    
    const progressEl = el.querySelector('.progress-fill');
    const progressText = el.querySelector('.achievement-progress-text');
    
    let current = 0;
    switch (config.type) {
      case 'tasks': current = completedTasks; break;
      case 'water_days': current = waterDays; break;
      case 'focus_minutes': current = focusMinutes; break;
      case 'words': current = words.length; break;
      case 'pages': current = totalPages; break;
      case 'gratitudes': current = gratitudes.length; break;
    }
    
    const percent = Math.min((current / config.required) * 100, 100);
    progressEl.style.width = `${percent}%`;
    progressText.textContent = `${current}/${config.required}`;
    
    if (unlockedTypes.includes(type)) {
      el.classList.add('unlocked');
    }
  });
}

async function checkAchievements() {
  const tasks = await db.getAll('daily_tasks');
  const completedTasks = tasks.filter(t => t.completed).length;
  
  if (completedTasks >= 1) {
    await db.unlockAchievement('first-task');
  }
  if (completedTasks >= 10) {
    await db.unlockAchievement('task-master-10');
  }
  
  loadAchievements();
}

// === БАДЫ ===
async function addSupplement() {
  const nameInput = document.getElementById('supplement-name');
  const timeInput = document.getElementById('supplement-time');
  const daysInput = document.getElementById('supplement-days');
  
  const name = nameInput.value.trim();
  const time = timeInput.value || '09:00';
  const days = daysInput.value;
  
  if (!name) {
    notifications.showToast('Введите название', 'warning');
    return;
  }
  
  const supplement = {
    id: `supplement_${Date.now()}`,
    name,
    time,
    days: days ? days.split(',').map(d => parseInt(d.trim())).filter(d => d >= 1 && d <= 365) : [],
    taken_today: false,
    created_at: new Date().toISOString()
  };
  
  await db.saveSupplement(supplement);
  
  nameInput.value = '';
  timeInput.value = '';
  daysInput.value = '';
  
  await loadSupplements();
  notifications.showToast('Добавка добавлена', 'success');
}

async function loadSupplements() {
  const supplements = await db.getSupplements() || [];
  const tbody = document.getElementById('supplements-body');
  
  if (!tbody) return;
  
  if (supplements.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Нет добавок</td></tr>';
    return;
  }
  
  tbody.innerHTML = supplements.map(s => {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const isToday = s.days.length === 0 || s.days.includes(dayOfYear);
    
    return `
      <tr>
        <td>${s.name}</td>
        <td>${s.time}</td>
        <td>${s.days.length > 0 ? s.days.join(', ') : 'Ежедневно'}</td>
        <td>
          <input type="checkbox" class="supplement-check" data-id="${s.id}" ${s.taken_today ? 'checked' : ''}>
        </td>
        <td>
          <button class="btn-delete-sm" onclick="deleteSupplement('${s.id}')">&times;</button>
        </td>
      </tr>
    `;
  }).join('');
  
  tbody.querySelectorAll('.supplement-check').forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
      await db.toggleSupplement(checkbox.dataset.id);
    });
  });
}

window.deleteSupplement = async function(id) {
  await db.deleteSupplement(id);
  await loadSupplements();
};

// === БЛАГОДАРНОСТЬ ===
async function saveGratitude() {
  const input = document.getElementById('gratitude-input');
  const text = input.value.trim();
  
  if (!text) {
    notifications.showToast('Введите текст благодарности', 'warning');
    return;
  }
  
  await db.saveGratitude(text);
  input.value = '';
  await loadGratitudes();
  await checkAchievements();
  notifications.showToast('Благодарность сохранена', 'success');
}

async function loadGratitudes() {
  const gratitudes = await db.getGratitudes() || [];
  const container = document.getElementById('today-gratitudes');
  
  if (container) {
    container.innerHTML = gratitudes.map(g => `<div class="gratitude-item">${g.text}</div>`).join('');
  }
}

// === СИНХРОНИЗАЦИЯ ===
async function syncData() {
  const btn = document.getElementById('syncBtn');
  btn.classList.add('syncing');
  
  await db.syncWithServer();
  
  setTimeout(() => {
    btn.classList.remove('syncing');
    notifications.showToast('Данные синхронизированы', 'success');
  }, 1000);
}

// Глобальные функции
window.addBookPage = addBookPage;
window.setCurrentBook = setCurrentBook;
window.deletePrinciple = deletePrinciple;
window.deleteSupplement = deleteSupplement;
