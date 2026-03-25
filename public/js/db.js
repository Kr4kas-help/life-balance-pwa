// db.js - Работа с локальной базой данных (IndexedDB) и синхронизация
const DB_NAME = 'life-balance-db';
const DB_VERSION = 2;
const STORE_NAMES = {
  USERS: 'users',
  DAILY_TASKS: 'daily_tasks',
  WORDS: 'words_learned',
  GRATITUDE: 'gratitude',
  CONTACTS: 'contacts',
  ACHIEVEMENTS: 'achievements',
  WATER_LOG: 'water_log',
  FOCUS_SESSIONS: 'focus_sessions',
  BOOKS: 'books',
  WALKS: 'walks',
  SUPPLEMENTS: 'supplements',
  PENDING_SYNC: 'pending_sync',
  PRINCIPLES: 'principles'
};

class Database {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    this.ready = this.init();
  }

  async ensureReady() {
    await this.ready;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Создаём хранилища
        if (!db.objectStoreNames.contains(STORE_NAMES.USERS)) {
          db.createObjectStore(STORE_NAMES.USERS, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(STORE_NAMES.DAILY_TASKS)) {
          const store = db.createObjectStore(STORE_NAMES.DAILY_TASKS, { keyPath: 'id' });
          store.createIndex('user_id', 'user_id', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_NAMES.WORDS)) {
          const store = db.createObjectStore(STORE_NAMES.WORDS, { keyPath: 'id' });
          store.createIndex('user_id', 'user_id', { unique: false });
          store.createIndex('theme', 'theme', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_NAMES.GRATITUDE)) {
          const store = db.createObjectStore(STORE_NAMES.GRATITUDE, { keyPath: 'id' });
          store.createIndex('user_id', 'user_id', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_NAMES.CONTACTS)) {
          const store = db.createObjectStore(STORE_NAMES.CONTACTS, { keyPath: 'id' });
          store.createIndex('theme', 'theme', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_NAMES.ACHIEVEMENTS)) {
          const store = db.createObjectStore(STORE_NAMES.ACHIEVEMENTS, { keyPath: 'id' });
          store.createIndex('achievement_type', 'achievement_type', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_NAMES.WATER_LOG)) {
          const store = db.createObjectStore(STORE_NAMES.WATER_LOG, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_NAMES.FOCUS_SESSIONS)) {
          const store = db.createObjectStore(STORE_NAMES.FOCUS_SESSIONS, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_NAMES.BOOKS)) {
          db.createObjectStore(STORE_NAMES.BOOKS, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(STORE_NAMES.WALKS)) {
          const store = db.createObjectStore(STORE_NAMES.WALKS, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_NAMES.SUPPLEMENTS)) {
          db.createObjectStore(STORE_NAMES.SUPPLEMENTS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.PENDING_SYNC)) {
          db.createObjectStore(STORE_NAMES.PENDING_SYNC, { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains(STORE_NAMES.PRINCIPLES)) {
          db.createObjectStore(STORE_NAMES.PRINCIPLES, { keyPath: 'id' });
        }
      };
    });
  }

  // Generic CRUD операции
  async add(storeName, data) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName, data) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName, id) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName, id) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex(storeName, indexName, value) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Специфические методы для задач
  async saveDailyTask(task) {
    const today = new Date().toISOString().split('T')[0];
    task.date = today;
    task.id = task.id || `${task.task_type}_${today}`;
    await this.put(STORE_NAMES.DAILY_TASKS, task);
    this.queueForSync('daily_tasks', task);
    return task;
  }

  async getDailyTasks(date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.getByIndex(STORE_NAMES.DAILY_TASKS, 'date', targetDate);
  }

  // Слова
  async saveWord(word) {
    word.id = word.id || `word_${Date.now()}`;
    word.date = new Date().toISOString().split('T')[0];
    await this.add(STORE_NAMES.WORDS, word);
    this.queueForSync('words', word);
    return word;
  }

  async getWords(theme = null) {
    if (theme) {
      return this.getByIndex(STORE_NAMES.WORDS, 'theme', theme);
    }
    return this.getAll(STORE_NAMES.WORDS);
  }

  // Благодарность
  async saveGratitude(text) {
    const gratitude = {
      id: `gratitude_${Date.now()}`,
      text,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    await this.add(STORE_NAMES.GRATITUDE, gratitude);
    this.queueForSync('gratitude', gratitude);
    return gratitude;
  }

  async getGratitudes(date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.getByIndex(STORE_NAMES.GRATITUDE, 'date', targetDate);
  }

  // Вода
  async logWater(amount) {
    const log = {
      id: `water_${Date.now()}`,
      amount,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toISOString()
    };
    await this.add(STORE_NAMES.WATER_LOG, log);
    this.queueForSync('water_log', log);
    return log;
  }

  async getWaterLog(date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logs = await this.getByIndex(STORE_NAMES.WATER_LOG, 'date', targetDate);
    return logs.reduce((sum, log) => sum + log.amount, 0);
  }

  // Фокус сессии
  async saveFocusSession(duration) {
    const session = {
      id: `focus_${Date.now()}`,
      duration,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    await this.add(STORE_NAMES.FOCUS_SESSIONS, session);
    this.queueForSync('focus_sessions', session);
    return session;
  }

  async getFocusSessions(date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.getByIndex(STORE_NAMES.FOCUS_SESSIONS, 'date', targetDate);
  }

  // Книги
  async saveBook(book) {
    book.id = book.id || `book_${Date.now()}`;
    book.started_at = book.started_at || new Date().toISOString();
    await this.put(STORE_NAMES.BOOKS, book);
    this.queueForSync('books', book);
    return book;
  }

  async getCurrentBook() {
    const books = await this.getAll(STORE_NAMES.BOOKS);
    return books.find(b => b.is_current) || null;
  }

  // Прогулки
  async saveWalk(location) {
    const walk = {
      id: `walk_${Date.now()}`,
      latitude: location.lat,
      longitude: location.lng,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toISOString()
    };
    await this.add(STORE_NAMES.WALKS, walk);
    this.queueForSync('walks', walk);
    return walk;
  }

  async getWalks() {
    return this.getAll(STORE_NAMES.WALKS);
  }

  // Контакты
  async saveContact(contact) {
    contact.id = contact.id || `contact_${Date.now()}`;
    await this.put(STORE_NAMES.CONTACTS, contact);
    this.queueForSync('contacts', contact);
    return contact;
  }

  async getContacts(theme = null) {
    if (theme) {
      return this.getByIndex(STORE_NAMES.CONTACTS, 'theme', theme);
    }
    return this.getAll(STORE_NAMES.CONTACTS);
  }

  // Достижения
  async unlockAchievement(type) {
    const achievement = {
      id: type,
      achievement_type: type,
      unlocked_at: new Date().toISOString()
    };
    await this.put(STORE_NAMES.ACHIEVEMENTS, achievement);
    this.queueForSync('achievements', achievement);
    return achievement;
  }

  async getAchievements() {
    return this.getAll(STORE_NAMES.ACHIEVEMENTS);
  }

  // Бады
  async saveSupplement(supplement) {
    const data = typeof supplement === 'string' 
      ? { id: `supplement_${Date.now()}`, name: supplement, taken_today: false }
      : supplement;
    
    if (!data.id) data.id = `supplement_${Date.now()}`;
    await this.put(STORE_NAMES.SUPPLEMENTS, data);
    return data;
  }

  async getSupplements() {
    return this.getAll(STORE_NAMES.SUPPLEMENTS);
  }

  async toggleSupplement(id) {
    const supplement = await this.get(STORE_NAMES.SUPPLEMENTS, id);
    if (supplement) {
      supplement.taken_today = !supplement.taken_today;
      await this.put(STORE_NAMES.SUPPLEMENTS, supplement);
      return supplement;
    }
    return null;
  }

  async deleteSupplement(id) {
    return this.delete(STORE_NAMES.SUPPLEMENTS, id);
  }

  // Принципы
  async savePrinciple(text) {
    const principle = {
      id: `principle_${Date.now()}`,
      text,
      created_at: new Date().toISOString()
    };
    await this.add(STORE_NAMES.PRINCIPLES, principle);
    return principle;
  }

  async getPrinciples() {
    return this.getAll(STORE_NAMES.PRINCIPLES);
  }

  async deletePrinciple(id) {
    return this.delete(STORE_NAMES.PRINCIPLES, id);
  }

  // Синхронизация
  queueForSync(table, data) {
    if (!this.isOnline) {
      this.add(STORE_NAMES.PENDING_SYNC, {
        table,
        data,
        created_at: new Date().toISOString()
      });
    }
  }

  async syncWithServer() {
    if (!this.isOnline) return;
    
    const pending = await this.getAll(STORE_NAMES.PENDING_SYNC);
    
    for (const item of pending) {
      try {
        await fetch(`/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        await this.delete(STORE_NAMES.PENDING_SYNC, item.id);
      } catch (e) {
        console.error('Sync error:', e);
      }
    }
  }

  // Очистка данных за день
  async resetDailyData() {
    const today = new Date().toISOString().split('T')[0];
    
    // Сбрасываем бады
    const supplements = await this.getSupplements();
    for (const s of supplements) {
      s.taken_today = false;
      await this.put(STORE_NAMES.SUPPLEMENTS, s);
    }
  }
}

// Глобальная переменная
const db = new Database();

// Обработчики онлайн/офлайн
window.addEventListener('online', () => {
  db.isOnline = true;
  db.syncWithServer();
});

window.addEventListener('offline', () => {
  db.isOnline = false;
});
