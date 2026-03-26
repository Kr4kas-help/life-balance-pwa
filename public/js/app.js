// app.js - Основная логика приложения
console.log('[APP] Loading app.js...');

// Проверка авторизации
function getUserId() {
  if (typeof authState !== 'undefined' && authState.user) {
    return authState.user.id;
  }
  return null;
}

function isLoggedIn() {
  return typeof authState !== 'undefined' && (authState.user !== null || authState.isGuest);
}

// Синхронизация с Supabase
async function syncWithSupabase(table, data, operation = 'upsert') {
  if (!supabase) {
    console.log('[APP] Supabase not available');
    return;
  }
  
  const userId = getUserId();
  if (!userId) {
    console.log('[APP] No user logged in');
    return;
  }
  
  try {
    if (operation === 'insert') {
      const { error } = await supabase.from(table).insert(data);
      if (error) throw error;
    } else if (operation === 'upsert') {
      const { error } = await supabase.from(table).upsert(data);
      if (error) throw error;
    }
    console.log('[APP] Synced to Supabase:', table);
  } catch (e) {
    console.error('[APP] Supabase sync error:', e);
  }
}

// Словари для изучения - встроенные + из URL
let customWords = []; // Слова из URL

async function loadCustomWords() {
  const url = localStorage.getItem('termsUrl');
  if (!url) return [];
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    const lines = text.split('\n');
    const words = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      let parts = trimmed.split(/\s*[-–—:]\s*/);
      if (parts.length >= 2) {
        words.push({
          word: parts[0].trim(),
          translation: parts.slice(1).join(' ').trim()
        });
      }
    }
    
    customWords = words;
    console.log('[APP] Загружено слов из URL:', customWords.length);
    return words;
  } catch (e) {
    console.error('[APP] Ошибка загрузки URL:', e);
    return [];
  }
}

async function saveTermsUrl() {
  const input = document.getElementById('terms-url');
  const url = input?.value.trim();
  
  if (!url) {
    notifications.showToast('Введите URL', 'warning');
    return;
  }
  
  localStorage.setItem('termsUrl', url);
  
  const urlInfo = document.getElementById('url-info');
  const currentUrl = document.getElementById('current-url');
  
  if (urlInfo) urlInfo.style.display = 'block';
  if (currentUrl) currentUrl.textContent = url;
  
  await loadCustomWords();
  notifications.showToast('URL сохранён', 'success');
}

async function loadTermsUrl() {
  const url = localStorage.getItem('termsUrl');
  const urlInfo = document.getElementById('url-info');
  const currentUrl = document.getElementById('current-url');
  const input = document.getElementById('terms-url');
  
  if (url && urlInfo && currentUrl) {
    urlInfo.style.display = 'block';
    currentUrl.textContent = url;
    if (input) input.value = url;
    await loadCustomWords();
  }
}

// Встроенные словари
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
  console.log('[APP] DOMContentLoaded');
  
  // Сначала инициализируем авторизацию
  if (typeof initAuth !== 'undefined') {
    console.log('[APP] Calling initAuth...');
    // Вызываем сразу, initAuth сам проверит готовность DOM
    initAuth();
  } else {
    console.warn('[APP] initAuth not found!');
  }

  // Ждём инициализации БД
  if (typeof db !== 'undefined' && db.ready) {
    await db.ready;
    console.log('[APP] Database ready');
  }
  
  // Регистрация Service Worker с обновлением
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[APP] Service Worker зарегистрирован:', registration.scope);
    } catch (e) {
      console.error('[APP] SW registration failed:', e);
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
  await loadGratitudeCalendar();
  await loadSupplements();
  await loadWords();
  await loadPrinciples();
  await loadAchievements();
  await loadBooks();
  await loadContacts();
  await loadWaterProgress();
  await loadTermsUrl();
  await initLifeCalendar();
  notifications.scheduleWaterReminder();
  
  console.log('[APP] Initialization complete');
});

// Навигация
function initNavigation() {
  console.log('[APP] initNavigation');
  const navItems = document.querySelectorAll('.nav-item');
  console.log('[APP] Nav items found:', navItems.length);
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      console.log('[APP] Switching to tab:', tab);
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
    setTimeout(() => initLifeCalendar(), 100);
  }
}

// Модальное окно
function initModal() {
  const closeBtn = document.getElementById('modal-close-btn');
  const modal = document.getElementById('day-tasks-modal');
  const contactClose = document.getElementById('contact-modal-close');
  const contactModal = document.getElementById('contact-modal');
  
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
  
  if (contactClose && contactModal) {
    contactClose.addEventListener('click', () => {
      contactModal.style.display = 'none';
    });
    
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        contactModal.style.display = 'none';
      }
    });
  }
}

