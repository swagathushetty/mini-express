// examples/04-full-api.js
const MiniExpress = require('../miniExpress');

const app = new MiniExpress();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/', (req, res) => {
  res.send('<p>Helllloooooooooooooooooooooooooooooo</p>');
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]);
});



app.post('/api/users', (req, res) => {
  res.status(201).json({
    message: 'User created',
    id: Math.random()
  });
});

app.listen(3000, () => {
  console.log('server on port 3000!');
});