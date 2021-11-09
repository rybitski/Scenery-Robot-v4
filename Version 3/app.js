var express = require("express");
app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.use(express.json());

var path = [];

app.post("/input", function (req, res) {
  path = req.body.path;
});

app.get("/input", function (req, res) {
  res.send(path);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/main.html");
  //res.send("Hello World!");
});

app.get("/main.html", function (req, res) {
  //res.sendFile(__dirname + "/main.html");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});


app.post("/callPython", function(req, res){
  callWhenclicked(req.body.path);
});

var returnedData;
app.get("/callPython", function (req, res){
 res.send(returnedData);
});

app.post("/groundPlan", function(req, res){
  console.log("This is where we return the data");
});

//#region 
function callWhenclicked(dataInput){
  console.log("recieved data in api");
  const{ spawn = () => null } = require('child_process');
  var data = dataInput;

  const childPython = spawn('python', ['SplineDraw.py', JSON.stringify(data)]);
  childPython.stdout.on('data', (data) =>{
    returnedData = data.toString('utf8');
  });

  childPython.stderr.on('data', (data) =>{
    console.error(`stdout: ${data}`);
  });

  childPython.on('close', (code) =>{
  });
}
//#endregion
