// auth.js - Авторизация и аутентификация
console.log('[AUTH] Loading auth.js...');

// ============================================
// НАСТРОЙКА SUPABASE
// ============================================
const SUPABASE_URL = 'https://xhzscskvrxefnoardxxa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_w2dp-1spX0B65wbdlt6jtQ_OAZPsARd';
// ============================================

let supabase = null;

// Проверяем наличие Supabase
if (typeof createClient !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('[AUTH] Supabase initialized successfully!');
  console.log('[AUTH] Project:', SUPABASE_URL);
} else {
  console.warn('[AUTH] Supabase not configured, using local auth only');
}

// Состояние авторизации
const authState = {
  user: null,
  isGuest: false
};

// Инициализация авторизации
function initAuth() {
  console.log('[AUTH] initAuth called');

  // Ждём полного загрузки DOM
  if (document.readyState === 'loading') {
    console.log('[AUTH] Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initAuth);
    return;
  }

  // Проверяем сохранённую сессию
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    authState.user = JSON.parse(savedUser);
    console.log('[AUTH] User restored from localStorage:', authState.user?.email);
  }

  const isGuest = localStorage.getItem('isGuest');
  if (isGuest === 'true') {
    authState.isGuest = true;
    console.log('[AUTH] Guest mode restored');
  }

  // Показываем экран авторизации если нет пользователя
  if (!authState.user && !authState.isGuest) {
    console.log('[AUTH] Showing auth screen');
    showAuthScreen();
  } else {
    console.log('[AUTH] User already logged in, hiding auth screen');
    hideAuthScreen();
  }

  // Настраиваем обработчики событий
  setupAuthTabs();
  setupAuthForms();
  setupGuestMode();
  setupLogout();

  console.log('[AUTH] Event listeners set up complete');
}

function setupAuthTabs() {
  console.log('[AUTH] setupAuthTabs called');

  const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
  const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  console.log('[AUTH] Elements:', {
    loginTab: !!loginTab,
    registerTab: !!registerTab,
    loginForm: !!loginForm,
    registerForm: !!registerForm
  });

  // Переключение на ВХОД
  function showLogin() {
    console.log('[AUTH] showLogin');
    if (loginTab) {
      loginTab.classList.add('active');
      loginTab.style.background = 'var(--accent)';
      loginTab.style.borderColor = 'var(--accent)';
      loginTab.style.color = 'white';
    }
    if (registerTab) {
      registerTab.classList.remove('active');
      registerTab.style.background = 'var(--bg-secondary)';
      registerTab.style.borderColor = 'var(--border)';
      registerTab.style.color = 'var(--text-secondary)';
    }
    if (loginForm) {
      loginForm.style.display = 'flex';
    }
    if (registerForm) {
      registerForm.style.display = 'none';
    }
  }

  // Переключение на РЕГИСТРАЦИЮ
  function showRegister() {
    console.log('[AUTH] showRegister');
    if (registerTab) {
      registerTab.classList.add('active');
      registerTab.style.background = 'var(--accent)';
      registerTab.style.borderColor = 'var(--accent)';
      registerTab.style.color = 'white';
    }
    if (loginTab) {
      loginTab.classList.remove('active');
      loginTab.style.background = 'var(--bg-secondary)';
      loginTab.style.borderColor = 'var(--border)';
      loginTab.style.color = 'var(--text-secondary)';
    }
    if (registerForm) {
      registerForm.style.display = 'flex';
    }
    if (loginForm) {
      loginForm.style.display = 'none';
    }
  }

  // Обработчики кликов
  if (loginTab) {
    loginTab.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showLogin();
    });
  }

  if (registerTab) {
    registerTab.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showRegister();
    });
  }

  // Инициализация - показываем вход
  showLogin();
}

function setupAuthForms() {
  console.log('[AUTH] setupAuthForms called');

  // Форма входа
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('[AUTH] Login submit');
      await handleLogin();
    });
  }

  // Форма регистрации
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('[AUTH] Register submit');
      await handleRegister();
    });
  }
}