// Инициализация обработчиков
function initEventListeners() {
  console.log('[APP] initEventListeners');
  
  // === ЗАДАЧИ ===
  const saveTasksBtn = document.getElementById('save-tasks-btn');
  console.log('[APP] save-tasks-btn found:', !!saveTasksBtn);
  if (saveTasksBtn) {
    saveTasksBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('[APP] Save tasks clicked');
      await saveTasks();
    });
  }

  document.querySelectorAll('.daily-task-check').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const taskId = e.target.dataset.task;
      const input = document.getElementById(`task-input-${taskId}`);
      const taskData = {
        id: `task_${new Date().toISOString().split('T')[0]}_${taskId}`,
        text: input?.value || `Задача ${taskId}`,
        completed: e.target.checked,
        date: new Date().toISOString().split('T')[0]
      };
      console.log('[APP] Task changed:', taskData);
      await db.put('daily_tasks', taskData);
      await loadTasksCalendar();
      await checkAchievements();
    });
  });

  // Книги
  const addBookBtn = document.getElementById('add-book-btn');
  if (addBookBtn) {
    addBookBtn.addEventListener('click', () => {
      document.getElementById('book-form').style.display = 'block';
    });
  }
  
  const saveBookBtn = document.getElementById('save-book-btn');
  if (saveBookBtn) {
    saveBookBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await saveBook();
    });
  }
  
  const cancelBookBtn = document.getElementById('cancel-book-btn');
  if (cancelBookBtn) {
    cancelBookBtn.addEventListener('click', () => {
      document.getElementById('book-form').style.display = 'none';
    });
  }

  // Разминка
  const startExerciseBtn = document.getElementById('start-exercise');
  if (startExerciseBtn) {
    startExerciseBtn.addEventListener('click', toggleExerciseTimer);
  }
  const resetExerciseBtn = document.getElementById('reset-exercise');
  if (resetExerciseBtn) {
    resetExerciseBtn.addEventListener('click', resetExerciseTimer);
  }

  // Вода
  const addWaterBtn = document.getElementById('add-water');
  if (addWaterBtn) {
    addWaterBtn.addEventListener('click', () => addWater('day'));
  }
  
  // Вода утро/день/вечер
  const waterMorning = document.getElementById('add-water-morning');
  if (waterMorning) {
    waterMorning.addEventListener('click', () => addWater('morning'));
  }
  const waterDay = document.getElementById('add-water-day');
  if (waterDay) {
    waterDay.addEventListener('click', () => addWater('day'));
  }
  const waterEvening = document.getElementById('add-water-evening');
  if (waterEvening) {
    waterEvening.addEventListener('click', () => addWater('evening'));
  }

  // === ФОКУС ===
  document.querySelectorAll('.quick-timer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const minutes = parseInt(btn.dataset.minutes);
      setFocusTimer(minutes * 60);
    });
  });

  const startFocusBtn = document.getElementById('start-focus');
  if (startFocusBtn) startFocusBtn.addEventListener('click', toggleFocusTimer);
  const pauseFocusBtn = document.getElementById('pause-focus');
  if (pauseFocusBtn) pauseFocusBtn.addEventListener('click', pauseFocusTimer);
  const resetFocusBtn = document.getElementById('reset-focus');
  if (resetFocusBtn) resetFocusBtn.addEventListener('click', resetFocusTimer);

  const dndSwitch = document.getElementById('dnd-switch');
  if (dndSwitch) dndSwitch.addEventListener('change', toggleDND);

  // === ИЗУЧАТЬ ===
  // URL терминов
  const saveTermsUrlBtn = document.getElementById('save-terms-url-btn');
  if (saveTermsUrlBtn) {
    saveTermsUrlBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await saveTermsUrl();
    });
  }
  
  const learnWordsBtn = document.getElementById('learn-words-btn');
  if (learnWordsBtn) learnWordsBtn.addEventListener('click', learnWords);

  // Принципы
  const addPrincipleBtn = document.getElementById('add-principle-btn');
  if (addPrincipleBtn) {
    addPrincipleBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await addPrinciple();
    });
  }

  // === КАЛЕНДАРЬ ===
  const saveBirthDateBtn = document.getElementById('save-birth-date');
  if (saveBirthDateBtn) {
    saveBirthDateBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await saveBirthDate();
    });
  }

  // === ПРОФИЛЬ ===
  const editProfileBtn = document.getElementById('edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      document.getElementById('profile-edit-form').style.display = 'block';
      document.getElementById('profile-fullname').value = appState.userProfile.fullName;
      document.getElementById('profile-birthdate').value = appState.userProfile.birthDate || '';
      document.getElementById('profile-email-input').value = appState.userProfile.email;
    });
  }

  const saveProfileBtn = document.getElementById('save-profile-btn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await saveProfile();
    });
  }
  
  const cancelProfileBtn = document.getElementById('cancel-profile-btn');
  if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener('click', () => {
      document.getElementById('profile-edit-form').style.display = 'none';
    });
  }

  // Аватар
  const avatarUpload = document.getElementById('avatar-upload');
  if (avatarUpload) {
    avatarUpload.addEventListener('change', handleAvatarUpload);
  }

  const saveGratitudeBtn = document.getElementById('save-gratitude');
  if (saveGratitudeBtn) {
    saveGratitudeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await saveGratitude();
    });
  }
  
  const addSupplementBtn = document.getElementById('add-supplement');
  if (addSupplementBtn) {
    addSupplementBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await addSupplement();
    });
  }

  const syncBtn = document.getElementById('syncBtn');
  if (syncBtn) {
    syncBtn.addEventListener('click', syncData);
  }

  // Делегирование событий для чекбоксов добавок
  const supplementsBody = document.getElementById('supplements-body');
  if (supplementsBody) {
    supplementsBody.addEventListener('change', async (e) => {
      if (e.target.classList.contains('supplement-check')) {
        await db.toggleSupplement(e.target.dataset.id);
        await loadSupplements();
      }
    });
  }

  // === КОНТАКТЫ ===
  const addContactBtn = document.getElementById('add-contact-btn');
  if (addContactBtn) {
    addContactBtn.addEventListener('click', () => {
      document.getElementById('contact-form').style.display = 'block';
      contactPhotoBase64 = null;
      updateContactPhotoPreview();
    });
  }
  
  // Фото контакта
  const contactPhoto = document.getElementById('contact-photo');
  if (contactPhoto) {
    contactPhoto.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          contactPhotoBase64 = event.target.result;
          updateContactPhotoPreview();
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  const contactPhotoBtn = document.getElementById('contact-photo-btn');
  if (contactPhotoBtn) {
    contactPhotoBtn.addEventListener('click', () => {
      document.getElementById('contact-photo').click();
    });
  }
  
  const saveContactBtn = document.getElementById('save-contact-btn');
  if (saveContactBtn) {
    saveContactBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await saveContact();
    });
  }
  
  const cancelContactBtn = document.getElementById('cancel-contact-btn');
  if (cancelContactBtn) {
    cancelContactBtn.addEventListener('click', () => {
      document.getElementById('contact-form').style.display = 'none';
      contactPhotoBase64 = null;
      updateContactPhotoPreview();
    });
  }
  
  const contactSearch = document.getElementById('contact-search');
  if (contactSearch) {
    contactSearch.addEventListener('input', searchContacts);
  }
  
  // Модальные окна
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const dayTasksModal = document.getElementById('day-tasks-modal');
  if (modalCloseBtn && dayTasksModal) {
    modalCloseBtn.addEventListener('click', () => {
      dayTasksModal.style.display = 'none';
    });
  }
  
  const contactModalClose = document.getElementById('contact-modal-close');
  const contactModal = document.getElementById('contact-modal');
  if (contactModalClose && contactModal) {
    contactModalClose.addEventListener('click', () => {
      contactModal.style.display = 'none';
    });
  }
  
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
  
  console.log('[APP] Event listeners initialized');
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
  const streakEl = document.getElementById('streak-count');
  if (streakEl) streakEl.textContent = streak;
}

