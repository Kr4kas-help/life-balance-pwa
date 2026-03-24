// notifications.js - Система уведомлений
class NotificationManager {
  constructor() {
    this.permission = Notification.permission;
    this.init();
  }

  async init() {
    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }
  }

  async requestPermission() {
    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  async show(title, options = {}) {
    if (this.permission !== 'granted') {
      console.log('Notifications not permitted');
      return null;
    }

    const defaultOptions = {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [100, 50, 100],
      tag: 'life-balance',
      renotify: true,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options.onClick) options.onClick();
      };
      
      return notification;
    } catch (e) {
      console.error('Notification error:', e);
      return null;
    }
  }

  // Уведомления для конкретных функций
  async notifyWater(current, goal) {
    if (current >= goal) {
      return this.show('💧 Отлично!', {
        body: 'Вы выпили足够 воды на сегодня!',
        tag: 'water'
      });
    }
    
    const remaining = goal - current;
    return this.show('💧 Время пить воду!', {
      body: `Осталось выпить ${remaining}мл`,
      tag: 'water'
    });
  }

  async notifyFocusComplete() {
    return this.show('🎯 Фокус завершён!', {
      body: 'Отличная работа! Сделайте перерыв.',
      tag: 'focus'
    });
  }

  async notifyBreakComplete() {
    return this.show('⏰ Перерыв окончен', {
      body: 'Время вернуться к работе!',
      tag: 'focus'
    });
  }

  async notifySleep() {
    const hour = new Date().getHours();
    const sleepHour = 23;
    const diff = sleepHour - hour;
    
    if (diff > 0) {
      return this.show('🌙 Скоро спать', {
        body: `Через ${diff} часов рекомендуется лечь спать`,
        tag: 'sleep'
      });
    }
  }

  async notifyAchievement(name) {
    return this.show('🏆 Достижение разблокировано!', {
      body: name,
      tag: 'achievement'
    });
  }

  async notifyGratitudeReminder() {
    const hour = new Date().getHours();
    if (hour >= 20 && hour <= 22) {
      return this.show('🙏 Запишите благодарность', {
        body: 'За что вы благодарны сегодня?',
        tag: 'gratitude'
      });
    }
  }

  // Планирование уведомлений
  scheduleWaterReminder() {
    // Каждые 2 часа напоминать пить воду
    setInterval(() => {
      const hour = new Date().getHours();
      if (hour >= 8 && hour <= 22) {
        this.show('💧 Напоминание', {
          body: 'Не забудьте выпить воды!',
          tag: 'water-reminder'
        });
      }
    }, 2 * 60 * 60 * 1000); // 2 часа
  }

  scheduleGratitudeReminder() {
    // Напоминание вечером
    setTimeout(() => {
      this.notifyGratitudeReminder();
    }, this.getDelayToTime(20, 0)); // 20:00
  }

  // Вспомогательные методы
  getDelayToTime(hour, minute) {
    const now = new Date();
    const target = new Date(now);
    target.setHours(hour, minute, 0, 0);
    
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    
    return target - now;
  }

  // Локальные уведомления (в приложении)
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Анимация появления
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Удаление через 3 секунды
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Звуковые сигналы
  playSound(type = 'notification') {
    const sounds = {
      notification: '/sounds/notification.mp3',
      focus: '/sounds/focus.mp3',
      complete: '/sounds/complete.mp3'
    };
    
    // Используем Web Audio API для генерации звуков
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'focus') {
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;
    } else if (type === 'complete') {
      oscillator.frequency.value = 1000;
      gainNode.gain.value = 0.5;
    } else {
      oscillator.frequency.value = 600;
      gainNode.gain.value = 0.2;
    }
    
    oscillator.type = 'sine';
    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 500);
  }
}

// Глобальная переменная
const notifications = new NotificationManager();
