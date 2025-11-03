const MiniExpress = require('../miniExpress');

const app = new MiniExpress();

// Home route
app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <h1>MiniExpress Routing Demo</h1>
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/users">Users</a></li>
      <li><a href="/users/123">User 123</a></li>
      <li><a href="/products/456/reviews/789">Product Review</a></li>
    </ul>
  `);
});

// About route
app.get('/about', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('About Page');
});

// Users list
app.get('/users', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
  ]));
});

// Single user with parameter
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    id: userId,
    name: `User ${userId}`,
    params: req.params
  }));
});

// Multiple parameters
app.get('/products/:productId/reviews/:reviewId', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    product: req.params.productId,
    review: req.params.reviewId,
    message: 'Review details'
  }));
});

// POST route (test with curl or Postman)
app.post('/users', (req, res) => {
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'User created',
    method: req.method
  }));
});

// PUT route
app.put('/users/:id', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: `User ${req.params.id} updated`,
    method: req.method
  }));
});

// DELETE route
app.delete('/users/:id', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: `User ${req.params.id} deleted`,
    method: req.method
  }));
});

app.listen(3000, () => {
  console.log('Routing server running on port 3000');
});