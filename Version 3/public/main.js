
//#region Side Navbar
/*---------------------------Begin Side Navbar Stuff---------------------*/

// used to changed between the sliding panel on the right hand side
var optionsList = document.getElementsByClassName("sideBarDetails");
function callSideBar(number) {
  for (i = 0; i < optionsList.length; i++) {
    if (i == number) {
      if (
        document.getElementsByClassName("sideBarDetails")[number].style.left ==
        "-300px"
      ) {
        //else just 40 pixels to the left
        //doing that causes it to be hidden behing the right side panel
        document.getElementsByClassName("sideBarDetails")[number].style.left =
          "40px";

      } else {
         // the panel is shifted to the left by 300 pixel when it is toggled
        document.getElementsByClassName("sideBarDetails")[number].style.left =
          "-300px";
      }
    } else {
      document.getElementsByClassName("sideBarDetails")[i].style.left = "40px";
    }
  }
}

document.getElementById("leftCont").onmouseover = function (event) {
  for (var i = 0; i < optionsList.length; i++) {
    if (optionsList[i].contains(event.target) == false) {
      if (
        document.getElementsByClassName("sideBarDetails")[i].style.left ==
        "-300px"
      ) {
        document.getElementsByClassName("sideBarDetails")[i].style.left =
          "40px";
      }
    }
  }
};
/*---------------------------End Side Navbar Stuff---------------------*/
//#endregion

const box = document.querySelector('.box');
box.addEventListener('click', (e)=>{
  e.target.classList.toggle('pause');
})

var halt = true;
//#region Send Path to Robot
function sendPath() {
  var data = [];
  var rect = document.getElementById("drawingCanvas").getBoundingClientRect();
  for (var i = 0; i < criticalPointsList.length; i++) {
    var tempx = criticalPointsList[i].x;
    var tempy = criticalPointsList[i].y;
    // var realX = ((tempx / rect.width) * stageWidth).toFixed(2);
    var realX = ((tempx/ rect.height)*stageWidth).toFixed(2);
    var realY = (stageHeight - (tempy / rect.height) * stageHeight).toFixed(2);
    data.push([realX, realY]);
  }

  halt = !halt;
  console.log(halt);

  var finalData = [halt,data];

  var xhr = new XMLHttpRequest();
  var url = "http://localhost:3000/input";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  var finalData = JSON.stringify({ path: finalData });
  xhr.send(finalData);
  
  console.log("sent data");
  
  //OSC packet

  //updateControlEndpoint();
}
//#endregion

//#region Grid Stuff
/*---------------------------------------------Begin Display Grid (via Toggle Button) Section----------------------------------------------------------------------------*/

window.onload = function(){
  gridToggle();
}

// function updateControlEndpoint(){
//   console.log("called control endpoint");
//   var data = {
//   "Stop Movement": stop_movement,
//   "Cue Number": cue_number,
//   "Run Cue": run_cue,
//   "Next Cue": next_cue,
//   "Cue Progression": cue_progression,
//   "Lift": lift,
//   "IO 1": io_1,
//   "IO 2": io_2,
//   "IO 3": io_3,
//   "IO 4": io_4,
//   "IO 5": io_5,
//   "Control Source": control_source
//   }
//   var xhr = new XMLHttpRequest();
//   var url = "http://localhost:3000/control";
//   xhr.open("PUT", url, true);
//   xhr.setRequestHeader("Content-Type", "application/json");
//   var data = JSON.stringify({ path: data });
//   xhr.send(data);
// }

// function createControlEndpoint() {
//   console.log("called control endpoint");
//   var data = {
//   "Stop Movement": stop_movement,
//   "Cue Number": cue_number,
//   "Run Cue": run_cue,
//   "Next Cue": next_cue,
//   "Cue Progression": cue_progression,
//   "Lift": lift,
//   "IO 1": io_1,
//   "IO 2": io_2,
//   "IO 3": io_3,
//   "IO 4": io_4,
//   "IO 5": io_5,
//   "Control Source": control_source
//   }
//   var xhr = new XMLHttpRequest();
//   var url = "http://localhost:3000/control";
//   xhr.open("POST", url, true);
//   xhr.setRequestHeader("Content-Type", "application/json");
//   var data = JSON.stringify({ path: data });
//   xhr.send(data);
// }


//#endregion

//#region Grid Stuff
/*---------------------------------------------Begin Display Grid (via Toggle Button) Section----------------------------------------------------------------------------*/
var isGridToggled = false;
var displayGridOnLoad = true;

