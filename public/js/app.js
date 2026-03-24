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

// Инициализация приложения
class App {
  constructor() {
    this.currentTab = 'dashboard';
    this.currentTheme = 'business';
    this.map = null;
    this.userLocation = null;
    this.timers = {
      pomodoro: null,
      exercise: null,
      dnd: null,
      sleep: null
    };
    this.timerState = {
      pomodoro: { time: 25 * 60, isRunning: false, isBreak: false, sessions: 0 },
      exercise: { time: 5 * 60, isRunning: false }
    };
    this.init();
  }

  async init() {
    // Регистрация Service Worker
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker зарегистрирован');
      } catch (e) {
        console.error('SW registration failed:', e);
      }
    }

    // Установка PWA
    this.setupPWAInstall();

    // Инициализация UI
    this.setupNavigation();
    this.setupEventListeners();
    this.updateGreeting();
    this.updateDate();
    this.initMap();
    this.initLifeCalendar();

    // Загрузка данных
    await this.loadDailyProgress();
    await this.loadWaterProgress();
    await this.loadGratitudes();
    await this.loadSupplements();
    await this.loadContacts();
    await this.loadWords();
    await this.loadAchievements();

    // Скрыть сплэш и показать приложение
    setTimeout(() => {
      document.getElementById('splash-screen').classList.add('hidden');
      document.getElementById('app').classList.remove('hidden');
    }, 1500);

    // Планирование уведомлений
    notifications.scheduleWaterReminder();
  }

  setupPWAInstall() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Показываем кнопку установки
      const installBtn = document.createElement('button');
      installBtn.className = 'btn btn-primary install-btn';
      installBtn.textContent = 'Установить приложение';
      installBtn.style.cssText = 'position: fixed; bottom: 80px; right: 16px; z-index: 1000;';
      
      installBtn.addEventListener('click', async () => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          installBtn.remove();
        }
      });
      
      document.body.appendChild(installBtn);
    });
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Свайп-жесты
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe(touchStartX, touchEndX);
    });
  }

  handleSwipe(start, end) {
    const threshold = 50;
    const diff = start - end;
    
    if (Math.abs(diff) > threshold) {
      const tabs = ['dashboard', 'tasks', 'focus', 'learn', 'profile', 'map'];
      const currentIndex = tabs.indexOf(this.currentTab);
      
      if (diff > 0 && currentIndex < tabs.length - 1) {
        this.switchTab(tabs[currentIndex + 1]);
      } else if (diff < 0 && currentIndex > 0) {
        this.switchTab(tabs[currentIndex - 1]);
      }
    }
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    
    // Обновляем навигацию
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });
    
    // Обновляем контент
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.dataset.tab === tabName);
    });

    // Инициализация карты при переходе на вкладку карты
    if (tabName === 'map' && this.map) {
      setTimeout(() => this.map.invalidateSize(), 100);
    }
  }

  setupEventListeners() {
    // Quick actions
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleQuickAction(action);
      });
    });

    // Задачи на главной
    document.querySelectorAll('#dashboard-tasks .checkbox-container input').forEach((checkbox, index) => {
      checkbox.addEventListener('change', (e) => {
        const taskItem = e.target.closest('.task-item');
        taskItem.classList.toggle('completed', e.target.checked);
        this.saveDailyTask(index + 1, e.target.checked);
      });
    });

    // Книга - +10 страниц
    document.getElementById('add-10-pages')?.addEventListener('click', () => this.addPages(10));
    
    // Вода
    document.getElementById('add-water')?.addEventListener('click', () => this.addWater(250));

    // Таймер разминки
    document.getElementById('start-exercise')?.addEventListener('click', () => this.startExerciseTimer());
    document.getElementById('reset-exercise')?.addEventListener('click', () => this.resetExerciseTimer());

    // Pomodoro
    document.getElementById('start-pomodoro')?.addEventListener('click', () => this.startPomodoro());
    document.getElementById('pause-pomodoro')?.addEventListener('click', () => this.pausePomodoro());
    document.getElementById('reset-pomodoro')?.addEventListener('click', () => this.resetPomodoro());

    // DND
    document.getElementById('dnd-switch')?.addEventListener('change', (e) => this.toggleDND(e.target.checked));
    document.getElementById('dnd-duration')?.addEventListener('change', (e) => this.updateDNDDuration(e.target.value));

    // Сон
    document.getElementById('sleep-time')?.addEventListener('change', () => this.updateSleepInfo());
    document.getElementById('enable-sleep-mode')?.addEventListener('click', () => this.enableSleepMode());

    // Слова
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTheme = btn.dataset.theme;
      });
    });
    document.getElementById('next-word')?.addEventListener('click', () => this.showNextWord());

    // Книга (текущая)
    document.getElementById('update-book-progress')?.addEventListener('click', () => this.updateBookProgress());

    // Благодарность
    document.getElementById('save-gratitude')?.addEventListener('click', () => this.saveGratitude());

    // Икигай
    document.getElementById('calculate-ikigai')?.addEventListener('click', () => this.calculateIkigai());

    // Контакты
    document.getElementById('add-contact')?.addEventListener('click', () => this.addContact());
    document.getElementById('contact-search')?.addEventListener('input', (e) => this.searchContacts(e.target.value));

    // Бады
    document.getElementById('add-supplement')?.addEventListener('click', () => this.addSupplement());

    // Прогулка
    document.getElementById('start-walk')?.addEventListener('click', () => this.startWalk());

    // Синхронизация
    document.getElementById('syncBtn')?.addEventListener('click', () => this.sync());

    // Чеклист задач
    document.querySelectorAll('.daily-task-check').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.saveDailyChecklist());
    });
  }

  // Обновление приветствия и даты
  updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Доброе утро';
    
    if (hour >= 12 && hour < 17) greeting = 'Добрый день';
    else if (hour >= 17 && hour < 22) greeting = 'Добрый вечер';
    else if (hour >= 22 || hour < 6) greeting = 'Доброй ночи';
    
    document.getElementById('greeting-text').textContent = greeting;
  }

  updateDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = new Date().toLocaleDateString('ru-RU', options);
    document.getElementById('current-date').textContent = dateStr;
  }

  // Загрузка прогресса
  async loadDailyProgress() {
    const tasks = await db.getDailyTasks();
    const progress = tasks.filter(t => t.completed).length;
    const total = 3;
    const percent = Math.round((progress / total) * 100);
    
    // Обновляем круг
    const circle = document.getElementById('daily-progress-circle');
    const circumference = 2 * Math.PI * 45;
    circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
    
    document.getElementById('progress-percent').textContent = `${percent}%`;
    
    // Обновляем чекбоксы
    tasks.forEach((task, index) => {
      const checkbox = document.getElementById(`dash-task-${index + 1}`);
      if (checkbox) {
        checkbox.checked = task.completed;
        checkbox.closest('.task-item').classList.toggle('completed', task.completed);
      }
    });
  }

  async loadWaterProgress() {
    const today = new Date().toISOString().split('T')[0];
    const total = await db.getWaterLog(today);
    const goal = 500;
    const percent = Math.min((total / goal) * 100, 100);
    
    document.getElementById('water-level').style.height = `${percent}%`;
    document.getElementById('water-count').textContent = `${total}/${goal}мл`;
  }

  async loadGratitudes() {
    const gratitudes = await db.getGratitudes();
    const container = document.getElementById('today-gratitudes');
    
    if (container) {
      container.innerHTML = gratitudes.map(g => 
        `<div class="gratitude-item">${g.text}</div>`
      ).join('');
    }
  }

  async loadSupplements() {
    const supplements = await db.getSupplements();
    const tbody = document.getElementById('supplements-body');
    
    if (tbody) {
      tbody.innerHTML = supplements.map(s => `
        <tr>
          <td>${s.name}</td>
          <td>
            <input type="checkbox" class="supplement-check" 
              data-id="${s.id}" ${s.taken_today ? 'checked' : ''}>
          </td>
        </tr>
      `).join('');
      
      // Обработчики чекбоксов
      tbody.querySelectorAll('.supplement-check').forEach(checkbox => {
        checkbox.addEventListener('change', async () => {
          await db.toggleSupplement(checkbox.dataset.id);
        });
      });
    }
  }

  async loadContacts() {
    const contacts = await db.getContacts();
    const container = document.getElementById('contacts-list');
    
    if (container) {
      container.innerHTML = contacts.map(c => `
        <div class="contact-item">
          <span class="contact-icon">👤</span>
          <div class="contact-info">
            <div class="contact-name">${c.name}</div>
            <div class="contact-theme">${this.getThemeName(c.theme)}</div>
            <div class="contact-data">${c.contact_info}</div>
          </div>
        </div>
      `).join('');
    }
  }

  async loadWords() {
    const words = await db.getWords();
    const container = document.getElementById('words-history');
    
    if (container && words.length > 0) {
      container.innerHTML = words.slice(-10).reverse().map(w => `
        <div class="word-history-item">
          <div class="word-history-word">${w.word}</div>
          <div class="word-history-translation">${w.translation}</div>
          <div class="word-history-theme">${this.getThemeName(w.theme)}</div>
        </div>
      `).join('');
    }
  }

  async loadAchievements() {
    const achievements = await db.getAchievements();
    const unlockedTypes = achievements.map(a => a.achievement_type);
    
    document.querySelectorAll('.achievement').forEach(el => {
      const type = el.dataset.achievement;
      if (unlockedTypes.includes(type)) {
        el.classList.add('unlocked');
      }
    });
  }

  // Обработчики действий
  handleQuickAction(action) {
    switch (action) {
      case 'focus':
        this.switchTab('focus');
        break;
      case 'water':
        this.addWater(250);
        break;
      case 'walk':
        this.switchTab('map');
        this.startWalk();
        break;
      case 'gratitude':
        this.switchTab('profile');
        document.getElementById('gratitude-input').focus();
        break;
    }
  }

  async saveDailyTask(taskNum, completed) {
    const taskTypes = ['reading', 'water', 'exercise'];
    await db.saveDailyTask({
      task_type: taskTypes[taskNum - 1],
      completed
    });
    await this.loadDailyProgress();
  }

  async addPages(pages) {
    const bookTitle = document.getElementById('book-title').value || 'Текущая книга';
    const book = await db.getCurrentBook() || { 
      title: bookTitle, 
      total_pages: 0, 
      pages_read: 0,
      is_current: true 
    };
    
    book.pages_read += pages;
    if (book.total_pages === 0) book.total_pages = 100;
    
    await db.saveBook(book);
    
    document.getElementById('pages-today').textContent = book.pages_read;
    
    // Проверка достижения
    if (book.pages_read >= 10) {
      await db.unlockAchievement('first-book');
      notifications.notifyAchievement('Первая книга');
    }
    
    notifications.showToast(`+${pages} страниц`);
  }

  async addWater(amount) {
    await db.logWater(amount);
    await this.loadWaterProgress();
    notifications.showToast(`+${amount}мл воды`);
  }

  // Таймер разминки
  startExerciseTimer() {
    if (this.timerState.exercise.isRunning) return;
    
    this.timerState.exercise.isRunning = true;
    document.getElementById('start-exercise').textContent = 'Пауза';
    
    this.timers.exercise = setInterval(() => {
      this.timerState.exercise.time--;
      this.updateTimerDisplay('exercise-timer', this.timerState.exercise.time);
      
      if (this.timerState.exercise.time <= 0) {
        this.resetExerciseTimer();
        notifications.show('🧘 Разминка завершена!', { body: 'Отличная работа!' });
        notifications.playSound('complete');
      }
    }, 1000);
    
    document.getElementById('start-exercise').onclick = () => this.pauseExerciseTimer();
  }

  pauseExerciseTimer() {
    clearInterval(this.timers.exercise);
    this.timerState.exercise.isRunning = false;
    document.getElementById('start-exercise').textContent = 'Продолжить';
    document.getElementById('start-exercise').onclick = () => this.startExerciseTimer();
  }

  resetExerciseTimer() {
    clearInterval(this.timers.exercise);
    this.timerState.exercise.isRunning = false;
    this.timerState.exercise.time = 5 * 60;
    this.updateTimerDisplay('exercise-timer', this.timerState.exercise.time);
    document.getElementById('start-exercise').textContent = 'Старт';
    document.getElementById('start-exercise').onclick = () => this.startExerciseTimer();
  }

  // Pomodoro
  startPomodoro() {
    if (this.timerState.pomodoro.isRunning) return;
    
    this.timerState.pomodoro.isRunning = true;
    document.getElementById('start-pomodoro').textContent = 'Пауза';
    
    this.timers.pomodoro = setInterval(() => {
      this.timerState.pomodoro.time--;
      this.updateTimerDisplay('pomodoro-time', this.timerState.pomodoro.time, true);
      
      if (this.timerState.pomodoro.time <= 0) {
        this.handlePomodoroComplete();
      }
    }, 1000);
    
    document.getElementById('start-pomodoro').onclick = () => this.pausePomodoro();
  }

  pausePomodoro() {
    clearInterval(this.timers.pomodoro);
    this.timerState.pomodoro.isRunning = false;
    document.getElementById('start-pomodoro').textContent = 'Продолжить';
    document.getElementById('start-pomodoro').onclick = () => this.startPomodoro();
  }

  resetPomodoro() {
    clearInterval(this.timers.pomodoro);
    this.timerState.pomodoro.isRunning = false;
    this.timerState.pomodoro.isBreak = false;
    this.timerState.pomodoro.time = 25 * 60;
    this.updateTimerDisplay('pomodoro-time', this.timerState.pomodoro.time, true);
    document.getElementById('pomodoro-mode').textContent = 'Фокус';
    document.getElementById('start-pomodoro').textContent = 'Старт';
    document.getElementById('start-pomodoro').onclick = () => this.startPomodoro();
  }

  async handlePomodoroComplete() {
    clearInterval(this.timers.pomodoro);
    this.timerState.pomodoro.isRunning = false;
    
    if (!this.timerState.pomodoro.isBreak) {
      // Завершена фокус-сессия
      await db.saveFocusSession(25);
      this.timerState.pomodoro.sessions++;
      document.getElementById('session-count').textContent = this.timerState.pomodoro.sessions;
      
      notifications.notifyFocusComplete();
      notifications.playSound('complete');
      
      // Переход на перерыв
      this.timerState.pomodoro.isBreak = true;
      this.timerState.pomodoro.time = 5 * 60;
      document.getElementById('pomodoro-mode').textContent = 'Перерыв';
    } else {
      // Перерыв завершён
      notifications.notifyBreakComplete();
      notifications.playSound('complete');
      
      this.timerState.pomodoro.isBreak = false;
      this.timerState.pomodoro.time = 25 * 60;
      document.getElementById('pomodoro-mode').textContent = 'Фокус';
    }
    
    this.updateTimerDisplay('pomodoro-time', this.timerState.pomodoro.time, true);
    document.getElementById('start-pomodoro').textContent = 'Старт';
    document.getElementById('start-pomodoro').onclick = () => this.startPomodoro();
  }

  // DND режим
  toggleDND(enabled) {
    const statusEl = document.getElementById('dnd-status');
    const timerEl = document.getElementById('dnd-timer');
    const duration = parseInt(document.getElementById('dnd-duration').value);
    
    if (enabled) {
      statusEl.textContent = 'Включён';
      timerEl.style.display = 'block';
      
      let remaining = duration * 60;
      this.timers.dnd = setInterval(() => {
        remaining--;
        const hours = Math.floor(remaining / 3600);
        const mins = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;
        document.getElementById('dnd-remaining').textContent = 
          `${hours.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
        
        if (remaining <= 0) {
          this.toggleDND(false);
          document.getElementById('dnd-switch').checked = false;
        }
      }, 1000);
    } else {
      statusEl.textContent = 'Выключен';
      timerEl.style.display = 'none';
      clearInterval(this.timers.dnd);
    }
  }

  updateDNDDuration(value) {
    if (document.getElementById('dnd-switch').checked) {
      this.toggleDND(false);
      document.getElementById('dnd-switch').checked = true;
      this.toggleDND(true);
    }
  }

  // Режим сна
  updateSleepInfo() {
    const sleepTime = document.getElementById('sleep-time').value;
    const [hours, minutes] = sleepTime.split(':').map(Number);
    
    const now = new Date();
    const sleep = new Date(now);
    sleep.setHours(hours, minutes, 0, 0);
    
    if (sleep <= now) {
      sleep.setDate(sleep.getDate() + 1);
    }
    
    const diff = sleep - now;
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minsLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('sleep-remaining').textContent = `${hoursLeft}ч ${minsLeft}мин`;
  }

  enableSleepMode() {
    const sleepTime = document.getElementById('sleep-time').value;
    const [hours] = sleepTime.split(':').map(Number);
    
    // Включаем DND до утра
    document.getElementById('dnd-duration').value = '480';
    document.getElementById('dnd-switch').checked = true;
    this.toggleDND(true);
    
    notifications.show('🌙 Режим сна включён', {
      body: 'Уведомления отключены до утра'
    });
  }

  // Слова
  showNextWord() {
    const words = WORD_DICTIONARIES[this.currentTheme];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    document.getElementById('current-word').textContent = randomWord.word;
    document.getElementById('current-translation').textContent = randomWord.translation;
    
    // Сохраняем слово
    db.saveWord({
      word: randomWord.word,
      translation: randomWord.translation,
      theme: this.currentTheme
    });
    
    this.loadWords();
  }

  async updateBookProgress() {
    const title = document.getElementById('current-book-title').value;
    const totalPages = parseInt(document.getElementById('total-pages').value) || 100;
    const todayPages = parseInt(document.getElementById('pages-today').textContent) || 0;
    
    const book = {
      title,
      total_pages: totalPages,
      pages_read: todayPages,
      is_current: true
    };
    
    await db.saveBook(book);
    
    const percent = Math.round((todayPages / totalPages) * 100);
    document.getElementById('book-progress-fill').style.width = `${percent}%`;
    document.getElementById('book-progress-text').textContent = `${todayPages} / ${totalPages} страниц`;
    
    notifications.showToast('Книга обновлена');
  }

  // Благодарность
  async saveGratitude() {
    const input = document.getElementById('gratitude-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    await db.saveGratitude(text);
    input.value = '';
    
    await this.loadGratitudes();
    await db.unlockAchievement('grateful');
    notifications.showToast('Благодарность сохранена');
  }

  // Икигай
  calculateIkigai() {
    const inputs = document.querySelectorAll('.ikigai-input');
    const answers = Array.from(inputs).map(i => i.value.trim());
    
    const resultEl = document.getElementById('ikigai-result');
    const descEl = document.getElementById('ikigai-description');
    
    resultEl.style.display = 'block';
    
    // Простой анализ
    const filled = answers.filter(a => a).length;
    
    if (filled < 4) {
      descEl.textContent = 'Ответьте на все вопросы для получения результата';
    } else {
      const results = [
        'Вы нашли своё призвание! Ваше любимое дело приносит пользу миру и доход.',
        'Вы на пути к призванию. Продолжайте развиваться в выбранном направлении.',
        'У вас есть потенциал. Попробуйте соединить любимое дело с потребностями рынка.',
        'Исследуйте разные направления. Ваше призвание где-то рядом!'
      ];
      
      descEl.textContent = results[Math.floor(Math.random() * results.length)];
    }
  }

  // Контакты
  async addContact() {
    const name = document.getElementById('contact-name').value;
    const theme = document.getElementById('contact-theme').value;
    const contactInfo = document.getElementById('contact-info').value;
    
    if (!name || !contactInfo) {
      notifications.showToast('Заполните все поля', 'warning');
      return;
    }
    
    await db.saveContact({ name, theme, contact_info: contactInfo });
    
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-info').value = '';
    
    await this.loadContacts();
    notifications.showToast('Контакт добавлен');
  }

  async searchContacts(query) {
    const contacts = await db.getContacts();
    const filtered = contacts.filter(c => 
      c.theme.toLowerCase().includes(query.toLowerCase()) ||
      c.name.toLowerCase().includes(query.toLowerCase())
    );
    
    const container = document.getElementById('contacts-list');
    container.innerHTML = filtered.map(c => `
      <div class="contact-item">
        <span class="contact-icon">👤</span>
        <div class="contact-info">
          <div class="contact-name">${c.name}</div>
          <div class="contact-theme">${this.getThemeName(c.theme)}</div>
          <div class="contact-data">${c.contact_info}</div>
        </div>
      </div>
    `).join('');
  }

  // Бады
  async addSupplement() {
    const name = document.getElementById('supplement-name').value;
    
    if (!name) return;
    
    await db.saveSupplement(name);
    document.getElementById('supplement-name').value = '';
    
    await this.loadSupplements();
  }

  // Карта
  initMap() {
    // Инициализация карты произойдёт при переходе на вкладку
    document.querySelector('[data-tab="map"]').addEventListener('click', () => {
      setTimeout(() => this.setupMap(), 100);
    });
  }

  setupMap() {
    if (this.map) return;
    
    this.map = L.map('map').setView([55.7558, 37.6173], 13); // Москва по умолчанию
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
    
    // Получение геолокации
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.userLocation = { lat: latitude, lng: longitude };
          this.map.setView([latitude, longitude], 15);
          
          L.marker([latitude, longitude])
            .addTo(this.map)
            .bindPopup('Вы здесь');
          
          document.getElementById('location-text').textContent = 
            `Ш: ${latitude.toFixed(4)}, Д: ${longitude.toFixed(4)}`;
        },
        (error) => {
          document.getElementById('location-text').textContent = 'Местоположение недоступно';
        }
      );
    }
  }

  async startWalk() {
    if (!this.userLocation) {
      notifications.showToast('Определите местоположение', 'warning');
      return;
    }
    
    await db.saveWalk(this.userLocation);
    
    const walksList = document.getElementById('walks-list');
    const walkItem = document.createElement('div');
    walkItem.className = 'walk-item';
    walkItem.innerHTML = `
      <span>Прогулка</span>
      <span>${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
    `;
    walksList.insertBefore(walkItem, walksList.firstChild);
    
    notifications.showToast('Прогулка началась! 🚶');
  }

  // Календарь жизни
  initLifeCalendar() {
    const grid = document.getElementById('life-grid');
    if (!grid) return;
    
    const totalWeeks = 52 * 100; // 100 лет
    const age = 25; // Пример возраст
    const weeksLived = age * 52;
    const percent = Math.round((weeksLived / totalWeeks) * 100);
    
    document.getElementById('weeks-lived').textContent = weeksLived;
    document.getElementById('life-percent').textContent = `${percent}%`;
    
    let html = '';
    for (let i = 0; i < totalWeeks; i++) {
      const classes = ['life-week'];
      if (i < weeksLived) classes.push('lived');
      if (i >= weeksLived && i < weeksLived + 1) classes.push('current');
      html += `<div class="${classes.join(' ')}"></div>`;
    }
    
    grid.innerHTML = html;
  }

  // Утилиты
  updateTimerDisplay(elementId, seconds, showMinutes = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    if (showMinutes) {
      element.querySelector('.timer-time').textContent = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      element.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }

  getThemeName(theme) {
    const names = {
      business: '💼 Бизнес',
      science: '🔬 Наука',
      art: '🎨 Искусство',
      sport: '⚽ Спорт',
      tech: '💻 Технологии',
      health: '❤️ Здоровье',
      learning: '📚 Обучение',
      motivation: '💪 Мотивация'
    };
    return names[theme] || theme;
  }

  async sync() {
    const btn = document.getElementById('syncBtn');
    btn.classList.add('syncing');
    
    try {
      await db.syncWithServer();
      notifications.showToast('Синхронизация завершена');
    } catch (e) {
      notifications.showToast('Ошибка синхронизации', 'error');
    }
    
    btn.classList.remove('syncing');
  }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

export default App;
