/*                                  Begin Seconds Range Slider Section                              */
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value + " sec";

slider.oninput = function () {
  output.innerHTML = this.value + " sec";
};
/*                                  End Seconds Range Slider Section                              */

/*                                   Begin Display Grid (via Toggle Button) Section                      */
var isGridToggled = false;
function myFunction() {
  var elnt = document.getElementById("gridCanvas");
  if (isGridToggled == false) {
    isGridToggled = true;
    elnt.style.visibility = "visible";
    displayGrid();
  } else {
    elnt.style.visibility = "hidden";
    isGridToggled = false;
    removeGridIntervals();
  }
}

//The following code draws a grid on a canvas
//in order to get the grid to turn on and off, we will have to stack two canvas' on top of each other:
//one canvas will be for the grid, one will be for user drawing. When the grid switch is toggled, the grid canvas is set to visible
gridCanvas = document.getElementById("gridCanvas"); //get the canvas by name
var ctx = gridCanvas.getContext("2d"); //set its dimentions to 2d
ctx.canvas.width = gridCanvas.getBoundingClientRect().width;
ctx.canvas.height = gridCanvas.getBoundingClientRect().height;

gridWidth = gridCanvas.getBoundingClientRect().width;
gridHeight = gridCanvas.getBoundingClientRect().height;

function displayGrid() {
  clearGrid();
  var intervalRate = displayGridIntervals();
  drawBoard(intervalRate);
}

