# SQL для настройки Supabase

Выполните этот SQL в **SQL Editor** на https://app.supabase.com

## 1. Создайте таблицы

```sql
-- Таблица для задач
CREATE TABLE IF NOT EXISTS daily_tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  text TEXT,
  completed BOOLEAN DEFAULT false,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для слов
CREATE TABLE IF NOT EXISTS words_learned (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
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
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  total_pages INTEGER,
  pages_read INTEGER DEFAULT 0,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для благодарностей
CREATE TABLE IF NOT EXISTS gratitude (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  text TEXT,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для добавок
CREATE TABLE IF NOT EXISTS supplements (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  time TIME,
  days INTEGER[],
  taken_today BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для принципов
CREATE TABLE IF NOT EXISTS principles (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для контактов
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
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
  user_id UUID REFERENCES auth.users(id),
  duration INTEGER,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для воды
CREATE TABLE IF NOT EXISTS water_log (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount INTEGER,
  period TEXT,
  date DATE,
  time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для пользователей (профиль)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  birth_date DATE,
  email TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. Создайте индексы

```sql
CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON daily_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_words_user_date ON words_learned(user_id, date);
CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_gratitude_user_date ON gratitude(user_id, date);
CREATE INDEX IF NOT EXISTS idx_supplements_user ON supplements(user_id);
CREATE INDEX IF NOT EXISTS idx_principles_user ON principles(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_user_date ON focus_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_user_date ON water_log(user_id, date);
```

## 3. Включите RLS (Row Level Security)

```sql
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
```

## 4. Создайте политики безопасности

```sql
-- Пользователи могут видеть и редактировать только свои данные
CREATE POLICY "Users can view own tasks" ON daily_tasks
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own words" ON words_learned
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own books" ON books
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own gratitude" ON gratitude
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own supplements" ON supplements
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own principles" ON principles
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own contacts" ON contacts
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own focus" ON focus_sessions
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own water" ON water_log
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);
```

## 5. Создайте триггер для автоматического создания профиля

```sql
-- Функция для создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 6. Проверка

После выполнения SQL проверьте:
1. Все таблицы созданы в **Table Editor**
2. Индексы добавлены
3. RLS включен для всех таблиц
4. Политики безопасности работают

Теперь приложение будет синхронизировать данные с Supabase!