function myFunction() {
  //console.log("i was here");
  //frequency = document.getElementById("frequency").value;
  removeGridIntervals();
  displayGrid();
}

function gridToggle(){
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

function setGridToggle(status){
  gridSwitch = document.getElementById("gridSwitch");
  gridToggleStatus = gridSwitch.checked;

  if (gridToggleStatus == status){
    gridSwitch.checked = !status;
    gridToggle();
    console.log(status);
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

  ctx.strokeStyle = "#333333";
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
  var axisFrequency = document.getElementById("frequency").value;
  // if(displayGridOnLoad == true){
  //   axisFrequency = .25;
  //   displayGridOnLoad = false;
  // }else{
  //   axisFrequency = document.getElementById("frequency").value;
  // }
  
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

  //the pixel accuracy is within +- 5 pixels
  for (var i = 0; i < yAxisArray.length - 1; i++) {
    const div = document.createElement("div" + i);
    div.id = "yCoord";
    div.style.width = "40px";
    div.style.height = "15px";
    div.style.position = "absolute";
    // div.style.color = "#00adb5";
    // div.style.color = "#FF9933";
    div.style.color = "#666666";
    div.style.zIndex = "2";
    div.style.bottom = yLocation - (i + 1) * yGapRate + "px"; //+2px for the border height
    div.style.left += ".5%";
    div.style.fontSize = "13px";
    div.style.textAlign = "center";
    // div.style.borderBottom = "2px solid orange";

    var pixelValue = (i + 1) * yGapRate;
    var h1 = document.createElement("h4");
    var feetInches = convertYPixelsToInches(pixelValue);
    var feet = Math.floor(feetInches);
    var inches = Math.round((feetInches % 1) * 12);
    h1.innerHTML = feet + "'" + inches + '"';

    div.append(h1);
    yAxisArray[i] = div;
    document.getElementById("leftCont").appendChild(yAxisArray[i]);
  }
  return yGapRate;
}

function displayXIntervals(intervalRate) {
  var xLocation = 0;
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
    // div.style.color = "#00adb5";
    // div.style.color = "#FF9933";
    div.style.color = "#666666";
    div.style.fontSize = "13px";
    div.style.textAlign = "center";
    // div.style.borderLeft = "2px solid orange";
    div.style.left += xLocation + (i + 1) * xGapRate + "px";

    var pixelValue = (i + 1) * xGapRate;
    var h1 = document.createElement("h4");
    var feetInches = convertXPixelsToInches(pixelValue);
    var feet = Math.floor(feetInches);
    var inches = Math.round((feetInches % 1) * 12);
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
/*-----------------------------------------------End Display Grid (via Toggle Button) Section----------------------------------------------------------------------------*/
//#endregion

//#region Canvas Input
/*----------------------------------------------Begin Canvas Size Input Section ---------------------------------------------------------------------*/
var stageWidth = 0;
var stageHeight = 0;
var isToggled = false;
var haveDimensions = false;
var requireStartDrawingPos = false; //variable for if user selects that the drawing must start in a specified location, default to false

function newTrack() {
  var w, h;
  stageWidth = parseInt(document.getElementById("stageWidth").value, 10);
  stageHeight = parseInt(document.getElementById("stageHeight").value, 10);
  w = "" + stageWidth + "' ";
  h = "" + stageHeight + "' ";

  var stageWidthInch =
    parseInt(document.getElementById("inchesWidth").value, 10) / 12;
  var stageHeightInch =
    parseInt(document.getElementById("inchesHeight").value, 10) / 12;

  w += document.getElementById("inchesWidth").value + '"';
  h += document.getElementById("inchesHeight").value + '"';

  stageWidth += stageWidthInch;
  stageHeight += stageHeightInch;
  stageWidth = stageWidth.toFixed(2);
  stageHeight = stageHeight.toFixed(2);

  // interval = document.getElementById("myRange").value * 1000; // this will turn the seconds into milliseconds
  // switch to constant draw rate
  interval = 0.01 * 1000;

  if (
    document.getElementById("stageWidth").value == "" ||
    document.getElementById("stageHeight").value == ""
  ) {
    alert("Please Enter Valid Dimensions");
  } else {
    document.getElementById("widthDisplay").innerText = "Width of Stage: " + w;
    document.getElementById("heightDisplay").innerText = "Depth of Stage: " + h;
    // document.getElementById("rateDisplay").innerText =
    //   "Critical Point Rate: " + interval + " ms";
    haveDimensions = true;
    isValidToDraw = true;
    myFunction();
  }
}

function startPositionToggle(){
  if (requireStartDrawingPos == false) {
    // if user hasn't entered start dimensions, send error
    if (document.getElementById("startX").value == "" || document.getElementById("startY").value == "")
      alert("Please Enter Start Dimensions");

    // calculate required start position in pixels
    var startDimensions = getStageDimensionsInFeetInches("startX", "startY", "inchesX", "inchesY");
    var startX = startDimensions[0];
    var startY = startDimensions[1];
    startXPixels = convertXInchesToPixels(startX);
    startYPixels = convertYInchesToPixels(startY);

    // draw start rectangle
    ctx.beginPath();
    ctx.rect(startXPixels - 10, startYPixels - 10, 20, 20);
    ctx.stroke()

    requireStartDrawingPos = true;
  } else {
    // clear start rectangle
    newTrack();
    
    requireStartDrawingPos = false;
  }
}

function setVisuals() {
  var w, h;

  w = "" + dimensionHelper(stageWidth)[0] + "' " + dimensionHelper(stageWidth)[1] + "\"";
  h = "" + + dimensionHelper(stageHeight)[0] + "' " + dimensionHelper(stageHeight)[1] + "\"";

  document.getElementById("widthDisplay").innerText = "Width of Stage: " + w;
  document.getElementById("heightDisplay").innerText = "Depth of Stage: " + h;
  document.getElementById("frequency").value = frequency;
  
  if(!isNaN(stageWidth)&&!isNaN(stageHeight)){
    console.log([stageWidth,stageHeight])
    let widthinches = (stageWidth*12)%12;
    let heightinches = (stageHeight*12)%12;
    let widthfeet = Math.trunc(stageWidth)
    let heightfeet = Math.trunc(stageHeight)
    document.getElementById("stageWidth").value = widthfeet;
    document.getElementById("stageHeight").value = heightfeet;
    document.getElementById("inchesWidth").value = widthinches.toFixed(0);
    document.getElementById("inchesHeight").value = heightinches.toFixed(0);
    console.log([widthfeet,widthinches,heightfeet,heightinches])
    haveDimensions = true;
    isValidToDraw = true;
    myFunction();
  }
}

function dimensionHelper(dimension){
  inches = (dimension*12).toFixed(0) % 12;
  feet = Math.trunc(dimension);
  return [feet,inches];
}
// var slider = document.getElementById("myRange");
// var output = document.getElementById("demo");
// output.innerHTML = slider.value + " sec";

// slider.oninput = function () {
//   output.innerHTML = this.value + " sec";
// };


/*----------------------------------------------End Verifying Canvas Dimension Input Section----------------------------------------------------------------------------*/
//#endregion

//#region Show Critical Points Section
/* -----------------------Start Toggle Points Canvas Section----------------- -----------------------------------------------------------------------------*/
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
/* -----------------------End Toggle Points Canvas Section----------------- -----------------------------------------------------------------------------*/
//#endregion

//#region Save Workspace Section

document.querySelector("#saveWork").addEventListener("click", () => {
  var popcue = false;
  if(fullMouseHistoryPoints.length > 0 && cuelist.length == 1){
    cuelist.push(new Array(criticalPointsList.length - 1, fullMouseHistoryPoints.length - 1));
    popcue = true;
    console.log(cuelist);
  }

  for (var i = 0; i < fullMouseHistoryPoints.length; i++) {
    console.log(fullMouseHistoryPoints[i].x);
  }

  var wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "Scenery Robot Workspace",
    Subject: "Test",
    Author: "University of Virginia Research Team",
    CreatedDate: new Date(1819, 01, 25),
  };
  
  wb.SheetNames.push("Workspace Summary");
  var summaryData = [["StageWidth", "StageWidthInches","StageHeight","StageHeightInches","gridInterval","gridToggled","pointsToggled","groundPlan","groundPlanToggled","slider"]];
  var widthVals = dimensionHelper(stageWidth);
  var heightVals = dimensionHelper(stageHeight);
  summaryData.push([]);
  summaryData[1].push(widthVals[0]);
  summaryData[1].push(widthVals[1]);
  summaryData[1].push(heightVals[0]);
  summaryData[1].push(heightVals[1]);
  summaryData[1].push(frequency);
  summaryData[1].push(isGridToggled);
  summaryData[1].push(isPointsToggled);
  summaryData[1].push("temp");
  summaryData[1].push(groundPlanShowing);
  summaryData[1].push("temp");

  var summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  wb.Sheets["Workspace Summary"] = summarySheet;

  for(var c = 1; c <= cuelist.length-1; c++){
    var cueSheetName = "Cue " + c;
    wb.SheetNames.push(cueSheetName);
    
    var leftBound = cuelist[c-1][1];
    var rightBound = cuelist[c][1];

    var wsData = [["mouseHistoryX", "mouseHistoryY"]];
    for (var i = leftBound; i < rightBound; i++) {
      var temp = [];
      temp.push(fullMouseHistoryPoints[i].x);
      temp.push(fullMouseHistoryPoints[i].y);
      wsData.push(temp);
    }
    var criticalPointsHeading = [
      "XPos",
      "YPos",
      "Width",
      "Height",
      "isClicked",
      "Color",
    ];
    wsData.push(criticalPointsHeading);

    var leftCritBound = cuelist[c-1][0];
    var rightCritBound = cuelist[c][0];

    for (var i = leftCritBound; i < rightCritBound; i++) {
      var temp = [];
      temp.push(criticalPointsList[i].x);
      temp.push(criticalPointsList[i].y);
      temp.push(criticalPointsList[i].width);
      temp.push(criticalPointsList[i].height);
      temp.push(criticalPointsList[i].isClicked);
      temp.push(criticalPointsList[i].color);
      wsData.push(temp);
    }

    var ws = XLSX.utils.aoa_to_sheet(wsData);
    wb.Sheets[cueSheetName] = ws;
  }
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
  if(popcue){
    cuelist.pop();
  }
});

//#endregion

//#region Upload Workspace

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
  var summarySheet = workbook.SheetNames[0];
  var summaryRows = XLSX.utils.sheet_to_row_object_array(
    workbook.Sheets[summarySheet]
  );

  var criticalPointCount = 0;
  var pointCount = 0;

  for(let k = 1; k < workbook.SheetNames.length; k++){
    isCritPoint = false;
    

    var pointSheet = workbook.SheetNames[k];
    var dataRows = XLSX.utils.sheet_to_row_object_array(
      workbook.Sheets[pointSheet]
    );

    for (var i = 0; i < dataRows.length; i++) {
      if (dataRows[i].mouseHistoryX == "XPos") {
        i++;
        isCritPoint = true;
      }
      
      if (isCritPoint == false) {
        fullMouseHistoryPoints.push(
          new myPoint(dataRows[i].mouseHistoryX, dataRows[i].mouseHistoryY)
        );
        pointCount += 1;
      } else {
        //error handling here (ensure each cue's first point is the same as the last cue's last point)
        criticalPointsList.push(
          new criticalPoint(
            dataRows[i].mouseHistoryX + 5,
            dataRows[i].mouseHistoryY + 5
          )
        );
        criticalPointCount += 1;
      }
    }
    console.log(criticalPointCount,pointCount);
    cuelist.push([criticalPointCount,pointCount]);
  }
  
  /*
  for (var i = 0; i < fullMouseHistoryPoints.length; i++) {
    console.log(fullMouseHistoryPoints[i].x);
  }*/
  console.log("# of cues: " + String(cuelist.length-1));
  cueSetup(cuelist.length);
  drawLinesFromHistory();
  reDrawPoints();
  console.log(summaryRows[0]);
  stageWidth=summaryRows[0].StageWidth+summaryRows[0].StageWidthInches/12;
  stageHeight=summaryRows[0].StageHeight+summaryRows[0].StageHeightInches/12;
  console.log([stageHeight,stageWidth]);
  frequency=summaryRows[0].gridInterval;
  setGridToggle(summaryRows[0].gridToggled);

  setVisuals();
}

//#endregion

//#region Draw Function
/*----------------------------------------------------------------Begin User Drawing Section---------------------------------------------------------------------------*/
drawingCanvas = document.getElementById("drawingCanvas"); //get the canvas by name
var context = drawingCanvas.getContext("2d"); //set its dimentions to 2d
setUpCanvas();

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

function setUpCanvas() {
  context.canvas.width = drawingCanvas.getBoundingClientRect().width;
  context.canvas.height = drawingCanvas.getBoundingClientRect().height;
  context.lineWidth = 1;
  context.lineCap = "round";
  context.strokeStyle = "black"; //finish setting up the drawing canvas
}
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
            fullMouseHistoryPoints.push( // add critical point to mouse history
              new myPoint(currentXPos, currentYPos)
            );
          }
          if (drawingLocation == "beginning") {
            criticalPointsList.unshift(
              new criticalPoint(currentXPos, currentYPos)
            );
            fullMouseHistoryPoints.unshift( // add critical point to mouse history
              new myPoint(currentXPos, currentYPos)
            );
          }
          if (drawingLocation == "middle") {
            middleFragmentArrayCriticalPoints.push(
              new criticalPoint(currentXPos, currentYPos)
            );
            middleFragmentArray.push( // add critical point to mouse history
              new myPoint(currentXPos, currentYPos)
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
        fullMouseHistoryPoints.push( // add critical point to mouse history
          new myPoint(currentXPos, currentYPos)
        );
      }
      if (drawingLocation == "beginning") {
        criticalPointsList.unshift(new criticalPoint(currentXPos, currentYPos));
        fullMouseHistoryPoints.unshift( // add critical point to mouse history
          new myPoint(currentXPos, currentYPos)
        );
      }
      if (drawingLocation == "middle") {  // come back to implement adding critical point to mouse history
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
      // if a line has already been drawn
      if (fullMouseHistoryPoints.length > 0) {
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
            fullMouseHistoryPoints.push( // add critical point to mouse history
              new myPoint(currentXPos, currentYPos)
            );
            drawingLocation = "end";
            setPosition(window.event);
          }
          if (startLocation.contains(currentXPos, currentYPos)) {
            startDrawing = true;
            criticalPointsList.unshift(
              new criticalPoint(currentXPos, currentYPos)
            );
            fullMouseHistoryPoints.unshift( // add critical point to mouse history
              new myPoint(currentXPos, currentYPos)
            );
            drawingLocation = "beginning";
            setPosition(window.event);
          }
        }
        // if a line hasn't been drawn yet
      } else {
          // if it doesn't require a starting position
          if (!requireStartDrawingPos) {
            startDrawing = true;  
            criticalPointsList.push(new criticalPoint(currentXPos, currentYPos)); //where the mouse was first pressed down, get a critical point
            setPosition(window.event);
          }
          // starting position required
          else {
            // calculate required start position in pixels
            var startDimensions = getStageDimensionsInFeetInches("startX", "startY", "inchesX", "inchesY");
            var startX = startDimensions[0];
            var startY = startDimensions[1];
            startXPixels = convertXInchesToPixels(startX);
            startYPixels = convertYInchesToPixels(startY);

            // generate required start rectangle
            var requiredStartLocation = new MyRect(
              startXPixels - 10,
              startYPixels - 10,
              20,
              20
            );

            // check that user is drawing in start rectangle
            if (requiredStartLocation.contains(currentXPos, currentYPos)) {
              startDrawing = true;
              criticalPointsList.unshift(
                new criticalPoint(currentXPos, currentYPos)
              );
              drawingLocation = "beginning";
              setPosition(window.event);
            }

          }
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
  this.color = "#339933";

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
    ctx.lineWidth = 2;
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
    context.strokeStyle = "#336633";
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
/*--------------------------------------------------------------------End User Drawing Section-----------------------------------------------------------------------------*/
//#endregion

//#region Erase Function
/*-----------------------------------------------------------------Begin Erase Button Section----------------------------------------------------------------------------*/
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
/*-------------------------------------------------------------------End Erase Button Section----------------------------------------------------------------------------*/
//#endregion

//#region Generating BSpline Section
var oldData = null;
var generatedArray = [];
var bSplineShowing = false;

//initialize the b-spline canvas
var splineCanvas = document.getElementById("bSplineCanvas"); //get the canvas by name
var splineCtx = splineCanvas.getContext("2d"); //set its dimentions to 2d
splineCtx.canvas.width = splineCanvas.getBoundingClientRect().width;
splineCtx.canvas.height = splineCanvas.getBoundingClientRect().height;

function showBSplineCurve() {
  console.log(generatedArray.length);
  var myelement = document.getElementById("bSplineCanvas");
  if (bSplineShowing == false) {
    bSplineShowing = true;
    myelement.style.visibility = "visible";
    getData();   
    bSplineDisplayHelper();
  } else {
    myelement.style.visibility = "hidden";
    bSplineShowing = false;
  }
}

function bSplineDisplayHelper(){
  getData();
  var rect = document.getElementById("bSplineCanvas").getBoundingClientRect();
  clearSpline();
  splineCtx.beginPath();
  for (var i = 0; i < generatedArray.length-1; i++ ) {
    var x = generatedArray[i].x;
    var y = generatedArray[i].y;
    splineCtx.moveTo(x, (Math.abs(generatedArray[i].y-rect.height)).toFixed(2));
    splineCtx.lineTo(generatedArray[i+1].x, (Math.abs(generatedArray[i+1].y-rect.height)).toFixed(2));
  }
  splineCtx.strokeStyle = "#339933";
  splineCtx.lineWidth = 1;
  splineCtx.stroke();
  splineCtx.closePath();
}

function clearSpline(){
  splineCtx.clearRect(0, 0, splineCanvas.width, splineCanvas.height);
}

function calculateBSpline(){
  sendFetchRequest();
  getData();
}

function sendFetchRequest(){
  var data = [];
  var rect = document.getElementById("pointsCanvas").getBoundingClientRect();
  for(var i = 0; i< criticalPointsList.length; i++){
     data.push([(criticalPointsList[i].x+5).toFixed(2), (Math.abs(criticalPointsList[i].y+5-rect.height)).toFixed(2)])
  }

  var xhr = new XMLHttpRequest();
  var url = "http://localhost:3000/call-external-python-script";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  var data = JSON.stringify({ path: data });
  xhr.send(data);
  console.log("fetch request sent");
  //data - [];
}

function getData(){
  var getData = null;
  var delayInMilliseconds = 1000; //1 second
  var localTimer = setInterval(function() {
      let url = "http://localhost:3000/b-spline-returned-data";
  fetch(url)
  .then(response=>response.text())
  .then(data=>{
      getData = data;
      if(getData != null && getData != oldData && getData.length > 1){
        clearInterval(localTimer);
        convertToArray(getData);
        oldData = getData;
        getData = null; //iffffy --------------------------------------
      }
      console.log("waiting to receive data from python script");
  });
  }, delayInMilliseconds);
}

function convertToArray(input){
  generatedArray = [];
  var vals = input.substring(0,input.length-1).split("\n");
  for(var i = 0; i< vals.length/2; i++){
    generatedArray.push(new myPoint(vals[i], vals[i+50]));
  }
  getData(); //infinite loop?
  console.log("I was called");
  /*
  console.log(vals);
  for(var i = 0; i< generatedArray.length; i++){
    console.log("[",generatedArray[i].x, ",",generatedArray[i].y,"]" );
  }
  console.log(generatedArray)
  */
}

//#endregion

//#region Ground Plan Stuff

var groundPlanShowing = true;
function toggleGroundPlan() {
  for (layer of dxfViewer.GetLayers()) {
    dxfViewer.ShowLayer(layer.name, !groundPlanShowing)
  }
  groundPlanShowing = !groundPlanShowing;
}

document.getElementById("groundPlanSelect").addEventListener("change", readGroundPlan);

function readGroundPlan(evt) {
  //var http = require('http');

  var myFile = evt.target.files[0];
 
  /*
  var f = evt.target.files[0];

  if (f) {
    var r = new FileReader();
    r.onload = (e) => {
      sendFileToUrl(e.target.result);
    };

  } else {
    console.log("Failed to load file");
  }*/
 
}

function sendFileToUrl(inputFile){
  /*

  var xhr = new XMLHttpRequest();
  var url = "http://localhost:3000/groundPlan";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(inputFile);
   */
  console.log("called file analyzer");
  var parser = new DxfParser();
  var dxf = parser.parseSync(fileInput);
  console.log(dxf);
  
}
//#endregion

//#region Smaller Helper Functions

function convertYPixelsToInches(inputValInPixels) {
  var rect = document.getElementById("drawingCanvas").getBoundingClientRect();
  //var realY = ((inputValInPixels / rect.height) * stageHeight).toFixed(2);
  var realY =
    stageHeight -
    ((inputValInPixels.toFixed(2) / rect.height) * stageHeight).toFixed(2);
  return realY;
}

// takes 2 string inputs that correspond to html ids and returns their dimensions in feet inches as a 1x2 array
function getStageDimensionsInFeetInches(x, y, xInch, yInch) {
  var returnX, returnY;
  returnX = parseInt(document.getElementById(x).value, 10);
  returnY = parseInt(document.getElementById(y).value, 10);
  
  var returnXInch =
  parseInt(document.getElementById(xInch).value, 10) / 12;
  var returnYInch =
  parseInt(document.getElementById(yInch).value, 10) / 12;

  returnX += returnXInch;
  returnY += returnYInch;
  returnX = returnX.toFixed(2);
  returnY = returnY.toFixed(2);
  console.log(returnX)
  return [returnX, returnY];
}

function convertXPixelsToInches(inputValInPixels) {
  var rect = document.getElementById("drawingCanvas").getBoundingClientRect();
  var realX = ((inputValInPixels / rect.height) * stageHeight).toFixed(2);
  return realX;
}

function convertXInchesToPixels(inputValInFeetInches) {
  var rect = document.getElementById("drawingCanvas").getBoundingClientRect();
  var pixels = ((inputValInFeetInches / stageHeight) * rect.height).toFixed(2);
  return pixels;
}

function convertYInchesToPixels(inputValInFeetInches) {
  var rect = document.getElementById("drawingCanvas").getBoundingClientRect();
  var pixels = (rect.height - ((inputValInFeetInches / stageHeight) * rect.height)).toFixed(2);
  return pixels;
}

function displayPoints() {
  document.getElementById("pointsOutput").innerHTML = "";
  var rect = document.getElementById("drawingCanvas").getBoundingClientRect();
  /*
  for (var i = 0; i < criticalPointsList.length; i++) {
    console.log(criticalPointsList[i].x, criticalPointsList[i].y);
  }*/
  var realX, realY;
  for (var i = 0; i < criticalPointsList.length; i++) {
    var tempx = criticalPointsList[i].x;
    var tempy = criticalPointsList[i].y;
    realX = ((tempx / rect.width) * stageWidth).toFixed(2);
    realX = convertXPixelsToInches(tempx);
    realY = convertYPixelsToInches(tempy);
    if (i + 1 == criticalPointsList.length) {
      document.getElementById("pointsOutput").innerHTML += "\r\n";
      document.getElementById("pointsOutput").innerHTML +=
        "(" + realX + ", " + realY + ")";
    } else {
      document.getElementById("pointsOutput").innerHTML += "\r\n";

      document.getElementById("pointsOutput").innerHTML +=
        "(" + realX + ", " + realY + "), ";
    }
  }
}

function copyPointsFunction() {
  var copyElement = document.getElementById("pointsOutput"); //select the element
  var elementText = copyElement.textContent; //get the text content from the element
  navigator.clipboard.writeText(elementText);
  alert("Copied the text: " + elementText);
}

function reloadPage() {
  location = location.href;
}

function drawLinesFromHistory() {
  context = null;
  context = drawingCanvas.getContext("2d"); //set its dimentions to 2d
  context.canvas.width = drawingCanvas.getBoundingClientRect().width;
  context.canvas.height = drawingCanvas.getBoundingClientRect().height;

  context.lineWidth = 1;
  context.lineCap = "round";
  context.strokeStyle = "#336633";

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

  /*
  
  plt.figure()
plt.plot(x, y, 'ro', out[0], out[1], 'b')
plt.legend(['Points', 'Interpolated B-spline', 'True'],loc='best')
plt.axis([min(x)-1, max(x)+1, min(y)-1, max(y)+1])
plt.title('B-Spline interpolation')
plt.show()
  
  */
}

var isUserLineToggled = true;
function displayLine() {
  var myDrawingElement= document.getElementById("drawingCanvas");
  if (isUserLineToggled == true) {
    isUserLineToggled = false;
    myDrawingElement.style.visibility = "hidden";
  } else {
    myDrawingElement.style.visibility = "visible";
    isUserLineToggled = true;
  }
}
//#endregion

//#region Cue
var cuelist = []; /*list of tuples of indexes of the last critical point and last mousea positon in each cue
                  (index of last critical point, index of last mouse position)*/
cuelist.push([0,0]); // we want the first critical point and mouse history index to be 0
function cue(start,end){
  this.start = start;
  this.end = end;
}

function cueSetup(numCues){
  var select = document.getElementById('cueDropdown');    

  for (var i = 1; i < numCues; i++){ // starts at 2 because we have 1 defined in html file, and < numCues (and not <=) because we push [0,0] at the beginning and we want to ignore that

    var option = document.createElement('option');
    option.value = i;
    option.innerHTML = "Cue " + String(i);
    select.options.add(option);
    console.log(option.innerHTML);
  }
}


function nextCue(){
  let next = (parseInt((document.getElementById('cueDropdown').value))+1)%(cuelist.length);
  highlightCue(next,"#00FFFF",false,true);
  document.getElementById('cueDropdown').value = next;
}

function lastCue(){
  let prev = (parseInt((document.getElementById('cueDropdown').value))+(cuelist.length-1))%(cuelist.length);
  highlightCue(prev,"#00FFFF",false,true);
  document.getElementById('cueDropdown').value = prev;
}

function highlightCue(cue,color,onlyThisCue,clean){
  //var cue = document.getElementById('cueDropdown').value;
  if (cue > cuelist.length-1){ // if right button pressed when already on last cue, go to full path
    cue = 0;
  }
  else if (cue < 0){ // if left button pressed when already on full path, go to last cue
    cue = cuelist.length-1;
  }
  //document.getElementById('cueDropdown').value = cue;
  

  if(clean){
    context = null;
    context = drawingCanvas.getContext("2d"); //set its dimentions to 2d
    context.canvas.width = drawingCanvas.getBoundingClientRect().width;
    context.canvas.height = drawingCanvas.getBoundingClientRect().height;
  }

  if (cue == 0){
    context.lineWidth = 1;
    context.lineCap = "round";
    context.strokeStyle = "#336633";

    leftBound = 0;
    rightBound = fullMouseHistoryPoints.length-1;
  }
  else{
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.strokeStyle = color;
    
    leftBound = cuelist[cue-1][1];
    rightBound = cuelist[cue][1];
    if (rightBound == fullMouseHistoryPoints.length){ //indexing error fix (see below)
      rightBound--;
    }
   
  }

  if (fullMouseHistoryPoints.length >= 2) {
    for (var i = leftBound; i < rightBound; i++) {
      context.beginPath(); // begin drawing highlighted section
      context.moveTo(fullMouseHistoryPoints[i].x, fullMouseHistoryPoints[i].y);
      context.lineTo(
        fullMouseHistoryPoints[i + 1].x, // index error
        fullMouseHistoryPoints[i + 1].y
      );
      context.stroke();
    }
    if(!onlyThisCue){
      context.lineWidth = 1;
      context.lineCap = "round";
      context.strokeStyle = "#336633";

      for (var i = 0; i < leftBound; i++) {
        context.beginPath(); // begin drawing unhighlighted section
        context.moveTo(fullMouseHistoryPoints[i].x, fullMouseHistoryPoints[i].y);
        context.lineTo(
          fullMouseHistoryPoints[i + 1].x,
          fullMouseHistoryPoints[i + 1].y
        );
        context.stroke();
      }
      for (var i = rightBound; i < fullMouseHistoryPoints.length-1; i++) {
        context.beginPath(); // begin drawing unhighlighted section
        context.moveTo(fullMouseHistoryPoints[i].x, fullMouseHistoryPoints[i].y);
        context.lineTo(
          fullMouseHistoryPoints[i + 1].x,
          fullMouseHistoryPoints[i + 1].y
        );
        context.stroke();
      }
    }
  }
}
var colors = ["#FF0000", "#00FF00", "#0000FF","#FFFF00", "#00FFFF", "#FF00FF", "#800000", "#808000",  "#008000", "#800080", "#008080", "#000080"];
var cueViewOn = false;
function cueView(){
  var popcue = false;
  if(fullMouseHistoryPoints.length > 0 && cuelist.length == 1){
    cuelist.push(new Array(criticalPointsList.length - 1, fullMouseHistoryPoints.length - 1));
    popcue = true;
    console.log(cuelist[1]);
  }
  if(!cueViewOn){
    highlightCue(cuelist.length-1,colors[(cuelist.length-1)%colors.length],true,true);
    for(var i = cuelist.length-2; i > 0; i--){
      highlightCue(i,colors[i%colors.length],true,false);
    }
    cueViewOn = true;
  }
  else{
    highlightCue(document.getElementById('cueDropdown').value,'#00FFFF',false,true);
    cueViewOn = false;
  }
  if(popcue){
    cuelist.pop();
  }
}

function splitCue(){
  if (numPointsSelected > 1){
    console.log("too many points selected");
    return;
  }
  else if (numPointsSelected <= 0){
    console.log("please select a points");
    return;
  }
  else if (cuelist.includes(criticalPointsList.indexOf(pointsSelected[0]))){
    console.log("please select a unique point");
    return;
  }
  var x = -1;
  for(var i = 0; i < cuelist.length;i++){
    console.log(criticalPointsList.indexOf(pointsSelected[0]));
    console.log(cuelist[i][0]);
    if(criticalPointsList.indexOf(pointsSelected[0]) < cuelist[i][0]){
      x = i;
      break;
    }
    else{
      x = cuelist.length;
    }
  }
  cuelist.splice(x,0,[criticalPointsList.indexOf(pointsSelected[0]),fullMouseHistoryPoints.indexOf[pointsSelected[0]]]);
  console.log(cuelist);
  if (cueViewOn){
    cueViewOn=false;
    cueView();
  }
}
