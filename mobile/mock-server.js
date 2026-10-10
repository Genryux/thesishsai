const jsonServer = require('json-server');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Setup Multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// Serve uploaded files statically
const express = require('express');
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// We need to parse body to get email/password
server.use(jsonServer.bodyParser);

// Custom One-Step Submission Route (Matches Real Backend Flow)
server.post('/submissions', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { paperId, remarks } = req.body;
  if (!paperId) {
    return res.status(400).json({ error: 'paperId is required' });
  }

  const db = router.db;
  
  const parsedPaperId = isNaN(Number(paperId)) ? paperId : parseInt(paperId, 10);
  
  // Calculate internal version string (like the real backend does)
  const existingSubmissions = db.get('submissions').filter({ paperId: parsedPaperId }).value();
  const versionNum = existingSubmissions.length + 1;
  const version = `v${versionNum}`;
  
  // Create submission record
  const newSubmission = {
    id: Date.now(), // Generate fake ID
    paperId: parsedPaperId,
    submittedBy: 2, // Hardcoded to student user ID (John Doe) for mock
    version: version,
    fileUrl: `/uploads/${req.file.filename}`,
    remarks: remarks || "",
    status: "Submitted",
    submittedAt: new Date().toISOString()
  };

  db.get('submissions').push(newSubmission).write();

  res.status(201).json(newSubmission);
});

// Add custom delay to simulate real network
server.use((req, res, next) => {
  setTimeout(next, 500);
});

// Custom Login Route
// Response shape mirrors the real backend's ServiceResult<T> (types/auth.ts) so the
// mobile client is exercised against the same contract it will use in production.
server.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const db = router.db; // lowdb instance
  
  // Find user
  const users = db.get('users').value();
  const user = users.find(u => String(u.email).toLowerCase() === email && u.password === password);
  
  if (user) {
    // Generate fake token
    const token = 'fake-jwt-token-' + user.id;
    // Only return safe fields (matches backend AuthUser) — never the password.
    const { id, firstName, lastName, roleId } = user;
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { user: { id, firstName, lastName, email: user.email, roleId }, token },
    });
  } else {
    // Generic message so account existence can't be probed.
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
});

// Auth Middleware for all other routes
server.use((req, res, next) => {
  // If it's a login request, pass it through
  if (req.path === '/login') {
    return next();
  }

  // Check for Authorization header
  if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
    const status = 401;
    const message = 'Error in authorization format';
    return res.status(status).json({ status, message });
  }
  
  // Very basic token verification (in a real app, verify JWT)
  const token = req.headers.authorization.split(' ')[1];
  if (!token.startsWith('fake-jwt-token-')) {
    const status = 401;
    const message = 'Access token is invalid or expired';
    return res.status(status).json({ status, message });
  }
  
  next();
});

// Use default middlewares (logger, static, cors, no-cache)
server.use(middlewares);

// Mount the json-server router
server.use(router);

server.listen(3000, '0.0.0.0', () => {
  console.log('JSON Server with Auth is running on port 3000');
});