var p = 0; //can add a shift in the grid, used in drawBoard()
function drawBoard(intervalRate) {
  //Prints all the vertical lines of the grid
  console.log(intervalRate);
  var rect = gridCanvas.getBoundingClientRect();

  for (var x = 0; x <= gridWidth; ) {
    ctx.moveTo(x + p, p);
    ctx.lineTo(x + p, gridHeight + p);
    x += parseFloat(intervalRate / 2);
  }
  //Prints all the horizontal lines of the grid

  for (var x = 0; x <= gridHeight; ) {
    ctx.moveTo(p, x + p);
    ctx.lineTo(gridWidth + p, x + p);
    x += parseFloat(intervalRate / 2);
  }

  ctx.strokeStyle = "gray";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function clearGrid() {
  ctx = null;
  ctx = gridCanvas.getContext("2d"); //set its dimentions to 2d
  ctx.canvas.width = gridCanvas.getBoundingClientRect().width;
  ctx.canvas.height = gridCanvas.getBoundingClientRect().height;
}

xAxisArray = [];
yAxisArray = [];
function displayGridIntervals() {
  axisFrequency = document.getElementById("frequency").value;
  yAxisArray.length = Math.floor(1 / axisFrequency);
  var intervalRate = displayYIntervals();
  xAxisArray.length = Math.floor(
    document.getElementById("gridCanvas").getBoundingClientRect().width /
      intervalRate
  );
  displayXIntervals(intervalRate);
  return intervalRate;
}

function displayYIntervals() {
  var tempHeight = document
    .getElementById("gridCanvas")
    .getBoundingClientRect()
    .height.toFixed(2);
  var yLocation = tempHeight;
  var yGapRate = (tempHeight / yAxisArray.length).toFixed(2);
  console.log(tempHeight, yGapRate, yAxisArray.length);

  //the pixel accuracy is within +- 5 pixels
  for (var i = 0; i < yAxisArray.length - 1; i++) {
    const div = document.createElement("div" + i);
    div.id = "yCoord";
    div.style.width = "40px";
    div.style.height = "15px";
    div.style.position = "absolute";
    div.style.color = "#00adb5";
    div.style.zIndex = "2";
    div.style.bottom = yLocation - (i + 1) * yGapRate + "px"; //+2px for the border height
    div.style.left += ".5%";
    div.style.fontSize = "13px";
    div.style.textAlign = "center";
    div.style.borderBottom = "2px solid orange";

    var pixelValue = (i + 1) * yGapRate;
    var h1 = document.createElement("h4");
    var feetInches = convertYPixelsToInches(pixelValue);
    var feet = Math.floor(feetInches);
    var inches = (feetInches % 1) * 12;
    h1.innerHTML = feet + "'" + inches + '"';

    div.append(h1);
    yAxisArray[i] = div;
    document.getElementById("leftCont").appendChild(yAxisArray[i]);
  }
  return yGapRate;
}

function displayXIntervals(intervalRate) {
  var tempWidth = document
    .getElementById("gridCanvas")
    .getBoundingClientRect()
    .width.toFixed(2);
  var xLocation = 0;
  //var xGapRate = (tempWidth / (xAxisArray.length - 1)).toFixed(0);
  var xGapRate = intervalRate;
  var rect = document.getElementById("gridCanvas").getBoundingClientRect();
  for (var i = 0; i < xAxisArray.length; i++) {
    const div = document.createElement("div" + i);
    div.id = "xCoord";
    div.style.width = "40px";
    div.style.height = "15px";
    div.style.position = "absolute";
    div.style.zIndex = "2";
    div.style.bottom = ".5%";
    div.style.color = "#00adb5";
    div.style.fontSize = "13px";
    div.style.textAlign = "center";
    div.style.borderLeft = "2px solid orange";
    div.style.left += xLocation + (i + 1) * xGapRate + "px";

    var pixelValue = (i + 1) * xGapRate;
    var h1 = document.createElement("h4");
    var feetInches = convertXPixelsToInches(pixelValue);
    var feet = Math.floor(feetInches);
    var inches = (feetInches % 1) * 12;
    h1.innerHTML = feet + "'" + inches + '"';

    div.append(h1);
    xAxisArray[i] = div;
    document.getElementById("leftCont").appendChild(xAxisArray[i]);
  }
}
function removeGridIntervals() {
  for (var i = 0; i < xAxisArray.length; i++) {
    var elem = document.getElementById("xCoord");
    if (elem != null) {
      elem.remove();
    }
  }

  for (var i = 0; i < yAxisArray.length; i++) {
    var el = document.getElementById("yCoord");
    if (el != null) {
      el.remove();
    }
  }
}
/*                                   End Display Grid (via Toggle Button) Section                      */
function convertYPixelsToInches(inputValInPixels) {
  var rect = document.getElementById("drawingCanvas").getBoundingClientRect();
  //var realY = ((inputValInPixels / rect.height) * stageHeight).toFixed(2);
  var realY = (
    stageHeight -
    (inputValInPixels / rect.height) * stageHeight
  ).toFixed(2);
  //console.log(inputValInPixels, realY);
  return realY;
}

function convertXPixelsToInches(inputValInPixels) {
  var rect = document.getElementById("drawingCanvas").getBoundingClientRect();
  realX = ((inputValInPixels / rect.height) * stageWidth).toFixed(2);
  return realX;
}
/*                                           Begin Verifying Canvas Dimension Input Section                         */
var stageWidth = 0;
var stageHeight = 0;
var interval = 0;
var isToggled = false;
var haveDimensions = false;
//change from length to depth*****
function newTrack() {
  stageWidth = parseInt(document.getElementById("stageWidth").value, 10);
  stageHeight = parseInt(document.getElementById("stageHeight").value, 10);
  var stageWidthInch =
    parseInt(document.getElementById("inchesWidth").value, 10) / 12;
  //(+document.getElementById("inchesWidth").value - 0) / 12;
  //parseFloat(document.getElementById("inchesWidth").value, 10) / 12;
  var stageHeightInch =
    parseInt(document.getElementById("inchesHeight").value, 10) / 12;

  stageWidth += stageWidthInch;
  stageHeight += stageHeightInch;
  stageWidth = stageWidth.toFixed(2);
  stageHeight = stageHeight.toFixed(2);
  //console.log(stageWidth, stageHeight);
  interval = document.getElementById("myRange").value * 1000; // this will turn the seconds into milliseconds

  var popup = document.getElementById("myPopup");
  if (stageWidth == 0 || stageHeight == 0) {
    popup.classList.toggle("show");
    isToggled = true;
  } else {
    isValidToDraw = true;
    if (isToggled == true) {
      popup.classList.toggle("show"); //this will remove the pop up warning
      isToggled = false;
    }

    document.getElementById("displayDim").innerHTML =
      "Width: " +
      stageWidth +
      " inches \n" +
      "Height: " +
      stageHeight +
      " inches";
    haveDimensions = true;
  }
}
/*                                          End Verifying Canvas Dimension Input Section                           */

/*                                    Begin Addtional Button Functions Section                             */
function displayPoints() {
  document.getElementById("xAndYCoordinates").innerHTML = ""; //clear the pre-existing text in the div element

  var rect = document.getElementById("drawingCanvas").getBoundingClientRect();
  //currentXPos = (event.clientX - rect.left) / (rect.right - rect.left) * drawingCanvas.width;
  //currentYPos = (event.clientY - rect.top) / (rect.bottom - rect.top) * drawingCanvas.height;
  /*
  for (var i = 0; i < criticalPointsList.length; i++) {
    console.log(criticalPointsList[i].x, criticalPointsList[i].y);
  }
  */
  var realX, realY;
  for (var i = 0; i < criticalPointsList.length; i++) {
    var tempx = criticalPointsList[i].x;
    var tempy = criticalPointsList[i].y;
    realX = ((tempx / rect.width) * stageWidth).toFixed(2);
    realX = convertXPixelsToInches(tempx);
    //realX = convertXpxToInches)
    //realY = (stageHeight - (tempy / rect.height) * stageHeight).toFixed(2);
    realY = convertYPixelsToInches(tempy);
    //realY = Math.abs(stageWidth - convertYPixelsToInches(tempy));
    if (i + 1 == criticalPointsList.length) {
      //for the last set of points, do not add the extra comma at the end
      document.getElementById("xAndYCoordinates").innerHTML +=
        "(" + realX + ", " + realY + ")";
    } else {
      document.getElementById("xAndYCoordinates").innerHTML +=
        "(" + realX + ", " + realY + "), ";
    }
  }
}

function copyPointsFunction() {
  var copyElement = document.getElementById("xAndYCoordinates"); //select the element
  var elementText = copyElement.textContent; //get the text content from the element
  navigator.clipboard.writeText(elementText);
  alert("Copied the text: " + elementText);
}
//function to reload the page and reset everything
function reloadPage() {
  location = location.href;
}

document.querySelector("#saveButton").addEventListener("click", () => {
  for (var i = 0; i < fullMouseHistoryPoints.length; i++) {
    console.log(fullMouseHistoryPoints[i].x);
  }

  var wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "SheetJS Tutorial",
    Subject: "Test",
    Author: "Red Stapler",
    CreatedDate: new Date(2017, 12, 19),
  };

  wb.SheetNames.push("Test Sheet");
  var ws_data = [["mouseHistoryX", "mouseHistoryY"]];
  for (var i = 0; i < fullMouseHistoryPoints.length; i++) {
    var temp = [];
    temp.push(fullMouseHistoryPoints[i].x);
    temp.push(fullMouseHistoryPoints[i].y);
    ws_data.push(temp);
  }
  var criticalPointsHeading = [
    "XPos",
    "YPos",
    "Width",
    "Height",
    "isClicked",
    "Color",
  ];
  ws_data.push(criticalPointsHeading);

  for (var i = 0; i < criticalPointsList.length; i++) {
    var temp = [];
    temp.push(criticalPointsList[i].x);
    temp.push(criticalPointsList[i].y);
    temp.push(criticalPointsList[i].width);
    temp.push(criticalPointsList[i].height);
    temp.push(criticalPointsList[i].isClicked);
    temp.push(criticalPointsList[i].color);
    ws_data.push(temp);
  }

  var ws = XLSX.utils.aoa_to_sheet(ws_data);
  wb.Sheets["Test Sheet"] = ws;
  var wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }
  saveAs(
    new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
    "Workspace.xlsx"
  );
});