function setupGuestMode() {
  console.log('[AUTH] setupGuestMode called');

  const guestBtn = document.getElementById('continue-guest');
  if (guestBtn) {
    guestBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[AUTH] Guest mode activated');
      authState.isGuest = true;
      localStorage.setItem('isGuest', 'true');
      hideAuthScreen();
    });
  } else {
    console.error('[AUTH] Guest button not found!');
  }
}

function setupLogout() {
  console.log('[AUTH] setupLogout called');

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

function showAuthScreen() {
  const authScreen = document.getElementById('auth-screen');
  const app = document.getElementById('app');

  console.log('[AUTH] showAuthScreen');

  if (authScreen) {
    authScreen.style.display = 'flex';
  }
  if (app) {
    app.style.display = 'none';
  }
}

function hideAuthScreen() {
  const authScreen = document.getElementById('auth-screen');
  const app = document.getElementById('app');

  console.log('[AUTH] hideAuthScreen');

  if (authScreen) {
    authScreen.style.display = 'none';
  }
  if (app) {
    app.style.display = 'flex';
  }

  updateProfileUI();
}

async function handleLogin() {
  const email = document.getElementById('login-email')?.value;
  const password = document.getElementById('login-password')?.value;
  const errorEl = document.getElementById('login-error');

  console.log('[AUTH] Login:', email);

  if (!email || !password) {
    if (errorEl) errorEl.textContent = 'Введите email и пароль';
    return;
  }

  // Локальная авторизация (демо)
  authState.user = { email, id: 'local_' + Date.now() };
  localStorage.setItem('user', JSON.stringify(authState.user));
  console.log('[AUTH] Login successful (local)');
  hideAuthScreen();
}

async function handleRegister() {
  const email = document.getElementById('register-email')?.value;
  const password = document.getElementById('register-password')?.value;
  const passwordConfirm = document.getElementById('register-password-confirm')?.value;
  const errorEl = document.getElementById('register-error');

  console.log('[AUTH] Register:', email);

  if (!email || !password) {
    if (errorEl) errorEl.textContent = 'Введите email и пароль';
    return;
  }

  if (password !== passwordConfirm) {
    if (errorEl) errorEl.textContent = 'Пароли не совпадают';
    return;
  }

  if (password.length < 6) {
    if (errorEl) errorEl.textContent = 'Пароль должен быть не менее 6 символов';
    return;
  }

  // Локальная регистрация (демо) - сразу входим
  authState.user = { email, id: 'local_' + Date.now() };
  localStorage.setItem('user', JSON.stringify(authState.user));
  console.log('[AUTH] Registration successful (local)');
  hideAuthScreen();
}

async function handleLogout() {
  // Предупреждение для гостевого режима
  if (authState.isGuest) {
    const confirmed = confirm('ВНИМАНИЕ: Все данные гостевого режима будут потеряны при выходе. Вы уверены?');
    if (!confirmed) return;
  } else {
    const confirmed = confirm('Вы уверены что хотите выйти из аккаунта?');
    if (!confirmed) return;
  }

  authState.user = null;
  authState.isGuest = false;
  localStorage.removeItem('user');
  localStorage.removeItem('isGuest');

  showAuthScreen();
}

function updateProfileUI() {
  const logoutBtn = document.getElementById('logout-btn');
  const profileEmail = document.getElementById('profile-email');
  const profileName = document.getElementById('profile-name-display');

  if (authState.user) {
    if (logoutBtn) logoutBtn.style.display = 'flex';
    if (profileEmail) profileEmail.textContent = authState.user.email;
    if (profileName) profileName.textContent = authState.user.full_name || 'Пользователь';
  } else if (authState.isGuest) {
    if (logoutBtn) logoutBtn.style.display = 'flex';
    if (profileEmail) profileEmail.textContent = 'Гостевой режим';
    if (profileName) profileName.textContent = 'Гость';
  } else {
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (profileEmail) profileEmail.textContent = 'user@example.com';
    if (profileName) profileName.textContent = 'Гость';
  }
}

// Экспортируем функции
window.initAuth = initAuth;
window.authState = authState;
