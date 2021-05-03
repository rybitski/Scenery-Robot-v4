const express = require('express')
const app = express()
const port = 3000;


app.use(express.json())

app.post('/form', (req, res) => {
    const name = req.body.name
    console.log(name)
  })

app.listen(port, () => {
console.log(`Example app listening at http://localhost:${port}`)
});