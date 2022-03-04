var express = require("express");
app = express();
const port = process.env.PORT || 3000;

const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
	windowMs: 1000, // 1 second
	max: 1, // Limit each IP to 1 requests per `window` (here, per 1 second)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests


app.use(express.static(__dirname + ""));
app.use(express.json());
app.use(limiter)




var pythonpath = 'python'
if (process.platform === 'darwin'){
  pythonpath = '/usr/bin/python'
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/main.html");
  //res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

//#region Robot Control API's
// var control_object = [];

// app.post("/control", function (req, res) {
//   control_object = req.body.path;
// });

// app.put("/control", function (req, res) {
//   control_object = req.body.path;
// });

// app.get("/control", function (req, res) {
//   res.send(control_object);
// });
//#endregion

//#region Data Transfer API's
var path = [];

app.post("/input", (req, res) =>{
  path = req.body.path;
});  

app.get("/input", (req, res) =>{
  res.send(path);
});
//#endregion

//#region B-Spline API's
app.post("/call-external-python-script", (req, res) =>{
  console.log("inside call-external-python-script api");
  callWhenclicked(req.body.path);
});

function callWhenclicked(dataInput){
  // console.log("recieved data in api");
  const{ spawn = () => null } = require('child_process');
  var data = dataInput;

  const childPython = spawn(pythonpath, ['SplineDraw.py', JSON.stringify(data)]);
  childPython.stdout.on('data', (data) =>{
    returnedData = data.toString('utf8');
  });

  childPython.stderr.on('data', (data) =>{
    console.error(`stdout: ${data}`);
  });

  childPython.on('close', (code) =>{
  });
}

var returnedData;
app.get("/b-spline-returned-data", (req, res)=>{
 res.send(returnedData);
});

//#endregion