/*                                    End Addtional Button Functions Section                             */

/*                                          Begin User Drawing Section                              */
drawingCanvas = document.getElementById("drawingCanvas"); //get the canvas by name
var context = drawingCanvas.getContext("2d"); //set its dimentions to 2d
context.canvas.width = drawingCanvas.getBoundingClientRect().width;
context.canvas.height = drawingCanvas.getBoundingClientRect().height;
context.lineWidth = 1;
context.lineCap = "round";
context.strokeStyle = "black"; //finish setting up the drawing canvas

var fullMouseHistoryPoints = []; //stores all the mouse history
var criticalPointsList = []; //this list stores all the critical points extracted at specified intervals
var preEditCritPointsList = [];
var preEditFullMouseHistoryPoints = [];
var middleFragmentArray = [];
var middleFragmentArrayCriticalPoints = [];
var pointsSelected = []; //this list stores the two points that are selected and we need to erase everything in the middle
var timer;
var startDrawing = false; //variable to conrol when to start drawing
var numPointsSelected = 0;
var indexEdited = 0;
var editLocation = "none";
var drawingLocation = "end";
var middleEditOne, middleEditTwo;
var indexFirstPoint, indexSecondPoint;

//every time the mouse moves, a new timer function is called and a set of points are pushed into the array
var startTimerOnce = true;
document.addEventListener("mousemove", function (event) {
  var rect = drawingCanvas.getBoundingClientRect();
  currentXPos =
    ((event.clientX - rect.left) / (rect.right - rect.left)) *
    drawingCanvas.width;
  currentYPos =
    ((event.clientY - rect.top) / (rect.bottom - rect.top)) *
    drawingCanvas.height;

  if (drawingCanvas.contains(event.target)) {
    if (startDrawing) {
      if (startTimerOnce) {
        startTimerOnce = false;
        timer = setInterval(function () {
          if (drawingLocation == "end") {
            criticalPointsList.push(
              new criticalPoint(currentXPos, currentYPos)
            );
          }
          if (drawingLocation == "beginning") {
            criticalPointsList.unshift(
              new criticalPoint(currentXPos, currentYPos)
            );
          }
          if (drawingLocation == "middle") {
            middleFragmentArrayCriticalPoints.push(
              new criticalPoint(currentXPos, currentYPos)
            );
          }
        }, interval);
      }
      draw(window.event);
    }
  }
});

