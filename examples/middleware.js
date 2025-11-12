// examples/03-middleware.js
const MiniExpress = require('../miniExpress');

const app = new MiniExpress();

// Middleware 1: Logger
app.use((req, res, next) => {
  console.log(`[Logger] ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});


// Middleware 2: Fake authentication
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    req.user = {
      id: 123,
      name: 'John Doe',
      token: authHeader
    };
    next();
  } else {
    // next(new Error('hey no auth'))
    next()
  }
});

app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <h1>Yoooooooooooooooo</h1>
  `);
});


app.get('/protected', (req, res) => {

  if (req.user) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Protected page - Welcome ${req.user.name}!`);
  } else {
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Unauthorized - please provide authorization header');
  }
});

app.use('/api', (req, res, next) => {
  res.setHeader('X-API-Version', '1.0');
  next();
});

// API route
app.get('/api/users', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]));
});

// Error handling middleware (must be last!)
app.use((err, req, res, next) => {
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: err.message,
    stack: err.stack
  }));
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});