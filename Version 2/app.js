var express = require('express');
app = express();
const port = 3000;

app.use(express.static(__dirname + '/public'));
app.use(express.json());

var path = [];

app.post('/test', function(req,res){
  path = req.body.path;
  console.log(path)
}); 

app.get('/test', function(req,res){
  res.send(path)
}); 

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

app.get('/main.html', function(req,res){
    res.sendFile(__dirname + '/main.html');
}); 

app.listen(port, () => {
console.log(`Example app listening at http://localhost:${port}`)
});