document.onmouseup = function () {
  var rect = drawingCanvas.getBoundingClientRect();
  var currentXPos, currentYPos;
  if (drawingCanvas.contains(event.target)) {
    if (startDrawing) {
      currentXPos =
        ((event.clientX - rect.left) / (rect.right - rect.left)) *
        drawingCanvas.width;
      currentYPos =
        ((event.clientY - rect.top) / (rect.bottom - rect.top)) *
        drawingCanvas.height;
      if (drawingLocation == "end") {
        criticalPointsList.push(new criticalPoint(currentXPos, currentYPos));
      }
      if (drawingLocation == "beginning") {
        criticalPointsList.unshift(new criticalPoint(currentXPos, currentYPos));
      }
      if (drawingLocation == "middle") {
        var tempted = new MyRect(
          preEditFullMouseHistoryPoints[middleEditTwo].x - 5,
          preEditFullMouseHistoryPoints[middleEditTwo].y - 5,
          10,
          10
        );
        if (
          tempted.contains(
            middleFragmentArray[middleFragmentArray.length - 1].x,
            middleFragmentArray[middleFragmentArray.length - 1].y
          )
        ) {
          postEraseProtocol();
          editLocation = "none";
          fullMouseHistoryPoints.splice(
            middleEditOne,
            1,
            ...middleFragmentArray
          );

          criticalPointsList.splice(
            Math.min(indexFirstPoint, indexSecondPoint),
            1,
            ...middleFragmentArrayCriticalPoints
          );
          preEditCritPointsList = [];
          preEditFullMouseHistoryPoints = [];
          middleFragmentArray = [];
          middleFragmentArrayCriticalPoints = [];
        } else {
          drawLinesFromHistory();
          middleFragmentArray = [];
          middleFragmentArrayCriticalPoints = [];
        }
      }
    }
  }
  clearInterval(timer);
  startTimerOnce = true;
  startDrawing = false;

  //loop through the list of critical points and keep a consistent min distance of atleast 20 px;
  for (var i = 0; i < criticalPointsList.length - 1; i++) {
    var currLocation = i + 1;
    var dist = Math.sqrt(
      Math.pow(
        criticalPointsList[currLocation].x - criticalPointsList[i].x,
        2
      ) +
        Math.pow(
          criticalPointsList[currLocation].y - criticalPointsList[i].y,
          2
        )
    );
    while (dist <= 20) {
      //while the min distance between 2 citical points is less than 20 pixels, remove them
      if (currLocation != criticalPointsList.length - 1) {
        criticalPointsList.splice(currLocation, 1);
      } else {
        criticalPointsList.splice(currLocation - 1, 1);
        break;
      }
      //currLocation++;
      if (currLocation >= criticalPointsList.length) {
        break;
      }

      dist = Math.sqrt(
        Math.pow(
          criticalPointsList[currLocation].x - criticalPointsList[i].x,
          2
        ) +
          Math.pow(
            criticalPointsList[currLocation].y - criticalPointsList[i].y,
            2
          )
      );
    }
  }
};

/*
realX = ((currentXPos / rect.width) * stageWidth).toFixed(2);
    realY = (stageHeight-((currentYPos / rect.height) * stageHeight)).toFixed(2);
*/

