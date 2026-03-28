// server.js - Backend сервер для Vercel
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Конфигурация Supabase (из переменных окружения)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Простое хранилище в памяти для демо (если нет Supabase)
const inMemoryDB = {
  daily_tasks: [],
  words_learned: [],
  gratitude: [],
  contacts: [],
  achievements: [],
  water_log: [],
  focus_sessions: [],
  books: [],
  walks: [],
  supplements: []
};

// Функция для работы с Supabase
async function supabaseRequest(table, method = 'GET', body = null) {
  if (!supabaseUrl || !supabaseKey) {
    // Используем in-memory DB
    return inMemoryDB[table] || [];
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, options);
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      return response.json();
    }
    return await response.json();
  } catch (error) {
    console.error('Supabase error:', error);
    return inMemoryDB[table] || [];
  }
}

// API Routes

// Синхронизация данных
app.post('/api/sync', async (req, res) => {
  const { table, data } = req.body;
  
  if (!table || !data) {
    return res.status(400).json({ error: 'Missing table or data' });
  }

  try {
    // Сохраняем в Supabase или in-memory
    if (supabaseUrl && supabaseKey) {
      await supabaseRequest(table, 'POST', data);
    } else {
      // In-memory storage
      data.id = data.id || `${table}_${Date.now()}`;
      inMemoryDB[table] = inMemoryDB[table] || [];
      const existingIndex = inMemoryDB[table].findIndex(item => item.id === data.id);
      if (existingIndex >= 0) {
        inMemoryDB[table][existingIndex] = data;
      } else {
        inMemoryDB[table].push(data);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Получение данных
app.get('/api/:table', async (req, res) => {
  const { table } = req.params;
  
  try {
    let data;
    if (supabaseUrl && supabaseKey) {
      data = await supabaseRequest(table);
    } else {
      data = inMemoryDB[table] || [];
    }
    res.json(data);
  } catch (error) {
    console.error('Get error:', error);
    res.status(500).json({ error: 'Failed to get data' });
  }
});

// Сохранение/обновление записи
app.post('/api/:table', async (req, res) => {
  const { table } = req.params;
  const data = req.body;

  try {
    if (supabaseUrl && supabaseKey) {
      await supabaseRequest(table, 'POST', data);
    } else {
      data.id = data.id || `${table}_${Date.now()}`;
      inMemoryDB[table] = inMemoryDB[table] || [];
      inMemoryDB[table].push(data);
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('Post error:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Для всех остальных запросов - отдаем index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Запуск сервера (только локально)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
