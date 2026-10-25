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
  // If demo PR requested
  if (pullNumber === 999) {
    return {
      pullRequest: getDemoPullRequestData(repo),
    };
  }

  const response = await api.get(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
  return response.data;
};

export const getDemoPullRequestData = (repoName = 'Shopkart') => {
  return {
    id: 99999,
    number: 42,
    title: 'feat: add user session token rotation and checkout rate limiter',
    state: 'open',
    body: 'Implements secure refresh token rotation to mitigate token replay attacks, adds rate limiting to /api/checkout, and updates unit test suites.',
    author: {
      login: 'sai-srujan29',
      avatarUrl: 'https://github.com/sai-srujan29.png',
    },
    head: {
      ref: 'feature/auth-rate-limit',
      sha: 'a1b2c3d4',
    },
    base: {
      ref: 'main',
      sha: 'e5f6g7h8',
    },
    stats: {
      additions: 142,
      deletions: 28,
      changedFiles: 3,
      commitsCount: 3,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    url: `https://github.com/sai-srujan29/${repoName}`,
    files: [
      {
        sha: 'f1a2b3c',
        filename: 'server/src/middleware/rateLimiter.js',
        status: 'added',
        additions: 48,
        deletions: 0,
        changes: 48,
        patch: `@@ -0,0 +1,48 @@
+import rateLimit from 'express-rate-limit';
+
+export const checkoutLimiter = rateLimit({
+  windowMs: 15 * 60 * 1000,
+  max: 10,
+  standardHeaders: true,
+  legacyHeaders: false,
+  message: {
+    success: false,
+    message: 'Too many checkout attempts from this IP, please try again in 15 minutes.'
+  }
+});
+
+export const apiLimiter = rateLimit({
+  windowMs: 60 * 1000,
+  max: 100,
+});`,
      },
      {
        sha: 'f2b3c4d',
        filename: 'server/src/services/authService.js',
        status: 'modified',
        additions: 64,
        deletions: 18,
        changes: 82,
        patch: `@@ -12,18 +12,64 @@
-export const verifySession = async (token) => {
-  return jwt.verify(token, process.env.JWT_SECRET);
-};
+export const verifySession = async (token) => {
+  try {
+    const decoded = jwt.verify(token, process.env.JWT_SECRET);
+    const user = await User.findById(decoded.id);
+    if (!user) throw new Error('User revoked');
+    return user;
+  } catch (err) {
+    throw new Error('Invalid session signature');
+  }
+};
+
+export const rotateRefreshToken = async (oldToken) => {
+  const session = await Session.findOne({ token: oldToken });
+  if (!session || session.isRevoked) {
+    // Possible token replay attack - revoke all user sessions
+    await Session.updateMany({ userId: session?.userId }, { isRevoked: true });
+    throw new Error('Replay attack detected');
+  }
+  session.isRevoked = true;
+  await session.save();
+  return generateNewTokenPair(session.userId);
+};`,
      },
      {
        sha: 'f3c4d5e',
        filename: 'server/tests/auth.test.js',
        status: 'modified',
        additions: 30,
        deletions: 10,
        changes: 40,
        patch: `@@ -40,10 +40,30 @@
+describe('Rate Limiter Tests', () => {
+  it('should block after 10 requests within windowMs', async () => {
+    for (let i = 0; i < 10; i++) {
+      await request(app).post('/api/checkout').send({});
+    }
+    const res = await request(app).post('/api/checkout').send({});
+    expect(res.status).toBe(429);
+  });
+});`,
      },
    ],
    commits: [
      {
        sha: 'c1d2e3f',
        message: 'feat: add checkout rate limiting middleware',
        author: 'sai-srujan29',
        date: new Date().toISOString(),
      },
      {
        sha: 'c2d3e4f',
        message: 'security: implement refresh token rotation to prevent replay',
        author: 'sai-srujan29',
        date: new Date().toISOString(),
      },
      {
        sha: 'c3d4e5f',
        message: 'test: add integration test cases for checkout rate limiter',
        author: 'sai-srujan29',
        date: new Date().toISOString(),
      },
    ],
  };
};