//when the mouse is pressed down, it check whether there is a line drawn and if the current mouse position is near where the line was last drawn
document.addEventListener("mousedown", function (event) {
  var rect = drawingCanvas.getBoundingClientRect();
  var currentXPos, currentYPos; //get the current x and y position with respects to the drawing canvas
  currentXPos =
    ((event.clientX - rect.left) / (rect.right - rect.left)) *
    drawingCanvas.width;
  currentYPos =
    ((event.clientY - rect.top) / (rect.bottom - rect.top)) *
    drawingCanvas.height;
  startDrawing = false;

  if (drawingCanvas.contains(event.target)) {
    if (haveDimensions == true) {
      if (fullMouseHistoryPoints.length > 0) {
        //if there is a list of old mouse locations
        //if there is a list of old mouse locations, we want to have the option to be able to edit at the front of the path and at the end
        var lastLocation = new MyRect(
          fullMouseHistoryPoints[fullMouseHistoryPoints.length - 1].x - 5,
          fullMouseHistoryPoints[fullMouseHistoryPoints.length - 1].y - 5,
          10,
          10
        );
        var startLocation = new MyRect(
          fullMouseHistoryPoints[0].x - 5,
          fullMouseHistoryPoints[0].y - 5,
          10,
          10
        );

        if (editLocation == "middle") {
          var middleEditFirstRect = new MyRect(
            preEditFullMouseHistoryPoints[middleEditOne].x - 5,
            preEditFullMouseHistoryPoints[middleEditOne].y - 5,
            10,
            10
          );
          if (middleEditFirstRect.contains(currentXPos, currentYPos)) {
            startDrawing = true;
            drawingLocation = "middle";
            setPosition(window.event);
          }
        } else {
          if (lastLocation.contains(currentXPos, currentYPos)) {
            startDrawing = true;
            criticalPointsList.push(
              new criticalPoint(currentXPos, currentYPos)
            );
            drawingLocation = "end";
            setPosition(window.event);
          }
          if (startLocation.contains(currentXPos, currentYPos)) {
            startDrawing = true;
            criticalPointsList.unshift(
              new criticalPoint(currentXPos, currentYPos)
            );
            drawingLocation = "beginning";
            setPosition(window.event);
          }
        }
      } else {
        startDrawing = true;
        criticalPointsList.push(new criticalPoint(currentXPos, currentYPos)); //where the mouse was first pressed down, get a critical point
        setPosition(window.event);
      }
    }
  }

  if (document.getElementById("pointsCanvas").contains(event.target)) {
    if (criticalPointsList.length > 0) {
      for (var i = 0; i < criticalPointsList.length; i++) {
        if (criticalPointsList[i].contains(currentXPos, currentYPos)) {
          if (pointsSelected.includes(criticalPointsList[i])) {
            pointsSelected.splice(
              pointsSelected.indexOf(criticalPointsList[i]),
              1
            );
            numPointsSelected--;
            criticalPointsList[i].updateColor();
            reDrawPoints();
          } else {
            if (numPointsSelected < 2) {
              pointsSelected.push(criticalPointsList[i]);
              criticalPointsList[i].updateColor();
              reDrawPoints();
              numPointsSelected++;
            }
          }
        }
      }
    }
  }
});

// new position from mouse event
function setPosition(e) {
  var rect = drawingCanvas.getBoundingClientRect();
  currentXPos =
    ((event.clientX - rect.left) / (rect.right - rect.left)) *
    drawingCanvas.width;
  currentYPos =
    ((event.clientY - rect.top) / (rect.bottom - rect.top)) *
    drawingCanvas.height;
  if (drawingLocation == "end") {
    fullMouseHistoryPoints.push(new myPoint(currentXPos, currentYPos));
  }
  if (drawingLocation == "beginning") {
    fullMouseHistoryPoints.unshift(new myPoint(currentXPos, currentYPos));
  }
  if (drawingLocation == "middle") {
    middleFragmentArray.push(new myPoint(currentXPos, currentYPos));
  }
}

function MyRect(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;

  this.contains = function (x, y) {
    return (
      this.x <= x &&
      x <= this.x + this.width &&
      this.y <= y &&
      y <= this.y + this.height
    );
  };
  this.draw = function (ctx) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.rect(this.x, this.y, this.width, this.height);
  };
  this.toString = function () {
    console.log(
      "x: " + this.x,
      " y: " + this.y,
      " width: " + this.width,
      " height: " + this.height
    );
  };
}

function myPoint(x, y) {
  this.x = x;
  this.y = y;
}

function criticalPoint(x, y) {
  this.x = x - 5;
  this.y = y - 5;
  this.width = 10;
  this.height = 10;
  this.isClicked = false;
  this.color = "red";

  this.updateColor = function () {
    if (this.color == "red") {
      this.color = "green";
    } else {
      this.color = "red";
    }
  };

  this.contains = function (x, y) {
    return (
      this.x <= x &&
      x <= this.x + this.width &&
      this.y <= y &&
      y <= this.y + this.height
    );
  };

  this.draw = function (ctx) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.stroke();
  };

  this.toString = function () {
    console.log("Critical Point at: ", this.x, this.y, this.width, this.height);
  };
}

