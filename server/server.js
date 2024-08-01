// server/index.js
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => res.send('Hello from the server!'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
