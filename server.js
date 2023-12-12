const express = require('express')
const app = express()
const port = 3000

// Documented https://expressjs.com/en/starter/static-files.html
app.use(express.static('fa'));

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

