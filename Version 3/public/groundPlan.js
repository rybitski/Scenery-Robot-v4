import { DxfViewer } from 'dxf-viewer';
// import * as THREE from 'three';
let gpContainer = document.querySelector('#groundPlanCanvasContainer');
document.querySelector('#groundPlanSelect').addEventListener('change', groundPlanUpload);
let fileURL = null;
let options = {
  clearAlpha: 1.0,
  canvasAlpha: true,
  autoResize: true
}
let dxfViewer = new DxfViewer(gpContainer, options);
window.dxfViewer = dxfViewer;
function zoomCustom(n) {
  dxfViewer.controls.enabled = false;
  let bounds = dxfViewer.bounds;
  let origin = dxfViewer.origin;
  let left = ( bounds.minX - origin.x ) / n;
  let right = ( bounds.maxX - origin.x ) / n;
  let top = ( bounds.maxY - origin.y ) / n;
  let bottom = ( bounds.minY - origin.y ) / n;
  dxfViewer.FitView(left, right, bottom, top, 0);
  dxfViewer.Render();
}
async function groundPlanUpload(e) {
  let file = e.target.files[0];
  console.log(file);
  if (fileURL) {
    URL.revokeObjectURL(fileURL);
  }
  fileURL = URL.createObjectURL(file);
  try {
    await dxfViewer.Load({
      url: fileURL
    })
    let bounds = dxfViewer.bounds;
    //let origin = dxfViewer.origin;
    document.querySelector('#stageWidth').value = Math.floor((bounds.maxX - bounds.minX) / 12);
    document.querySelector('#inchesWidth').value = Math.ceil((bounds.maxX - bounds.minX) / 12 % 1 * 12);
    document.querySelector('#stageHeight').value = Math.floor((bounds.maxY - bounds.minY) / 12);
    document.querySelector('#inchesHeight').value = Math.ceil((bounds.maxY - bounds.minY) / 12 % 1 * 12);
    newTrack();
    zoomCustom(1);
  } catch (error) {
    console.warn(error);
  }
}

