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
  
  // Переключатель вход/регистрация
  setupAuthTabs();
  
  // Формы
  setupAuthForms();
  
  // Гостевой режим
  setupGuestMode();
  
  // Кнопка выхода
  setupLogout();
}

function setupAuthTabs() {
  const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
  const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (loginTab) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      if (registerTab) registerTab.classList.remove('active');
      if (loginForm) loginForm.style.display = 'flex';
      if (registerForm) registerForm.style.display = 'none';
    });
  }
  
  if (registerTab) {
    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      if (loginTab) loginTab.classList.remove('active');
      if (registerForm) registerForm.style.display = 'flex';
      if (loginForm) loginForm.style.display = 'none';
    });
  }
}

function setupAuthForms() {
  // Форма входа
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleLogin();
    });
  }
  
  // Форма регистрации
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleRegister();
    });
  }
}

function setupGuestMode() {
  const guestBtn = document.getElementById('continue-guest');
  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      console.log('[AUTH] Guest mode selected');
      authState.isGuest = true;
      // Не сохраняем в localStorage - гость только на эту сессию
      hideAuthScreen();
    });
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

function showAuthScreen() {
  const authScreen = document.getElementById('auth-screen');
  const app = document.getElementById('app');
  
  console.log('[AUTH] showAuthScreen called');
  
  if (authScreen) {
    authScreen.style.display = 'flex';
    authScreen.style.visibility = 'visible';
    authScreen.style.opacity = '1';
  }
  if (app) {
    app.style.display = 'none';
  }
}

function hideAuthScreen() {
  const authScreen = document.getElementById('auth-screen');
  const app = document.getElementById('app');
  
  console.log('[AUTH] hideAuthScreen called');
  
  if (authScreen) {
    authScreen.style.display = 'none';
  }
  if (app) {
    app.style.display = 'flex';
    app.style.opacity = '1';
  }
  
  updateProfileUI();
}

async function handleLogin() {
  const email = document.getElementById('login-email')?.value;
  const password = document.getElementById('login-password')?.value;
  const errorEl = document.getElementById('login-error');
  
  console.log('[AUTH] Login attempt:', email);
  
  if (!email || !password) {
    if (errorEl) errorEl.textContent = 'Введите email и пароль';
    return;
  }
  
  if (!supabase) {
    // Локальная авторизация (демо)
    authState.user = { email, id: 'local_' + Date.now() };
    localStorage.setItem('user', JSON.stringify(authState.user));
    hideAuthScreen();
    return;
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    authState.user = data.user;
    localStorage.setItem('user', JSON.stringify(authState.user));
    console.log('[AUTH] Login successful:', authState.user.email);
    hideAuthScreen();
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    if (errorEl) errorEl.textContent = error.message;
  }
}

async function handleRegister() {
  const email = document.getElementById('register-email')?.value;
  const password = document.getElementById('register-password')?.value;
  const passwordConfirm = document.getElementById('register-password-confirm')?.value;
  const errorEl = document.getElementById('register-error');
  
  console.log('[AUTH] Register attempt:', email);
  
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
  
  if (!supabase) {
    // Локальная регистрация (демо)
    authState.user = { email, id: 'local_' + Date.now() };
    localStorage.setItem('user', JSON.stringify(authState.user));
    hideAuthScreen();
    return;
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    
    console.log('[AUTH] Registration successful, showing login form');
    
    // После регистрации показываем форму входа
    if (errorEl) {
      errorEl.style.color = '#22c55e';
      errorEl.textContent = 'Регистрация успешна! Теперь войдите.';
    }
    
    // Переключаем на форму входа через 2 секунды
    setTimeout(() => {
      const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
      const registerForm = document.getElementById('register-form');
      const loginForm = document.getElementById('login-form');
      
      if (loginTab) loginTab.click();
      if (errorEl) {
        errorEl.style.color = '#ef4444';
        errorEl.textContent = '';
      }
      
      // Очищаем поля регистрации
      document.getElementById('register-email').value = '';
      document.getElementById('register-password').value = '';
      document.getElementById('register-password-confirm').value = '';
    }, 2000);
    
  } catch (error) {
    console.error('[AUTH] Register error:', error);
    if (errorEl) {
      errorEl.style.color = '#ef4444';
      errorEl.textContent = error.message;
    }
  }
}

async function handleLogout() {
  if (!confirm('Вы уверены что хотите выйти из аккаунта?')) return;
  
  if (supabase) {
    await supabase.auth.signOut();
  }
  
  authState.user = null;
  authState.isGuest = false;
  localStorage.removeItem('user');
  localStorage.removeItem('isGuest');
  
  // Очищаем данные профиля
  const profileEmail = document.getElementById('profile-email');
  const profileName = document.getElementById('profile-name-display');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (profileEmail) profileEmail.textContent = 'user@example.com';
  if (profileName) profileName.textContent = 'Гость';
  if (logoutBtn) logoutBtn.style.display = 'none';
  
  showAuthScreen();
}

function updateProfileUI() {
  const logoutBtn = document.getElementById('logout-btn');
  const profileEmail = document.getElementById('profile-email');
  const profileName = document.getElementById('profile-name-display');
  
  if (authState.user) {
    if (logoutBtn) logoutBtn.style.display = 'flex';
    if (profileEmail) profileEmail.textContent = authState.user.email || authState.user.user_metadata?.email;
    if (profileName) profileName.textContent = authState.user.user_metadata?.full_name || 'Пользователь';
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

function isLoggedIn() {
  return authState.user !== null || authState.isGuest;
}

function getUser() {
  return authState.user;
}

function isGuest() {
  return authState.isGuest;
}