var isValidToDraw = false;
var isDrawing = false;
function draw(e) {
  if (isValidToDraw == true) {
    if (e.buttons !== 1) return;
    context.strokeStyle = "black";
    context.lineWidth = 1;
    isDrawing = true;
    context.beginPath(); // begin
    if (drawingLocation == "end") {
      context.moveTo(
        fullMouseHistoryPoints[fullMouseHistoryPoints.length - 1].x,
        fullMouseHistoryPoints[fullMouseHistoryPoints.length - 1].y
      );
      setPosition(e);
      context.lineTo(
        fullMouseHistoryPoints[fullMouseHistoryPoints.length - 1].x,
        fullMouseHistoryPoints[fullMouseHistoryPoints.length - 1].y
      );
    }
    if (drawingLocation == "beginning") {
      context.moveTo(fullMouseHistoryPoints[0].x, fullMouseHistoryPoints[0].y);
      setPosition(e);
      context.lineTo(fullMouseHistoryPoints[0].x, fullMouseHistoryPoints[0].y);
    }
    if (drawingLocation == "middle") {
      context.moveTo(
        middleFragmentArray[middleFragmentArray.length - 1].x,
        middleFragmentArray[middleFragmentArray.length - 1].y
      );
      setPosition(e);
      context.lineTo(
        middleFragmentArray[middleFragmentArray.length - 1].x,
        middleFragmentArray[middleFragmentArray.length - 1].y
      );
    }
    context.stroke(); // draw it!
  }
}
/*                                                      End User Drawing Section                            */

/*                                        Begin Draw Points on Canvas Section                            */
var isPointsToggled = false;
function drawCoordinates() {
  var elnt = document.getElementById("pointsCanvas");
  if (isPointsToggled == false) {
    isPointsToggled = true;
    elnt.style.visibility = "visible";
    document.getElementById("pointsPopup").style.visibility = "visible";
    reDrawPoints();
  } else {
    elnt.style.visibility = "hidden";
    document.getElementById("pointsPopup").style.visibility = "hidden";
    isPointsToggled = false;
  }
}

function reDrawPoints() {
  var pointsCanvas = document.getElementById("pointsCanvas");
  var rect = pointsCanvas.getBoundingClientRect();
  var ctx = "";
  ctx = pointsCanvas.getContext("2d"); //set its dimentions to 2d
  ctx.canvas.width = pointsCanvas.getBoundingClientRect().width;
  ctx.canvas.height = pointsCanvas.getBoundingClientRect().height;
  for (var i = 0; i < criticalPointsList.length; i++) {
    criticalPointsList[i].draw(ctx);
  }
}
/*                                  End Draw Points on Canvas Section                          */

/*                                                       Begin Undo Button Section                            */
var undoTimer;
document.getElementById("undoButton").onmousedown = function (event) {
  editLocation = "none";
  undoTimer = setInterval(function () {
    if (criticalPointsList.length > 0) {
      while (
        criticalPointsList[criticalPointsList.length - 1].contains(
          fullMouseHistoryPoints[fullMouseHistoryPoints.length - 1].x,
          fullMouseHistoryPoints[fullMouseHistoryPoints.length - 1].y
        )
      ) {
        if (
          pointsSelected.includes(
            criticalPointsList[criticalPointsList.length - 1]
          )
        ) {
          pointsSelected.splice(
            pointsSelected.indexOf(
              criticalPointsList[criticalPointsList.length - 1]
            ),
            1
          );
          numPointsSelected--;
        }
        criticalPointsList.pop();
        if (criticalPointsList.length == 0) {
          break;
        }
      }
    }
    fullMouseHistoryPoints.pop();
    drawLinesFromHistory();
    reDrawPoints();
  }, 25);
};

document.getElementById("undoButton").onmouseup = function (event) {
  clearInterval(undoTimer);
};

function drawLinesFromHistory() {
  context = null;
  context = drawingCanvas.getContext("2d"); //set its dimentions to 2d
  context.canvas.width = drawingCanvas.getBoundingClientRect().width;
  context.canvas.height = drawingCanvas.getBoundingClientRect().height;

  context.lineWidth = 1;
  context.lineCap = "round";
  context.strokeStyle = "black";

  if (fullMouseHistoryPoints.length >= 2) {
    for (var i = 0; i < fullMouseHistoryPoints.length - 1; i++) {
      if (i == indexEdited && editLocation == "middle") {
        i = i + 1;
      }
      context.beginPath(); // begin
      context.moveTo(fullMouseHistoryPoints[i].x, fullMouseHistoryPoints[i].y);
      context.lineTo(
        fullMouseHistoryPoints[i + 1].x,
        fullMouseHistoryPoints[i + 1].y
      );
      context.stroke();
    }
  }
}

