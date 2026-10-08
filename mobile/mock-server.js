const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// We need to parse body to get email/password
server.use(jsonServer.bodyParser);

// Add custom delay to simulate real network
server.use((req, res, next) => {
  setTimeout(next, 500);
});

// Custom Login Route
server.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db; // lowdb instance
  
  // Find user
  const users = db.get('users').value();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Generate fake token
    const token = 'fake-jwt-token-' + user.id;
    res.status(200).json({ token, user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
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
