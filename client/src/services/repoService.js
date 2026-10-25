import api from './api.js';

export const getRepositories = async () => {
  const response = await api.get('/repos');
  return response.data;
};

export const getPullRequests = async (owner, repo, state = 'all') => {
  const response = await api.get(`/repos/${owner}/${repo}/pulls`, {
    params: { state },
  });
  return response.data;
};

export const getPullRequestDetails = async (owner, repo, pullNumber) => {
  const response = await api.get(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
  return response.data;
};

export const getDemoPullRequestData = (repoName = 'Shopkart') => {
  const lower = repoName.toLowerCase();

  if (lower.includes('shop') || lower.includes('cart')) {
    return {
      id: 99999,
      number: 14,
      title: 'feat(cart): implement tiered coupon discount & inventory reservation lock',
      state: 'open',
      body: 'Adds inventory lock during 10-minute checkout window to prevent overselling popular items, plus tiered coupon validation.',
      author: {
        login: 'sai-srujan29',
        avatarUrl: 'https://github.com/sai-srujan29.png',
      },
      head: { ref: 'feat/inventory-lock', sha: 'a8b1c2d' },
      base: { ref: 'main', sha: 'e3f4g5h' },
      stats: { additions: 92, deletions: 14, changedFiles: 2, commitsCount: 2 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      url: `https://github.com/sai-srujan29/${repoName}`,
      files: [
        {
          sha: 's1',
          filename: 'services/inventoryLockService.js',
          status: 'added',
          additions: 58,
          deletions: 0,
          changes: 58,
          patch: `@@ -0,0 +1,58 @@
+import redis from '../config/redis.js';
+
+export const reserveStock = async (itemId, quantity, userId) => {
+  const lockKey = \`lock:item:\${itemId}\`;
+  const acquired = await redis.set(lockKey, userId, 'NX', 'EX', 600);
+  if (!acquired) {
+    throw new Error('Item currently locked by another checkout session');
+  }
+  return { reserved: true, expiresAt: Date.now() + 600000 };
+};`,
        },
        {
          sha: 's2',
          filename: 'controllers/checkoutController.js',
          status: 'modified',
          additions: 34,
          deletions: 14,
          changes: 48,
          patch: `@@ -15,14 +15,34 @@
-export const processOrder = async (req, res) => {
-  const order = await Order.create(req.body);
-  res.json(order);
-};
+export const processOrder = async (req, res) => {
+  const { items } = req.body;
+  const reservations = [];
+  try {
+    for (const item of items) {
+      const lock = await reserveStock(item.id, item.qty, req.user._id);
+      reservations.push(lock);
+    }
+    const order = await Order.create({ ...req.body, status: 'confirmed' });
+    res.status(201).json({ success: true, order });
+  } catch (err) {
+    res.status(409).json({ success: false, message: err.message });
+  }
+};`,
        },
      ],
      commits: [
        { sha: 'sc1', message: 'feat: add Redis distributed stock lock', author: 'sai-srujan29', date: new Date().toISOString() },
        { sha: 'sc2', message: 'fix: rollback locks on checkout exception', author: 'sai-srujan29', date: new Date().toISOString() },
      ],
    };
  }

  if (lower.includes('weather')) {
    return {
      id: 99999,
      number: 8,
      title: 'feat(cache): add 30-minute in-memory cache for OpenWeather forecast calls',
      state: 'open',
      body: 'Reduces external rate-limit usage by caching forecast responses in Node-cache keyed by city geo-coordinates.',
      author: {
        login: 'sai-srujan29',
        avatarUrl: 'https://github.com/sai-srujan29.png',
      },
      head: { ref: 'perf/forecast-cache', sha: 'w1w2w3w' },
      base: { ref: 'main', sha: 'w4w5w6w' },
      stats: { additions: 65, deletions: 22, changedFiles: 2, commitsCount: 1 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      url: `https://github.com/sai-srujan29/${repoName}`,
      files: [
        {
          sha: 'w1',
          filename: 'utils/weatherCache.js',
          status: 'added',
          additions: 38,
          deletions: 0,
          changes: 38,
          patch: `@@ -0,0 +1,38 @@
+import NodeCache from 'node-cache';
+const weatherCache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });
+
+export const getCachedWeather = (key) => weatherCache.get(key);
+export const setCachedWeather = (key, data) => weatherCache.set(key, data);`,
        },
        {
          sha: 'w2',
          filename: 'services/weatherApi.js',
          status: 'modified',
          additions: 27,
          deletions: 22,
          changes: 49,
          patch: `@@ -10,22 +10,27 @@
-export const fetchForecast = async (city) => {
-  const res = await axios.get(\`https://api.openweathermap.org/data/2.5/forecast?q=\${city}&appid=\${process.env.WEATHER_API_KEY}\`);
-  return res.data;
-};
+export const fetchForecast = async (city) => {
+  const cacheKey = \`weather:\${city.toLowerCase().trim()}\`;
+  const cached = getCachedWeather(cacheKey);
+  if (cached) return cached;
+  const res = await axios.get(\`https://api.openweathermap.org/data/2.5/forecast?q=\${encodeURIComponent(city)}&appid=\${process.env.WEATHER_API_KEY}\`);
+  setCachedWeather(cacheKey, res.data);
+  return res.data;
+};`,
        },
      ],
      commits: [
        { sha: 'wc1', message: 'perf: cache external weather API responses', author: 'sai-srujan29', date: new Date().toISOString() },
      ],
    };
  }

  if (lower.includes('game') || lower.includes('match')) {
    return {
      id: 99999,
      number: 19,
      title: 'feat(engine): add Fisher-Yates deck shuffle and combo streak bonus',
      state: 'open',
      body: 'Replaces bias-prone Math.random() sort with unbiased Fisher-Yates shuffle algorithm and adds a 1.5x streak multiplier.',
      author: {
        login: 'sai-srujan29',
        avatarUrl: 'https://github.com/sai-srujan29.png',
      },
      head: { ref: 'feat/shuffle-algorithm', sha: 'g1g2g3' },
      base: { ref: 'main', sha: 'g4g5g6' },
      stats: { additions: 44, deletions: 12, changedFiles: 2, commitsCount: 1 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      url: `https://github.com/sai-srujan29/${repoName}`,
      files: [
        {
          sha: 'gm1',
          filename: 'src/gameEngine.js',
          status: 'modified',
          additions: 28,
          deletions: 8,
          changes: 36,
          patch: `@@ -5,8 +5,28 @@
-export const shuffleCards = (cards) => {
-  return cards.sort(() => Math.random() - 0.5);
-};
+export const shuffleCards = (cards) => {
+  const deck = [...cards];
+  for (let i = deck.length - 1; i > 0; i--) {
+    const j = Math.floor(Math.random() * (i + 1));
+    [deck[i], deck[j]] = [deck[j], deck[i]];
+  }
+  return deck;
+};`,
        },
      ],
      commits: [
        { sha: 'gc1', message: 'feat: unbiased card deck shuffle', author: 'sai-srujan29', date: new Date().toISOString() },
      ],
    };
  }

  // Default for other repos
  return {
    id: 99999,
    number: 27,
    title: `refactor(${repoName}): optimize async pipeline & sanitize inputs`,
    state: 'open',
    body: `Performance optimization and input sanitization across database query methods in ${repoName}.`,
    author: {
      login: 'sai-srujan29',
      avatarUrl: 'https://github.com/sai-srujan29.png',
    },
    head: { ref: 'refactor/async-pipeline', sha: 'r1r2r3' },
    base: { ref: 'main', sha: 'r4r5r6' },
    stats: { additions: 110, deletions: 38, changedFiles: 3, commitsCount: 2 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    url: `https://github.com/sai-srujan29/${repoName}`,
    files: [
      {
        sha: 'df1',
        filename: 'src/controller.js',
        status: 'modified',
        additions: 60,
        deletions: 22,
        changes: 82,
        patch: `@@ -14,22 +14,60 @@
-export const queryItems = async (req, res) => {
-  const data = await Model.find({ tag: req.query.tag });
-  res.json(data);
-};
+export const queryItems = async (req, res, next) => {
+  try {
+    const sanitizedTag = String(req.query.tag || '').trim().replace(/[^\w-]/g, '');
+    const data = await Model.find({ tag: sanitizedTag }).lean().limit(50);
+    res.status(200).json({ success: true, count: data.length, data });
+  } catch (err) {
+    next(err);
+  }
+};`,
      },
      {
        sha: 'df2',
        filename: 'src/utils/sanitizer.js',
        status: 'added',
        additions: 50,
        deletions: 16,
        changes: 66,
        patch: `@@ -0,0 +1,50 @@
+export const escapeHtml = (unsafe) => {
+  return unsafe
+    .replace(/&/g, '&amp;')
+    .replace(/</g, '&lt;')
+    .replace(/>/g, '&gt;')
+    .replace(/"/g, '&quot;')
+    .replace(/'/g, '&#039;');
+};`,
      },
    ],
    commits: [
      { sha: 'rc1', message: `refactor: input sanitization and query limits in ${repoName}`, author: 'sai-srujan29', date: new Date().toISOString() },
    ],
  };
};