/*                                                       End Undo Button Section                            */

/*                                                    Begin Erase Button Section                            */
var edit = false;
function eraseFunction() {
  if (edit == false) {
    var startSplice, endSplice;
    editLocation = "middle";
    if (numPointsSelected == 2) {
      //verified that we have two distinct pionts in points Selected
      pointsSelected[0].toString();
      pointsSelected[1].toString();
      //indexes are correct
      indexFirstPoint = criticalPointsList.indexOf(pointsSelected[0]);
      indexSecondPoint = criticalPointsList.indexOf(pointsSelected[1]);
      var tempmx = Math.max(indexFirstPoint, indexSecondPoint);
      indexFirstPoint = Math.min(indexFirstPoint, indexSecondPoint);
      indexSecondPoint = tempmx;

      //find the distance between the two indexes
      var distance = indexSecondPoint - indexFirstPoint;
      if (indexFirstPoint < indexSecondPoint) {
        for (var i = 0; i < fullMouseHistoryPoints.length; i++) {
          if (
            pointsSelected[0].contains(
              fullMouseHistoryPoints[i].x,
              fullMouseHistoryPoints[i].y
            )
          ) {
            startSplice = i;
            break;
          }
        }
        for (var i = fullMouseHistoryPoints.length - 1; i >= 0; i--) {
          if (
            pointsSelected[1].contains(
              fullMouseHistoryPoints[i].x,
              fullMouseHistoryPoints[i].y
            )
          ) {
            endSplice = i;
            break;
          }
        }
      } else {
        for (var i = 0; i < fullMouseHistoryPoints.length; i++) {
          if (
            pointsSelected[1].contains(
              fullMouseHistoryPoints[i].x,
              fullMouseHistoryPoints[i].y
            )
          ) {
            startSplice = i;
            break;
          }
        }
        for (var i = fullMouseHistoryPoints.length - 1; i >= 0; i--) {
          if (
            pointsSelected[0].contains(
              fullMouseHistoryPoints[i].x,
              fullMouseHistoryPoints[i].y
            )
          ) {
            endSplice = i;
            break;
          }
        }
      }

      var lineSpliceDistance =
        Math.max(startSplice, endSplice) - Math.min(startSplice, endSplice);

      //if the first critical point is selected
      if (
        edit == false &&
        fullMouseHistoryPoints[0].x ==
          criticalPointsList[indexFirstPoint].x + 5 &&
        fullMouseHistoryPoints[0].y == criticalPointsList[indexFirstPoint].y + 5
      ) {
        editLocation = "beginning";
      }

      //if the last critical point is selected
      if (
        edit == false &&
        fullMouseHistoryPoints[fullMouseHistoryPoints.length - 1].x ==
          criticalPointsList[indexSecondPoint].x + 5 &&
        fullMouseHistoryPoints[fullMouseHistoryPoints.length - 1].y ==
          criticalPointsList[indexSecondPoint].y + 5
      ) {
        editLocation = "end";
      }

      //if both the first and last critical points are selected
      if (
        edit == false &&
        fullMouseHistoryPoints[0].x ==
          criticalPointsList[indexFirstPoint].x + 5 &&
        fullMouseHistoryPoints[0].y == criticalPointsList[indexFirstPoint].y + 5
      ) {
        if (
          fullMouseHistoryPoints[fullMouseHistoryPoints.length - 1].x ==
            criticalPointsList[indexSecondPoint].x + 5 &&
          fullMouseHistoryPoints[fullMouseHistoryPoints.length - 1].y ==
            criticalPointsList[indexSecondPoint].y + 5
        ) {
          editLocation = "clearPage";
        }
      }
      // Before this code we are checking to see where the erase funciton should happen
      //after this, we can execute the desired locations
      if (edit == false && editLocation == "clearPage") {
        preEditCritPointsList = cloneArray(criticalPointsList);
        preEditFullMouseHistoryPoints = cloneArray(fullMouseHistoryPoints);

        for (var i = 0; i < fullMouseHistoryPoints.length; i++) {
          fullMouseHistoryPoints.pop();
        }
        for (var i = 0; i < criticalPointsList.length; i++) {
          criticalPointsList.pop();
        }
        fullMouseHistoryPoints.length = 0;
        criticalPointsList.length = 0;
        fullMouseHistoryPoints = [];
        criticalPointsList = [];
        postEraseProtocol();
      }

      if (edit == false && editLocation == "beginning") {
        preEditCritPointsList = cloneArray(criticalPointsList);
        preEditFullMouseHistoryPoints = cloneArray(fullMouseHistoryPoints);

        startSplice = 0;
        fullMouseHistoryPoints.splice(
          Math.min(startSplice, endSplice),
          lineSpliceDistance
        );
        criticalPointsList.splice(
          Math.min(indexFirstPoint, indexSecondPoint),
          distance
        );
        indexEdited = 0;
        edit = true;
        postEraseProtocol();
      }

      //erase in the middle works
      if (edit == false && editLocation == "middle") {
        preEditCritPointsList = cloneArray(criticalPointsList);
        preEditFullMouseHistoryPoints = cloneArray(fullMouseHistoryPoints);
        middleEditOne = Math.min(startSplice, endSplice);
        middleEditTwo = Math.max(startSplice, endSplice);
        fullMouseHistoryPoints.splice(
          Math.min(startSplice, endSplice) + 1,
          lineSpliceDistance - 1
        );
        criticalPointsList.splice(indexFirstPoint + 1, distance - 1);

        indexEdited = Math.min(startSplice, endSplice);
        edit = true;
      }

      if (edit == false && editLocation == "end") {
        preEditCritPointsList = cloneArray(criticalPointsList);
        preEditFullMouseHistoryPoints = cloneArray(fullMouseHistoryPoints);
        fullMouseHistoryPoints.splice(
          Math.min(startSplice, endSplice) + 1,
          fullMouseHistoryPoints.length - Math.min(startSplice, endSplice) + 1
        );
        criticalPointsList.splice(
          indexFirstPoint + 1,
          criticalPointsList.length - indexFirstPoint
        );
        indexEdited = Math.min(startSplice, endSplice);
        edit = true;
        postEraseProtocol();
      }

      drawLinesFromHistory();
      reDrawPoints();
    } else {
      alert("Please select atleast 2 points");
    }
  } else {
    alert("please finish editing");
  }
}

