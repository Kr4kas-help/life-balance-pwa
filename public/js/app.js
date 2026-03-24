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
  uploadedFile: null
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initEventListeners();
  loadProfile();
  loadTasks();
  loadHistory();
  loadGratitudes();
  loadSupplements();
  loadWords();
  loadAchievements();
  initLifeCalendar();
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
  
  // Обновляем навигацию
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });
  
  // Обновляем контент
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.dataset.tab === tabName);
  });
  
  // Перерисовываем календарь при переключении
  if (tabName === 'calendar') {
    initLifeCalendar();
  }
}

// Инициализация обработчиков
function initEventListeners() {
  // === ЗАДАЧИ ===
  // Сохранение задач
  document.getElementById('save-tasks-btn')?.addEventListener('click', saveTasks);
  
  // Чекбоксы задач
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
      updateHistory();
    });
  });
  
  // Книга
  document.getElementById('add-10-pages')?.addEventListener('click', addPages);
  
  // Разминка
  document.getElementById('start-exercise')?.addEventListener('click', toggleExerciseTimer);
  document.getElementById('reset-exercise')?.addEventListener('click', resetExerciseTimer);
  
  // Вода
  document.getElementById('add-water')?.addEventListener('click', addWater);
  
  // === ФОКУС ===
  // Быстрые таймеры
  document.querySelectorAll('.quick-timer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const minutes = parseInt(btn.dataset.minutes);
      setFocusTimer(minutes * 60);
    });
  });
  
  // Таймер фокуса
  document.getElementById('start-focus')?.addEventListener('click', toggleFocusTimer);
  document.getElementById('pause-focus')?.addEventListener('click', pauseFocusTimer);
  document.getElementById('reset-focus')?.addEventListener('click', resetFocusTimer);
  
  // DND
  document.getElementById('dnd-switch')?.addEventListener('change', toggleDND);
  
  // === ИЗУЧАТЬ ===
  // Загрузка файла
  document.getElementById('upload-file-btn')?.addEventListener('click', uploadFile);
  
  // Изучение слов
  document.getElementById('learn-words-btn')?.addEventListener('click', learnWords);
  
  // === ПРОФИЛЬ ===
  // Сохранение профиля
  document.getElementById('save-profile-btn')?.addEventListener('click', saveProfile);
  
  // Благодарность
  document.getElementById('save-gratitude')?.addEventListener('click', saveGratitude);
  
  // Бады
  document.getElementById('add-supplement')?.addEventListener('click', addSupplement);
  
  // Синхронизация
  document.getElementById('syncBtn')?.addEventListener('click', syncData);
}

// === ЗАДАЧИ ===
function saveTasks() {
  const tasks = [];
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`task-input-${i}`);
    const checkbox = document.querySelector(`.daily-task-check[data-task="${i}"]`);
    if (input && input.value.trim()) {
      tasks.push({
        id: `task_${new Date().toISOString().split('T')[0]}_${i}`,
        text: input.value.trim(),
        completed: checkbox?.checked || false,
        date: new Date().toISOString().split('T')[0]
      });
    }
  }
  
  tasks.forEach(task => db.put('daily_tasks', task));
  updateHistory();
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
  
  updateHistory();
}

async function updateHistory() {
  const today = new Date().toISOString().split('T')[0];
  const tasks = await db.getByIndex('daily_tasks', 'date', today);
  const completedToday = tasks.filter(t => t.completed).length;
  
  // За неделю
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekTasks = await db.getAll('daily_tasks');
  const completedWeek = weekTasks.filter(t => {
    const taskDate = new Date(t.date);
    return taskDate >= weekAgo && t.completed;
  }).length;
  
  const total = tasks.length || 3;
  const rate = Math.round((completedToday / total) * 100);
  
  document.getElementById('completed-today').textContent = completedToday;
  document.getElementById('completed-week').textContent = completedWeek;
  document.getElementById('completion-rate').textContent = `${rate}%`;
  
  // История по дням
  const historyList = document.getElementById('history-list');
  if (historyList) {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = await db.getByIndex('daily_tasks', 'date', dateStr);
      const completed = dayTasks.filter(t => t.completed).length;
      last7Days.push({ date: dateStr, completed, total: dayTasks.length || 3 });
    }
    
    historyList.innerHTML = last7Days.map(day => `
      <div class="history-item">
        <span class="history-date">${formatDate(day.date)}</span>
        <span class="history-completed">${day.completed}/${day.total}</span>
      </div>
    `).join('');
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { weekday: 'short', day: 'numeric' };
  return date.toLocaleDateString('ru-RU', options);
}

