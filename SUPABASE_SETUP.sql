-- SQL для настройки Supabase
-- Выполните этот SQL в SQL Editor на https://app.supabase.com
-- Ваш проект: https://supabase.com/dashboard/project/xhzscskvrxefnoardxxa

-- =====================================================
-- 1. СОЗДАЙТЕ ТАБЛИЦЫ
-- =====================================================

-- Таблица для пользователей Telegram
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для задач
CREATE TABLE IF NOT EXISTS daily_tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT REFERENCES users(telegram_id),
  text TEXT,
  completed BOOLEAN DEFAULT false,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для слов
CREATE TABLE IF NOT EXISTS words_learned (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT REFERENCES users(telegram_id),
  word TEXT,
  translation TEXT,
  theme TEXT,
  date DATE,
  learned BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для книг
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT REFERENCES users(telegram_id),
  title TEXT,
  total_pages INTEGER,
  pages_read INTEGER DEFAULT 0,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для благодарностей
CREATE TABLE IF NOT EXISTS gratitude (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT REFERENCES users(telegram_id),
  text TEXT,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для добавок
CREATE TABLE IF NOT EXISTS supplements (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT REFERENCES users(telegram_id),
  name TEXT,
  time TIME,
  days INTEGER[],
  taken_today BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для принципов
CREATE TABLE IF NOT EXISTS principles (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT REFERENCES users(telegram_id),
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для контактов
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT REFERENCES users(telegram_id),
  fio TEXT,
  phone TEXT,
  organization TEXT,
  job TEXT,
  location TEXT,
  note TEXT,
  extra TEXT,
  photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для сессий фокуса
CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT REFERENCES users(telegram_id),
  duration INTEGER,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для воды
CREATE TABLE IF NOT EXISTS water_log (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  telegram_id BIGINT REFERENCES users(telegram_id),
  amount INTEGER,
  period TEXT,
  date DATE,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для профиля пользователей (привязана к users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id),
  telegram_id BIGINT REFERENCES users(telegram_id),
  full_name TEXT,
  birth_date DATE,
  email TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. СОЗДАЙТЕ ИНДЕКСЫ
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON daily_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_telegram_date ON daily_tasks(telegram_id, date);
CREATE INDEX IF NOT EXISTS idx_words_user_date ON words_learned(user_id, date);
CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_gratitude_user_date ON gratitude(user_id, date);
CREATE INDEX IF NOT EXISTS idx_supplements_user ON supplements(user_id);
CREATE INDEX IF NOT EXISTS idx_principles_user ON principles(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_user_date ON focus_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_user_date ON water_log(user_id, date);

-- =====================================================
-- 3. ВКЛЮЧИТЕ RLS (Row Level Security)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE words_learned ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE gratitude ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. СОЗДАЙТЕ ПОЛИТИКИ БЕЗОПАСНОСТИ
-- =====================================================

-- Таблица users - публичное чтение, запись только при создании
CREATE POLICY "Users table public read" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users table insert only" ON users
  FOR INSERT WITH CHECK (true);

-- Пользователи могут видеть и редактировать только свои данные (по user_id)
CREATE POLICY "Users can view own tasks" ON daily_tasks
  FOR ALL USING (
    auth.uid() = user_id OR 
    telegram_id = (SELECT telegram_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own words" ON words_learned
  FOR ALL USING (
    auth.uid() = user_id OR 
    telegram_id = (SELECT telegram_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own books" ON books
  FOR ALL USING (
    auth.uid() = user_id OR 
    telegram_id = (SELECT telegram_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own gratitude" ON gratitude
  FOR ALL USING (
    auth.uid() = user_id OR 
    telegram_id = (SELECT telegram_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own supplements" ON supplements
  FOR ALL USING (
    auth.uid() = user_id OR 
    telegram_id = (SELECT telegram_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own principles" ON principles
  FOR ALL USING (
    auth.uid() = user_id OR 
    telegram_id = (SELECT telegram_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own contacts" ON contacts
  FOR ALL USING (
    auth.uid() = user_id OR 
    telegram_id = (SELECT telegram_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own focus" ON focus_sessions
  FOR ALL USING (
    auth.uid() = user_id OR 
    telegram_id = (SELECT telegram_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own water" ON water_log
  FOR ALL USING (
    auth.uid() = user_id OR 
    telegram_id = (SELECT telegram_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR ALL USING (
    auth.uid() = id OR 
    telegram_id = (SELECT telegram_id FROM users WHERE id = auth.uid())
  );

-- =====================================================
-- 5. ФУНКЦИЯ ДЛЯ СОЗДАНИЯ/ОБНОВЛЕНИЯ ПОЛЬЗОВАТЕЛЯ TELEGRAM
-- =====================================================

-- Функция для создания или обновления пользователя при входе через Telegram
CREATE OR REPLACE FUNCTION public.upsert_telegram_user(
  p_telegram_id BIGINT,
  p_username TEXT DEFAULT NULL,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_language_code TEXT DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Пробуем найти существующего пользователя
  SELECT id INTO v_user_id FROM users WHERE telegram_id = p_telegram_id;
  
  IF v_user_id IS NOT NULL THEN
    -- Обновляем last_login и данные
    UPDATE users 
    SET 
      username = COALESCE(p_username, username),
      first_name = COALESCE(p_first_name, first_name),
      last_name = COALESCE(p_last_name, last_name),
      language_code = COALESCE(p_language_code, language_code),
      photo_url = COALESCE(p_photo_url, photo_url),
      last_login = NOW()
    WHERE telegram_id = p_telegram_id
    RETURNING id INTO v_user_id;
  ELSE
    -- Создаём нового пользователя
    INSERT INTO users (telegram_id, username, first_name, last_name, language_code, photo_url)
    VALUES (p_telegram_id, p_username, p_first_name, p_last_name, p_language_code, p_photo_url)
    RETURNING id INTO v_user_id;
    
    -- Создаём профиль
    INSERT INTO user_profiles (id, telegram_id, full_name, avatar)
    VALUES (v_user_id, p_telegram_id, CONCAT(p_first_name, ' ', p_last_name), p_photo_url);
  END IF;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ГОТОВО!
-- =====================================================