function postEraseProtocol() {
  for (var i = 0; i < pointsSelected.length; i++) {
    pointsSelected[i].updateColor();
  }
  numPointsSelected = 0;
  pointsSelected = [];
  edit = false;
}

function cloneArray(inputArr) {
  var temp = [];
  for (var i = 0; i < inputArr.length; i++) {
    temp.push(inputArr[i]);
  }
  return temp;
}
/*                                                      End Erase Button Section                            */

document.getElementById("docpicker").addEventListener("change", importFile);
function importFile(evt) {
  var f = evt.target.files[0];

  if (f) {
    var r = new FileReader();
    r.onload = (e) => {
      var contents = processExcel(e.target.result);
    };
    r.readAsBinaryString(f);
  } else {
    console.log("Failed to load file");
  }
}
function processExcel(data) {
  fullMouseHistoryPoints = [];
  criticalPointsList = [];
  var isCritPoint = false;
  var workbook = XLSX.read(data, {
    type: "binary",
  });
  var firstSheet = workbook.SheetNames[0];
  var excelRows = XLSX.utils.sheet_to_row_object_array(
    workbook.Sheets[firstSheet]
  );
  for (var i = 0; i < excelRows.length; i++) {
    if (excelRows[i].mouseHistoryX == "XPos") {
      i++;
      isCritPoint = true;
    }

    if (isCritPoint == false) {
      fullMouseHistoryPoints.push(
        new myPoint(excelRows[i].mouseHistoryX, excelRows[i].mouseHistoryY)
      );
    } else {
      criticalPointsList.push(
        new criticalPoint(
          excelRows[i].mouseHistoryX + 5,
          excelRows[i].mouseHistoryY + 5
        )
      );
    }
  }
  for (var i = 0; i < fullMouseHistoryPoints.length; i++) {
    console.log(fullMouseHistoryPoints[i].x);
  }
  drawLinesFromHistory();
}

function sendPath() {
  var data = [];
  var rect = document.getElementById("drawingCanvas").getBoundingClientRect();
  for (var i = 0; i < criticalPointsList.length; i++) {
    var tempx = criticalPointsList[i].x;
    var tempy = criticalPointsList[i].y;
    var realX = ((tempx / rect.width) * stageWidth).toFixed(2);
    var realY = (stageHeight - (tempy / rect.height) * stageHeight).toFixed(2);
    data.push([realX, realY]);
  }
  console.log(data);
  var xhr = new XMLHttpRequest();
  var url = "http://localhost:3000/input";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  /*
  xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
          var json = JSON.parse(xhr.responseText);
          console.log(json.email + ", " + json.password);
      }
  };
  */
  var data = JSON.stringify({ path: data });
  xhr.send(data);
}