// === ЗАДАЧИ ===
async function saveTasks() {
  console.log('[APP] saveTasks called');
  const today = new Date().toISOString().split('T')[0];
  const userId = getUserId();
  
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`task-input-${i}`);
    const checkbox = document.querySelector(`.daily-task-check[data-task="${i}"]`);
    if (input && input.value.trim()) {
      const taskData = {
        id: `task_${today}_${i}`,
        user_id: userId,
        text: input.value.trim(),
        completed: checkbox?.checked || false,
        date: today
      };
      
      // Сохраняем локально
      await db.put('daily_tasks', taskData);
      
      // Синхронизируем с Supabase если вошли
      if (userId && supabase) {
        await syncWithSupabase('daily_tasks', taskData);
      }
    }
  }
  
  await loadTasksCalendar();
  await checkAchievements();
  notifications.showToast('Задачи сохранены', 'success');
}

async function loadTasks() {
  console.log('[APP] loadTasks called');
  const today = new Date().toISOString().split('T')[0];
  const tasks = await db.getByIndex('daily_tasks', 'date', today);
  console.log('[APP] Loaded tasks:', tasks);
  
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
  
  const elToday = document.getElementById('completed-today');
  const elWeek = document.getElementById('completed-week');
  const elRate = document.getElementById('completion-rate');
  if (elToday) elToday.textContent = completedToday;
  if (elWeek) elWeek.textContent = completedWeek;
  if (elRate) elRate.textContent = `${rate}%`;
}

