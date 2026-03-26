// auth.js - Авторизация и аутентификация
console.log('[AUTH] Loading auth.js...');

// ============================================
// НАСТРОЙКА SUPABASE
// ============================================
// 1. Зарегистрируйтесь на https://supabase.com
// 2. Создайте новый проект
// 3. Скопируйте URL и Anon Key из Settings → API
// 4. Вставьте их ниже:

const SUPABASE_URL = ''; // Например: https://xxxxxxxxxxxxx.supabase.co
const SUPABASE_ANON_KEY = ''; // Ваш anon key

// ============================================

let supabase = null;

// Проверяем наличие Supabase
if (typeof createClient !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('[AUTH] Supabase initialized');
} else {
  console.warn('[AUTH] Supabase not configured, using local auth only');
  console.warn('[AUTH] To enable cloud sync, set up Supabase keys in auth.js');
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
    console.log('[AUTH] User restored from localStorage:', authState.user);
  }
  
  const isGuest = localStorage.getItem('isGuest');
  if (isGuest === 'true') {
    authState.isGuest = true;
    console.log('[AUTH] Guest mode');
  }
  
  // Показываем экран авторизации если нет пользователя
  if (!authState.user && !authState.isGuest) {
    showAuthScreen();
  } else {
    hideAuthScreen();
  }
  
  // Переключатель вход/регистрация
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const tabName = tab.dataset.tab;
      if (tabName === 'login') {
        document.getElementById('login-form').style.display = 'flex';
        document.getElementById('register-form').style.display = 'none';
      } else {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'flex';
      }
    });
  });
  
  // Форма входа
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLogin();
  });
  
  // Форма регистрации
  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleRegister();
  });
  
  // Гостевой режим
  document.getElementById('continue-guest')?.addEventListener('click', () => {
    authState.isGuest = true;
    localStorage.setItem('isGuest', 'true');
    hideAuthScreen();
  });
  
  // Кнопка выхода
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
}

function showAuthScreen() {
  const authScreen = document.getElementById('auth-screen');
  const app = document.getElementById('app');
  
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
  
  if (authScreen) {
    authScreen.style.display = 'none';
  }
  if (app) {
    app.style.display = 'block';
  }
  
  updateProfileUI();
}

async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  
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
    hideAuthScreen();
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    errorEl.textContent = error.message;
  }
}

async function handleRegister() {
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const passwordConfirm = document.getElementById('register-password-confirm').value;
  const errorEl = document.getElementById('register-error');
  
  if (password !== passwordConfirm) {
    errorEl.textContent = 'Пароли не совпадают';
    return;
  }
  
  if (password.length < 6) {
    errorEl.textContent = 'Пароль должен быть не менее 6 символов';
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
    
    authState.user = data.user;
    localStorage.setItem('user', JSON.stringify(authState.user));
    hideAuthScreen();
  } catch (error) {
    console.error('[AUTH] Register error:', error);
    errorEl.textContent = error.message;
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
  document.getElementById('profile-name-display').textContent = 'Гость';
  document.getElementById('profile-email').textContent = 'user@example.com';
  document.getElementById('logout-btn').style.display = 'none';
  
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