function addPages() {
  const bookTitle = document.getElementById('book-title').value || 'Текущая книга';
  const pagesEl = document.getElementById('pages-today');
  const current = parseInt(pagesEl.textContent) || 0;
  pagesEl.textContent = current + 10;
  notifications.showToast('+10 страниц', 'success');
}

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
    
    let remaining = 60 * 60; // 1 час по умолчанию
    
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
  
  // Берём 5 случайных слов из разных категорий
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
  
  // Сохраняем слова
  for (const word of newWords) {
    await db.saveWord({
      word: word.word,
      translation: word.translation,
      theme: 'daily',
      date: new Date().toISOString().split('T')[0]
    });
  }
  
  loadWords();
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

// === КАЛЕНДАРЬ ЖИЗНИ ===
function initLifeCalendar() {
  const grid = document.getElementById('life-grid');
  if (!grid) return;
  
  // Дата рождения (примерная - 25 лет назад)
  const birthDate = new Date();
  birthDate.setFullYear(birthDate.getFullYear() - 25);
  
  const now = new Date();
  const weeksInLife = Math.floor((now - birthDate) / (7 * 24 * 60 * 60 * 1000));
  const totalWeeks = 4000;
  
  document.getElementById('weeks-lived').textContent = weeksInLife;
  document.getElementById('life-percent').textContent = Math.round((weeksInLife / totalWeeks) * 100) + '%';
  document.getElementById('age-value').textContent = Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000)) + ' лет';
  document.getElementById('weeks-value').textContent = weeksInLife;
  document.getElementById('weeks-left').textContent = totalWeeks - weeksInLife;
  
  // Генерация сетки (показываем по 52 недели в строке = 1 год)
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
  const profile = await db.get('users', 'current') || { name: '', email: 'user@example.com' };
  
  document.getElementById('profile-name').value = profile.name || '';
  document.getElementById('profile-email').textContent = profile.email;
  
  // Статистика
  const tasks = await db.getAll('daily_tasks');
  const words = await db.getAll('words');
  const focus = await db.getAll('focus_sessions');
  
  document.getElementById('total-tasks').textContent = tasks.filter(t => t.completed).length;
  document.getElementById('total-words').textContent = words.length;
  document.getElementById('focus-minutes').textContent = focus.reduce((sum, s) => sum + (s.duration || 0), 0);
}

function saveProfile() {
  const name = document.getElementById('profile-name').value.trim();
  const email = document.getElementById('profile-email').textContent;
  
  db.put('users', { id: 'current', name, email });
  notifications.showToast('Профиль сохранён', 'success');
}

async function saveGratitude() {
  const input = document.getElementById('gratitude-input');
  const text = input.value.trim();
  
  if (!text) return;
  
  await db.saveGratitude(text);
  input.value = '';
  loadGratitudes();
  notifications.showToast('Благодарность сохранена', 'success');
}

async function loadGratitudes() {
  const gratitudes = await db.getGratitudes();
  const container = document.getElementById('today-gratitudes');
  
  if (container) {
    container.innerHTML = gratitudes.map(g => `<div class="gratitude-item">${g.text}</div>`).join('');
  }
}

async function addSupplement() {
  const input = document.getElementById('supplement-name');
  const name = input.value.trim();
  
  if (!name) return;
  
  await db.saveSupplement(name);
  input.value = '';
  loadSupplements();
  notifications.showToast('Добавка добавлена', 'success');
}

async function loadSupplements() {
  const supplements = await db.getSupplements();
  const tbody = document.getElementById('supplements-body');
  
  if (tbody) {
    tbody.innerHTML = supplements.map(s => `
      <tr>
        <td>${s.name}</td>
        <td>
          <input type="checkbox" class="supplement-check" data-id="${s.id}" ${s.taken_today ? 'checked' : ''}>
        </td>
      </tr>
    `).join('');
    
    tbody.querySelectorAll('.supplement-check').forEach(checkbox => {
      checkbox.addEventListener('change', async () => {
        await db.toggleSupplement(checkbox.dataset.id);
      });
    });
  }
}

async function loadAchievements() {
  const achievements = await db.getAchievements();
  const unlockedTypes = achievements.map(a => a.achievement_type);
  
  document.querySelectorAll('.achievement').forEach(el => {
    const type = el.dataset.achievement;
    if (unlockedTypes.includes(type)) {
      el.classList.add('unlocked');
    }
  });
}

async function syncData() {
  const btn = document.getElementById('syncBtn');
  btn.classList.add('syncing');
  
  await db.syncWithServer();
  
  setTimeout(() => {
    btn.classList.remove('syncing');
    notifications.showToast('Данные синхронизированы', 'success');
  }, 1000);
}