// === КАЛЕНДАРЬ ЗАДАЧ ===
async function loadTasksCalendar() {
  console.log('[APP] loadTasksCalendar called');
  const calendar = document.getElementById('tasks-calendar');
  if (!calendar) {
    console.log('[APP] tasks-calendar element not found');
    return;
  }
  
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay() || 7;
  
  const allTasks = await db.getAll('daily_tasks');
  console.log('[APP] All tasks for calendar:', allTasks);
  
  const monthTasks = allTasks.filter(t => {
    const taskDate = new Date(t.date);
    return taskDate.getMonth() === month && taskDate.getFullYear() === year;
  });
  
  const tasksByDay = {};
  monthTasks.forEach(task => {
    const day = new Date(task.date).getDate();
    if (!tasksByDay[day]) tasksByDay[day] = [];
    tasksByDay[day].push(task);
  });
  
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
  
  for (let i = 1; i < startDay; i++) {
    html += '<div class="calendar-day-empty"></div>';
  }
  
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
  console.log('[APP] Calendar rendered');
  
  calendar.querySelectorAll('.calendar-day').forEach(el => {
    el.addEventListener('click', () => {
      const date = el.dataset.date;
      const dayNum = new Date(date).getDate();
      const dayTasks = tasksByDay[dayNum] || [];
      openDayTasksModal(date, dayTasks);
    });
  });
  
  await updateStats();
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

function formatDateFull(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// === КНИГИ ===
async function saveBook() {
  console.log('[APP] saveBook called');
  const titleInput = document.getElementById('book-title-input');
  const pagesInput = document.getElementById('book-total-pages');
  
  const title = titleInput?.value.trim();
  const totalPages = parseInt(pagesInput?.value) || 0;
  
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
  
  if (titleInput) titleInput.value = '';
  if (pagesInput) pagesInput.value = '';
  document.getElementById('book-form').style.display = 'none';
  
  await loadBooks();
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
        <div class="book-header">
          <div class="book-info">
            <span class="book-title">${book.title}</span>
            <span class="book-pages">${book.pages_read} / ${book.total_pages} стр.</span>
          </div>
          <div class="book-menu">
            <button class="book-menu-btn" onclick="toggleBookMenu('${book.id}')">⋮</button>
            <div class="book-menu-dropdown" id="book-menu-${book.id}">
              <button class="book-menu-item" onclick="deleteBook('${book.id}')">🗑️ Удалить</button>
            </div>
          </div>
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

window.toggleBookMenu = function(bookId) {
  const menu = document.getElementById(`book-menu-${bookId}`);
  if (menu) {
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
};

window.deleteBook = async function(bookId) {
  if (confirm('Вы уверены что хотите удалить эту книгу?')) {
    await db.delete('books', bookId);
    await loadBooks();
    notifications.showToast('Книга удалена', 'success');
  }
  // Закрыть все меню
  document.querySelectorAll('.book-menu-dropdown').forEach(m => m.style.display = 'none');
};

// Закрыть меню при клике вне
document.addEventListener('click', (e) => {
  if (!e.target.closest('.book-menu')) {
    document.querySelectorAll('.book-menu-dropdown').forEach(m => m.style.display = 'none');
  }
});

window.addBookPage = async function(bookId) {
  const books = await db.getAll('books') || [];
  const book = books.find(b => b.id === bookId);
  
  if (book) {
    book.pages_read += 10;
    await db.put('books', book);
    
    if (book.is_current) {
      appState.currentBook = book;
    }
    
    await loadBooks();
    notifications.showToast('+10 страниц', 'success');
    await checkAchievements();
  }
};

window.setCurrentBook = async function(bookId) {
  const books = await db.getAll('books') || [];
  
  for (const b of books) {
    b.is_current = b.id === bookId;
    await db.put('books', b);
  }
  
  await loadBooks();
  notifications.showToast('Книга выбрана текущей', 'success');
};

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

// Вода с разделением на утро/день/вечер - 1500мл всего (500мл на период, 2 клика по 250мл)
const waterState = {
  morning: 0,
  day: 0,
  evening: 0
};

async function loadWaterProgress() {
  const today = new Date().toISOString().split('T')[0];
  const logs = await db.getByIndex('water_log', 'date', today) || [];
  
  waterState.morning = logs.filter(l => l.period === 'morning').reduce((sum, l) => sum + l.amount, 0);
  waterState.day = logs.filter(l => l.period === 'day').reduce((sum, l) => sum + l.amount, 0);
  waterState.evening = logs.filter(l => l.period === 'evening').reduce((sum, l) => sum + l.amount, 0);
  
  const total = waterState.morning + waterState.day + waterState.evening;
  const goal = 1500;
  
  // Обновляем стаканы для каждого периода
  updateWaterGlass('morning', waterState.morning, 500);
  updateWaterGlass('day', waterState.day, 500);
  updateWaterGlass('evening', waterState.evening, 500);
  
  // Обновляем summary
  const waterCount = document.getElementById('water-count');
  const waterTotalBar = document.getElementById('water-total-bar');
  
  if (waterCount) waterCount.textContent = `${total}/${goal} мл`;
  
  // Обновляем общий прогресс бар
  if (waterTotalBar) {
    const percent = Math.min((total / goal) * 100, 100);
    waterTotalBar.style.width = `${percent}%`;
  }
}

function updateWaterGlass(period, current, max) {
  const level = document.getElementById(`water-level-${period}`);
  const count = document.getElementById(`water-count-${period}`);
  const btn = document.getElementById(`add-water-${period}`);
  
  const percent = Math.min((current / max) * 100, 100);
  
  if (level) level.style.height = `${percent}%`;
  if (count) count.textContent = `${current}/${max} мл`;
  
  // Блокируем кнопку если достигнут лимит (2 клика = 500мл)
  if (btn) {
    if (current >= max) {
      btn.disabled = true;
      btn.textContent = '✓';
    } else {
      btn.disabled = false;
      btn.textContent = '+250мл';
    }
  }
}

async function addWater(period) {
  const amount = 250;
  const maxPerPeriod = 500;
  
  // Проверяем лимит
  if (waterState[period] >= maxPerPeriod) {
    notifications.showToast('Лимит на этот период достигнут!', 'warning');
    return;
  }
  
  const log = {
    id: `water_${Date.now()}`,
    amount,
    period,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toISOString()
  };
  
  await db.add('water_log', log);
  await loadWaterProgress();
  
  const labels = { morning: '🌅 Утро', day: '☀️ День', evening: '🌙 Вечер' };
  notifications.showToast(`${labels[period]} +${amount}мл`, 'success');
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
  const sessionCount = document.getElementById('session-count');
  if (sessionCount) sessionCount.textContent = appState.sessionsToday;
  
  await db.saveFocusSession(25);
  notifications.showToast('Сессия фокуса завершена!', 'success');
  notifications.playSound('complete');
  
  appState.focusTime = 25 * 60;
  updateTimerDisplay('focus-time', appState.focusTime);
  await checkAchievements();
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
  
  if (fileInput?.files && fileInput.files[0]) {
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
  const progressContainer = document.getElementById('words-progress-container');
  
  // Получаем уже изученные слова сегодня
  const today = new Date().toISOString().split('T')[0];
  const allWords = await db.getAll('words_learned') || [];
  const todayLearned = allWords.filter(w => w.date === today);
  
  const learnedCount = todayLearned.length;
  
  // Обновляем прогресс при загрузке
  if (progressContainer) {
    progressContainer.style.display = 'block';
    updateWordsProgress(learnedCount, 5);
  }
  
  if (learnedCount >= 5) {
    container.innerHTML = '<p class="empty-state">Лимит слов на сегодня исчерпан</p>';
    return;
  }
  
  // Получаем все слова из словарей
  const allDictionaryWords = Object.values(WORD_DICTIONARIES).flat();
  const learnedWordsToday = todayLearned.map(w => w.word);
  const availableWords = allDictionaryWords.filter(w => !learnedWordsToday.includes(w.word));
  
  if (availableWords.length === 0) {
    container.innerHTML = '<p class="empty-state">Все слова изучены! Завтра будут новые.</p>';
    return;
  }
  
  // Берём 5 случайных слов из доступных (или меньше если осталось)
  const remaining = 5 - learnedCount;
  const shuffled = availableWords.sort(() => 0.5 - Math.random());
  const newWords = shuffled.slice(0, remaining);
  
  appState.wordsToday = newWords.map(w => ({ ...w, learned: false }));
  
  container.innerHTML = newWords.map((item, index) => `
    <div class="word-card-day">
      <label class="checkbox-container word-checkbox">
        <input type="checkbox" class="word-check" data-index="${index}" data-word="${item.word}">
        <span class="checkmark"></span>
      </label>
      <div class="word-info">
        <span class="word-number">${index + 1}.</span>
        <span class="word-text">${item.word}</span>
        <span class="word-translation">${item.translation}</span>
      </div>
    </div>
  `).join('');
  
  // Обработчики чекбоксов
  container.querySelectorAll('.word-check').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const index = e.target.dataset.index;
      const word = appState.wordsToday[index];
      
      if (e.target.checked && !word.learned) {
        word.learned = true;

        // Сохраняем слово в базу
        const userId = getUserId();
        const wordData = {
          id: `word_${Date.now()}_${Math.random()}`,
          user_id: userId,
          word: word.word,
          translation: word.translation,
          theme: 'daily',
          date: today,
          learned: true
        };

        await db.add('words_learned', wordData);
        
        // Синхронизируем с Supabase
        if (userId && supabase) {
          await syncWithSupabase('words_learned', wordData, 'insert');
        }

        // Обновляем прогресс
        const newLearnedCount = learnedCount + container.querySelectorAll('.word-check:checked').length;
        updateWordsProgress(newLearnedCount, 5);
        
        await loadWords();
        await checkAchievements();
        notifications.showToast('Слово добавлено в историю!', 'success');
        
        // Если достигли лимита - обновляем UI
        if (newLearnedCount >= 5) {
          setTimeout(() => learnWords(), 500);
        }
      }
    });
  });
  
  notifications.showToast('5 слов готово к изучению!', 'success');
}

function updateWordsProgress(current, total) {
  const progressBar = document.getElementById('words-progress-bar');
  const progressText = document.getElementById('words-progress-text');
  
  if (!progressBar || !progressText) return;
  
  const percent = Math.min((current / total) * 100, 100);
  progressBar.style.width = `${percent}%`;
  
  // Градиент от красного к зеленому
  const hue = (percent / 100) * 120;
  progressBar.style.background = `linear-gradient(90deg, 
    hsl(0, 70%, 50%) 0%, 
    hsl(${hue * 0.5}, 70%, 50%) ${percent * 0.5}%, 
    hsl(${hue}, 70%, 50%) ${percent}%,
    hsl(${hue}, 70%, 50%) 100%)`;
  
  progressText.textContent = `${current}/${total} слов`;
}

async function loadWords() {
  const words = await db.getAll('words_learned') || [];
  const container = document.getElementById('words-history-container');

  if (!container) return;
  
  if (words.length === 0) {
    container.innerHTML = '<p class="empty-state">Пока нет изученных слов</p>';
    return;
  }

  container.innerHTML = `
    <div class="words-history-scroll">
      ${words.slice(-50).reverse().map(w => `
        <div class="word-history-item">
          <span class="word-history-word">${w.word}</span>
          <span class="word-history-translation">${w.translation}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// === ЖИЗНЕННЫЕ ПРИНЦИПЫ ===
async function addPrinciple() {
  console.log('[APP] addPrinciple called');
  const input = document.getElementById('principle-input');
  const text = input?.value.trim();

  if (!text) {
    notifications.showToast('Введите текст принципа', 'warning');
    return;
  }

  console.log('[APP] Saving principle:', text);
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
      <div class="principle-menu">
        <button class="principle-menu-btn" onclick="togglePrincipleMenu('${p.id}')">⋮</button>
        <div class="principle-menu-dropdown" id="principle-menu-${p.id}">
          <button class="principle-menu-item" onclick="deletePrinciple('${p.id}')">🗑️ Удалить</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.togglePrincipleMenu = function(id) {
  const menu = document.getElementById(`principle-menu-${id}`);
  if (menu) {
    // Закрыть все остальные меню
    document.querySelectorAll('.principle-menu-dropdown').forEach(m => {
      if (m.id !== `principle-menu-${id}`) m.style.display = 'none';
    });
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
  }
};

window.deletePrinciple = async function(id) {
  await db.deletePrinciple(id);
  await loadPrinciples();
  // Закрыть все меню
  document.querySelectorAll('.principle-menu-dropdown').forEach(m => m.style.display = 'none');
};

// Закрыть меню при клике вне
document.addEventListener('click', (e) => {
  if (!e.target.closest('.principle-menu')) {
    document.querySelectorAll('.principle-menu-dropdown').forEach(m => m.style.display = 'none');
  }
});

// === КАЛЕНДАРЬ ЖИЗНИ ===
async function saveBirthDate() {
  const input = document.getElementById('birth-date-input');
  const birthDate = input?.value;
  
  if (!birthDate) {
    notifications.showToast('Выберите дату', 'warning');
    return;
  }
  
  appState.userProfile.birthDate = birthDate;
  
  const profile = await db.get('users', 'current') || { id: 'current' };
  profile.birthDate = birthDate;
  await db.put('users', profile);
  
  localStorage.setItem('userBirthDate', birthDate);
  
  await initLifeCalendar();
  notifications.showToast('Дата рождения сохранена', 'success');
}

async function initLifeCalendar() {
  const grid = document.getElementById('life-grid');
  if (!grid) return;
  
  let birthDateStr = appState.userProfile.birthDate || localStorage.getItem('userBirthDate');
  
  let birthDate;
  if (birthDateStr) {
    birthDate = new Date(birthDateStr);
  } else {
    birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 25);
  }
  
  const now = new Date();
  const totalWeeks = 80 * 52;
  const weeksInLife = Math.floor((now - birthDate) / (7 * 24 * 60 * 60 * 1000));
  const weeksLeft = Math.max(0, totalWeeks - weeksInLife);
  const lifePercent = Math.round((weeksInLife / totalWeeks) * 100);
  
  const elWeeksLived = document.getElementById('weeks-lived');
  const elTotalWeeks = document.getElementById('total-weeks');
  const elLifePercent = document.getElementById('life-percent');
  const elAge = document.getElementById('age-value');
  const elWeeksValue = document.getElementById('weeks-value');
  const elWeeksLeft = document.getElementById('weeks-left');
  const elBirthDate = document.getElementById('birth-date-display');
  
  if (elWeeksLived) elWeeksLived.textContent = weeksInLife;
  if (elTotalWeeks) elTotalWeeks.textContent = totalWeeks;
  if (elLifePercent) elLifePercent.textContent = lifePercent + '%';
  
  const ageYears = Math.floor((now - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  if (elAge) elAge.textContent = ageYears + ' лет';
  if (elWeeksValue) elWeeksValue.textContent = weeksInLife;
  if (elWeeksLeft) elWeeksLeft.textContent = weeksLeft;
  if (elBirthDate) elBirthDate.textContent = birthDate.toLocaleDateString('ru-RU');
  
  const birthInput = document.getElementById('birth-date-input');
  if (birthInput) {
    birthInput.value = birthDateStr || '';
  }
  
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
  
  const nameDisplay = document.getElementById('profile-name-display');
  const emailDisplay = document.getElementById('profile-email');
  
  if (nameDisplay) nameDisplay.textContent = appState.userProfile.fullName || 'Гость';
  if (emailDisplay) emailDisplay.textContent = appState.userProfile.email;
  
  if (appState.userProfile.avatar) {
    const img = document.getElementById('avatar-img');
    const emoji = document.getElementById('avatar-emoji');
    if (img) {
      img.src = appState.userProfile.avatar;
      img.style.display = 'block';
    }
    if (emoji) emoji.style.display = 'none';
  }
  
  await updateProfileStats();
  
  if (appState.userProfile.birthDate) {
    await initLifeCalendar();
  }
}

async function updateProfileStats() {
  const tasks = await db.getAll('daily_tasks');
  const words = await db.getAll('words');
  const focus = await db.getAll('focus_sessions');
  
  const elTasks = document.getElementById('total-tasks');
  const elWords = document.getElementById('total-words');
  const elFocus = document.getElementById('focus-minutes');
  
  if (elTasks) elTasks.textContent = tasks.filter(t => t.completed).length;
  if (elWords) elWords.textContent = words.length;
  if (elFocus) elFocus.textContent = focus.reduce((sum, s) => sum + (s.duration || 0), 0);
}

async function saveProfile() {
  const fullName = document.getElementById('profile-fullname')?.value.trim();
  const birthDate = document.getElementById('profile-birthdate')?.value;
  const email = document.getElementById('profile-email-input')?.value.trim();
  
  appState.userProfile = {
    id: 'current',
    fullName,
    birthDate: birthDate || null,
    email: email || 'user@example.com'
  };
  
  await db.put('users', appState.userProfile);
  
  const nameDisplay = document.getElementById('profile-name-display');
  const emailDisplay = document.getElementById('profile-email');
  
  if (nameDisplay) nameDisplay.textContent = fullName;
  if (emailDisplay) emailDisplay.textContent = email;
  
  document.getElementById('profile-edit-form').style.display = 'none';
  
  if (birthDate) {
    await initLifeCalendar();
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
    if (img) {
      img.src = base64;
      img.style.display = 'block';
    }
    if (emoji) emoji.style.display = 'none';
    
    await db.put('users', appState.userProfile);
    notifications.showToast('Аватар сохранён', 'success');
  };
  reader.readAsDataURL(file);
}

// === ДОСТИЖЕНИЯ ===
async function loadAchievements() {
  const achievements = await db.getAchievements();
  const unlockedTypes = achievements.map(a => a.achievement_type);
  
  const tasks = await db.getAll('daily_tasks');
  const completedTasks = tasks.filter(t => t.completed).length;
  
  const words = await db.getAll('words');
  
  const focus = await db.getAll('focus_sessions');
  const focusMinutes = focus.reduce((sum, s) => sum + (s.duration || 0), 0);
  
  const books = await db.getAll('books');
  const totalPages = books.reduce((sum, b) => sum + (b.pages_read || 0), 0);
  
  const gratitudes = await db.getAll('gratitude');
  
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
    if (progressEl) progressEl.style.width = `${percent}%`;
    if (progressText) progressText.textContent = `${current}/${config.required}`;
    
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
  
  await loadAchievements();
}

// === БАДЫ ===
async function addSupplement() {
  console.log('[APP] addSupplement called');
  
  const nameInput = document.getElementById('supplement-name');
  const timeInput = document.getElementById('supplement-time');
  const daysInput = document.getElementById('supplement-days');

  const name = nameInput?.value.trim();
  const time = timeInput?.value || '09:00';
  const days = daysInput?.value;

  console.log('[APP] Input values:', { name, time, days });

  if (!name) {
    notifications.showToast('Введите название', 'warning');
    return;
  }

  const userId = getUserId();
  const supplement = {
    id: `supplement_${Date.now()}`,
    user_id: userId,
    name,
    time,
    days: days ? days.split(',').map(d => parseInt(d.trim())).filter(d => d >= 1 && d <= 365) : [],
    taken_today: false,
    created_at: new Date().toISOString()
  };

  console.log('[APP] Supplement to save:', supplement);

  try {
    // Сохраняем локально
    await db.put('supplements', supplement);
    console.log('[APP] Supplement saved to IndexedDB');
    
    // Синхронизируем с Supabase если вошли
    if (userId && supabase) {
      await syncWithSupabase('supplements', supplement, 'insert');
    }

    if (nameInput) nameInput.value = '';
    if (timeInput) timeInput.value = '';
    if (daysInput) daysInput.value = '';

    // Небольшая задержка чтобы БД успела записаться
    setTimeout(async () => {
      await loadSupplements();
    }, 100);
    
    notifications.showToast('Добавка добавлена', 'success');
  } catch (error) {
    console.error('[APP] Error saving supplement:', error);
    notifications.showToast('Ошибка сохранения', 'error');
  }
}

async function loadSupplements() {
  console.log('[APP] loadSupplements called');

  try {
    // Используем db.getAll с правильным именем хранилища
    const supplements = await db.getAll('supplements') || [];
    console.log('[APP] Loaded supplements:', supplements);

    const tbody = document.getElementById('supplements-body');

    if (!tbody) {
      console.error('[APP] supplements-body element not found');
      return;
    }

    if (!supplements || supplements.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Нет добавок</td></tr>';
      return;
    }

    tbody.innerHTML = supplements.map(s => {
      if (!s) return '';
      return `
        <tr>
          <td>${s.name || ''}</td>
          <td>${s.time || ''}</td>
          <td>${s.days && s.days.length > 0 ? s.days.join(', ') : 'Ежедневно'}</td>
          <td>
            <input type="checkbox" class="supplement-check" data-id="${s.id}" ${s.taken_today ? 'checked' : ''}>
          </td>
          <td>
            <button class="btn-delete-sm" onclick="deleteSupplement('${s.id}')">&times;</button>
          </td>
        </tr>
      `;
    }).filter(Boolean).join('');

  } catch (error) {
    console.error('[APP] Error loading supplements:', error);
    // Если хранилище не найдено - показываем пустое состояние
    const tbody = document.getElementById('supplements-body');
    if (tbody && error.name === 'NotFoundError') {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Хранилище не найдено. Обновите страницу.</td></tr>';
    }
  }
}

window.deleteSupplement = async function(id) {
  console.log('[APP] deleteSupplement called, id:', id);
  try {
    await db.delete('supplements', id);
    await loadSupplements();
    notifications.showToast('Добавка удалена', 'success');
  } catch (error) {
    console.error('[APP] Error deleting supplement:', error);
  }
};

// === КОНТАКТЫ ===
// Контакты с фото
let contactPhotoBase64 = null;

async function loadContacts() {
  const contacts = await db.getContacts() || [];
  const list = document.getElementById('contacts-list');
  
  if (!list) return;
  
  if (contacts.length === 0) {
    list.innerHTML = '<p class="empty-state">Нет контактов</p>';
    return;
  }
  
  list.innerHTML = contacts.map(c => `
    <div class="contact-item" onclick="openContactModal('${c.id}')">
      <div class="contact-avatar">
        ${c.photo ? `<img src="${c.photo}" alt="${c.fio || 'C'}">` : (c.fio || 'C')[0].toUpperCase()}
      </div>
      <div class="contact-info">
        <span class="contact-name">${c.fio || 'Без имени'}</span>
        <span class="contact-phone">${c.phone || ''}</span>
        <span class="contact-org">${c.organization || ''}</span>
      </div>
    </div>
  `).join('');
}

async function saveContact() {
  console.log('[APP] saveContact called');
  const fio = document.getElementById('contact-fio')?.value.trim();
  const phone = document.getElementById('contact-phone')?.value.trim();
  const org = document.getElementById('contact-org')?.value.trim();
  const job = document.getElementById('contact-job')?.value.trim();
  const location = document.getElementById('contact-location')?.value.trim();
  const note = document.getElementById('contact-note')?.value.trim();
  const extra = document.getElementById('contact-extra')?.value.trim();
  
  if (!fio && !phone) {
    notifications.showToast('Введите ФИО или телефон', 'warning');
    return;
  }
  
  const contact = { 
    fio, 
    phone, 
    organization: org, 
    job, 
    location, 
    note, 
    extra,
    photo: contactPhotoBase64
  };
  console.log('[APP] Saving contact:', contact);
  await db.saveContact(contact);
  
  // Сброс формы и фото
  if (document.getElementById('contact-fio')) document.getElementById('contact-fio').value = '';
  if (document.getElementById('contact-phone')) document.getElementById('contact-phone').value = '';
  if (document.getElementById('contact-org')) document.getElementById('contact-org').value = '';
  if (document.getElementById('contact-job')) document.getElementById('contact-job').value = '';
  if (document.getElementById('contact-location')) document.getElementById('contact-location').value = '';
  if (document.getElementById('contact-note')) document.getElementById('contact-note').value = '';
  if (document.getElementById('contact-extra')) document.getElementById('contact-extra').value = '';
  contactPhotoBase64 = null;
  updateContactPhotoPreview();
  document.getElementById('contact-form').style.display = 'none';
  
  await loadContacts();
  notifications.showToast('Контакт сохранён', 'success');
}

function updateContactPhotoPreview() {
  const preview = document.getElementById('contact-avatar-preview');
  if (!preview) return;
  
  if (contactPhotoBase64) {
    preview.innerHTML = `<img src="${contactPhotoBase64}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
  } else {
    preview.innerHTML = '<span>📷</span>';
  }
}

async function searchContacts() {
  const query = document.getElementById('contact-search')?.value;
  const contacts = await db.searchContacts(query);
  
  const list = document.getElementById('contacts-list');
  if (!list) return;
  
  if (contacts.length === 0) {
    list.innerHTML = '<p class="empty-state">Ничего не найдено</p>';
    return;
  }
  
  list.innerHTML = contacts.map(c => `
    <div class="contact-item" onclick="openContactModal('${c.id}')">
      <div class="contact-avatar">${(c.fio || 'C')[0].toUpperCase()}</div>
      <div class="contact-info">
        <span class="contact-name">${c.fio || 'Без имени'}</span>
        <span class="contact-phone">${c.phone || ''}</span>
        <span class="contact-org">${c.organization || ''}</span>
      </div>
    </div>
  `).join('');
}

window.openContactModal = async function(id) {
  const contacts = await db.getContacts();
  const contact = contacts.find(c => c.id === id);
  if (!contact) return;
  
  const modal = document.getElementById('contact-modal');
  const title = document.getElementById('contact-modal-title');
  const body = document.getElementById('contact-modal-body');
  const editBtn = document.getElementById('edit-contact-modal-btn');
  
  title.textContent = contact.fio || 'Контакт';
  
  // Показываем кнопку редактирования
  if (editBtn) {
    editBtn.style.display = 'flex';
    editBtn.onclick = () => openEditContactModal(contact);
  }
  
  body.innerHTML = `
    <div class="contact-details">
      ${contact.photo ? `
        <div class="contact-detail-photo">
          <img src="${contact.photo}" alt="${contact.fio}">
        </div>
      ` : ''}
      <div class="detail-row">
        <span class="detail-label">👤 ФИО:</span>
        <span class="detail-value">${contact.fio || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">📞 Телефон:</span>
        <span class="detail-value">${contact.phone || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">🏢 Организация:</span>
        <span class="detail-value">${contact.organization || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">💼 Должность:</span>
        <span class="detail-value">${contact.job || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">📍 Геолокация:</span>
        <span class="detail-value">${contact.location || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">📝 Заметка:</span>
        <span class="detail-value">${contact.note || '-'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">📌 Дополнительно:</span>
        <span class="detail-value">${contact.extra || '-'}</span>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-danger btn-full" onclick="deleteContact('${contact.id}')">Удалить</button>
    </div>
  `;
  
  modal.style.display = 'flex';
};

function openEditContactModal(contact) {
  document.getElementById('contact-modal').style.display = 'none';
  
  // Заполняем форму контакта
  document.getElementById('contact-form').style.display = 'block';
  document.getElementById('contact-fio').value = contact.fio || '';
  document.getElementById('contact-phone').value = contact.phone || '';
  document.getElementById('contact-org').value = contact.organization || '';
  document.getElementById('contact-job').value = contact.job || '';
  document.getElementById('contact-location').value = contact.location || '';
  document.getElementById('contact-note').value = contact.note || '';
  document.getElementById('contact-extra').value = contact.extra || '';
  
  // Устанавливаем фото
  if (contact.photo) {
    contactPhotoBase64 = contact.photo;
    updateContactPhotoPreview();
  }
  
  // Сохраняем ID для обновления
  window.editingContactId = contact.id;
  
  // Меняем текст кнопки сохранения
  const saveBtn = document.getElementById('save-contact-btn');
  if (saveBtn) saveBtn.textContent = 'Обновить';
}

// Обновляем функцию saveContact для поддержки редактирования
async function saveContact() {
  console.log('[APP] saveContact called');
  const fio = document.getElementById('contact-fio')?.value.trim();
  const phone = document.getElementById('contact-phone')?.value.trim();
  const org = document.getElementById('contact-org')?.value.trim();
  const job = document.getElementById('contact-job')?.value.trim();
  const location = document.getElementById('contact-location')?.value.trim();
  const note = document.getElementById('contact-note')?.value.trim();
  const extra = document.getElementById('contact-extra')?.value.trim();
  
  if (!fio && !phone) {
    notifications.showToast('Введите ФИО или телефон', 'warning');
    return;
  }
  
  const contact = { 
    fio, 
    phone, 
    organization: org, 
    job, 
    location, 
    note, 
    extra,
    photo: contactPhotoBase64
  };
  
  // Если редактируем - добавляем ID
  if (window.editingContactId) {
    contact.id = window.editingContactId;
    await db.put('contacts', contact);
    window.editingContactId = null;
    
    // Возвращаем текст кнопки
    const saveBtn = document.getElementById('save-contact-btn');
    if (saveBtn) saveBtn.textContent = 'Сохранить';
  } else {
    console.log('[APP] Saving contact:', contact);
    await db.saveContact(contact);
  }
  
  // Сброс формы и фото
  if (document.getElementById('contact-fio')) document.getElementById('contact-fio').value = '';
  if (document.getElementById('contact-phone')) document.getElementById('contact-phone').value = '';
  if (document.getElementById('contact-org')) document.getElementById('contact-org').value = '';
  if (document.getElementById('contact-job')) document.getElementById('contact-job').value = '';
  if (document.getElementById('contact-location')) document.getElementById('contact-location').value = '';
  if (document.getElementById('contact-note')) document.getElementById('contact-note').value = '';
  if (document.getElementById('contact-extra')) document.getElementById('contact-extra').value = '';
  contactPhotoBase64 = null;
  updateContactPhotoPreview();
  document.getElementById('contact-form').style.display = 'none';
  
  await loadContacts();
  notifications.showToast('Контакт сохранён', 'success');
}

window.deleteContact = async function(id) {
  await db.deleteContact(id);
  document.getElementById('contact-modal').style.display = 'none';
  await loadContacts();
  notifications.showToast('Контакт удалён', 'success');
};

// === БЛАГОДАРНОСТЬ ===
async function saveGratitude() {
  console.log('[APP] saveGratitude called');
  const input = document.getElementById('gratitude-input');
  const text = input?.value.trim();

  if (!text) {
    notifications.showToast('Введите текст благодарности', 'warning');
    return;
  }

  const userId = getUserId();
  const gratitude = {
    id: `gratitude_${Date.now()}`,
    user_id: userId,
    text,
    date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  try {
    // Сохраняем локально
    await db.add('gratitude', gratitude);
    
    // Синхронизируем с Supabase
    if (userId && supabase) {
      await syncWithSupabase('gratitude', gratitude, 'insert');
    }
    
    input.value = '';
    await loadGratitudes();
    await loadGratitudeCalendar();
    await checkAchievements();
    notifications.showToast('Благодарность сохранена', 'success');
  } catch (error) {
    console.error('[APP] Error saving gratitude:', error);
    notifications.showToast('Ошибка сохранения', 'error');
  }
}

async function loadGratitudes() {
  const today = new Date().toISOString().split('T')[0];
  const allGratitudes = await db.getAll('gratitude') || [];
  const todayGratitudes = allGratitudes.filter(g => g.date === today);
  
  const container = document.getElementById('today-gratitudes');
  if (container) {
    if (todayGratitudes.length === 0) {
      container.innerHTML = '<p class="empty-state">Пока нет записей</p>';
    } else {
      container.innerHTML = todayGratitudes.map(g => `
        <div class="gratitude-item">
          <span>${g.text}</span>
          <button class="btn-delete-sm" onclick="deleteGratitude('${g.id}')">&times;</button>
        </div>
      `).join('');
    }
  }
}

async function loadGratitudeCalendar() {
  const calendar = document.getElementById('gratitude-calendar');
  if (!calendar) return;
  
  const allGratitudes = await db.getAll('gratitude') || [];
  
  const byDate = {};
  allGratitudes.forEach(g => {
    if (!byDate[g.date]) byDate[g.date] = [];
    byDate[g.date].push(g);
  });
  
  const dates = Object.keys(byDate).sort().reverse().slice(0, 30);
  
  if (dates.length === 0) {
    calendar.innerHTML = '<p class="empty-state">Нет записей</p>';
    return;
  }
  
  calendar.innerHTML = `
    <h4>История благодарностей</h4>
    <div class="gratitude-calendar-list">
      ${dates.map(date => `
        <div class="gratitude-calendar-day">
          <span class="gratitude-date">${formatDateFull(date)}</span>
          <span class="gratitude-count">${byDate[date].length} зап.</span>
        </div>
      `).join('')}
    </div>
  `;
}

window.deleteGratitude = async function(id) {
  await db.delete('gratitude', id);
  await loadGratitudes();
  await loadGratitudeCalendar();
  notifications.showToast('Запись удалена', 'success');
};

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
window.addBookPage = window.addBookPage || addBookPage;
window.setCurrentBook = window.setCurrentBook || setCurrentBook;
window.deletePrinciple = window.deletePrinciple || deletePrinciple;
window.deleteSupplement = window.deleteSupplement || deleteSupplement;
window.openContactModal = window.openContactModal || openContactModal;
window.deleteContact = window.deleteContact || deleteContact;
window.deleteGratitude = window.deleteGratitude || deleteGratitude;
