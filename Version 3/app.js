var express = require("express");
app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + ""));
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

